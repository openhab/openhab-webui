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
package org.openhab.ui.basic.internal.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.io.http.HttpContextFactoryService;
import org.openhab.core.items.ItemRegistry;
import org.openhab.ui.basic.internal.render.PageRenderer;
import org.openhab.ui.basic.render.RenderException;
import org.osgi.framework.BundleContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.http.HttpContext;
import org.osgi.service.http.HttpService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This is the manifest servlet for the Basic UI. It dynamically genrates a
 * manifest on the sitemap model.
 *
 * @author Kevin Haunschmied - Initial contribution
 *
 */
@Component(immediate = true, service = {})
@NonNullByDefault
public class ManifestServlet extends BaseServlet {

    private static final long serialVersionUID = 4591967180619528326L;

    public static final String MANIFEST_NAME = "manifest.json";

    private static final String MANIFEST_CONTENT_TYPE = "application/json;charset=UTF-8";

    private final Logger logger = LoggerFactory.getLogger(ManifestServlet.class);

    private final PageRenderer renderer;

    @Activate
    public ManifestServlet(final @Reference HttpService httpService,
            final @Reference HttpContextFactoryService httpContextFactoryService,
            final @Reference ItemRegistry itemRegistry, final @Reference PageRenderer renderer) {
        super(httpService, httpContextFactoryService, itemRegistry);
        this.renderer = renderer;
    }

    @Activate
    protected void activate(Map<String, Object> configProps, BundleContext bundleContext) {
        HttpContext httpContext = createHttpContext(bundleContext.getBundle());
        super.activate(WEBAPP_ALIAS + "/" + MANIFEST_NAME, httpContext);
    }

    @Deactivate
    protected void deactivate() {
        super.deactivate(WEBAPP_ALIAS + "/" + MANIFEST_NAME);
    }

    private void generateManifest(ServletResponse res, @Nullable String sitemapName)
            throws IOException, RenderException {
        PrintWriter resWriter;
        resWriter = res.getWriter();
        resWriter.append(renderer.renderManifest(sitemapName));

        res.setContentType(MANIFEST_CONTENT_TYPE);
    }

    @Override
    protected void service(@NonNullByDefault({}) HttpServletRequest req, @NonNullByDefault({}) HttpServletResponse res)
            throws ServletException, IOException {
        logger.debug("Manifest request received!");

        // read request parameters
        String sitemapName = req.getParameter("sitemap");
        String requestUri = req.getRequestURI();

        try {
            if (requestUri != null && requestUri.endsWith(MANIFEST_NAME)) {
                generateManifest(res, sitemapName);
                return;
            }
        } catch (RenderException e) {
            throw new ServletException(e.getMessage(), e);
        }
    }
}
