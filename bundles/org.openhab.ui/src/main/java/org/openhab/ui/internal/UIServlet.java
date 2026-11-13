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
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.nio.file.InvalidPathException;
import java.nio.file.Path;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.OpenHAB;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.servlet.whiteboard.propertytypes.HttpWhiteboardContextSelect;
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
 * @author Holger Friedrich - Serve files without Jetty DefaultServlet, support range requests
 */
// The ranking makes this servlet win the "/*" mapping against the Jakarta REST whiteboard's default application
// servlet, which is registered at "/*" in the default context. Pax Web resolves the conflict by context ranking on
// registration, but only by servlet ranking and service id when re-enabling waiting servlets after any other servlet
// on "/" is unregistered, which would otherwise let the REST servlet take over and serve 404 for the UI.
@Component(immediate = true, service = Servlet.class, name = "org.openhab.ui", property = {
        "service.ranking:Integer=1" })
@NonNullByDefault
@HttpWhiteboardServletName(UIServlet.SERVLET_PATH)
@HttpWhiteboardServletPattern(UIServlet.SERVLET_PATH + "*")
@HttpWhiteboardContextSelect("(osgi.http.whiteboard.context.name=org.openhab.ui.context)")
public class UIServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    private final Logger logger = LoggerFactory.getLogger(UIServlet.class);

    private static final String APP_BASE = "app";
    public static final String SERVLET_PATH = "/";
    private static final String STATIC_PATH = "/static/";
    // precompressed variants in order of preference, mapping the file extension to the HTTP content-coding
    private static final List<Encoding> ENCODINGS = List.of(new Encoding("br", "br"), new Encoding("gz", "gzip"));
    // a single byte range; multiple ranges are not supported and the complete resource is served instead
    private static final Pattern BYTE_RANGE = Pattern.compile("bytes=(\\d*)-(\\d*)");

    private final UIContext uiContext;
    private final Path staticBase;
    private final long bundleModifiedTime;

    @Activate
    public UIServlet(final @Reference UIContext uiContext) {
        this(uiContext, Path.of(OpenHAB.getConfigFolder(), "html"));
    }

    UIServlet(UIContext uiContext, Path staticBase) {
        this.uiContext = uiContext;
        this.staticBase = staticBase.toAbsolutePath().normalize();
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

        // the path info is decoded and normalized by the container, unlike the raw request URI, so ".." segments
        // cannot be used to leave the served directories
        String requestPath = request.getPathInfo();
        if (requestPath == null || requestPath.isEmpty() || SERVLET_PATH.equals(requestPath)) {
            requestPath = "/index.html";
        }

        ResourceDescriptor resource = resolveResource(requestPath, request.getHeader("Accept-Encoding"));
        if (resource == null) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND);
            return;
        }

        response.setHeader("Vary", "Accept-Encoding");
        if (resource.lastModified > 0) {
            response.setDateHeader("Last-Modified", resource.lastModified);
            if (isNotModified(request, resource.lastModified)) {
                response.setStatus(HttpServletResponse.SC_NOT_MODIFIED);
                return;
            }
        }
        if (resource.contentType != null) {
            response.setContentType(resource.contentType);
        }
        // .svgz files are gzip compressed SVGs and must be served with Content-Encoding: gzip, as Jetty's
        // DefaultServlet did
        @Nullable
        String contentEncoding = resource.contentEncoding;
        if (requestPath.endsWith(".svgz")) {
            contentEncoding = contentEncoding == null ? "gzip" : "gzip, " + contentEncoding;
        }
        if (contentEncoding != null) {
            response.setHeader("Content-Encoding", contentEncoding);
        }
        long length = resource.contentLength;
        ByteRange range = null;
        if (length >= 0) {
            response.setHeader("Accept-Ranges", "bytes");
            String rangeHeader = request.getHeader("Range");
            if (rangeHeader != null && isRangeApplicable(request, resource.lastModified)) {
                range = parseRange(rangeHeader, length);
            }
        }

        if (range == ByteRange.UNSATISFIABLE) {
            response.setHeader("Content-Range", "bytes */" + length);
            // not sendError(), which would dispatch to the error page servlet and serve the UI instead
            response.setStatus(HttpServletResponse.SC_REQUESTED_RANGE_NOT_SATISFIABLE);
            return;
        }
        if (range != null) {
            response.setStatus(HttpServletResponse.SC_PARTIAL_CONTENT);
            response.setHeader("Content-Range", "bytes " + range.first() + "-" + range.last() + "/" + length);
            response.setContentLengthLong(range.length());
        } else if (length >= 0) {
            response.setContentLengthLong(length);
        }

        try (InputStream is = resource.url.openStream()) {
            if (range == null) {
                is.transferTo(response.getOutputStream());
            } else {
                is.skipNBytes(range.first());
                copy(is, response.getOutputStream(), range.length());
            }
        }
    }

    private static void copy(InputStream in, OutputStream out, long count) throws IOException {
        byte[] buffer = new byte[8192];
        long remaining = count;
        while (remaining > 0) {
            int read = in.read(buffer, 0, (int) Math.min(buffer.length, remaining));
            if (read < 0) {
                break;
            }
            out.write(buffer, 0, read);
            remaining -= read;
        }
    }

    /**
     * Checks the If-Range precondition. No ETags are sent, so only an HTTP date matching the last modification time
     * allows a partial response.
     */
    private boolean isRangeApplicable(HttpServletRequest request, long lastModified) {
        if (request.getHeader("If-Range") == null) {
            return true;
        }
        try {
            return request.getDateHeader("If-Range") == (lastModified / 1000) * 1000;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Parses a Range header according to RFC 9110, section 14.1.2.
     *
     * @return the requested range, {@link ByteRange#UNSATISFIABLE} if no byte of the resource is selected, or null if
     *         the header is invalid or requests multiple ranges and the complete resource should be served
     */
    static @Nullable ByteRange parseRange(String header, long length) {
        Matcher matcher = BYTE_RANGE.matcher(header.trim());
        if (!matcher.matches()) {
            return null;
        }
        String first = matcher.group(1);
        String last = matcher.group(2);
        try {
            if (first.isEmpty()) {
                if (last.isEmpty()) {
                    return null;
                }
                long suffixLength = Long.parseLong(last);
                if (suffixLength == 0 || length == 0) {
                    return ByteRange.UNSATISFIABLE;
                }
                return new ByteRange(Math.max(0, length - suffixLength), length - 1);
            }
            long start = Long.parseLong(first);
            long end = last.isEmpty() ? Long.MAX_VALUE : Long.parseLong(last);
            if (end < start) {
                return null;
            }
            if (start >= length) {
                return ByteRange.UNSATISFIABLE;
            }
            return new ByteRange(start, Math.min(end, length - 1));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private boolean isNotModified(HttpServletRequest request, long lastModified) {
        try {
            long ifModifiedSince = request.getDateHeader("If-Modified-Since");
            // HTTP dates have a resolution of one second
            return ifModifiedSince >= 0 && ifModifiedSince >= (lastModified / 1000) * 1000;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    private static boolean accepts(@Nullable String acceptEncoding, String coding) {
        if (acceptEncoding == null) {
            return false;
        }
        for (String part : acceptEncoding.split(",")) {
            String[] params = part.split(";");
            if (params[0].trim().equalsIgnoreCase(coding)) {
                return params.length < 2 || !params[1].trim().matches("q=0(\\.0{0,3})?");
            }
        }
        return false;
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
        Path path;
        try {
            path = staticBase.resolve(requestPath.substring(STATIC_PATH.length())).normalize();
        } catch (InvalidPathException e) {
            return null;
        }
        if (!path.startsWith(staticBase)) {
            return null;
        }
        File file = path.toFile();
        if (file.isDirectory() || !file.exists()) {
            return null;
        }

        for (Encoding encoding : ENCODINGS) {
            if (accepts(acceptEncoding, encoding.coding())) {
                File compressed = new File(file.getPath() + "." + encoding.extension());
                if (compressed.exists()) {
                    URL compressedUrl = fileUrl(compressed);
                    if (compressedUrl != null) {
                        return new ResourceDescriptor(compressedUrl, contentType(requestPath), encoding.coding(),
                                compressed.length(), compressed.lastModified());
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
        for (Encoding encoding : ENCODINGS) {
            if (accepts(acceptEncoding, encoding.coding())) {
                URL compressed = uiContext.getResource(bundlePath + "." + encoding.extension());
                if (compressed != null) {
                    return new ResourceDescriptor(compressed, contentType(requestPath), encoding.coding(), -1,
                            bundleModifiedTime);
                }
            }
        }

        URL resource = uiContext.getResource(bundlePath);
        if (resource == null && ENCODINGS.stream().noneMatch(e -> requestPath.endsWith("." + e.extension()))) {
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

    private record Encoding(String extension, String coding) {
    }

    private record ResourceDescriptor(URL url, @Nullable String contentType, @Nullable String contentEncoding,
            long contentLength, long lastModified) {
    }

    record ByteRange(long first, long last) {
        static final ByteRange UNSATISFIABLE = new ByteRange(-1, -1);

        long length() {
            return last - first + 1;
        }
    }
}
