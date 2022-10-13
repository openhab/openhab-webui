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
package org.openhab.ui.internal;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Arrays;
import java.util.Hashtable;
import java.util.Map;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.UnavailableException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.eclipse.jetty.server.handler.ContextHandler;
import org.eclipse.jetty.servlet.DefaultServlet;
import org.eclipse.jetty.util.resource.Resource;
import org.openhab.core.OpenHAB;
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
 * Servlet that serves files from both the filesystem and the local bundle. Supports general file caching as well as
 * serving compressed files
 *
 * @author Yannick Schaus - Initial contribution
 * @author Dan Cunningham - Convert file serving to a custom servlet
 */

@Component(immediate = true, name = "org.openhab.ui", property = { "httpContext.id:String=oh-ui-http-ctx" })
@NonNullByDefault
public class UIServlet extends DefaultServlet {

    private static final long serialVersionUID = 1L;

    private final Logger logger = LoggerFactory.getLogger(UIServlet.class);

    private static final String APP_BASE = "app";
    private static final String SERVLET_NAME = "/";
    private static final String STATIC_PATH = "/static";
    private static final String STATIC_BASE = OpenHAB.getConfigFolder() + "/html";
    private static final String[] COMPRESS_EXT = { "gz", "br" };

    private final HttpContext defaultHttpContext;
    private final HttpService httpService;
    private @Nullable ContextHandler contextHandler;

    @Activate
    public UIServlet(final @Reference HttpService httpService, final @Reference HttpContext httpContext) {
        super();
        defaultHttpContext = httpService.createDefaultHttpContext();
        this.httpService = httpService;
    }

    @Activate
    protected void activate(Map<String, Object> config) {
        try {
            logger.debug("Starting up {} at {}", getClass().getSimpleName(), SERVLET_NAME);
            httpService.registerServlet(SERVLET_NAME, this, new Hashtable<>(), defaultHttpContext);
        } catch (NamespaceException e) {
            logger.error("Error during servlet registration - alias {} already in use", SERVLET_NAME, e);
        } catch (ServletException e) {
            logger.error("Error during servlet registration", e);
        }
    }

    @Deactivate
    protected void deactivate() {
        httpService.unregister(SERVLET_NAME);
    }

    @Override
    public void init() throws UnavailableException {
        setInitParameter("acceptRanges", "true");
        setInitParameter("dirAllowed", "false");
        setInitParameter("redirectWelcome", "false");
        setInitParameter("precompressed", "true");
        setInitParameter("etags", "true");
        contextHandler = ContextHandler.getCurrentContext().getContextHandler();
        super.init();
    }

    @Override
    protected ContextHandler initContextHandler(@Nullable ServletContext servletContext) {
        if (servletContext instanceof ContextHandler.Context) {
            return ((ContextHandler.Context) servletContext).getContextHandler();
        } else {
            throw new IllegalArgumentException("The servletContext " + servletContext + " "
                    + servletContext.getClass().getName() + " is not " + ContextHandler.Context.class.getName());
        }
    }

    @Override
    public @Nullable Resource getResource(@NonNullByDefault({}) String name) {
        logger.debug("getResource: {}", name);
        ContextHandler contextHandler = this.contextHandler;
        if (contextHandler == null) {
            return null;
        }
        URL url = null;
        if (name.startsWith(STATIC_PATH) && !name.endsWith("/")) {
            try {
                url = new java.io.File(STATIC_BASE + name.substring(new String(STATIC_PATH).length())).toURI().toURL();
                logger.trace("Serving static file from {}", url);
            } catch (MalformedURLException e) {
                logger.error("Error while serving static content: {}", e.getMessage());
                url = defaultHttpContext.getResource(APP_BASE + name);
            }
        } else {
            url = defaultHttpContext.getResource(APP_BASE + name);
            // if we don't find a resource, and its not a check for a compressed version, return Vue.js base for
            // routing
            if (url == null && !Arrays.stream(COMPRESS_EXT).anyMatch(entry -> name.endsWith(entry))) {
                // sending the default directory will trigger "getWelcomeFile" to be called which is required to avoid
                // Jetty doing a 302 redirect
                // which breaks Vue.js routing when reloading the browser on some pages
                url = defaultHttpContext.getResource(APP_BASE);
            }
        }
        try {
            logger.debug("getResource returning {}", url);
            return contextHandler.newResource(url);
        } catch (IOException e) {
            logger.error("Error while serving content: {}", e.getMessage());
            return null;
        }
    }

    @Override
    protected void doGet(@Nullable HttpServletRequest request, @Nullable HttpServletResponse response)
            throws ServletException, IOException {
        if (request == null || response == null) {
            return;
        }
        if (!defaultHttpContext.handleSecurity(request, response)) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            return;
        }
        super.doGet(request, response);
    }

    @Override
    public @Nullable String getWelcomeFile(@Nullable String pathInContext) {
        logger.debug("getWelcomeFile {}", pathInContext);
        if (pathInContext != null && pathInContext.startsWith(STATIC_PATH)) {
            return null;
        }
        return "/index.html";
    }

    private void setInitParameter(String name, String value) {
        getServletContext().setInitParameter(CONTEXT_INIT + name, value);
    }
}
