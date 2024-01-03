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

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.openhab.core.auth.Role;
import org.openhab.core.io.rest.JSONResponse;
import org.openhab.core.io.rest.RESTConstants;
import org.openhab.core.io.rest.RESTResource;
import org.openhab.core.io.rest.Stream2JSONInputStream;
import org.openhab.ui.habpanel.internal.gallery.GalleryItem;
import org.openhab.ui.habpanel.internal.gallery.GalleryProviderFactory;
import org.openhab.ui.habpanel.internal.gallery.GalleryWidgetProvider;
import org.openhab.ui.habpanel.internal.gallery.GalleryWidgetsListItem;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.jaxrs.whiteboard.JaxrsWhiteboardConstants;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JSONRequired;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JaxrsApplicationSelect;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JaxrsName;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JaxrsResource;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * This class describes the /habpanel resource of the REST API, currently holding facilities for browsing widget
 * galleries.
 *
 * @author Yannick Schaus - Initial contribution
 * @author Wouter Born - Migrated to OpenAPI annotations
 */
@Component
@JaxrsResource
@JaxrsName(HABPanelResource.PATH_HABPANEL)
@JaxrsApplicationSelect("(" + JaxrsWhiteboardConstants.JAX_RS_NAME + "=" + RESTConstants.JAX_RS_NAME + ")")
@JSONRequired
@Path(HABPanelResource.PATH_HABPANEL)
@Tag(name = HABPanelResource.PATH_HABPANEL)
@NonNullByDefault
public class HABPanelResource implements RESTResource {

    public static final String PATH_HABPANEL = "habpanel";

    @GET
    @RolesAllowed({ Role.USER, Role.ADMIN })
    @Path("/gallery/{galleryName: [a-zA-Z_0-9]*}/widgets")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Gets the list of widget gallery items.", responses = {
            @ApiResponse(responseCode = "200", description = "OK", content = @Content(array = @ArraySchema(schema = @Schema(implementation = GalleryWidgetsListItem.class)))),
            @ApiResponse(responseCode = "404", description = "Unknown gallery") })
    public Response getGalleryWidgetList(
            @PathParam("galleryName") @Parameter(description = "gallery name e.g. 'community'") String galleryName)
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
    @Operation(summary = "Gets the details about a widget gallery item.", responses = {
            @ApiResponse(responseCode = "200", description = "OK", content = @Content(schema = @Schema(implementation = GalleryItem.class))),
            @ApiResponse(responseCode = "404", description = "Unknown gallery or gallery item not found") })
    public Response getGalleryWidgetsItem(
            @PathParam("galleryName") @Parameter(description = "gallery name e.g. 'community'") String galleryName,
            @PathParam("id") @Parameter(description = "id within the gallery") String id) throws Exception {
        GalleryWidgetProvider galleryProvider = GalleryProviderFactory.getWidgetGalleryProvider(galleryName);

        if (galleryProvider == null) {
            return JSONResponse.createResponse(Status.NOT_FOUND, null, "unknown gallery name!");
        }

        GalleryItem item = galleryProvider.getGalleryItem(id);

        return Response.ok(item).build();
    }
}
