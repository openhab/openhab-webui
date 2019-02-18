/**
 * Copyright (c) 2010-2013, openHAB.org and others.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habmin.internal.services.rule;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;

import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;

import org.apache.commons.io.IOUtils;
import org.eclipse.smarthome.config.core.ConfigConstants;
import org.eclipse.smarthome.io.rest.RESTResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.swagger.annotations.Api;

/**
 * <p>
 * This class acts as a REST resource for history data and provides different
 * methods to interact with the rule system
 *
 * <p>
 * The typical content types are plain text for status values and XML or JSON(P)
 * for more complex data structures
 * </p>
 *
 * <p>
 * This resource is registered with the Jersey servlet.
 * </p>
 *
 * @author Chris Jackson
 */
@Path(RuleResource.PATH)
@Api(value = RuleResource.API)
public class RuleResource implements RESTResource {

    private static final Logger logger = LoggerFactory.getLogger(RuleResource.class);

    /** The URI path to this resource */
    public static final String PATH = "habmin/rules";
    public static final String API = "habmin-rules";

    protected static final String RULE_FOLDER = "/rules/";
    protected static final String RULE_FILEEXT = ".rules";

    @Context
    UriInfo uriInfo;

    @GET
    @Produces({ MediaType.APPLICATION_JSON })
    public Response httpGetModelList(@Context HttpHeaders headers) {
        logger.debug("Received HTTP GET request at '{}'", uriInfo.getPath());

        Object responseObject = getRuleModelList();
        return Response.ok(responseObject).build();
    }

    @GET
    @Path("/{modelname: .+}")
    @Produces({ MediaType.APPLICATION_JSON })
    public Response httpGetModelSource(@Context HttpHeaders headers, @PathParam("modelname") String modelName) {
        logger.debug("Received HTTP GET request at '{}'", uriInfo.getPath());

        Object responseObject = getRuleModelSource(modelName);
        return Response.ok(responseObject).build();
    }

    @PUT
    @Path("/{modelname: .+}")
    @Produces({ MediaType.APPLICATION_JSON })
    public Response httpPutModelSource(@Context HttpHeaders headers, @PathParam("modelname") String modelName,
            RuleSourceBean rule) {
        logger.debug("Received HTTP PUT request at '{}'", uriInfo.getPath());

        Object responseObject = putRuleModelSource(modelName, rule);
        return Response.ok(responseObject).build();
    }

    private RuleSourceListBean getRuleModelList() {
        RuleSourceListBean beans = new RuleSourceListBean();

        File[] files = new File(ConfigConstants.getConfigFolder() + RULE_FOLDER).listFiles();
        if (files == null) {
            return beans;
        }

        for (File file : files) {
            String modelName = file.getName();

            if (!modelName.endsWith(RULE_FILEEXT)) {
                continue;
            }

            RuleSourceBean bean = new RuleSourceBean();
            bean.name = modelName.substring(0, modelName.length() - RULE_FILEEXT.length());

            beans.rules.add(bean);
        }

        return beans;
    }

    private RuleSourceBean putRuleModelSource(String modelName, RuleSourceBean rule) {
        String orgName = ConfigConstants.getConfigFolder() + RULE_FOLDER + modelName + RULE_FILEEXT;
        String newName = ConfigConstants.getConfigFolder() + RULE_FOLDER + modelName + RULE_FILEEXT + ".new";
        String bakName = ConfigConstants.getConfigFolder() + RULE_FOLDER + modelName + RULE_FILEEXT + ".bak";

        try {
            BufferedWriter out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(newName), "UTF-8"));

            out.write(rule.source);
            out.close();
        } catch (IOException e) {
            // TODO: update
            e.printStackTrace();
        }

        // Rename the files.
        File bakFile = new File(bakName);
        File orgFile = new File(orgName);
        File newFile = new File(newName);

        // Delete any existing .bak file
        if (bakFile.exists()) {
            bakFile.delete();
        }

        // Rename the existing item file to backup
        orgFile.renameTo(bakFile);

        // Rename the new file to the item file
        newFile.renameTo(orgFile);

        return getRuleModelSource(modelName);
    }

    private RuleSourceBean getRuleModelSource(String modelName) {
        RuleSourceBean rule = new RuleSourceBean();
        rule.name = modelName;

        FileInputStream inputStream = null;
        try {
            inputStream = new FileInputStream(
                    ConfigConstants.getConfigFolder() + RULE_FOLDER + modelName + RULE_FILEEXT);
            rule.source = IOUtils.toString(inputStream);
        } catch (FileNotFoundException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }

        if (inputStream != null) {
            try {
                inputStream.close();
            } catch (IOException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }

        return rule;
    }
}
