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

import java.io.File;
import java.math.BigDecimal;
import java.util.ArrayList;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.openhab.core.io.rest.RESTResource;
import org.openhab.ui.cometvisu.internal.Config;
import org.openhab.ui.cometvisu.internal.ManagerSettings;
import org.openhab.ui.cometvisu.internal.backend.model.rest.CheckResponse;
import org.openhab.ui.cometvisu.internal.backend.model.rest.EnvironmentState;
import org.osgi.service.component.annotations.Component;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;

/**
 * Check filesystem backend for the cometvisu manager.
 *
 * @author Tobias Bräutigam - Initial contribution
 *
 */
@Component
@Path(Config.COMETVISU_BACKEND_ALIAS + "/fs/check")
@Api(Config.COMETVISU_BACKEND_ALIAS + "/fs/check")
public class CheckResource implements RESTResource {

    /**
     * Checks some files and folders for existance and access rights.
     *
     * @return the check result that contains a bitfield with check results for each entity
     */
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Check filesystem environment (access rights, etc)")
    @ApiResponses(value = { @ApiResponse(code = 200, message = "OK", response = CheckResponse.class) })
    public CheckResponse checkEnvironment() {
        CheckResponse res = new CheckResponse();
        File configFolder = ManagerSettings.getInstance().getConfigFolder();
        ArrayList<File> filesToCheck = new ArrayList<File>();
        filesToCheck.add(configFolder);
        filesToCheck.add(new File(configFolder.getAbsoluteFile() + File.separator + "media"));
        filesToCheck.add(new File(configFolder.getAbsoluteFile() + File.separator + "backup"));
        filesToCheck.add(new File(configFolder.getAbsoluteFile() + File.separator + "hidden.php"));

        for (final File file : filesToCheck) {
            EnvironmentState state = new EnvironmentState();
            state.setEntity(file.getName());
            state.setState(this.getState(file));
            res.add(state);
        }
        return res;
    }

    private BigDecimal getState(File file) {
        int stateField = 0;
        if (file.exists()) {
            // Bit 0: exists
            stateField |= 1;
        }
        if (file.canRead()) {
            // Bit 1: readable
            stateField |= 1 << 1;
        }
        if (file.canWrite()) {
            // Bit 2: writable
            stateField |= 2 << 1;
        }
        return new BigDecimal(stateField);
    }
}
