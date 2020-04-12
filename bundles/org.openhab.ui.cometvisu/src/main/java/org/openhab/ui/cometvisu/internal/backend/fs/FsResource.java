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

import java.io.File;
import java.math.BigDecimal;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.openhab.core.io.rest.RESTResource;
import org.openhab.ui.cometvisu.backend.rest.model.ReadResponse;
import org.openhab.ui.cometvisu.internal.Config;
import org.openhab.ui.cometvisu.internal.ManagerSettings;
import org.openhab.ui.cometvisu.internal.util.FileOperationException;
import org.openhab.ui.cometvisu.internal.util.FsUtil;
import org.openhab.ui.cometvisu.internal.util.MountedFile;
import org.osgi.service.component.annotations.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Filesystem backend for the cometvisu manager.
 *
 * @author Tobias Bräutigam - Initial contribution
 *
 */
@Component(immediate = true, service = { FsResource.class, RESTResource.class })
@Path(Config.COMETVISU_BACKEND_ALIAS + "/fs")
public class FsResource implements RESTResource {
    private final Logger logger = LoggerFactory.getLogger(FsResource.class);

    // @POST
    // @Consumes({ MediaType.MULTIPART_FORM_DATA, MediaType.TEXT_PLAIN })
    // public Response create(@QueryParam("path") String path, @QueryParam("type") String type,
    // @QueryParam("hash") String hash, @FormParam(value = "file") InputStream fileInputStream,
    // @FormParam(value = "filename") String filename,
    // @DefaultValue("false") @FormParam(value = "force") Boolean force) {
    // File folder = new File(
    // ManagerSettings.getInstance().getConfigFolder().getAbsolutePath() + File.separator + path);
    // File target = new File(folder.getAbsoluteFile() + File.pathSeparator + filename);
    // if (!target.exists() || force) {
    // if (folder.canWrite()) {
    // try {
    // FsUtil.getInstance().saveFile(target, fileInputStream, hash);
    // return Response.ok().build();
    // } catch (FileOperationException e) {
    // return Response.status(e.getStatus()).entity(e.getCause()).build();
    // } catch (Exception e) {
    // return Response.status(Status.FORBIDDEN).entity("").build();
    // }
    // } else {
    // return Response.status(Status.FORBIDDEN).entity("").build();
    // }
    // } else {
    // return Response.status(Status.NOT_ACCEPTABLE).entity("File already exists").build();
    // }
    // }

    @DELETE
    public Response delete(@QueryParam("path") String path, @QueryParam("hash") String hash,
            @QueryParam("force") Boolean force) {
        File file = new File(ManagerSettings.getInstance().getConfigFolder().getAbsolutePath() + File.separator + path);
        if (file.exists()) {
            if (file.isDirectory() && file.list().length > 0) {
                return Response.status(Status.NOT_ACCEPTABLE).entity("folder not empty").build();
            }
            // TODOS: move to trash, really delete when in trash
            file.delete();
            return Response.ok().build();
        } else {
            return Response.status(Status.NOT_FOUND).entity("file not found").build();
        }
    }

    @GET
    @Produces({ MediaType.APPLICATION_JSON, MediaType.TEXT_PLAIN, MediaType.APPLICATION_OCTET_STREAM })
    public Response read(@DefaultValue("") @QueryParam("path") String path,
            @DefaultValue("") @QueryParam("hash") BigDecimal hash,
            @DefaultValue("false") @QueryParam("download") Boolean download,
            @DefaultValue("false") @QueryParam("recursive") Boolean recursive) {

        try {
            MountedFile file = new MountedFile(path);
            logger.debug("read request for: " + file.getAbsolutePath());
            if (file.exists()) {
                if (file.isDirectory()) {
                    return Response.ok(FsUtil.getInstance().listDir(file, recursive), MediaType.APPLICATION_JSON)
                            .build();
                } else if (download) {
                    return Response.ok(file.toFile(), MediaType.APPLICATION_OCTET_STREAM)
                            .header("Content-Disposition", "attachment; filename=\"" + file.getName() + "\"").build();
                } else {
                    return Response.ok(file.toFile(), MediaType.TEXT_PLAIN).build();
                }
            } else if (path.equalsIgnoreCase("backup")) {
                // backup folder is always requested and will be created on demand, so we pretend as if its there and
                // empty
                return Response.ok(new ReadResponse(), MediaType.APPLICATION_JSON).build();
            } else {
                return Response.status(Status.NOT_FOUND).entity("file not found: " + file.getAbsolutePath()).build();
            }

        } catch (FileOperationException e) {
            return Response.status(e.getStatus()).entity(e.getCause()).build();
        }
    }

    @PUT
    @Consumes({ MediaType.TEXT_PLAIN, MediaType.TEXT_XML })
    public Response update(@QueryParam("path") String path, String body,
            @DefaultValue("ignore") @QueryParam("hash") String hash) {
        File target = new File(
                ManagerSettings.getInstance().getConfigFolder().getAbsolutePath() + File.separator + path);
        if (target.exists()) {
            if (target.canWrite()) {
                try {
                    FsUtil.getInstance().saveFile(target, body, hash);
                    return Response.ok().build();
                } catch (FileOperationException e) {
                    return Response.status(e.getStatus()).entity(e.getCause()).build();
                } catch (Exception e) {
                    return Response.status(Status.FORBIDDEN).entity("").build();
                }
            } else {
                return Response.status(Status.FORBIDDEN).entity("").build();
            }
        } else {
            return Response.status(Status.NOT_FOUND).entity("").build();
        }
    }

    private File getFile(String path) throws FileOperationException {
        String normalizedPath = path.equals(".") ? ""
                : (path.startsWith(File.separator) ? path : File.separator + path);
        if (normalizedPath.contains("../") || normalizedPath.contains("/..")) {
            throw new FileOperationException("path not allowed", Status.NOT_ACCEPTABLE);
        }
        return new File(ManagerSettings.getInstance().getConfigFolder().getAbsolutePath() + normalizedPath);
    }

}
