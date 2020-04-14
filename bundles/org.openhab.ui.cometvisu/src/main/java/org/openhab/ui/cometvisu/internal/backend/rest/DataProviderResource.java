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

import org.openhab.core.io.rest.RESTResource;
import org.openhab.core.items.GroupItem;
import org.openhab.core.items.Item;
import org.openhab.core.items.ItemRegistry;
import org.openhab.core.persistence.PersistenceItemInfo;
import org.openhab.core.persistence.PersistenceService;
import org.openhab.core.persistence.QueryablePersistenceService;
import org.openhab.ui.cometvisu.backend.rest.model.DataProviderEntry;
import org.openhab.ui.cometvisu.backend.rest.model.DataProviderHint;
import org.openhab.ui.cometvisu.backend.rest.model.DataProviderResponse;
import org.openhab.ui.cometvisu.internal.Config;
import org.openhab.ui.cometvisu.internal.ManagerSettings;
import org.openhab.ui.cometvisu.internal.config.ConfigHelper.Transform;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;

/**
 * DataProvider backend for the cometvisu manager.
 *
 * @author Tobias Bräutigam - Initial contribution
 *
 */
@Component
@Path(Config.COMETVISU_BACKEND_ALIAS + "/data")
@Api(Config.COMETVISU_BACKEND_ALIAS + "/data")
public class DataProviderResource implements RESTResource {
    private final Logger logger = LoggerFactory.getLogger(DataProviderResource.class);

    private ItemRegistry itemRegistry;
    protected static Map<String, QueryablePersistenceService> persistenceServices = new HashMap<>();

    @Reference(cardinality = ReferenceCardinality.OPTIONAL, policy = ReferencePolicy.DYNAMIC)
    protected void setItemRegistry(ItemRegistry itemRegistry) {
        this.itemRegistry = itemRegistry;
    }

    protected void unsetItemRegistry(ItemRegistry itemRegistry) {
        this.itemRegistry = null;
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
    @ApiOperation(value = "Returns the list of available addresses.")
    @ApiResponses(value = { @ApiResponse(code = 200, message = "OK", response = Map.class) })
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
            System.out.println(item.toString() + "/" + item.getType());
            if (item.getType() == "Group") {
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
            if (!groups.containsKey(type)) {
                groups.put(type, new ArrayList<>());
            }
            groups.get(type).add(entry);
        }
        System.out.println(groups.size() + "/" + this.itemRegistry.getItems().size());
        return Response.ok(groups).build();
    }

    @GET
    @Path("/designs")
    @Produces({ MediaType.APPLICATION_JSON })
    @ApiOperation(value = "Returns the list of available designs.")
    @ApiResponses(value = { @ApiResponse(code = 200, message = "OK", response = List.class) })
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
    @ApiOperation(value = "Returns the list of available influx database tags.")
    @ApiResponses(value = { @ApiResponse(code = 200, message = "OK") })
    public Response getInfluxDBFields(@QueryParam("auth") String auth, @QueryParam("measurement") String measurement) {
        // this is not supported by the openHAB backend
        return Response.ok().build();
    }

    @GET
    @Path("/influxdbtags")
    @Produces({ MediaType.APPLICATION_JSON })
    @ApiOperation(value = "Returns the list of available influx database fields.")
    @ApiResponses(value = { @ApiResponse(code = 200, message = "OK") })
    public Response getInfluxDBTags(@QueryParam("auth") String auth, @QueryParam("measurement") String measurement) {
        // this is not supported by the openHAB backend
        return Response.ok().build();
    }

    @GET
    @Path("/influxdbs")
    @Produces({ MediaType.APPLICATION_JSON })
    @ApiOperation(value = "Returns the list of available influx databases.")
    @ApiResponses(value = { @ApiResponse(code = 200, message = "OK") })
    public Response getInfluxDBs(@QueryParam("auth") String auth) {
        // this is not supported by the openHAB backend
        return Response.ok().build();
    }

    @GET
    @Path("/rrds")
    @Produces({ MediaType.APPLICATION_JSON })
    @ApiOperation(value = "Returns the list of available RRDs.")
    @ApiResponses(value = { @ApiResponse(code = 200, message = "OK", response = DataProviderResponse.class) })
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
