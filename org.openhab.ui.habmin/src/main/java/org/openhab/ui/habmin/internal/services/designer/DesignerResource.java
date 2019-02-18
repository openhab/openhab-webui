/**
 * Copyright (c) 2010-2013, openHAB.org and others.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habmin.internal.services.designer;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;

import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

import org.eclipse.smarthome.config.core.ConfigConstants;
import org.eclipse.smarthome.core.items.ItemRegistry;
import org.eclipse.smarthome.io.rest.RESTResource;
import org.openhab.ui.habmin.HABminConstants;
import org.openhab.ui.habmin.internal.services.designer.blocks.DesignerRuleCreator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.thoughtworks.xstream.XStream;
import com.thoughtworks.xstream.io.xml.StaxDriver;

import io.swagger.annotations.Api;

/**
 * @author Chris Jackson
 */
@Path(DesignerResource.PATH)
@Api(value = DesignerResource.API)
public class DesignerResource implements RESTResource {

    private static final Logger logger = LoggerFactory.getLogger(DesignerResource.class);

    protected static final String DESIGN_FILE = "designer.xml";

    public static final String PATH = "habmin/designer";
    public static final String API = "habmin-designer";

    @Context
    UriInfo uriInfo;

    static private ItemRegistry itemRegistry;

    public void setItemRegistry(ItemRegistry itemRegistry) {
        DesignerResource.itemRegistry = itemRegistry;
    }

    public void unsetItemRegistry(ItemRegistry itemRegistry) {
        DesignerResource.itemRegistry = null;
    }

    static public ItemRegistry getItemRegistry() {
        return itemRegistry;
    }

    @GET
    @Produces({ MediaType.APPLICATION_JSON })
    public Response getDesigns(@Context HttpHeaders headers) {
        logger.debug("Received HTTP GET request at '{}'", uriInfo.getPath());

        Object responseObject = getDesignBeans();
        return Response.ok(responseObject).build();
    }

    @GET
    @Path("/{designref: [0-9]*}")
    @Produces({ MediaType.APPLICATION_JSON })
    public Response getDesignRef(@Context HttpHeaders headers, @PathParam("designref") Integer designref) {
        logger.debug("Received HTTP GET request at '{}'.", uriInfo.getPath());

        Object responseObject = getDesignBean(designref);
        return Response.ok(responseObject).build();
    }

    @DELETE
    @Path("/{designref: [0-9]*}")
    @Produces({ MediaType.APPLICATION_JSON })
    public Response deleteDesignRef(@Context HttpHeaders headers, @PathParam("designref") Integer designref) {
        logger.debug("Received HTTP DELETE request at '{}'.", uriInfo.getPath());

        Object responseObject = deleteDesignBean(designref);
        return Response.ok(responseObject).build();
    }

    @PUT
    @Path("/{designref: [0-9]*}")
    @Produces({ MediaType.APPLICATION_JSON })
    public Response putDesignRef(@Context HttpHeaders headers, @PathParam("designref") Integer designref,
            DesignerBean updatedDesign) {
        logger.debug("Received HTTP PUT request at '{}'.", uriInfo.getPath());

        Object responseObject = putDesignBean(designref, updatedDesign);
        return Response.ok(responseObject).build();
    }

    @POST
    @Produces({ MediaType.APPLICATION_JSON })
    public Response postDesignRef(@Context HttpHeaders headers, DesignerBean updatedDesign) {
        logger.debug("Received HTTP POST request at '{}'", uriInfo.getPath());

        Object responseObject = putDesignBean(0, updatedDesign);
        return Response.ok(responseObject).build();
    }

    private DesignerListBean getDesignBeans() {
        DesignerListBean designs = loadDesigns();
        DesignerListBean newList = new DesignerListBean();

        // We only want to return the id and name
        for (DesignerBean i : designs.designs) {
            DesignerBean newDesign = new DesignerBean();
            newDesign.id = i.id;
            newDesign.name = i.name;

            newList.designs.add(newDesign);
        }

        return newList;
    }

    private DesignerBean getDesignBean(Integer designRef) {
        DesignerListBean designs = loadDesigns();

        for (DesignerBean i : designs.designs) {
            if (i.id.intValue() == designRef) {
                i.source = DesignerRuleCreator.loadSource(i.id, i.name);
                return i;
            }
        }

        return null;
    }

    private DesignerListBean deleteDesignBean(Integer designRef) {
        DesignerListBean designs = loadDesigns();

        DesignerBean foundDesign = null;
        // Loop through the designs list
        for (DesignerBean i : designs.designs) {
            if (i.id.intValue() == designRef) {
                // If it was found in the list, remember it...
                foundDesign = i;
            }
        }

        // If it was found in the list, remove it...
        if (foundDesign != null) {
            designs.designs.remove(foundDesign);
        }

        saveDesigns(designs);

        return getDesignBeans();
    }

    private DesignerListBean loadDesigns() {
        DesignerListBean designs = null;

        logger.debug("Loading Designs.");
        FileInputStream fin;
        try {
            long timerStart = System.currentTimeMillis();

            fin = new FileInputStream(
                    ConfigConstants.getUserDataFolder() + "/" + HABminConstants.HABMIN_DATA_DIR + DESIGN_FILE);

            XStream xstream = new XStream(new StaxDriver());
            xstream.alias("designlist", DesignerListBean.class);
            xstream.alias("field", DesignerFieldBean.class);
            xstream.alias("mutation", DesignerMutationBean.class);
            xstream.alias("child", DesignerChildBean.class);
            xstream.processAnnotations(DesignerListBean.class);
            xstream.processAnnotations(DesignerMutationBean.class);
            xstream.processAnnotations(DesignerBean.class);
            xstream.processAnnotations(DesignerBlockBean.class);
            xstream.processAnnotations(DesignerChildBean.class);
            xstream.processAnnotations(DesignerCommentBean.class);
            xstream.processAnnotations(DesignerFieldBean.class);

            designs = (DesignerListBean) xstream.fromXML(fin);

            fin.close();

            long timerStop = System.currentTimeMillis();
            logger.debug("Designs loaded in {}ms.", timerStop - timerStart);

        } catch (FileNotFoundException e) {
            designs = new DesignerListBean();
        } catch (IOException e) {
            e.printStackTrace();
        }

        if (designs.designs == null) {
            designs.designs = new ArrayList<DesignerBean>();
        }

        return designs;
    }

    /**
     *
     * @param designRef The reference for this design. This should be 0 to create a new design.
     * @param bean
     * @return
     */
    private DesignerBean putDesignBean(Integer designRef, DesignerBean bean) {
        // Sanity check.
        // designRef is 0 for a new design
        // if it's not 0, then bean.id must either be missing, or it must be the same as designRef
        if (designRef != 0 && bean.id != null && bean.id.intValue() != designRef.intValue()) {
            logger.error("Inconsistent id in HTTP call '{}' and structure '{}'", designRef, bean.id);
            return null;
        }

        // Load the existing list
        DesignerListBean list = loadDesigns();

        int high = 0;

        DesignerBean foundDesign = null;
        // Loop through the designs list
        for (DesignerBean i : list.designs) {
            if (i.id > high) {
                high = i.id;
            }
            if (i.id.intValue() == designRef) {
                // If it was found in the list, remember it...
                foundDesign = i;
            }
        }

        // If it was found in the list, remove it...
        if (foundDesign != null) {
            list.designs.remove(foundDesign);
        }

        // Set id if this is a new design
        if (bean.id == null) {
            bean.id = high + 1;
        }

        // Sanity check the name
        if (bean.name == null) {
            bean.name = "";
        }

        // Now save the updated version
        list.designs.add(bean);
        saveDesigns(list);

        bean.source = DesignerRuleCreator.saveRule(bean.id, bean.name, bean.block);

        return bean;
    }

    private boolean saveDesigns(DesignerListBean designs) {
        File folder = new File(ConfigConstants.getUserDataFolder() + "/" + HABminConstants.HABMIN_DATA_DIR);
        // create path for serialization.
        if (!folder.exists()) {
            logger.debug("Creating directory {}", HABminConstants.getDataDirectory());
            folder.mkdirs();
        }

        FileOutputStream fout;
        try {
            long timerStart = System.currentTimeMillis();

            fout = new FileOutputStream(
                    ConfigConstants.getUserDataFolder() + "/" + HABminConstants.HABMIN_DATA_DIR + DESIGN_FILE);

            XStream xstream = new XStream(new StaxDriver());
            xstream.alias("designlist", DesignerListBean.class);
            xstream.alias("field", DesignerFieldBean.class);
            xstream.alias("mutation", DesignerMutationBean.class);
            xstream.alias("child", DesignerChildBean.class);
            xstream.processAnnotations(DesignerListBean.class);
            xstream.processAnnotations(DesignerMutationBean.class);
            xstream.processAnnotations(DesignerBean.class);
            xstream.processAnnotations(DesignerBlockBean.class);
            xstream.processAnnotations(DesignerChildBean.class);
            xstream.processAnnotations(DesignerCommentBean.class);
            xstream.processAnnotations(DesignerFieldBean.class);

            xstream.toXML(designs, fout);

            fout.close();

            long timerStop = System.currentTimeMillis();
            logger.debug("Designs saved in {}ms.", timerStop - timerStart);
        } catch (FileNotFoundException e) {
            logger.debug("Unable to open Designs for SAVE - ", e);

            return false;
        } catch (IOException e) {
            logger.debug("Unable to write Designs for SAVE - ", e);

            return false;
        }

        return true;
    }
}
