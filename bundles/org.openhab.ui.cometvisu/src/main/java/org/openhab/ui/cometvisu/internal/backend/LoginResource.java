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
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

import org.eclipse.smarthome.io.rest.RESTResource;
import org.openhab.ui.cometvisu.internal.Config;
import org.openhab.ui.cometvisu.internal.backend.beans.ConfigBean;
import org.openhab.ui.cometvisu.internal.backend.beans.LoginBean;
import org.openhab.ui.cometvisu.internal.backend.beans.ResourcesBean;
import org.osgi.service.component.annotations.Component;

/**
 * handles login request from the CometVisu client
 * currently this is just a placeholder and does no real authentification
 *
 * @author Tobias Bräutigam - Initial contribution
 */
@Component(immediate = true, service = { LoginResource.class, RESTResource.class })
@Path(Config.COMETVISU_BACKEND_ALIAS + "/" + Config.COMETVISU_BACKEND_LOGIN_ALIAS)
public class LoginResource implements RESTResource {
    @GET
    @Produces({ MediaType.APPLICATION_JSON })
    public Response getLogin(@Context UriInfo uriInfo, @Context HttpHeaders headers, @QueryParam("u") String user,
            @QueryParam("p") String password, @QueryParam("d") String device) {
        LoginBean bean = new LoginBean();
        bean.v = "0.0.1";
        bean.s = "0"; // Session-ID not needed with SSE
        ConfigBean conf = new ConfigBean();
        ResourcesBean res = new ResourcesBean();
        String origin = headers.getHeaderString("Origin");
        String serverHost = uriInfo.getBaseUri().getScheme() + "://" + uriInfo.getBaseUri().getHost();
        if (uriInfo.getBaseUri().getPort() != 80) {
            serverHost += ":" + uriInfo.getBaseUri().getPort();
        }
        String host = origin == null || serverHost.compareToIgnoreCase(origin) == 0 ? "" : serverHost;

        conf.baseURL = host + "/rest/" + Config.COMETVISU_BACKEND_ALIAS + "/";
        conf.resources = res;
        res.read = Config.COMETVISU_BACKEND_READ_ALIAS;
        res.rrd = Config.COMETVISU_BACKEND_CHART_ALIAS;
        res.write = Config.COMETVISU_BACKEND_WRITE_ALIAS;
        bean.c = conf;
        return Response.ok(bean, MediaType.APPLICATION_JSON).build();
    }
}
