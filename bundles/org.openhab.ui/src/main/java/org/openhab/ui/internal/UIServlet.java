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
package org.openhab.ui.internal;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.List;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.OpenHAB;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.servlet.whiteboard.propertytypes.HttpWhiteboardContext;
import org.osgi.service.servlet.whiteboard.propertytypes.HttpWhiteboardServletName;
import org.osgi.service.servlet.whiteboard.propertytypes.HttpWhiteboardServletPattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.servlet.Servlet;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Servlet that serves files from both the filesystem and the local bundle. Supports general file caching as well as
 * serving compressed files
 *
 * @author Yannick Schaus - Initial contribution
 * @author Dan Cunningham - Convert file serving to a custom servlet
 */
@Component(immediate = true, service = Servlet.class, name = "org.openhab.ui")
@NonNullByDefault
@HttpWhiteboardServletName(UIServlet.SERVLET_PATH)
@HttpWhiteboardServletPattern(UIServlet.SERVLET_PATH + "*")
@HttpWhiteboardContext(name = "=org.openhab.ui.context", path = "=/")
public class UIServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    private final Logger logger = LoggerFactory.getLogger(UIServlet.class);

    private static final String APP_BASE = "app";
    public static final String SERVLET_PATH = "/";
    private static final String STATIC_PATH = "/static";
    private static final String STATIC_BASE = OpenHAB.getConfigFolder() + "/html";
    private static final List<String> COMPRESS_EXT = List.of("br", "gz");

    private final UIContext uiContext;
    private final long bundleModifiedTime;

    @Activate
    public UIServlet(final @Reference UIContext uiContext) {
        this.uiContext = uiContext;
        logger.debug("Starting up {} at {}", getClass().getSimpleName(), SERVLET_PATH);
        bundleModifiedTime = (System.currentTimeMillis() / 1000) * 1000; // round milliseconds
    }

    @Override
    protected void doGet(@Nullable HttpServletRequest request, @Nullable HttpServletResponse response)
            throws ServletException, IOException {
        if (request == null || response == null) {
            return;
        }

        if (!uiContext.handleSecurity(request, response)) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            return;
        }

        String requestPath = request.getRequestURI().substring(request.getContextPath().length());
        if (requestPath.isEmpty()) {
            requestPath = SERVLET_PATH;
        }
        if (SERVLET_PATH.equals(requestPath)) {
            requestPath = "/index.html";
        }

        ResourceDescriptor resource = resolveResource(requestPath, request.getHeader("Accept-Encoding"));
        if (resource == null) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        if (resource.contentType != null) {
            response.setContentType(resource.contentType);
        }
        if (resource.contentEncoding != null) {
            response.setHeader("Content-Encoding", resource.contentEncoding);
            response.setHeader("Vary", "Accept-Encoding");
        }
        if (resource.lastModified > 0) {
            response.setDateHeader("Last-Modified", resource.lastModified);
        }
        if (resource.contentLength >= 0) {
            response.setContentLengthLong(resource.contentLength);
        }

        try (InputStream is = resource.url.openStream()) {
            is.transferTo(response.getOutputStream());
        }
    }

    private @Nullable ResourceDescriptor resolveResource(String requestPath, @Nullable String acceptEncoding) {
        logger.debug("Resolving UI resource: {}", requestPath);

        if (requestPath.startsWith(STATIC_PATH) && !requestPath.endsWith("/")) {
            return resolveStaticResource(requestPath, acceptEncoding);
        }

        if (requestPath.endsWith("/")) {
            return null;
        }

        return resolveBundleResource(APP_BASE + requestPath, requestPath, acceptEncoding);
    }

    private @Nullable ResourceDescriptor resolveStaticResource(String requestPath, @Nullable String acceptEncoding) {
        String relativePath = requestPath.substring(STATIC_PATH.length());
        File file = new File(STATIC_BASE + relativePath);
        if (file.isDirectory() || !file.exists()) {
            return null;
        }

        if (acceptEncoding != null) {
            for (String ext : COMPRESS_EXT) {
                if (acceptEncoding.contains(ext)) {
                    File compressed = new File(file.getPath() + "." + ext);
                    if (compressed.exists()) {
                        URL compressedUrl = fileUrl(compressed);
                        if (compressedUrl != null) {
                            return new ResourceDescriptor(compressedUrl, contentType(requestPath), ext,
                                    compressed.length(), compressed.lastModified());
                        }
                    }
                }
            }
        }

        URL fileUrl = fileUrl(file);
        return fileUrl == null ? null
                : new ResourceDescriptor(fileUrl, contentType(requestPath), null, file.length(), file.lastModified());
    }

    private @Nullable URL fileUrl(File file) {
        try {
            return file.toURI().toURL();
        } catch (MalformedURLException e) {
            logger.debug("Failed to create URL for static resource {}", file, e);
            return null;
        }
    }

    private @Nullable ResourceDescriptor resolveBundleResource(String bundlePath, String requestPath,
            @Nullable String acceptEncoding) {
        if (acceptEncoding != null) {
            for (String ext : COMPRESS_EXT) {
                if (acceptEncoding.contains(ext)) {
                    URL compressed = uiContext.getResource(bundlePath + "." + ext);
                    if (compressed != null) {
                        return new ResourceDescriptor(compressed, contentType(requestPath), ext, -1,
                                bundleModifiedTime);
                    }
                }
            }
        }

        URL resource = uiContext.getResource(bundlePath);
        if (resource == null && COMPRESS_EXT.stream().noneMatch(requestPath::endsWith)) {
            // Missing resources should return 404 so the error page servlet can handle SPA routes.
            return null;
        }
        return resource == null ? null
                : new ResourceDescriptor(resource, contentType(requestPath), null, -1, bundleModifiedTime);
    }

    private @Nullable String contentType(String path) {
        String contentType = getServletContext().getMimeType(path);
        if (contentType == null) {
            contentType = URLConnection.guessContentTypeFromName(path);
        }
        return contentType;
    }

    private record ResourceDescriptor(URL url, @Nullable String contentType, @Nullable String contentEncoding,
            long contentLength, long lastModified) {
    }
}
