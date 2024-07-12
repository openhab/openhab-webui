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
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import javax.annotation.security.RolesAllowed;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.openhab.core.auth.Role;
import org.openhab.core.io.rest.RESTConstants;
import org.openhab.core.io.rest.RESTResource;
import org.openhab.ui.cometvisu.internal.Config;
import org.openhab.ui.cometvisu.internal.ManagerSettings;
import org.openhab.ui.cometvisu.internal.backend.model.rest.ReadResponse;
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
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Filesystem backend for the cometvisu manager.
 *
 * @author Tobias Bräutigam - Initial contribution
 * @author Wouter Born - Migrated to JAX-RS Whiteboard Specification
 * @author Wouter Born - Migrated to OpenAPI annotations
 */
@Component
@JaxrsResource
@JaxrsName(Config.COMETVISU_BACKEND_ALIAS + "/fs")
@JaxrsApplicationSelect("(" + JaxrsWhiteboardConstants.JAX_RS_NAME + "=" + RESTConstants.JAX_RS_NAME + ")")
@JSONRequired
@Path(Config.COMETVISU_BACKEND_ALIAS + "/fs")
@Tag(name = Config.COMETVISU_BACKEND_ALIAS + "/fs")
@NonNullByDefault
public class FsResource implements RESTResource {
    private final Logger logger = LoggerFactory.getLogger(FsResource.class);

    @POST
    @RolesAllowed({ Role.USER, Role.ADMIN })
    @Consumes("text/*")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Create a text file", responses = { @ApiResponse(responseCode = "200", description = "OK"),
            @ApiResponse(responseCode = "403", description = "not allowed"),
            @ApiResponse(responseCode = "406", description = "File already exists") })
    public Response create(@QueryParam("path") String path, @QueryParam("type") String type,
            @QueryParam("hash") String hash, @Parameter(description = "file content") String body,
            @DefaultValue("false") @QueryParam("force") Boolean force) {
        MountedFile file;
        try {
            file = new MountedFile(path);
            File folder = file.toFile().toPath().getParent().toFile();
            if (!file.exists() || force) {
                if (!file.isReadonlyMount() && folder.canWrite()) {
                    try {
                        FsUtil.getInstance().saveFile(file.toFile(), body, hash);
                        return Response.ok().build();
                    } catch (FileOperationException e) {
                        return FsUtil.createErrorResponse(e);
                    } catch (Exception e) {
                        return FsUtil.createErrorResponse(Status.FORBIDDEN, "forbidden");
                    }
                } else {
                    return FsUtil.createErrorResponse(Status.FORBIDDEN, "forbidden");
                }
            } else {
                return FsUtil.createErrorResponse(Status.NOT_ACCEPTABLE, "File already exists");
            }
        } catch (FileOperationException e1) {
            return FsUtil.createErrorResponse(e1);
        }
    }

    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Create a binary file", responses = { @ApiResponse(responseCode = "200", description = "OK"),
            @ApiResponse(responseCode = "403", description = "not allowed"),
            @ApiResponse(responseCode = "406", description = "File already exists") })
    public Response createBinary(@Context HttpServletRequest request,
            @Parameter(description = "Relative path inside the config folder", required = true) @QueryParam("path") String path,
            @QueryParam("type") String type,
            @Parameter(description = "CRC32 hash of the file content") @QueryParam("hash") String hash,
            @Parameter(description = "force overriding existing file") @DefaultValue("false") @FormParam("force") Boolean force,
            @Parameter(description = "file content") @FormParam("file") Object fileParam) {
        MountedFile target;
        try {
            MultipartRequestMap map = new MultipartRequestMap(request);
            File file = map.getFileParameter("file");
            target = new MountedFile(Paths.get(path, file.getName()).toString());
            File folder = target.toFile().toPath().getParent().toFile();
            if (!target.exists() || force) {
                if (!target.isReadonlyMount() && folder.canWrite()) {
                    try {
                        FsUtil.getInstance().saveFile(target.toFile(), new FileInputStream(file), hash);
                        return Response.ok().build();
                    } catch (FileOperationException e) {
                        return FsUtil.createErrorResponse(e);
                    } catch (Exception e) {
                        return FsUtil.createErrorResponse(Status.FORBIDDEN, "forbidden");
                    }
                } else {
                    return FsUtil.createErrorResponse(Status.FORBIDDEN, "forbidden");
                }
            } else {
                return FsUtil.createErrorResponse(Status.NOT_ACCEPTABLE, "File already exists");
            }
        } catch (FileOperationException e1) {
            return FsUtil.createErrorResponse(e1);
        }
    }

    @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({ Role.USER, Role.ADMIN })
    @Operation(summary = "Deletes a file/folder", responses = { @ApiResponse(responseCode = "200", description = "OK"),
            @ApiResponse(responseCode = "403", description = "not allowed"),
            @ApiResponse(responseCode = "404", description = "File/Folder not found"),
            @ApiResponse(responseCode = "406", description = "Folder not empty") })
    public Response delete(
            @Parameter(description = "Relative path inside the config folder", required = true) @QueryParam("path") String path,
            @Parameter(description = "force deletion of non empty folders") @QueryParam("force") Boolean force) {
        MountedFile file;
        try {
            file = new MountedFile(path);
            if (file.exists()) {
                if (file.isDirectory() && file.hasChildren()) {
                    return FsUtil.createErrorResponse(Status.NOT_ACCEPTABLE, "folder not empty");
                }
                if (file.isReadonlyMount() || !file.toFile().canWrite()) {
                    return FsUtil.createErrorResponse(Status.FORBIDDEN, "forbidden");
                }
                if (FsUtil.getInstance().isInTrash(file.toFile())) {
                    // really delete the file in trash
                    file.toFile().delete();
                    return Response.ok().build();
                } else {
                    // move to trash
                    java.nio.file.Path inTrash = Paths.get(ManagerSettings.getInstance().getTrashPath(),
                            file.getName());
                    try {
                        File trashFolder = new File(ManagerSettings.getInstance().getTrashPath());
                        if (!trashFolder.exists()) {
                            trashFolder.mkdir();
                        }
                        if (Files.move(file.getAbsolutePath(), inTrash, StandardCopyOption.REPLACE_EXISTING) != null) {
                            return Response.ok().build();
                        } else {
                            return FsUtil.createErrorResponse(Status.INTERNAL_SERVER_ERROR, "error moving to trash");
                        }
                    } catch (IOException e) {
                        return FsUtil.createErrorResponse(Status.INTERNAL_SERVER_ERROR, "error moving to trash");
                    }
                }
            } else {
                return FsUtil.createErrorResponse(Status.NOT_FOUND, "file not found");
            }
        } catch (FileOperationException e1) {
            return FsUtil.createErrorResponse(e1);
        }
    }

    @GET
    @Produces({ MediaType.APPLICATION_JSON, MediaType.TEXT_PLAIN, MediaType.APPLICATION_OCTET_STREAM })
    @Operation(summary = "Return directory listing or file content", responses = {
            @ApiResponse(responseCode = "200", description = "OK"),
            @ApiResponse(responseCode = "403", description = "not allowed"),
            @ApiResponse(responseCode = "404", description = "File/Folder not found") })
    public Response read(
            @Parameter(description = "Relative path inside the config folder", required = true, content = @Content(schema = @Schema(implementation = String.class, defaultValue = ""))) @QueryParam("path") String path,
            @Parameter(description = "should the file be downloaded?", content = @Content(schema = @Schema(implementation = Boolean.class, defaultValue = "false"))) @DefaultValue("false") @QueryParam("download") Boolean download,
            @Parameter(description = "also include all sub-folders in the directory listing", content = @Content(schema = @Schema(implementation = Boolean.class, defaultValue = "false"))) @DefaultValue("false") @QueryParam("recursive") Boolean recursive) {
        try {
            MountedFile file = new MountedFile(path);
            logger.debug("read request for: {}", file.getAbsolutePath());
            if (file.exists()) {
                if (file.isDirectory()) {
                    return Response.ok(FsUtil.getInstance().listDir(file, recursive), MediaType.APPLICATION_JSON)
                            .build();
                } else if (download) {
                    return Response.ok(file.toFile(), MediaType.APPLICATION_OCTET_STREAM)
                            .header("Content-Disposition", "attachment; filename=\"" + file.getName() + "\"").build();
                } else {
                    try {
                        String mimetype = Files.probeContentType(file.getAbsolutePath());
                        return Response.ok(file.toFile(), mimetype).build();
                    } catch (IOException e) {
                        // use text type all fallback
                        return Response.ok(file.toFile(), MediaType.TEXT_PLAIN).build();
                    }
                }
            } else if ("backup".equalsIgnoreCase(path)) {
                // backup folder is always requested and will be created on demand, so we pretend as if its there and
                // empty
                return Response.ok(new ReadResponse(), MediaType.APPLICATION_JSON).build();
            } else {
                return FsUtil.createErrorResponse(Status.NOT_FOUND, "file not found: " + file.getAbsolutePath());
            }
        } catch (FileOperationException e) {
            return FsUtil.createErrorResponse(e);
        }
    }

    @PUT
    @RolesAllowed({ Role.USER, Role.ADMIN })
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes({ MediaType.TEXT_PLAIN, MediaType.TEXT_XML })
    @Operation(summary = "Update an existing file", responses = {
            @ApiResponse(responseCode = "200", description = "OK"),
            @ApiResponse(responseCode = "403", description = "not allowed"),
            @ApiResponse(responseCode = "404", description = "File does not exist") })
    public Response update(
            @Parameter(description = "Relative path inside the config folder", required = true) @QueryParam("path") String path,
            @Parameter(description = "file content") String body,
            @Parameter(description = "CRC32 hash value of the file content", content = @Content(schema = @Schema(implementation = String.class, defaultValue = "ignore"))) @DefaultValue("ignore") @QueryParam("hash") String hash) {
        File target = new File(
                ManagerSettings.getInstance().getConfigFolder().getAbsolutePath() + File.separator + path);
        if (target.exists()) {
            if (target.canWrite()) {
                try {
                    FsUtil.getInstance().saveFile(target, body, hash);
                    return Response.ok().build();
                } catch (FileOperationException e) {
                    return FsUtil.createErrorResponse(e);
                } catch (Exception e) {
                    return FsUtil.createErrorResponse(Status.FORBIDDEN, "forbidden");
                }
            } else {
                return FsUtil.createErrorResponse(Status.FORBIDDEN, "forbidden");
            }
        } else {
            return FsUtil.createErrorResponse(Status.NOT_FOUND, "not found");
        }
    }
}
