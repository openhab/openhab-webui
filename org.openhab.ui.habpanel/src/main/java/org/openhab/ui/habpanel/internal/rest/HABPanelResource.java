/**
 * Copyright (c) 2015-2017 by the respective copyright holders.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habpanel.internal.rest;

import java.util.stream.Stream;

import javax.annotation.security.RolesAllowed;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.eclipse.smarthome.core.auth.Role;
import org.eclipse.smarthome.io.rest.JSONResponse;
import org.eclipse.smarthome.io.rest.RESTResource;
import org.eclipse.smarthome.io.rest.Stream2JSONInputStream;
import org.openhab.ui.habpanel.internal.gallery.GalleryItem;
import org.openhab.ui.habpanel.internal.gallery.GalleryProviderFactory;
import org.openhab.ui.habpanel.internal.gallery.GalleryWidgetProvider;
import org.openhab.ui.habpanel.internal.gallery.GalleryWidgetsListItem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;

/**
 * This class describes the /habpanel resource of the REST API, currently holding facilities for browsing widget
 * galleries.
 *
 * @author Yannick Schaus - Initial contribution
 *
 */
@Path(HABPanelResource.PATH_HABPANEL)
@Api(HABPanelResource.PATH_HABPANEL)
public class HABPanelResource implements RESTResource {

    private final Logger logger = LoggerFactory.getLogger(HABPanelResource.class);

    public static final String PATH_HABPANEL = "habpanel";

    @GET
    @RolesAllowed({ Role.USER, Role.ADMIN })
    @Path("/gallery/{galleryName: [a-zA-Z_0-9]*}/widgets")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Gets the list of widget gallery items.")
    @ApiResponses(value = { @ApiResponse(code = 200, message = "OK", response = String.class),
            @ApiResponse(code = 404, message = "Unknown gallery") })
    public Response getGalleryWidgetList(
            @PathParam("galleryName") @ApiParam(value = "gallery name e.g. 'community'", required = true) String galleryName)
            throws Exception {

        GalleryWidgetProvider galleryProvider = GalleryProviderFactory.getWidgetGalleryProvider(galleryName);

        if (galleryProvider == null) {
            return JSONResponse.createResponse(Status.NOT_FOUND, null, "unknown gallery name!");
        }

        Stream<GalleryWidgetsListItem> stream = galleryProvider.getGalleryList();

        return Response.ok(new Stream2JSONInputStream(stream)).build();
    }

    @GET
    @RolesAllowed({ Role.USER, Role.ADMIN })
    @Path("/gallery/{galleryName: [a-zA-Z_0-9]*}/widgets/{id: [a-zA-Z_0-9]*}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Gets the details about a widget gallery item.")
    @ApiResponses(value = { @ApiResponse(code = 200, message = "OK", response = String.class),
            @ApiResponse(code = 404, message = "Unknown gallery or gallery item not found") })
    public Response getGalleryWidgetsItem(
            @PathParam("galleryName") @ApiParam(value = "gallery name e.g. 'community'", required = true) String galleryName,
            @PathParam("id") @ApiParam(value = "id within the gallery", required = true) String id) throws Exception {

        GalleryWidgetProvider galleryProvider = GalleryProviderFactory.getWidgetGalleryProvider(galleryName);

        if (galleryProvider == null) {
            return JSONResponse.createResponse(Status.NOT_FOUND, null, "unknown gallery name!");
        }

        GalleryItem item = galleryProvider.getGalleryItem(id);

        return Response.ok(item).build();
    }

}
