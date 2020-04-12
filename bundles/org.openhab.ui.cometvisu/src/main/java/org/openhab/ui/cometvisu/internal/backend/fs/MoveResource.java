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
package org.openhab.ui.cometvisu.internal.backend.fs;

import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.QueryParam;

import org.openhab.core.io.rest.RESTResource;
import org.openhab.ui.cometvisu.internal.Config;
import org.osgi.service.component.annotations.Component;

/**
 * Moves files for the CometVisu manager.
 *
 * @author Tobias Bräutigam - Initial contribution
 *
 */
@Component(immediate = true, service = { MoveResource.class, RESTResource.class })
@Path(Config.COMETVISU_BACKEND_ALIAS + "/fs/move")
public class MoveResource implements RESTResource {

    @PUT
    public void move(@QueryParam("src") String src, @QueryParam("target") String target) {

    }
}
