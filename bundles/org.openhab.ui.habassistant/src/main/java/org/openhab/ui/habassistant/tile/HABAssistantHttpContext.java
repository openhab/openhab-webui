/**
 * Copyright (c) 2010-2022 Contributors to the openHAB project
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
package org.openhab.ui.habassistant.tile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.core.HttpHeaders;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.osgi.service.http.HttpContext;
import org.osgi.service.http.HttpService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * An implementation of {@link HttpContext} which will handle the gzip-compressed assets.
 *
 * @author Miguel Álvarez - Initial contribution
 */
@NonNullByDefault
public class HABAssistantHttpContext implements HttpContext {
    private final Logger logger = LoggerFactory.getLogger(HABAssistantHttpContext.class);

    private final HttpContext defaultHttpContext;
    private final String resourcesBase;
    private final boolean useGzipCompression;

    /**
     * Constructs an {@link HABAssistantHttpContext} with will another {@link HttpContext} as a base.
     *
     * @param defaultHttpContext the base {@link HttpContext} - use {@link HttpService#createDefaultHttpContext()} to
     *            create a default one
     */
    public HABAssistantHttpContext(HttpContext defaultHttpContext, String resourcesBase, boolean useGzipCompression) {
        this.defaultHttpContext = defaultHttpContext;
        this.resourcesBase = resourcesBase;
        this.useGzipCompression = useGzipCompression;
    }

    @Override
    public boolean handleSecurity(@Nullable HttpServletRequest request, @Nullable HttpServletResponse response)
            throws IOException {
        // Add the Content-Encoding: gzip header to the response for selected resources
        // (Disclaimer: I know, this is not the intended purpose of this method...)
        if (useGzipCompression && request != null && response != null
                && isGzipVersionAvailable(request.getRequestURI())) {
            response.addHeader(HttpHeaders.CONTENT_ENCODING, "gzip");
        }
        return defaultHttpContext.handleSecurity(request, response);
    }

    @Override
    public URL getResource(@Nullable String name) {
        logger.debug("Requesting resource: {}", name);
        // Get the gzipped version for selected resources, built as static resources
        URL defaultResource = defaultHttpContext.getResource(name);
        if (name != null) {
            if (useGzipCompression && isGzipVersionAvailable(name)) {
                try {
                    return new URL(defaultResource.toString() + ".gz");
                } catch (MalformedURLException ignored) {
                }
            } else if (name.equals(resourcesBase) || (resourcesBase + "/").equals(name) || !name.contains(".")) {
                return defaultHttpContext.getResource(resourcesBase + "/index.html");
            }
        }
        return defaultResource;
    }

    @Override
    public String getMimeType(@Nullable String name) {
        return defaultHttpContext.getMimeType(name);
    }

    private boolean isGzipVersionAvailable(String name) {
        return name.endsWith(".css") || name.endsWith(".js") && !name.contains("websocket-worker");
    }
}
