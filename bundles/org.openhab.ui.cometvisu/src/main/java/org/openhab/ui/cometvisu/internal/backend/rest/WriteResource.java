/**
 * Copyright (c) 2010-2024 Contributors to the openHAB project
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

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;
import javax.ws.rs.core.UriInfo;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.openhab.core.events.EventPublisher;
import org.openhab.core.io.rest.RESTConstants;
import org.openhab.core.io.rest.RESTResource;
import org.openhab.core.items.Item;
import org.openhab.core.items.ItemNotFoundException;
import org.openhab.core.items.ItemRegistry;
import org.openhab.core.items.events.ItemEventFactory;
import org.openhab.core.types.Command;
import org.openhab.core.types.TypeParser;
import org.openhab.ui.cometvisu.internal.Config;
import org.openhab.ui.cometvisu.internal.backend.model.SuccessBean;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.jaxrs.whiteboard.JaxrsWhiteboardConstants;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JSONRequired;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JaxrsApplicationSelect;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JaxrsName;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JaxrsResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * handles state updates send by the CometVisu client and forwars them to the EventPublisher
 *
 * @author Tobias Bräutigam - Initial contribution
 * @author Wouter Born - Migrated to JAX-RS Whiteboard Specification
 * @author Wouter Born - Migrated to OpenAPI annotations
 *
 * @deprecated CometVisu (>=0.12) is using openHAB's native REST API, a special backend implementation is obsolete now
 */
@Component
@JaxrsResource
@JaxrsName(Config.COMETVISU_BACKEND_ALIAS + "/" + Config.COMETVISU_BACKEND_WRITE_ALIAS)
@JaxrsApplicationSelect("(" + JaxrsWhiteboardConstants.JAX_RS_NAME + "=" + RESTConstants.JAX_RS_NAME + ")")
@JSONRequired
@Path(Config.COMETVISU_BACKEND_ALIAS + "/" + Config.COMETVISU_BACKEND_WRITE_ALIAS)
@Tag(name = Config.COMETVISU_BACKEND_ALIAS + "/" + Config.COMETVISU_BACKEND_WRITE_ALIAS)
@NonNullByDefault
@Deprecated(since = "3.4", forRemoval = true)
public class WriteResource implements RESTResource {
    private final Logger logger = LoggerFactory.getLogger(WriteResource.class);

    private final EventPublisher eventPublisher;
    private final ItemRegistry itemRegistry;

    private @Context @NonNullByDefault({}) UriInfo uriInfo;

    @Activate
    public WriteResource(final @Reference EventPublisher eventPublisher, final @Reference ItemRegistry itemRegistry) {
        this.eventPublisher = eventPublisher;
        this.itemRegistry = itemRegistry;
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "starts defined actions e.g. downloading the CometVisu client", responses = {
            @ApiResponse(responseCode = "200", description = "OK"),
            @ApiResponse(responseCode = "404", description = "Item not found") })
    public Response setState(@Context HttpHeaders headers,
            @Parameter(description = "Item name", required = true) @QueryParam("a") String itemName,
            @Parameter(description = "Item value", required = true) @QueryParam("v") String value,
            @Parameter(description = "timestamp") @QueryParam("ts") long timestamp) {
        if (logger.isDebugEnabled()) {
            logger.debug("Received CV write request at '{}' for item '{}' with value '{}'.", uriInfo.getPath(),
                    itemName, value);
        }
        Item item;
        try {
            item = itemRegistry.getItem(itemName);
            Command command = TypeParser.parseCommand(item.getAcceptedCommandTypes(), value);
            SuccessBean bean = new SuccessBean();
            if (command != null) {
                eventPublisher.post(ItemEventFactory.createCommandEvent(item.getName(), command));
                bean.success = 1;
            } else {
                bean.success = 0;
            }
            return Response.ok(bean, MediaType.APPLICATION_JSON).build();
        } catch (ItemNotFoundException e) {
            logger.error("{}", e.getLocalizedMessage());
            return Response.status(Status.NOT_FOUND).build();
        }
    }
}
