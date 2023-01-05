/**
 * Copyright (c) 2010-2023 Contributors to the openHAB project
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0
 *
 * SPDX-License-Identifier: EPL-2.0
 */
package org.openhab.ui.cometvisu.internal.backend.rest;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.sse.Sse;
import javax.ws.rs.sse.SseEventSink;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.io.rest.RESTConstants;
import org.openhab.core.io.rest.RESTResource;
import org.openhab.core.io.rest.SseBroadcaster;
import org.openhab.core.items.GenericItem;
import org.openhab.core.items.Item;
import org.openhab.core.items.ItemFactory;
import org.openhab.core.items.ItemNotFoundException;
import org.openhab.core.items.ItemRegistry;
import org.openhab.core.types.State;
import org.openhab.ui.cometvisu.internal.Config;
import org.openhab.ui.cometvisu.internal.backend.model.StateBean;
import org.openhab.ui.cometvisu.internal.listeners.StateEventListener;
import org.openhab.ui.cometvisu.internal.util.SseUtil;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.jaxrs.whiteboard.JaxrsWhiteboardConstants;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JSONRequired;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JaxrsApplicationSelect;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JaxrsName;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JaxrsResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * handles read request from the CometVisu client every request initializes a
 * SSE communication
 *
 * @author Tobias Bräutigam - Initial contribution
 * @author Wouter Born - Migrated to JAX-RS Whiteboard Specification
 * @author Wouter Born - Migrated to OpenAPI annotations
 *
 * @deprecated CometVisu (>=0.12) is using openHAB's native REST API, a special backend implementation is obsolete now
 */
@Component(immediate = true)
@JaxrsResource
@JaxrsName(Config.COMETVISU_BACKEND_ALIAS + "/" + Config.COMETVISU_BACKEND_READ_ALIAS)
@JaxrsApplicationSelect("(" + JaxrsWhiteboardConstants.JAX_RS_NAME + "=" + RESTConstants.JAX_RS_NAME + ")")
@JSONRequired
@Path(Config.COMETVISU_BACKEND_ALIAS + "/" + Config.COMETVISU_BACKEND_READ_ALIAS)
@Tag(name = Config.COMETVISU_BACKEND_ALIAS + "/" + Config.COMETVISU_BACKEND_READ_ALIAS)
@NonNullByDefault
@Deprecated(since = "3.4", forRemoval = true)
public class ReadResource implements EventBroadcaster, RESTResource {
    private final Logger logger = LoggerFactory.getLogger(ReadResource.class);

    private SseBroadcaster<SseSinkInfo> broadcaster = new SseBroadcaster<>();

    private final ExecutorService executorService = Executors.newSingleThreadExecutor();

    private final ItemRegistry itemRegistry;

    private final StateEventListener stateEventListener = new StateEventListener(this);

    private List<String> itemNames = new ArrayList<>();
    private Map<Item, Map<String, @Nullable Class<? extends State>>> items = new HashMap<>();

    private @NonNullByDefault({}) Sse sse;

    private Collection<ItemFactory> itemFactories = new CopyOnWriteArrayList<>();

    @Activate
    public ReadResource(@Reference ItemRegistry itemRegistry) {
        this.itemRegistry = itemRegistry;
    }

    @Deactivate
    public void deactivate() {
        broadcaster.close();
    }

    @Context
    public void setSse(final Sse sse) {
        this.sse = sse;
    }

    protected void addItemFactory(ItemFactory itemFactory) {
        itemFactories.add(itemFactory);
    }

    protected void removeItemFactory(ItemFactory itemFactory) {
        itemFactories.remove(itemFactory);
    }

    /**
     * Subscribes the connecting client to the stream of events filtered by the
     * given eventFilter.
     *
     * @param eventFilter
     * @return {@link EventOutput} object associated with the incoming
     *         connection.
     * @throws IOException
     * @throws InterruptedException
     */
    @GET
    @Produces(MediaType.SERVER_SENT_EVENTS)
    @Operation(summary = "Creates the SSE stream for item states, sends all requested states once and then only changes states", responses = {
            @ApiResponse(responseCode = "200", description = "OK") })
    public void getStates(@Context final SseEventSink sseEventSink, @QueryParam("a") List<String> itemNames,
            @QueryParam("i") long index, @QueryParam("t") long time) throws IOException, InterruptedException {
        this.itemNames = itemNames;

        broadcaster.add(sseEventSink, new SseSinkInfo(itemNames, index, time));

        // get all requested items and send their states to the client
        items = new HashMap<>();
        // send the current states of all items to the client
        List<StateBean> states = new ArrayList<>();
        for (String cvItemName : itemNames) {
            try {
                String[] parts = cvItemName.split(":");
                String ohItemName = cvItemName;
                Class<? extends State> stateClass = null;
                if (parts.length == 2) {
                    String classPrefix = parts[0].toLowerCase();
                    if (Config.itemTypeMapper.containsKey(classPrefix)) {
                        stateClass = Config.itemTypeMapper.get(classPrefix);
                        classPrefix += ":";
                    } else {
                        logger.debug("no type found for '{}'", classPrefix);
                        classPrefix = "";
                    }
                    ohItemName = parts[1];
                }
                Item item = this.itemRegistry.getItem(ohItemName);
                if (!items.containsKey(item)) {
                    items.put(item, new HashMap<>());
                }
                items.get(item).put(cvItemName, stateClass);
                StateBean itemState = new StateBean();
                itemState.name = cvItemName;

                if (stateClass != null) {
                    itemState.state = item.getStateAs(stateClass).toString();
                    logger.trace("get state of '{}' as '{}' == '{}'", item, stateClass, itemState.state);
                } else {
                    itemState.state = item.getState().toString();
                }
                states.add(itemState);
            } catch (ItemNotFoundException e) {
                logger.error("{}", e.getLocalizedMessage());
            }
        }

        logger.debug("initially broadcasting {}/{} item states", states.size(), itemNames.size());
        broadcaster.send(SseUtil.buildEvent(sse.newEventBuilder(), states));

        // listen to state changes of the requested items
        registerItems();
    }

    /**
     * listen for state changes from the requested items
     */
    @Override
    public void registerItems() {
        for (Item item : items.keySet()) {
            if (item instanceof GenericItem) {
                ((GenericItem) item).addStateChangeListener(stateEventListener);
            }
        }
    }

    /**
     * listens to state changes of the given item, if it is part of the requested items
     *
     * @param item the new item, that should be listened to
     */
    @Override
    public void registerItem(Item item) {
        if (items.containsKey(item) || !itemNames.contains(item.getName())) {
            return;
        }
        if (item instanceof GenericItem) {
            ((GenericItem) item).addStateChangeListener(stateEventListener);
        }
    }

    /**
     * listens to state changes of the given item, if it is part of the
     * requested items
     *
     * @param item the new item, that should be listened to
     */
    @Override
    public void unregisterItem(Item item) {
        if (items.containsKey(item) || !itemNames.contains(item.getName())) {
            return;
        }
        if (item instanceof GenericItem) {
            ((GenericItem) item).removeStateChangeListener(stateEventListener);
            items.remove(item);
        }
    }

    /**
     * Broadcasts an event described by the given parameters to all currently
     * listening clients.
     *
     * @param item the item which has changed
     * @param eventObject bean that can be converted to a JSON object.
     */
    @Override
    public void broadcastEvent(final Object eventObject) {
        if (sse == null) {
            logger.trace("broadcast skipped (no one listened since activation)");
            return;
        }

        executorService.execute(() -> {
            broadcaster.send(SseUtil.buildEvent(sse.newEventBuilder(), eventObject));
        });
    }

    @Override
    public Map<String, @Nullable Class<? extends State>> getClientItems(Item item) {
        return Objects.requireNonNullElse(items.get(item), Map.of());
    }
}
