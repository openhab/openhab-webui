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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.openhab.core.io.rest.RESTConstants;
import org.openhab.core.io.rest.RESTResource;
import org.openhab.core.items.GroupItem;
import org.openhab.core.items.Item;
import org.openhab.core.items.ItemRegistry;
import org.openhab.core.persistence.PersistenceItemInfo;
import org.openhab.core.persistence.PersistenceService;
import org.openhab.core.persistence.QueryablePersistenceService;
import org.openhab.ui.cometvisu.internal.Config;
import org.openhab.ui.cometvisu.internal.ManagerSettings;
import org.openhab.ui.cometvisu.internal.backend.model.rest.DataProviderEntry;
import org.openhab.ui.cometvisu.internal.backend.model.rest.DataProviderHint;
import org.openhab.ui.cometvisu.internal.backend.model.rest.DataProviderResponse;
import org.openhab.ui.cometvisu.internal.backend.sitemap.ConfigHelper.Transform;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;
import org.osgi.service.jaxrs.whiteboard.JaxrsWhiteboardConstants;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JSONRequired;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JaxrsApplicationSelect;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JaxrsName;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JaxrsResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * DataProvider backend for the cometvisu manager.
 *
 * @author Tobias Bräutigam - Initial contribution
 * @author Wouter Born - Migrated to JAX-RS Whiteboard Specification
 * @author Wouter Born - Migrated to OpenAPI annotations
 */
@Component
@JaxrsResource
@JaxrsName(Config.COMETVISU_BACKEND_ALIAS + "/data")
@JaxrsApplicationSelect("(" + JaxrsWhiteboardConstants.JAX_RS_NAME + "=" + RESTConstants.JAX_RS_NAME + ")")
@JSONRequired
@Path(Config.COMETVISU_BACKEND_ALIAS + "/data")
@Tag(name = Config.COMETVISU_BACKEND_ALIAS + "/data")
@NonNullByDefault
public class DataProviderResource implements RESTResource {
    private final Logger logger = LoggerFactory.getLogger(DataProviderResource.class);

    private final ItemRegistry itemRegistry;
    private final Map<String, QueryablePersistenceService> persistenceServices = new HashMap<>();

    @Activate
    public DataProviderResource(final @Reference ItemRegistry itemRegistry) {
        this.itemRegistry = itemRegistry;
    }

    @Reference(cardinality = ReferenceCardinality.MULTIPLE, policy = ReferencePolicy.DYNAMIC)
    public void addPersistenceService(PersistenceService service) {
        if (service instanceof QueryablePersistenceService) {
            persistenceServices.put(service.getId(), (QueryablePersistenceService) service);
        }
    }

    public void removePersistenceService(PersistenceService service) {
        persistenceServices.remove(service.getId());
    }

    @GET
    @Path("/addresses")
    @Produces({ MediaType.APPLICATION_JSON })
    @Operation(summary = "Returns the list of available addresses.", responses = {
            @ApiResponse(responseCode = "200", description = "OK", content = @Content(schema = @Schema(implementation = Map.class))) })
    public Response getAddresses() {
        // collect all available transform types
        List<String> transformTypes = new ArrayList<>();
        for (Transform transform : Transform.values()) {
            transformTypes.add(transform.toString().toLowerCase());
        }

        Map<String, List<Object>> groups = new HashMap<>();
        for (Item item : this.itemRegistry.getItems()) {
            DataProviderEntry entry = new DataProviderEntry();
            entry.setValue(item.getName());

            String type = item.getType();
            if ("Group".equals(item.getType())) {
                Item groupItem = ((GroupItem) item).getBaseItem();
                if (groupItem != null) {
                    type = groupItem.getType();
                } else {
                    continue;
                }
            }
            entry.setLabel(item.getName());
            String transform = type.toLowerCase().replace("Item", "");
            if (transformTypes.contains(transform)) {
                DataProviderHint hint = new DataProviderHint();
                hint.put("transform", "OH:" + transform);
                entry.getHints().add(hint);
            } else {
                logger.debug("no transform type found for item type {}, skipping this item", type);
                continue;
            }

            List<Object> group = groups.get(type);
            if (group == null) {
                group = new ArrayList<>();
                groups.put(type, group);
            }
            group.add(entry);
        }
        return Response.ok(groups).build();
    }

    @GET
    @Path("/designs")
    @Produces({ MediaType.APPLICATION_JSON })
    @Operation(summary = "Returns the list of available designs.", responses = {
            @ApiResponse(responseCode = "200", description = "OK", content = @Content(array = @ArraySchema(schema = @Schema(implementation = String.class)))) })
    public List<String> getDesigns() {
        // all designs
        File designDir = ManagerSettings.getInstance().getDesignFolder();
        File[] designs = designDir.listFiles();
        List<String> res = new ArrayList<String>();
        if (designs != null) {
            Arrays.sort(designs);
            for (File design : designs) {
                if (design.isDirectory()) {
                    res.add(design.getName());
                }
            }
        }
        return res;
    }

    @GET
    @Path("/influxdbfields")
    @Produces({ MediaType.APPLICATION_JSON })
    @Operation(summary = "Returns the list of available influx database tags.", responses = {
            @ApiResponse(responseCode = "200", description = "OK") })
    public Response getInfluxDBFields(@QueryParam("auth") String auth, @QueryParam("measurement") String measurement) {
        // this is not supported by the openHAB backend
        return Response.ok().build();
    }

    @GET
    @Path("/influxdbtags")
    @Produces({ MediaType.APPLICATION_JSON })
    @Operation(summary = "Returns the list of available influx database fields.", responses = {
            @ApiResponse(responseCode = "200", description = "OK") })
    public Response getInfluxDBTags(@QueryParam("auth") String auth, @QueryParam("measurement") String measurement) {
        // this is not supported by the openHAB backend
        return Response.ok().build();
    }

    @GET
    @Path("/influxdbs")
    @Produces({ MediaType.APPLICATION_JSON })
    @Operation(summary = "Returns the list of available influx databases.", responses = {
            @ApiResponse(responseCode = "200", description = "OK") })
    public Response getInfluxDBs(@QueryParam("auth") String auth) {
        // this is not supported by the openHAB backend
        return Response.ok().build();
    }

    @GET
    @Path("/rrds")
    @Produces({ MediaType.APPLICATION_JSON })
    @Operation(summary = "Returns the list of available RRDs.", responses = {
            @ApiResponse(responseCode = "200", description = "OK", content = @Content(schema = @Schema(implementation = DataProviderResponse.class))) })
    public Response getRRDs() {
        DataProviderResponse res = new DataProviderResponse();
        for (final QueryablePersistenceService service : persistenceServices.values()) {
            for (final PersistenceItemInfo info : service.getItemInfo()) {
                DataProviderEntry entry = new DataProviderEntry();
                entry.setLabel(info.getName() + "(" + info.getCount() + ")");
                entry.setValue(info.getName());

            }
        }
        return Response.ok(res).build();
    }
}
