/**
 * Copyright (c) 2010-2019 Contributors to the openHAB project
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
package org.openhab.ui.cometvisu.internal.backend;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Map.Entry;
import java.util.TreeMap;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

import org.eclipse.smarthome.core.items.GroupItem;
import org.eclipse.smarthome.core.items.Item;
import org.eclipse.smarthome.core.items.ItemNotFoundException;
import org.eclipse.smarthome.core.items.ItemRegistry;
import org.eclipse.smarthome.core.library.types.DecimalType;
import org.eclipse.smarthome.core.persistence.FilterCriteria;
import org.eclipse.smarthome.core.persistence.FilterCriteria.Ordering;
import org.eclipse.smarthome.core.persistence.HistoricItem;
import org.eclipse.smarthome.core.persistence.PersistenceService;
import org.eclipse.smarthome.core.persistence.QueryablePersistenceService;
import org.eclipse.smarthome.io.rest.RESTResource;
import org.openhab.ui.cometvisu.internal.Config;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;
import org.rrd4j.ConsolFun;
import org.rrd4j.core.FetchData;
import org.rrd4j.core.FetchRequest;
import org.rrd4j.core.RrdDb;
import org.rrd4j.core.Util;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * handles requests for chart series data from the CometVisu client
 * used by the diagram plugin
 *
 * @author Tobias Bräutigam - Initial contribution
 *
 */
@Component(immediate = true, service = { ChartResource.class, RESTResource.class })
@Path(Config.COMETVISU_BACKEND_ALIAS + "/" + Config.COMETVISU_BACKEND_CHART_ALIAS)
public class ChartResource implements RESTResource {
    private final Logger logger = LoggerFactory.getLogger(ChartResource.class);

    // pattern RRDTool uses to format doubles in XML files
    private static final String PATTERN = "0.0000000000E00";

    private static final DecimalFormat DECIMAL_FORMAT;

    protected static final String RRD_FOLDER = org.eclipse.smarthome.config.core.ConfigConstants.getUserDataFolder()
            + File.separator + "persistence" + File.separator + "rrd4j";

    static {
        DECIMAL_FORMAT = (DecimalFormat) NumberFormat.getNumberInstance(Locale.ENGLISH);
        DECIMAL_FORMAT.applyPattern(PATTERN);
    }

    protected static Map<String, QueryablePersistenceService> persistenceServices = new HashMap<>();

    private ItemRegistry itemRegistry;

    @Context
    private UriInfo uriInfo;

    @Reference(cardinality = ReferenceCardinality.MULTIPLE, policy = ReferencePolicy.DYNAMIC)
    public void addPersistenceService(PersistenceService service) {
        if (service instanceof QueryablePersistenceService) {
            persistenceServices.put(service.getId(), (QueryablePersistenceService) service);
        }
    }

    public void removePersistenceService(PersistenceService service) {
        persistenceServices.remove(service.getId());
    }

    public static Map<String, QueryablePersistenceService> getPersistenceServices() {
        return persistenceServices;
    }

    @Reference
    protected void setItemRegistry(ItemRegistry itemRegistry) {
        this.itemRegistry = itemRegistry;
    }

    protected void unsetItemRegistry(ItemRegistry itemRegistry) {
        this.itemRegistry = null;
    }

    @GET
    @Produces({ MediaType.APPLICATION_JSON })
    public Response getChartSeries(@Context HttpHeaders headers, @QueryParam("rrd") String itemName,
            @QueryParam("ds") String consFunction, @QueryParam("start") String start, @QueryParam("end") String end,
            @QueryParam("res") long resolution) {
        if (logger.isDebugEnabled()) {
            logger.debug("Received GET request at '{}' for rrd '{}'.", uriInfo.getPath(), itemName);
        }
        String responseType = MediaType.APPLICATION_JSON;

        // RRD specific: no equivalent in PersistenceService known
        ConsolFun consilidationFunction = ConsolFun.valueOf(consFunction);

        // read the start/end time as they are provided in the RRD-way, we use
        // the RRD4j to read them
        long[] times = Util.getTimestamps(start, end);
        Date startTime = new Date();
        startTime.setTime(times[0] * 1000L);
        Date endTime = new Date();
        endTime.setTime(times[1] * 1000L);

        if (itemName.endsWith(".rrd")) {
            itemName = itemName.substring(0, itemName.length() - 4);
        }
        String[] parts = itemName.split(":");
        String service = "rrd4j";

        if (parts.length == 2) {
            itemName = parts[1];
            service = parts[0];
        }

        Item item;
        try {
            item = itemRegistry.getItem(itemName);
            logger.debug("item '{}' found ", item);

            // Prefer RRD-Service
            QueryablePersistenceService persistenceService = getPersistenceServices().get(service);
            // Fallback to first persistenceService from list
            if (persistenceService == null) {
                Iterator<Entry<String, QueryablePersistenceService>> pit = getPersistenceServices().entrySet()
                        .iterator();
                if (pit.hasNext()) {
                    persistenceService = pit.next().getValue();
                    logger.debug("required persistence service ({}) not found, using {} instead", service,
                            persistenceService.getId());
                } else {
                    throw new IllegalArgumentException("No Persistence service found.");
                }
            } else {
                logger.debug("using {} persistence for item {}", persistenceService.getId(), itemName);
            }
            Object data = null;
            if (persistenceService.getId().equals("rrd4j")) {
                data = getRrdSeries(persistenceService, item, consilidationFunction, startTime, endTime, resolution);
            } else {
                data = getPersistenceSeries(persistenceService, item, startTime, endTime, resolution);
            }
            return Response.ok(data, responseType).build();
        } catch (ItemNotFoundException e1) {
            logger.error("Item '{}' not found error while requesting series data.", itemName);

        }
        return Response.serverError().build();
    }

    public Object getPersistenceSeries(QueryablePersistenceService persistenceService, Item item, Date timeBegin,
            Date timeEnd, long resolution) {
        Map<Long, List<String>> data = new HashMap<>();

        // Define the data filter
        FilterCriteria filter = new FilterCriteria();
        filter.setBeginDate(timeBegin);
        filter.setEndDate(timeEnd);
        filter.setItemName(item.getName());
        filter.setOrdering(Ordering.ASCENDING);

        // Get the data from the persistence store
        Iterable<HistoricItem> result = persistenceService.query(filter);
        Iterator<HistoricItem> it = result.iterator();

        // Iterate through the data
        int dataCounter = 0;
        while (it.hasNext()) {
            dataCounter++;
            HistoricItem historicItem = it.next();
            org.eclipse.smarthome.core.types.State state = historicItem.getState();
            if (state instanceof DecimalType) {
                List<String> vals = new ArrayList<>();
                vals.add(formatDouble(((DecimalType) state).doubleValue(), "null", true));
                data.put(historicItem.getTimestamp().getTime(), vals);
            }
        }
        logger.debug("'{}' querying item '{}' from '{}' to '{}' => '{}' results", persistenceService.getId(),
                filter.getItemName(), filter.getBeginDate(), filter.getEndDate(), dataCounter);
        return convertToRrd(data);
    }

    /**
     * returns a rrd series data, an array of [[timestamp,data1,data2,...]]
     *
     * @param persistenceService
     * @param item
     * @param consilidationFunction
     * @param timeBegin
     * @param timeEnd
     * @param resolution
     * @return
     */
    public Object getRrdSeries(QueryablePersistenceService persistenceService, Item item,
            ConsolFun consilidationFunction, Date timeBegin, Date timeEnd, long resolution) {
        Map<Long, List<String>> data = new TreeMap<>();
        try {
            List<String> itemNames = new ArrayList<>();

            if (item instanceof GroupItem) {
                GroupItem groupItem = (GroupItem) item;
                for (Item member : groupItem.getMembers()) {
                    itemNames.add(member.getName());
                }
            } else {
                itemNames.add(item.getName());
            }
            for (String itemName : itemNames) {
                addRrdData(data, itemName, consilidationFunction, timeBegin, timeEnd, resolution);
            }

        } catch (FileNotFoundException e) {
            // rrd file does not exist, fallback to generic persistence service
            logger.debug("no rrd file found '{}'", (RRD_FOLDER + File.separator + item.getName() + ".rrd"));
            return getPersistenceSeries(persistenceService, item, timeBegin, timeEnd, resolution);
        } catch (Exception e) {
            logger.error("{}: fallback to generic persistance service", e.getLocalizedMessage());
            return getPersistenceSeries(persistenceService, item, timeBegin, timeEnd, resolution);
        }
        return convertToRrd(data);
    }

    private List<Object> convertToRrd(Map<Long, List<String>> data) {
        // sort data by key
        Map<Long, List<String>> treeMap = new TreeMap<>(data);
        List<Object> rrd = new ArrayList<>();
        for (Long time : treeMap.keySet()) {
            Object[] entry = new Object[2];
            entry[0] = time;
            entry[1] = data.get(time);
            rrd.add(entry);
        }
        return rrd;
    }

    private Map<Long, List<String>> addRrdData(Map<Long, List<String>> data, String itemName,
            ConsolFun consilidationFunction, Date timeBegin, Date timeEnd, long resolution) throws IOException {
        RrdDb rrdDb = new RrdDb(RRD_FOLDER + File.separator + itemName + ".rrd");
        FetchRequest fetchRequest = rrdDb.createFetchRequest(consilidationFunction, Util.getTimestamp(timeBegin),
                Util.getTimestamp(timeEnd), resolution);
        FetchData fetchData = fetchRequest.fetchData();
        long[] timestamps = fetchData.getTimestamps();
        double[][] values = fetchData.getValues();

        logger.debug("RRD fetch returned '{}' rows and '{}' columns", fetchData.getRowCount(),
                fetchData.getColumnCount());

        for (int row = 0; row < fetchData.getRowCount(); row++) {
            // change to microseconds
            long time = timestamps[row] * 1000;

            if (!data.containsKey(time)) {
                data.put(time, new ArrayList<>());
            }
            List<String> vals = data.get(time);
            int indexOffset = vals.size();
            for (int dsIndex = 0; dsIndex < fetchData.getColumnCount(); dsIndex++) {
                vals.add(dsIndex + indexOffset, formatDouble(values[dsIndex][row], "null", true));
            }
        }
        rrdDb.close();

        return data;
    }

    static String formatDouble(double x, String nanString, boolean forceExponents) {
        if (Double.isNaN(x)) {
            return nanString;
        }
        if (forceExponents) {
            return DECIMAL_FORMAT.format(x);
        }
        return "" + x;
    }
}
