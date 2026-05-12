/*
 * Copyright (c) 2010-2026 Contributors to the openHAB project
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
package org.openhab.ui.habot.tile.internal;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;

import org.osgi.framework.Bundle;
import org.osgi.service.servlet.context.ServletContextHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.ws.rs.core.HttpHeaders;

/**
 * A custom {@link ServletContextHelper} which handles gzip-compressed assets and SPA fallbacks.
 *
 * @author Yannick Schaus - Initial contribution
 */
public class HABotHttpContext extends ServletContextHelper {
    private final Logger logger = LoggerFactory.getLogger(HABotHttpContext.class);

    private final String resourcesBase;
    private final boolean useGzipCompression;

    /**
     * Constructs an {@link HABotHttpContext}.
     *
     * @param bundle the bundle providing the resources
     * @param resourcesBase the base folder for web resources
     * @param useGzipCompression whether to serve pre-compressed gzip assets when available
     */
    public HABotHttpContext(Bundle bundle, String resourcesBase, boolean useGzipCompression) {
        super(bundle);
        this.resourcesBase = resourcesBase;
        this.useGzipCompression = useGzipCompression;
    }

    @Override
    public boolean handleSecurity(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // Add the Content-Encoding: gzip header to the response for selected resources
        // (Disclaimer: I know, this is not the intended purpose of this method...)
        if (useGzipCompression && isGzipVersionAvailable(request.getRequestURI())) {
            response.addHeader(HttpHeaders.CONTENT_ENCODING, "gzip");
        }
        return super.handleSecurity(request, response);
    }

    @Override
    public URL getResource(String name) {
        logger.debug("Requesting resource: {}", name);
        // Get the gzipped version for selected resources, built as static resources by webpack
        URL defaultResource = super.getResource(name);
        if (useGzipCompression && defaultResource != null && isGzipVersionAvailable(name)) {
            try {
                return new URL(defaultResource.toString() + ".gz");
            } catch (MalformedURLException e) {
                return defaultResource;
            }
        } else {
            if (defaultResource != null) {
                if (name.equals(resourcesBase) || name.equals("/" + resourcesBase) || (resourcesBase + "/").equals(name)
                        || ("/" + resourcesBase + "/").equals(name) || !name.contains(".")) {
                    URL index = super.getResource("/" + resourcesBase + "/index.html");
                    return index != null ? index : defaultResource;
                }
                return defaultResource;
            }

            if (!name.contains(".")) {
                return super.getResource("/" + resourcesBase + "/index.html");
            }
            return null;
        }
    }

    @Override
    public String getMimeType(String name) {
        return super.getMimeType(name);
    }

    private boolean isGzipVersionAvailable(String name) {
        if (!name.endsWith(".css") && !name.contains("/js/")) {
            return false;
        }
        if ((name.contains("app.") || name.contains("vendor.")) || name.contains("charts.")) {
            return true;
        }
        if (name.contains("0.") && name.endsWith(".css")) {
            return true;
        }

        return false;
    }
}
