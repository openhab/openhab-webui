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
package org.openhab.ui.cometvisu.internal.backend.rest;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.openhab.core.io.rest.RESTConstants;
import org.openhab.core.io.rest.RESTResource;
import org.openhab.ui.cometvisu.internal.Config;
import org.openhab.ui.cometvisu.internal.util.ClientInstaller;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.jaxrs.whiteboard.JaxrsWhiteboardConstants;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JSONRequired;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JaxrsApplicationSelect;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JaxrsName;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JaxrsResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;

/**
 * Allows certain actions to configure the CometVisu backend through the REST api.
 *
 * @author Tobias Bräutigam - Initial contribution
 * @author Wouter Born - Migrated to JAX-RS Whiteboard Specification
 */
@Component
@JaxrsResource
@JaxrsName(Config.COMETVISU_BACKEND_ALIAS + "/" + Config.COMETVISU_BACKEND_CONFIG_ALIAS)
@JaxrsApplicationSelect("(" + JaxrsWhiteboardConstants.JAX_RS_NAME + "=" + RESTConstants.JAX_RS_NAME + ")")
@JSONRequired
@Path(Config.COMETVISU_BACKEND_ALIAS + "/" + Config.COMETVISU_BACKEND_CONFIG_ALIAS)
@Api(Config.COMETVISU_BACKEND_ALIAS + "/" + Config.COMETVISU_BACKEND_CONFIG_ALIAS)
public class ConfigResource implements RESTResource {

    private final Logger logger = LoggerFactory.getLogger(ConfigResource.class);

    @GET
    @Path("/{actionName}")
    @Produces({ MediaType.TEXT_PLAIN })
    @ApiOperation(value = "starts defined actions e.g. downloading the CometVisu client")
    @ApiResponses(value = { @ApiResponse(code = 200, message = "OK") })
    public Response getValue(
            @ApiParam(value = "name of the action, currently only 'download-client' is implemented") @PathParam("actionName") String actionName) {
        if ("download-client".equalsIgnoreCase(actionName)) {
            logger.debug("calling installation checker with config overriding");
            ClientInstaller.getInstance().check(true);
        } else {
            logger.error("Unknown CometVisu backend action '{}' requested", actionName);
            return Response.status(404).build();
        }

        return Response.ok().build();
    }
}
