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
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpClient.Redirect;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;
import java.time.Duration;
import java.util.Base64;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.io.rest.RESTConstants;
import org.openhab.core.io.rest.RESTResource;
import org.openhab.ui.cometvisu.internal.Config;
import org.openhab.ui.cometvisu.internal.backend.model.rest.ConfigSection;
import org.openhab.ui.cometvisu.internal.backend.model.rest.HiddenConfig;
import org.openhab.ui.cometvisu.internal.util.FsUtil;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.jaxrs.whiteboard.JaxrsWhiteboardConstants;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JSONRequired;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JaxrsApplicationSelect;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JaxrsName;
import org.osgi.service.jaxrs.whiteboard.propertytypes.JaxrsResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.GsonBuilder;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Provides the options to proxy network requests for the CometVisu to avoid CORS errors.
 *
 * @author Tobias Bräutigam - Initial contribution
 */
@Component
@JaxrsResource
@JaxrsName(Config.COMETVISU_BACKEND_ALIAS + "/proxy")
@JaxrsApplicationSelect("(" + JaxrsWhiteboardConstants.JAX_RS_NAME + "=" + RESTConstants.JAX_RS_NAME + ")")
@JSONRequired
@Path(Config.COMETVISU_BACKEND_ALIAS + "/proxy")
@Tag(name = Config.COMETVISU_BACKEND_ALIAS + "/proxy")
@NonNullByDefault
public class ProxyResource implements RESTResource {
    private final Logger logger = LoggerFactory.getLogger(ProxyResource.class);

    HttpClient client = HttpClient.newBuilder().followRedirects(Redirect.NORMAL).build();

    @GET
    @Produces({ MediaType.APPLICATION_JSON, MediaType.MEDIA_TYPE_WILDCARD })
    @Operation(summary = "proxy a request", responses = { @ApiResponse(responseCode = "200", description = "OK"),
            @ApiResponse(responseCode = "400", description = "Bad request"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "Not found"),
            @ApiResponse(responseCode = "406", description = "Not Acceptable"),
            @ApiResponse(responseCode = "500", description = "Internal server error") })
    public Response proxy(
            @Parameter(description = "URL this request should be sent to", content = @Content(schema = @Schema(implementation = String.class, defaultValue = ""))) @QueryParam("url") @Nullable String url,
            @Parameter(description = "optional authorization token", content = @Content(schema = @Schema(implementation = String.class, defaultValue = ""))) @QueryParam("auth-type") @Nullable String authType,
            @Parameter(description = "use information from hidden config section", content = @Content(schema = @Schema(implementation = String.class, defaultValue = ""))) @QueryParam("config-section") @Nullable String configSection) {
        ConfigSection sec = null;
        String queryUrl = url != null ? url : "";
        HiddenConfig config = ConfigResource.loadHiddenConfig();
        if (configSection != null && !configSection.isBlank()) {
            // read URI and further information
            sec = config.get(configSection);
            if (sec != null) {
                String configUrl = sec.get("uri");
                if (configUrl == null) {
                    return Response.status(Status.INTERNAL_SERVER_ERROR).build();
                }
                queryUrl = configUrl;
            } else {
                return Response.status(Status.NOT_FOUND).build();
            }
        } else if (url == null || url.isBlank()) {
            return Response.status(Status.BAD_REQUEST).build();
        } else {
            ConfigSection whiteList = config.get("proxy.whitelist");
            boolean allowed = false;
            if (whiteList != null) {
                for (Map.Entry<String, String> entry : whiteList.entrySet()) {
                    String value = entry.getValue();
                    if (value.startsWith("/") && value.endsWith("/")) {
                        Pattern pattern = Pattern.compile(value.substring(1, value.length() - 1),
                                Pattern.CASE_INSENSITIVE);
                        Matcher matcher = pattern.matcher(queryUrl);
                        if (matcher.find()) {
                            allowed = true;
                            break;
                        }
                    } else if (value.equalsIgnoreCase(queryUrl)) {
                        allowed = true;
                        break;
                    }
                }
            }
            if (!allowed) {
                return Response.status(Status.FORBIDDEN).build();
            }
        }
        logger.info("proxying request to {}", queryUrl);

        var requestBuilder = HttpRequest.newBuilder().uri(URI.create(queryUrl)).timeout(Duration.ofMinutes(2));
        if (authType != null && !authType.isEmpty() && sec != null) {
            switch (authType.toLowerCase()) {
                case "basic":
                    String valueToEncode = sec.get("user") + ":" + sec.get("pass");
                    requestBuilder.header("Authorization",
                            "Basic " + Base64.getEncoder().encodeToString(valueToEncode.getBytes()));
                    break;

                case "bearer":
                    requestBuilder.header("Authorization", "Bearer " + sec.get("user"));
                    break;
            }
        }
        var request = requestBuilder.build();
        try {
            HttpResponse<byte[]> response = this.client.send(request, BodyHandlers.ofByteArray());
            byte[] rawData = response.body();
            var builder = Response.status(response.statusCode());
            var type = response.headers().firstValue("Content-Type");
            if (type.isPresent()) {
                String contentType = type.get();
                builder.type(contentType);
                if (contentType.equalsIgnoreCase("application/json")) {
                    var json = new GsonBuilder().create().fromJson(new String(rawData), Object.class);
                    builder.entity(json);
                } else if (contentType.startsWith("application/") || contentType.startsWith("text/")) {
                    // any other string type
                    builder.entity(new String(rawData));
                } else {
                    builder.entity(rawData);
                }
            }
            return builder.build();
        } catch (IOException | InterruptedException e) {
            return FsUtil.createErrorResponse(Status.BAD_REQUEST, e.getLocalizedMessage());
        }
    }
}
