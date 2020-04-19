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

import java.io.IOException;
import java.nio.file.Files;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.openhab.core.io.rest.RESTResource;
import org.openhab.ui.cometvisu.internal.Config;
import org.openhab.ui.cometvisu.internal.ManagerSettings;
import org.openhab.ui.cometvisu.internal.backend.model.rest.ConfigSection;
import org.openhab.ui.cometvisu.internal.backend.model.rest.HiddenConfig;
import org.openhab.ui.cometvisu.internal.util.FsUtil;
import org.osgi.service.component.annotations.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;

/**
 * Hidden configuration backend for the cometvisu manager.
 *
 * @author Tobias Bräutigam - Initial contribution
 *
 */
@Component
@Path(Config.COMETVISU_BACKEND_ALIAS + "/config")
@Api(Config.COMETVISU_BACKEND_ALIAS + "/config")
public class HiddenConfigResource implements RESTResource {
    private final Logger logger = LoggerFactory.getLogger(HiddenConfigResource.class);
    private Pattern dataPattern = Pattern.compile("\\$data\\s*=\\s*'(.+)';", Pattern.DOTALL | Pattern.MULTILINE);

    @POST
    @Path("/hidden/{section}/{key}")
    @Consumes(MediaType.TEXT_PLAIN)
    @ApiOperation(value = "Creates a new config option")
    @ApiResponses(value = { @ApiResponse(code = 200, message = "OK"), @ApiResponse(code = 403, message = "not allowed"),
            @ApiResponse(code = 404, message = "section not found"),
            @ApiResponse(code = 406, message = "config option exists") })
    public Response createHiddenConfig(
            @ApiParam(value = "Section of the config option") @PathParam("section") String section,
            @ApiParam(value = "Key (ID) of the config option in the section, ('*' for all options)") @PathParam("key") String key,
            @ApiParam(value = "value of the option", required = true) String body) {
        if (section.equals("*") || key.equals("*")) {
            return FsUtil.createErrorResponse(Status.NOT_ACCEPTABLE, "wildcard not allowed");
        }
        HiddenConfig config = this.loadHiddenConfig();
        if (!config.containsKey(section)) {
            return FsUtil.createErrorResponse(Status.NOT_FOUND, "section not found");
        }
        ConfigSection sec = config.get(section);
        if (sec.containsKey(key)) {
            return FsUtil.createErrorResponse(Status.NOT_ACCEPTABLE, "option already exists");
        }
        sec.put(key, body);
        try {
            this.writeHiddenConfig(config);
            return Response.ok().build();
        } catch (Exception e) {
            logger.error("{}", e.getMessage());
            return FsUtil.createErrorResponse(Status.INTERNAL_SERVER_ERROR, "error saving hidden config");
        }
    }

    @DELETE
    @Path("/hidden/{section}/{key}")
    @ApiOperation(value = "Delete config option")
    @ApiResponses(value = { @ApiResponse(code = 200, message = "OK"), @ApiResponse(code = 403, message = "not allowed"),
            @ApiResponse(code = 404, message = "config option does not exist") })
    public Response deleteHiddenConfig(
            @ApiParam(value = "Section of the config option, ('*' for all sections)") @PathParam("section") String section,
            @ApiParam(value = "Key (ID) of the config option in the section, ('*' for all options)") @PathParam("key") String key) {
        HiddenConfig config = this.loadHiddenConfig();
        if (section.equals("*")) {
            config.clear();
        } else if (!config.containsKey(section)) {
            return FsUtil.createErrorResponse(Status.NOT_FOUND, "section not found");
        } else {
            ConfigSection sec = config.get(section);
            if (key.contentEquals("*")) {
                sec.clear();
            } else if (!sec.containsKey(key)) {
                return FsUtil.createErrorResponse(Status.NOT_FOUND, "option not found");
            } else {
                sec.remove(key);
            }
        }
        try {
            this.writeHiddenConfig(config);
            return Response.ok().build();
        } catch (Exception e) {
            logger.error("{}", e.getMessage());
            return FsUtil.createErrorResponse(Status.INTERNAL_SERVER_ERROR, "error saving hidden config");
        }
    }

    @GET
    @Path("/hidden/{section}/{key}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Provides the value of a config option")
    @ApiResponses(value = { @ApiResponse(code = 200, message = "OK"), @ApiResponse(code = 403, message = "not allowed"),
            @ApiResponse(code = 404, message = "config option does not exist") })
    public Response getHiddenConfig(
            @ApiParam(value = "Section of the config option, ('*' for all sections)") @PathParam("section") String sectionKey,
            @ApiParam(value = "Key (ID) of the config option in the section, ('*' for all options)") @PathParam("key") String key) {
        HiddenConfig config = this.loadHiddenConfig();
        if (sectionKey.contentEquals("*")) {
            if (key.contentEquals("*")) {
                return Response.ok(config).build();
            } else {
                // invalid */key not allowed
                return FsUtil.createErrorResponse(Status.FORBIDDEN, "invalid request");
            }
        } else {
            // find section
            ConfigSection section = config.get(sectionKey);
            if (section == null) {
                return FsUtil.createErrorResponse(Status.NOT_FOUND, "section not found");
            }
            if (key.contentEquals("*")) {
                // return complete section
                return Response.ok(section).build();
            } else {
                if (section.containsKey(key)) {
                    return Response.ok(section.get(key)).build();
                } else {
                    return FsUtil.createErrorResponse(Status.NOT_FOUND, "option not found");
                }
            }
        }
    }

    @PUT
    @Path("/hidden")
    @Consumes(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Save the hidden config")
    @ApiResponses(value = { @ApiResponse(code = 200, message = "OK"), @ApiResponse(code = 403, message = "not allowed"),
            @ApiResponse(code = 500, message = "error saving hidden config") })
    public Response saveHiddenConfig(
            @ApiParam(value = "Complete config content", required = true) HiddenConfig config) {
        try {
            this.writeHiddenConfig(config);
            return Response.ok().build();
        } catch (Exception e) {
            logger.error("{}", e.getMessage());
            return FsUtil.createErrorResponse(Status.INTERNAL_SERVER_ERROR, "error saving hidden config");
        }
    }

    @PUT
    @Path("/hidden/{section}/{key}")
    @Consumes(MediaType.TEXT_PLAIN)
    @ApiOperation(value = "Changes the value of an existing config option")
    @ApiResponses(value = { @ApiResponse(code = 200, message = "OK"), @ApiResponse(code = 403, message = "not allowed"),
            @ApiResponse(code = 404, message = "config option does not exist"),
            @ApiResponse(code = 406, message = "wildcard not allowed"),
            @ApiResponse(code = 500, message = "error saving hidden config") })
    public Response updateHiddenConfig(
            @ApiParam(value = "Section of the config option") @PathParam("section") String section,
            @ApiParam(value = "Key (ID) of the config option in the section") @PathParam("key") String key,
            @ApiParam(value = "value of the option", required = true) String body) {
        if (section.equals("*") || key.equals("*")) {
            return FsUtil.createErrorResponse(Status.NOT_ACCEPTABLE, "wildcard not allowed");
        }
        HiddenConfig config = this.loadHiddenConfig();
        if (!config.containsKey(section)) {
            return FsUtil.createErrorResponse(Status.NOT_FOUND, "section not found");
        }
        ConfigSection sec = config.get(section);
        if (!sec.containsKey(key)) {
            return FsUtil.createErrorResponse(Status.NOT_FOUND, "option not found");
        }
        sec.put(key, body);
        try {
            this.writeHiddenConfig(config);
            return Response.ok().build();
        } catch (Exception e) {
            logger.error("{}", e.getMessage());
            return FsUtil.createErrorResponse(Status.INTERNAL_SERVER_ERROR, "error saving hidden config");
        }
    }

    private HiddenConfig loadHiddenConfig() {
        HiddenConfig config = new HiddenConfig();
        try {
            java.nio.file.Path hiddenConfigPath = ManagerSettings.getInstance().getConfigPath().resolve("hidden.php");
            if (hiddenConfigPath.toFile().exists()) {
                List<String> content = Files.readAllLines(hiddenConfigPath);
                boolean isPhpVersion = true;
                for (int i = content.size() - 1; i >= 0; i++) {
                    if (content.get(i).contains("json_decode")) {
                        isPhpVersion = false;
                        break;
                    }
                }
                if (isPhpVersion) {
                    return this.loadPhpConfig(config, content);
                } else {
                    return this.loadJson(String.join("\n", content));
                }
            }
        } catch (IOException e) {
        }
        return config;
    }

    private HiddenConfig loadJson(String content) {
        Gson gson = new Gson();
        Matcher m = dataPattern.matcher(content);
        if (m.find()) {
            content = m.group(1);
        }

        return gson.fromJson(content, HiddenConfig.class);
    }

    private HiddenConfig loadPhpConfig(HiddenConfig config, List<String> content) {
        boolean inHidden = false;
        Pattern sectionPattern = Pattern.compile("\\s*(//)?\'([^']+)\'\\s*=>\\s*array\\s*\\(([^\\)]+)\\),?");
        Pattern optionPattern = Pattern.compile("\'([^']+)\'\\s*=>\\s*\\'([^']+)\\',?");
        for (final String line : content) {
            if (!inHidden) {
                if (line.equalsIgnoreCase("$hidden = array(")) {
                    inHidden = true;
                }
            } else if (line.equalsIgnoreCase(");")) {
                break;
            } else {
                Matcher m = sectionPattern.matcher(line);
                if (m.find()) {
                    boolean commented = m.group(1) != null;
                    if (!commented) {
                        String options = m.group(3);
                        Matcher om = optionPattern.matcher(options);
                        ConfigSection section = new ConfigSection();
                        while (om.find()) {
                            section.put(om.group(1), om.group(2));
                        }
                        config.put(m.group(2), section);
                    }
                }
            }
        }
        return config;
    }

    private void writeHiddenConfig(HiddenConfig hidden) throws IOException {
        java.nio.file.Path hiddenConfigPath = ManagerSettings.getInstance().getConfigPath().resolve("hidden.php");
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        StringBuilder content = new StringBuilder().append("<?php\n")
                .append("// File for configurations that shouldn't be shared with the user\n").append("$data = '")
                .append(gson.toJson(hidden)).append("';\n").append("$hidden = json_decode($data, true);\n");
        Files.writeString(hiddenConfigPath, content);
    }
}
