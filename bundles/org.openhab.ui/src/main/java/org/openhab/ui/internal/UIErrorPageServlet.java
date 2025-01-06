/*
 * Copyright (c) 2010-2025 Contributors to the openHAB project
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
import java.io.InputStream;
import java.util.Set;

import javax.servlet.Servlet;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.http.whiteboard.propertytypes.HttpWhiteboardServletErrorPage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Returns the index file whenever pages cannot be found. This allows the UI to route to a page based on the URL or
 * display an error message. The response status is based on the first path segment of the request to keep the logic
 * simple.
 *
 * @author Wouter Born - Initial contribution
 */
@Component(immediate = true, service = Servlet.class)
@HttpWhiteboardServletErrorPage(errorPage = { "404" })
@NonNullByDefault
public class UIErrorPageServlet extends HttpServlet {

    private static final long serialVersionUID = 6472170444750947727L;

    private static final String INDEX_FILE = "/app/index.html";
    private static final Set<String> VALID_ROUTE_SEGMENTS = Set.of("about", "addons", "analyzer", "developer",
            "equipment", "home", "locations", "overview", "page", "profile", "properties", "res", "settings",
            "setup-wizard");

    private final Logger logger = LoggerFactory.getLogger(UIErrorPageServlet.class);

    @Override
    protected void doGet(@NonNullByDefault({}) HttpServletRequest req, @NonNullByDefault({}) HttpServletResponse resp)
            throws ServletException, IOException {
        try (InputStream is = UIErrorPageServlet.class.getResourceAsStream(INDEX_FILE)) {
            if (is == null) {
                logger.warn("The index file ({}) does not exist", INDEX_FILE);
                return;
            }
            String requestURI = (String) req.getAttribute("javax.servlet.error.request_uri");
            int status = isValidRoute(requestURI) ? 200 : 404;
            logger.debug("Returning index file as response with status {} for request URI: {}", status, requestURI);
            resp.setContentType("text/html");
            resp.setStatus(status);
            is.transferTo(resp.getOutputStream());
        }
    }

    private boolean isValidRoute(@Nullable String path) {
        if (path == null) {
            return false;
        }

        String[] segments = path.split("/");
        return segments.length > 1 && segments[0].isEmpty() && VALID_ROUTE_SEGMENTS.contains(segments[1]);
    }
}
