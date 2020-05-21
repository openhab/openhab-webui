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
package org.openhab.ui.internal;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.openhab.core.config.core.ConfigConstants;
import org.openhab.core.net.HttpServiceUtil;
import org.osgi.framework.BundleContext;
import org.osgi.service.component.ComponentContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.http.HttpContext;
import org.osgi.service.http.HttpService;
import org.osgi.service.http.NamespaceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This service register the default UI's resources in the HTTP context.
 *
 * @author Yannick Schaus - Initial contribution
 */
@Component(immediate = true, name = "org.openhab.ui", property = { "httpContext.id:String=oh-ui-http-ctx" })
@NonNullByDefault
public class UIService implements HttpContext {

    private static final String APP_BASE = "app";
    private static final String STATIC_PATH = "/static";
    private static final String STATIC_BASE = ConfigConstants.getConfigFolder() + "/html";

    private final Logger logger = LoggerFactory.getLogger(UIService.class);

    private final HttpService httpService;
    private final HttpContext defaultHttpContext;

    @Activate
    public UIService(final @Reference HttpService httpService) {
        this.httpService = httpService;
        defaultHttpContext = httpService.createDefaultHttpContext();
    }

    @Override
    public boolean handleSecurity(@NonNullByDefault({}) HttpServletRequest request,
            @NonNullByDefault({}) HttpServletResponse response) throws IOException {
        return defaultHttpContext.handleSecurity(request, response);
    }

    @Override
    public URL getResource(@NonNullByDefault({}) String name) {
        if (name.startsWith(APP_BASE + STATIC_PATH) && !name.endsWith("/")) {
            try {
                URL url = new java.io.File(STATIC_BASE + name.substring(new String(APP_BASE + STATIC_PATH).length()))
                        .toURI().toURL();
                logger.trace("Serving static file from {}", url);
                return url;
            } catch (MalformedURLException e) {
                logger.error("Error while serving static content: {}", e.getMessage());
                return defaultHttpContext.getResource(name);
            }
        } else {
            return defaultHttpContext.getResource(name);
        }
    }

    @Override
    public String getMimeType(@NonNullByDefault({}) String name) {
        return defaultHttpContext.getMimeType(name);
    }

    @Activate
    protected void activate(ComponentContext componentContext, Map<String, Object> properties) {
        BundleContext bundleContext = componentContext.getBundleContext();
        try {
            httpService.registerResources("/", APP_BASE, this);
            if (HttpServiceUtil.getHttpServicePort(bundleContext) > 0) {
                logger.info("Started UI on port {}", HttpServiceUtil.getHttpServicePort(bundleContext));
            } else {
                logger.info("Started UI");
            }
        } catch (NamespaceException e) {
            logger.error("Error during UI startup: {}", e.getMessage());
        }
    }

    @Deactivate
    protected void deactivate(ComponentContext componentContext) {
        httpService.unregister("/");
        logger.info("Stopped UI");
    }
}
