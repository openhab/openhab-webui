/**
 * Copyright (c) 2010-2019 Contributors to the openHAB project
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
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.eclipse.smarthome.io.rest.RESTResource;
import org.openhab.ui.cometvisu.internal.Config;
import org.openhab.ui.cometvisu.internal.util.ClientInstaller;
import org.osgi.service.component.annotations.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Allows certain actions to configure the CometVisu backend through the REST api.
 *
 * @author Tobias Bräutigam - Initial contribution
 */
@Component(immediate = true, service = { ConfigResource.class, RESTResource.class })
@Path(Config.COMETVISU_BACKEND_ALIAS + "/" + Config.COMETVISU_BACKEND_CONFIG_ALIAS)
public class ConfigResource implements RESTResource {

    private final Logger logger = LoggerFactory.getLogger(ConfigResource.class);

    @GET
    @Path("/{actionName}")
    @Produces({ MediaType.TEXT_PLAIN })
    public Response getValue(@PathParam("actionName") String actionName) {
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
