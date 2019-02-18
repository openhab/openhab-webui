package org.openhab.ui.habmin.internal.services.floorplan;

import java.io.BufferedOutputStream;
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

import org.apache.commons.codec.binary.Base64;
import org.eclipse.smarthome.config.core.ConfigConstants;
import org.eclipse.smarthome.io.rest.RESTResource;
import org.openhab.ui.habmin.HABminConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.thoughtworks.xstream.XStream;
import com.thoughtworks.xstream.io.xml.StaxDriver;

import io.swagger.annotations.Api;

@Path(FloorplanResource.PATH)
@Api(value = FloorplanResource.API)
public class FloorplanResource implements RESTResource {

    /** The URI path to this resource */
    public static final String PATH = "habmin/floorplan";
    public static final String API = "habmin-floorplan";

    private static String FLOORPLAN_FILE = "floorplans.xml";

    private static final Logger logger = LoggerFactory.getLogger(FloorplanResource.class);

    @Context
    UriInfo uriInfo;

    @GET
    @Produces({ MediaType.APPLICATION_JSON })
    public Response httpGetFloorplans(@Context HttpHeaders headers) {
        logger.trace("Received HTTP GET request at '{}'.", uriInfo.getPath());

        Object responseObject = getFloorplanList();
        return Response.ok(responseObject).build();
    }

    @POST
    @Produces({ MediaType.APPLICATION_JSON })
    public Response httpPostFloorplan(@Context HttpHeaders headers, FloorplanConfigBean floorplan) {
        logger.trace("Received HTTP POST request at '{}'.", uriInfo.getPath());

        Object responseObject = putFloorplanBean(0, floorplan);
        return Response.ok(responseObject).build();
    }

    @GET
    @Path("/{floorplanID: [0-9]*}")
    @Produces({ MediaType.APPLICATION_JSON })
    public Response httpGetFloorplan(@Context HttpHeaders headers, @PathParam("floorplanID") Integer floorplanID) {
        logger.trace("Received HTTP GET request at '{}'.", uriInfo.getPath());

        Object responseObject = getFloorplan(floorplanID);
        return Response.ok(responseObject).build();
    }

    @PUT
    @Path("/{floorplanID: [0-9]*}")
    @Produces({ MediaType.APPLICATION_JSON })
    public Response httpPutFloorplan(@Context HttpHeaders headers, @PathParam("floorplanID") Integer floorplanID,
            FloorplanConfigBean floorplan) {
        logger.trace("Received HTTP PUT request at '{}'.", uriInfo.getPath());

        Object responseObject = putFloorplanBean(floorplanID, floorplan);
        return Response.ok(responseObject).build();
    }

    @DELETE
    @Path("/{floorplanID: [0-9]*}")
    @Produces({ MediaType.APPLICATION_JSON })
    public Response httpDeleteFloorplan(@Context HttpHeaders headers, @QueryParam("type") String type,
            @PathParam("floorplanID") Integer floorplanID) {
        logger.trace("Received HTTP DELETE request at '{}'.", uriInfo.getPath());

        Object responseObject = deleteFloorplan(floorplanID);
        return Response.ok(responseObject).build();
    }

    @GET
    @Path("/{floorplanID: [0-9]*}/image")
    @Produces({ "image/jpeg" })
    public Response httpGetFloorplanImage(@Context HttpHeaders headers, @PathParam("floorplanID") String floorplanID) {

        File folder = new File(HABminConstants.getDataDirectory());
        // Create path.
        if (!folder.exists()) {
            logger.debug("Creating directory {}", HABminConstants.getDataDirectory());
            folder.mkdirs();
        }
        File file = new File(folder + "/floorplan-" + floorplanID + ".img");

        return Response.ok(file).build();
    }

    private FloorplanConfigBean putFloorplanBean(Integer floorplanRef, FloorplanConfigBean bean) {
        if (floorplanRef == 0) {
            bean.id = null;
        } else {
            bean.id = floorplanRef;
        }

        // Load the existing list
        FloorplanListBean list = loadFloorplans();

        int high = 0;

        FloorplanConfigBean foundFloorplan = null;
        // Loop through the interface list
        for (FloorplanConfigBean i : list.entries) {
            if (i.id > high) {
                high = i.id;
            }
            if (i.id.intValue() == floorplanRef) {
                // If it was found in the list, remember it...
                foundFloorplan = i;
            }
        }

        // If it was found in the list, remove it...
        if (foundFloorplan != null) {
            list.entries.remove(foundFloorplan);
        }

        // Set defaults if this is a new floorplan
        if (bean.id == null) {
            bean.id = high + 1;
        }

        // Save the image
        if (bean.imgBase64 != null) {
            byte[] data = Base64.decodeBase64(bean.imgBase64);

            File folder = new File(HABminConstants.getDataDirectory());
            // Create path.
            if (!folder.exists()) {
                logger.debug("Creating directory {}", HABminConstants.getDataDirectory());
                folder.mkdirs();
            }

            try {
                FileOutputStream fos = new FileOutputStream(folder + "/floorplan-" + bean.id + ".img");

                BufferedOutputStream out = new BufferedOutputStream(fos);
                out.write(data);
                out.flush();
                fos.close();
            } catch (FileNotFoundException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            } catch (IOException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }

            // And don't save it in the XML!!
            bean.imgBase64 = null;
        }

        // Now save the updated version
        list.entries.add(bean);
        saveFloorplans(list);

        return bean;
    }

    private List<FloorplanConfigBean> getFloorplanList() {
        FloorplanListBean floorplans = loadFloorplans();
        // FloorplanListBean newList = new FloorplanListBean();
        List<FloorplanConfigBean> list = new ArrayList<FloorplanConfigBean>();

        // We only want to return the id and name
        for (FloorplanConfigBean i : floorplans.entries) {
            FloorplanConfigBean newFloorplan = new FloorplanConfigBean();
            newFloorplan.id = i.id;
            newFloorplan.name = i.name;
            newFloorplan.category = i.category;

            list.add(newFloorplan);
        }

        return list;
    }

    private FloorplanConfigBean getFloorplan(Integer floorplanRef) {
        FloorplanListBean floorplans = loadFloorplans();

        for (FloorplanConfigBean i : floorplans.entries) {
            if (i.id.intValue() == floorplanRef) {
                return i;
            }
        }

        return null;
    }

    private List<FloorplanConfigBean> deleteFloorplan(Integer floorplanRef) {
        FloorplanListBean floorplans = loadFloorplans();

        FloorplanConfigBean foundFloorplan = null;
        for (FloorplanConfigBean i : floorplans.entries) {
            if (i.id.intValue() == floorplanRef) {
                // If it was found in the list, remember it...
                foundFloorplan = i;
                break;
            }
        }

        // If it was found in the list, remove it...
        if (foundFloorplan != null) {
            floorplans.entries.remove(foundFloorplan);

            // Remove the image as well...
            File folder = new File(HABminConstants.getDataDirectory());
            if (folder.exists()) {
                File file = new File(folder, "floorplan-" + floorplanRef + ".img");

                file.delete();
            }
        }

        // And save this to disk...
        saveFloorplans(floorplans);

        return getFloorplanList();
    }

    private boolean saveFloorplans(FloorplanListBean floorplan) {
        File folder = new File(ConfigConstants.getUserDataFolder() + "/" + HABminConstants.HABMIN_DATA_DIR);
        // create path for serialization.
        if (!folder.exists()) {
            folder.mkdirs();
        }

        try {
            long timerStart = System.currentTimeMillis();

            BufferedWriter out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(
                    ConfigConstants.getUserDataFolder() + "/" + HABminConstants.HABMIN_DATA_DIR + FLOORPLAN_FILE),
                    "UTF-8"));

            XStream xstream = new XStream(new StaxDriver());
            xstream.alias("floorplans", FloorplanListBean.class);
            xstream.alias("floorplan", FloorplanConfigBean.class);
            xstream.alias("hotspot", FloorplanHotspotConfigBean.class);
            xstream.processAnnotations(FloorplanListBean.class);

            xstream.toXML(floorplan, out);

            out.close();

            long timerStop = System.currentTimeMillis();
            logger.debug("Floorplan list saved in {}ms.", timerStop - timerStart);
        } catch (FileNotFoundException e) {
            logger.debug("Unable to open Floorplan list for SAVE - ", e);

            return false;
        } catch (IOException e) {
            logger.debug("Unable to write Floorplan list for SAVE - ", e);

            return false;
        }

        return true;
    }

    private FloorplanListBean loadFloorplans() {
        FloorplanListBean floorplans = null;

        FileInputStream fin;
        try {
            long timerStart = System.currentTimeMillis();

            fin = new FileInputStream(
                    ConfigConstants.getUserDataFolder() + "/" + HABminConstants.HABMIN_DATA_DIR + FLOORPLAN_FILE);

            XStream xstream = new XStream(new StaxDriver());
            xstream.alias("floorplans", FloorplanListBean.class);
            xstream.alias("floorplan", FloorplanConfigBean.class);
            xstream.alias("hotspot", FloorplanHotspotConfigBean.class);
            xstream.processAnnotations(FloorplanListBean.class);

            floorplans = (FloorplanListBean) xstream.fromXML(fin);

            fin.close();

            long timerStop = System.currentTimeMillis();
            logger.debug("Floorplans loaded in {}ms.", timerStop - timerStart);

        } catch (FileNotFoundException e) {
            floorplans = new FloorplanListBean();
        } catch (IOException e) {
            e.printStackTrace();
        }

        return floorplans;
    }

}