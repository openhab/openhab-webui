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

import java.io.IOException;
import java.nio.file.Files;
import java.util.List;
import java.util.Objects;
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

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.openhab.core.io.rest.RESTConstants;
import org.openhab.core.io.rest.RESTResource;
import org.openhab.ui.cometvisu.internal.Config;
import org.openhab.ui.cometvisu.internal.ManagerSettings;
import org.openhab.ui.cometvisu.internal.backend.model.rest.ConfigSection;
import org.openhab.ui.cometvisu.internal.backend.model.rest.HiddenConfig;
import org.openhab.ui.cometvisu.internal.util.ClientInstaller;
import org.openhab.ui.cometvisu.internal.util.FsUtil;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.jaxrs.whiteboard.JaxrsWhiteboardConstants;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JSONRequired;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JaxrsApplicationSelect;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JaxrsName;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JaxrsResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Allows certain actions to configure the CometVisu backend through the REST api.
 *
 * @author Tobias Bräutigam - Initial contribution
 * @author Wouter Born - Migrated to JAX-RS Whiteboard Specification
 * @author Wouter Born - Migrated to OpenAPI annotations
 */
@Component
@JaxrsResource
@JaxrsName(Config.COMETVISU_BACKEND_ALIAS + "/" + Config.COMETVISU_BACKEND_CONFIG_ALIAS)
@JaxrsApplicationSelect("(" + JaxrsWhiteboardConstants.JAX_RS_NAME + "=" + RESTConstants.JAX_RS_NAME + ")")
@JSONRequired
@Path(Config.COMETVISU_BACKEND_ALIAS + "/" + Config.COMETVISU_BACKEND_CONFIG_ALIAS)
@Tag(name = Config.COMETVISU_BACKEND_ALIAS + "/" + Config.COMETVISU_BACKEND_CONFIG_ALIAS)
@NonNullByDefault
public class ConfigResource implements RESTResource {
    private final Logger logger = LoggerFactory.getLogger(ConfigResource.class);
    private static final Pattern dataPattern = Pattern.compile("\\$data\\s*=\\s*'(.+)';",
            Pattern.DOTALL | Pattern.MULTILINE);
    private static final Pattern sectionPattern = Pattern
            .compile("\\s*(//)?\'([^']+)\'\\s*=>\\s*array\\s*\\(([^\\)]+)\\),?");
    private static final Pattern optionPattern = Pattern.compile("\'([^']+)\'\\s*=>\\s*\\'([^']+)\\',?");

    @GET
    @Path("/download-client")
    @Produces({ MediaType.TEXT_PLAIN })
    @Operation(summary = "starts downloading the CometVisu client", responses = {
            @ApiResponse(responseCode = "200", description = "OK") })
    public Response triggerDownload() {
        logger.debug("calling installation checker with config overriding");
        ClientInstaller.getInstance().check(true);
        return Response.ok().build();
    }

    @POST
    @Path("/hidden/{section}/{key}")
    @Consumes(MediaType.TEXT_PLAIN)
    @Operation(summary = "Creates a new config option", responses = {
            @ApiResponse(responseCode = "200", description = "OK"),
            @ApiResponse(responseCode = "403", description = "not allowed"),
            @ApiResponse(responseCode = "404", description = "section not found"),
            @ApiResponse(responseCode = "406", description = "config option exists") })
    public Response createHiddenConfig(
            @Parameter(description = "Section of the config option") @PathParam("section") String section,
            @Parameter(description = "Key (ID) of the config option in the section, ('*' for all options)") @PathParam("key") String key,
            @Parameter(description = "value of the option", required = true) String body) {
        if ("*".equals(section) || "*".equals(key)) {
            return FsUtil.createErrorResponse(Status.NOT_ACCEPTABLE, "wildcard not allowed");
        }
        HiddenConfig config = loadHiddenConfig();
        ConfigSection sec = config.get(section);
        if (sec == null) {
            return FsUtil.createErrorResponse(Status.NOT_FOUND, "section not found");
        }
        if (sec.containsKey(key)) {
            return FsUtil.createErrorResponse(Status.NOT_ACCEPTABLE, "option already exists");
        }
        sec.put(key, body);
        try {
            writeHiddenConfig(config);
            return Response.ok().build();
        } catch (Exception e) {
            logger.error("{}", e.getMessage());
            return FsUtil.createErrorResponse(Status.INTERNAL_SERVER_ERROR, "error saving hidden config");
        }
    }

    @DELETE
    @Path("/hidden/{section}/{key}")
    @Operation(summary = "Delete config option", responses = { @ApiResponse(responseCode = "200", description = "OK"),
            @ApiResponse(responseCode = "403", description = "not allowed"),
            @ApiResponse(responseCode = "404", description = "config option does not exist") })
    public Response deleteHiddenConfig(
            @Parameter(description = "Section of the config option, ('*' for all sections)") @PathParam("section") String section,
            @Parameter(description = "Key (ID) of the config option in the section, ('*' for all options)") @PathParam("key") String key) {
        HiddenConfig config = loadHiddenConfig();
        if ("*".equals(section)) {
            config.clear();
        } else {
            ConfigSection sec = config.get(section);
            if (sec == null) {
                return FsUtil.createErrorResponse(Status.NOT_FOUND, "section not found");
            }
            if ("*".contentEquals(key)) {
                sec.clear();
            } else if (!sec.containsKey(key)) {
                return FsUtil.createErrorResponse(Status.NOT_FOUND, "option not found");
            } else {
                sec.remove(key);
            }
        }
        try {
            writeHiddenConfig(config);
            return Response.ok().build();
        } catch (Exception e) {
            logger.error("{}", e.getMessage());
            return FsUtil.createErrorResponse(Status.INTERNAL_SERVER_ERROR, "error saving hidden config");
        }
    }

    @GET
    @Path("/hidden/{section}/{key}")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Provides the value of a config option", responses = {
            @ApiResponse(responseCode = "200", description = "OK"),
            @ApiResponse(responseCode = "403", description = "not allowed"),
            @ApiResponse(responseCode = "404", description = "config option does not exist") })
    public Response getHiddenConfig(
            @Parameter(description = "Section of the config option, ('*' for all sections)") @PathParam("section") String sectionKey,
            @Parameter(description = "Key (ID) of the config option in the section, ('*' for all options)") @PathParam("key") String key) {
        HiddenConfig config = loadHiddenConfig();
        if ("*".contentEquals(sectionKey)) {
            if ("*".contentEquals(key)) {
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
            if ("*".contentEquals(key)) {
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

    @GET
    @Path("/hidden")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Provides the value of a config option", responses = {
            @ApiResponse(responseCode = "200", description = "OK"),
            @ApiResponse(responseCode = "403", description = "not allowed"),
            @ApiResponse(responseCode = "404", description = "config option does not exist") })
    public Response getHiddenConfig() {
        HiddenConfig config = loadHiddenConfig();
        return Response.ok(config).build();
    }

    @PUT
    @Path("/hidden")
    @Consumes(MediaType.APPLICATION_JSON)
    @Operation(summary = "Save the hidden config", responses = { @ApiResponse(responseCode = "200", description = "OK"),
            @ApiResponse(responseCode = "403", description = "not allowed"),
            @ApiResponse(responseCode = "500", description = "error saving hidden config") })
    public Response saveHiddenConfig(
            @Parameter(description = "Complete config content", required = true) HiddenConfig config) {
        try {
            writeHiddenConfig(config);
            return Response.ok().build();
        } catch (Exception e) {
            logger.error("{}", e.getMessage());
            return FsUtil.createErrorResponse(Status.INTERNAL_SERVER_ERROR, "error saving hidden config");
        }
    }

    @PUT
    @Path("/hidden/{section}/{key}")
    @Consumes(MediaType.TEXT_PLAIN)
    @Operation(summary = "Changes the value of an existing config option", responses = {
            @ApiResponse(responseCode = "200", description = "OK"),
            @ApiResponse(responseCode = "403", description = "not allowed"),
            @ApiResponse(responseCode = "404", description = "config option does not exist"),
            @ApiResponse(responseCode = "406", description = "wildcard not allowed"),
            @ApiResponse(responseCode = "500", description = "error saving hidden config") })
    public Response updateHiddenConfig(
            @Parameter(description = "Section of the config option") @PathParam("section") String section,
            @Parameter(description = "Key (ID) of the config option in the section") @PathParam("key") String key,
            @Parameter(description = "value of the option", required = true) String body) {
        if ("*".equals(section) || "*".equals(key)) {
            return FsUtil.createErrorResponse(Status.NOT_ACCEPTABLE, "wildcard not allowed");
        }
        HiddenConfig config = loadHiddenConfig();
        ConfigSection sec = config.get(section);
        if (sec == null) {
            return FsUtil.createErrorResponse(Status.NOT_FOUND, "section not found");
        }
        if (!sec.containsKey(key)) {
            return FsUtil.createErrorResponse(Status.NOT_FOUND, "option not found");
        }
        sec.put(key, body);
        try {
            writeHiddenConfig(config);
            return Response.ok().build();
        } catch (Exception e) {
            logger.error("{}", e.getMessage());
            return FsUtil.createErrorResponse(Status.INTERNAL_SERVER_ERROR, "error saving hidden config");
        }
    }

    public static HiddenConfig loadHiddenConfig() {
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
                    return loadPhpConfig(config, content);
                } else {
                    return loadJson(String.join("\n", content));
                }
            }
        } catch (IOException e) {
        }
        return config;
    }

    private static HiddenConfig loadJson(String content) {
        Gson gson = new Gson();
        Matcher m = dataPattern.matcher(content);
        String rawContent = m.find() ? m.group(1) : content;

        return Objects.requireNonNull(gson.fromJson(rawContent, HiddenConfig.class));
    }

    private static HiddenConfig loadPhpConfig(HiddenConfig config, List<String> content) {
        boolean inHidden = false;

        for (final String line : content) {
            if (!inHidden) {
                if ("$hidden = array(".equalsIgnoreCase(line)) {
                    inHidden = true;
                }
            } else if (");".equalsIgnoreCase(line)) {
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
