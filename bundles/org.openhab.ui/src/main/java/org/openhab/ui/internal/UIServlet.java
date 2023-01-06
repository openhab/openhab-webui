/**
 * Copyright (c) 2010-2023 Contributors to the openHAB project
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

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.channels.ReadableByteChannel;
import java.util.Arrays;
import java.util.Hashtable;
import java.util.Map;

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
    private long bundleModifiedTime = 0;
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
            bundleModifiedTime = (System.currentTimeMillis() / 1000) * 1000; // round milliseconds
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
    public @Nullable Resource getResource(@NonNullByDefault({}) String name) {
        logger.debug("getResource: {}", name);
        ContextHandler contextHandler = this.contextHandler;
        if (contextHandler == null) {
            return null;
        }

        if (name.startsWith(STATIC_PATH) && !name.endsWith("/")) {
            URL url = null;
            try {
                url = new java.io.File(STATIC_BASE + name.substring(new String(STATIC_PATH).length())).toURI().toURL();
            } catch (MalformedURLException e) {
                logger.error("Error while serving static content: {}", e.getMessage());
                url = defaultHttpContext.getResource(APP_BASE + name);
            }
            try {
                logger.debug("getResource static file returning {}", url);
                return contextHandler.newResource(url);
            } catch (IOException e) {
                logger.error("Error while serving content: {}", e.getMessage());
                return null;
            }
        } else {
            URL url = defaultHttpContext.getResource(APP_BASE + name);
            // if we don't find a resource, and its not a check for a compressed version, return the app base and let
            // the Vue.js main UI handle routing
            if (url == null && !Arrays.stream(COMPRESS_EXT).anyMatch(entry -> name.endsWith(entry))) {
                // sending a directory will trigger "getWelcomeFile" to be called which is required to avoid
                // Jetty doing a 302 redirect which breaks Vue.js routing when reloading the browser on some pages
                url = defaultHttpContext.getResource(APP_BASE);
            }
            try {
                logger.debug("getResource bundle file returning {}", url);
                return url == null ? null : new ResourceWrapper(contextHandler.newResource(url));
            } catch (IOException e) {
                logger.error("Error while serving content: {}", e.getMessage());
                return null;
            }
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

    /**
     *
     * Wraps a resource and returns a consistent time for bundled files
     *
     */
    class ResourceWrapper extends Resource {

        private Resource baseResource;

        public ResourceWrapper(Resource baseResource) {
            this.baseResource = baseResource;
        }

        @Override
        public long lastModified() {
            return bundleModifiedTime;
        }

        @Override
        public boolean isContainedIn(@Nullable Resource r) throws MalformedURLException {
            return baseResource.isContainedIn(r);
        }

        @Override
        public void close() {
            baseResource.close();
        }

        @Override
        public boolean exists() {
            return baseResource.exists();
        }

        @Override
        public boolean isDirectory() {
            return baseResource.isDirectory();
        }

        @Override
        public long length() {
            return baseResource.length();
        }

        @Override
        public URL getURL() {
            return baseResource.getURL();
        }

        @Override
        public File getFile() throws IOException {
            return baseResource.getFile();
        }

        @Override
        public String getName() {
            return baseResource.getName();
        }

        @Override
        public InputStream getInputStream() throws IOException {
            return baseResource.getInputStream();
        }

        @Override
        public ReadableByteChannel getReadableByteChannel() throws IOException {
            return baseResource.getReadableByteChannel();
        }

        @Override
        public boolean delete() throws SecurityException {
            return baseResource.delete();
        }

        @Override
        public boolean renameTo(@Nullable Resource dest) throws SecurityException {
            return baseResource.renameTo(dest);
        }

        @Override
        public String[] list() {
            return baseResource.list();
        }

        @Override
        public Resource addPath(@Nullable String path) throws IOException, MalformedURLException {
            return baseResource.addPath(path);
        }
    }
}
