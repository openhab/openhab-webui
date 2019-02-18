/**
 * Copyright (c) 2010-2013, openHAB.org and others.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habmin.internal.services.dashboard;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

import org.eclipse.smarthome.config.core.ConfigConstants;
import org.eclipse.smarthome.io.rest.RESTResource;
import org.openhab.ui.habmin.HABminConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.thoughtworks.xstream.XStream;
import com.thoughtworks.xstream.io.xml.StaxDriver;

import io.swagger.annotations.Api;

/**
 * <p>
 * This class acts as a REST resource for history data and provides different methods to interact with the, persistence
 * store
 *
 * <p>
 * The typical content types are plain text for status values and XML or JSON(P) for more complex data structures
 * </p>
 *
 * <p>
 * This resource is registered with the Jersey servlet.
 * </p>
 *
 * @author Chris Jackson
 */
@Path(DashboardResource.PATH)
@Api(value = DashboardResource.API)
public class DashboardResource implements RESTResource {

    private static String DASHBOARD_FILE = "dashboards.xml";

    private static final Logger logger = LoggerFactory.getLogger(DashboardResource.class);

    /** The URI path to this resource */
    public static final String PATH = "habmin/dashboards";
    public static final String API = "habmin-dashboards";

    @Context
    UriInfo uriInfo;

    @GET
    @Produces({ MediaType.APPLICATION_JSON })
    public Response httpGetDashboards(@Context HttpHeaders headers) {
        logger.trace("Received HTTP GET request at '{}'.", uriInfo.getPath());

        Object responseObject = getDashboardList();
        return Response.ok(responseObject).build();
    }

    @POST
    @Produces({ MediaType.APPLICATION_JSON })
    public Response httpPostDashboards(@Context HttpHeaders headers, DashboardConfigBean dashboard) {
        logger.trace("Received HTTP POST request at '{}'.", uriInfo.getPath());

        Object responseObject = putDashboardBean(0, dashboard);
        return Response.ok(responseObject).build();
    }

    @PUT
    @Path("/{dashboardId: [a-zA-Z_0-9]*}")
    @Produces({ MediaType.APPLICATION_JSON })
    public Response httpPutDashboards(@Context HttpHeaders headers, @PathParam("dashboardId") Integer dashboardId,
            DashboardConfigBean dashboard) {
        logger.trace("Received HTTP PUT request at '{}'.", uriInfo.getPath());

        Object responseObject = putDashboardBean(dashboardId, dashboard);
        return Response.ok(responseObject).build();
    }

    @DELETE
    @Path("/{dashboardId: [a-zA-Z_0-9]*}")
    @Produces({ MediaType.APPLICATION_JSON })
    public Response httpDeleteDashboards(@Context HttpHeaders headers, @QueryParam("type") String type,
            @PathParam("dashboardId") Integer dashboardId) {
        logger.trace("Received HTTP DELETE request at '{}'.", uriInfo.getPath());

        Object responseObject = deleteDashboard(dashboardId);
        return Response.ok(responseObject).build();
    }

    @GET
    @Path("/{dashboardId: [a-zA-Z_0-9]*}")
    @Produces({ MediaType.APPLICATION_JSON })
    public Response httpGetDashboards(@Context HttpHeaders headers, @PathParam("dashboardId") Integer dashboardId) {
        logger.trace("Received HTTP GET request at '{}'.", uriInfo.getPath());

        Object responseObject = getDashboard(dashboardId);
        return Response.ok(responseObject).build();
    }

    private DashboardConfigBean putDashboardBean(Integer dashboardRef, DashboardConfigBean bean) {
        if (dashboardRef == 0) {
            bean.id = null;
        } else {
            bean.id = dashboardRef;
        }

        // Load the existing list
        DashboardListBean list = loadDashboards();

        int high = 0;

        DashboardConfigBean foundDashboard = null;
        // Loop through the interface list
        for (DashboardConfigBean i : list.entries) {
            if (i.id > high) {
                high = i.id;
            }
            if (i.id.intValue() == dashboardRef) {
                // If it was found in the list, remember it...
                foundDashboard = i;
            }
        }

        // If it was found in the list, remove it...
        if (foundDashboard != null) {
            list.entries.remove(foundDashboard);
        }

        // Set defaults if this is a new dashboard
        if (bean.id == null) {
            bean.id = high + 1;
        }

        // Now save the updated version
        list.entries.add(bean);
        saveDashboards(list);

        return bean;
    }

    private List<DashboardConfigBean> getDashboardList() {
        DashboardListBean dashboards = loadDashboards();
        // DashboardListBean newList = new DashboardListBean();
        List<DashboardConfigBean> list = new ArrayList<DashboardConfigBean>();

        // We only want to return the id and name
        for (DashboardConfigBean i : dashboards.entries) {
            DashboardConfigBean newDashboard = new DashboardConfigBean();
            newDashboard.id = i.id;
            newDashboard.name = i.name;
            newDashboard.category = i.category;
            newDashboard.menu = i.menu;

            list.add(newDashboard);
        }

        return list;
    }

    private DashboardConfigBean getDashboard(Integer dashboardRef) {
        DashboardListBean dashboards = loadDashboards();

        for (DashboardConfigBean i : dashboards.entries) {
            if (i.id.intValue() == dashboardRef) {
                return i;
            }
        }

        return null;
    }

    private List<DashboardConfigBean> deleteDashboard(Integer dashboardRef) {
        DashboardListBean dashboards = loadDashboards();

        DashboardConfigBean foundDashboard = null;
        for (DashboardConfigBean i : dashboards.entries) {
            if (i.id.intValue() == dashboardRef) {
                // If it was found in the list, remember it...
                foundDashboard = i;
                break;
            }
        }

        // If it was found in the list, remove it...
        if (foundDashboard != null) {
            dashboards.entries.remove(foundDashboard);
        }

        saveDashboards(dashboards);

        return getDashboardList();
    }

    private XStream getXStream() {
        XStream xstream = new XStream(new StaxDriver());
        xstream.alias("dashboards", DashboardListBean.class);
        xstream.alias("dashboard", DashboardConfigBean.class);
        xstream.alias("widgets", DashboardWidgetBean.class);
        xstream.alias("options", DashboardWidgetOptionsBean.class);
        xstream.processAnnotations(DashboardListBean.class);

        return xstream;
    }

    private boolean saveDashboards(DashboardListBean dashboard) {
        File folder = new File(ConfigConstants.getUserDataFolder() + "/" + HABminConstants.HABMIN_DATA_DIR);
        // create path for serialization.
        if (!folder.exists()) {
            logger.debug("Creating directory {}", HABminConstants.getDataDirectory());
            folder.mkdirs();
        }

        try {
            long timerStart = System.currentTimeMillis();

            BufferedWriter out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(
                    ConfigConstants.getUserDataFolder() + "/" + HABminConstants.HABMIN_DATA_DIR + DASHBOARD_FILE),
                    "UTF-8"));

            XStream xstream = getXStream();
            xstream.toXML(dashboard, out);

            out.close();

            long timerStop = System.currentTimeMillis();
            logger.debug("Dashboard list saved in {}ms.", timerStop - timerStart);
        } catch (FileNotFoundException e) {
            logger.debug("Unable to open Dashboards list for SAVE - ", e);

            return false;
        } catch (IOException e) {
            logger.debug("Unable to write Dashboards list for SAVE - ", e);

            return false;
        }

        return true;
    }

    private DashboardListBean loadDashboards() {
        DashboardListBean dashboards = null;

        FileInputStream fin;
        try {
            long timerStart = System.currentTimeMillis();

            fin = new FileInputStream(
                    ConfigConstants.getUserDataFolder() + "/" + HABminConstants.HABMIN_DATA_DIR + DASHBOARD_FILE);

            XStream xstream = getXStream();
            dashboards = (DashboardListBean) xstream.fromXML(fin);

            fin.close();

            long timerStop = System.currentTimeMillis();
            logger.debug("Dashboards loaded in {}ms.", timerStop - timerStart);

        } catch (FileNotFoundException e) {
            dashboards = new DashboardListBean();
        } catch (IOException e) {
            e.printStackTrace();
        }

        return dashboards;
    }
}
