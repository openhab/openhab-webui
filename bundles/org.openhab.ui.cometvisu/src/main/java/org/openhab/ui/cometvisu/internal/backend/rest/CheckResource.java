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

import java.io.File;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.openhab.core.io.rest.RESTConstants;
import org.openhab.core.io.rest.RESTResource;
import org.openhab.ui.cometvisu.internal.Config;
import org.openhab.ui.cometvisu.internal.ManagerSettings;
import org.openhab.ui.cometvisu.internal.backend.model.rest.CheckResponse;
import org.openhab.ui.cometvisu.internal.backend.model.rest.EnvironmentState;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.jaxrs.whiteboard.JaxrsWhiteboardConstants;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JSONRequired;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JaxrsApplicationSelect;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JaxrsName;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JaxrsResource;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Check filesystem backend for the cometvisu manager.
 *
 * @author Tobias Bräutigam - Initial contribution
 * @author Wouter Born - Migrated to JAX-RS Whiteboard Specification
 * @author Wouter Born - Migrated to OpenAPI annotations
 */
@Component
@JaxrsResource
@JaxrsName(Config.COMETVISU_BACKEND_ALIAS + "/fs/check")
@JaxrsApplicationSelect("(" + JaxrsWhiteboardConstants.JAX_RS_NAME + "=" + RESTConstants.JAX_RS_NAME + ")")
@JSONRequired
@Path(Config.COMETVISU_BACKEND_ALIAS + "/fs/check")
@Tag(name = Config.COMETVISU_BACKEND_ALIAS + "/fs/check")
@NonNullByDefault
public class CheckResource implements RESTResource {

    /**
     * Checks some files and folders for existance and access rights.
     *
     * @return the check result that contains a bitfield with check results for each entity
     */
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Check filesystem environment (access rights, etc)", responses = {
            @ApiResponse(responseCode = "200", description = "OK", content = @Content(schema = @Schema(implementation = CheckResponse.class))) })
    public CheckResponse checkEnvironment() {
        CheckResponse res = new CheckResponse();
        File configFolder = ManagerSettings.getInstance().getConfigFolder();
        List<File> filesToCheck = new ArrayList<>();
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
