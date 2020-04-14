/**
 * Copyright (c) 2010-2020 Contributors to the openHAB project
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
package org.openhab.ui.cometvisu.internal.backend;

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

import org.openhab.core.events.EventPublisher;
import org.openhab.core.io.rest.RESTResource;
import org.openhab.core.items.Item;
import org.openhab.core.items.ItemNotFoundException;
import org.openhab.core.items.ItemRegistry;
import org.openhab.core.items.events.ItemEventFactory;
import org.openhab.core.types.Command;
import org.openhab.core.types.TypeParser;
import org.openhab.ui.cometvisu.internal.Config;
import org.openhab.ui.cometvisu.internal.backend.beans.SuccessBean;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;

/**
 * handles state updates send by the CometVisu client and forwars them to the EventPublisher
 *
 * @author Tobias Bräutigam - Initial contribution
 */
@Component
@Path(Config.COMETVISU_BACKEND_ALIAS + "/" + Config.COMETVISU_BACKEND_WRITE_ALIAS)
@Api(Config.COMETVISU_BACKEND_ALIAS + "/" + Config.COMETVISU_BACKEND_WRITE_ALIAS)
public class WriteResource implements RESTResource {
    private final Logger logger = LoggerFactory.getLogger(WriteResource.class);

    private ItemRegistry itemRegistry;

    private EventPublisher eventPublisher;

    @Context
    private UriInfo uriInfo;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "starts defined actions e.g. downloading the CometVisu client")
    @ApiResponses(value = { @ApiResponse(code = 200, message = "OK"),
            @ApiResponse(code = 404, message = "Item not found") })
    public Response setState(@Context HttpHeaders headers,
            @ApiParam(value = "Item name", required = true) @QueryParam("a") String itemName,
            @ApiParam(value = "Item value", required = true) @QueryParam("v") String value,
            @ApiParam(value = "timestamp") @QueryParam("ts") long timestamp) {
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

    @Reference
    protected void setItemRegistry(ItemRegistry itemRegistry) {
        this.itemRegistry = itemRegistry;
    }

    protected void unsetItemRegistry(ItemRegistry itemRegistry) {
        this.itemRegistry = null;
    }

    @Reference
    protected void setEventPublisher(EventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    protected void unsetEventPublisher(EventPublisher eventPublisher) {
        this.eventPublisher = null;
    }
}
