/*
 * Copyright (c) 2010-2025 Contributors to the openHAB project
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
import java.nio.file.Files;

import javax.annotation.security.RolesAllowed;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.openhab.core.auth.Role;
import org.openhab.core.io.rest.RESTConstants;
import org.openhab.core.io.rest.RESTResource;
import org.openhab.ui.cometvisu.internal.Config;
import org.openhab.ui.cometvisu.internal.util.FileOperationException;
import org.openhab.ui.cometvisu.internal.util.FsUtil;
import org.openhab.ui.cometvisu.internal.util.MountedFile;
import org.osgi.service.component.annotations.Component;
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
 * Move/renames files for the CometVisu manager.
 *
 * @author Tobias Bräutigam - Initial contribution
 * @author Wouter Born - Migrated to JAX-RS Whiteboard Specification
 * @author Wouter Born - Migrated to OpenAPI annotations
 */
@Component
@JaxrsResource
@JaxrsName(Config.COMETVISU_BACKEND_ALIAS + "/fs/move")
@JaxrsApplicationSelect("(" + JaxrsWhiteboardConstants.JAX_RS_NAME + "=" + RESTConstants.JAX_RS_NAME + ")")
@JSONRequired
@RolesAllowed({ Role.USER, Role.ADMIN })
@Path(Config.COMETVISU_BACKEND_ALIAS + "/fs/move")
@Tag(name = Config.COMETVISU_BACKEND_ALIAS + "/fs/move")
@NonNullByDefault
public class MoveResource implements RESTResource {
    private final Logger logger = LoggerFactory.getLogger(MoveResource.class);

    @PUT
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Move folder or file to a new place", responses = {
            @ApiResponse(responseCode = "200", description = "OK"),
            @ApiResponse(responseCode = "403", description = "forbidden"),
            @ApiResponse(responseCode = "404", description = "not found"),
            @ApiResponse(responseCode = "406", description = "target exists"),
            @ApiResponse(responseCode = "500", description = "rename/move failed") })
    public Response move(
            @Parameter(description = "current path of the filesystem entry", required = true) @QueryParam("src") String src,
            @Parameter(description = " new path of the filesystem entry", required = true) @QueryParam("target") String target) {
        MountedFile sourceFile;
        MountedFile targetFile;
        try {
            sourceFile = new MountedFile(src);
            targetFile = new MountedFile(target);
            if (!sourceFile.exists()) {
                return FsUtil.createErrorResponse(Status.NOT_FOUND, "source not found");
            }
            if (targetFile.exists()) {
                return FsUtil.createErrorResponse(Status.NOT_ACCEPTABLE, "target exists");
            }
            // source file will be deleted, target created so both files need write access
            if (sourceFile.isReadonlyMount() || !sourceFile.toFile().canWrite() || targetFile.isReadonlyMount()) {
                return FsUtil.createErrorResponse(Status.FORBIDDEN, "not allowed");
            }
            java.nio.file.Path parentTarget = targetFile.getAbsolutePath().getParent();
            if (!parentTarget.toFile().exists()) {
                parentTarget.toFile().mkdirs();
            }
            if (parentTarget.toFile().canWrite()) {
                if (Files.move(sourceFile.getAbsolutePath(), targetFile.getAbsolutePath()) != null) {
                    return Response.ok().build();
                } else {
                    return FsUtil.createErrorResponse(Status.INTERNAL_SERVER_ERROR, "rename/move failed");
                }
            } else {
                return FsUtil.createErrorResponse(Status.FORBIDDEN, "not allowed");
            }
        } catch (FileOperationException e) {
            return FsUtil.createErrorResponse(e);
        } catch (IOException e) {
            logger.error("{}", e.getMessage());
            return FsUtil.createErrorResponse(Status.INTERNAL_SERVER_ERROR, "rename/move failed");
        }
    }
}
