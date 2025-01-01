/**
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
package org.openhab.ui.basic.internal.servlet;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

import javax.servlet.Servlet;
import javax.servlet.ServletException;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.emf.common.util.EList;
import org.eclipse.jdt.annotation.NonNullByDefault;
import org.openhab.core.config.core.ConfigurableService;
import org.openhab.core.io.rest.sitemap.SitemapSubscriptionService;
import org.openhab.core.model.sitemap.SitemapProvider;
import org.openhab.core.model.sitemap.sitemap.LinkableWidget;
import org.openhab.core.model.sitemap.sitemap.Sitemap;
import org.openhab.core.model.sitemap.sitemap.Widget;
import org.openhab.ui.basic.internal.WebAppConfig;
import org.openhab.ui.basic.internal.render.PageRenderer;
import org.openhab.ui.basic.render.RenderException;
import org.osgi.framework.BundleContext;
import org.osgi.framework.Constants;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Modified;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;
import org.osgi.service.http.whiteboard.propertytypes.HttpWhiteboardServletAsyncSupported;
import org.osgi.service.http.whiteboard.propertytypes.HttpWhiteboardServletName;
import org.osgi.service.http.whiteboard.propertytypes.HttpWhiteboardServletPattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This is the main servlet for the Basic UI.
 * It serves the Html code based on the sitemap model.
 *
 * @author Kai Kreuzer - Initial contribution and API
 * @author Vlad Ivanov - Basic UI changes
 * @author Laurent Garnier - New page /basicui/app/settings
 */
@Component(immediate = true, service = Servlet.class, configurationPid = "org.openhab.basicui", //
        property = Constants.SERVICE_PID + "=org.openhab.basicui")
@ConfigurableService(category = "ui", label = "Basic UI", description_uri = WebAppServlet.CONFIG_URI)
@HttpWhiteboardServletAsyncSupported(asyncSupported = true)
@HttpWhiteboardServletName(WebAppServlet.SERVLET_PATH)
@HttpWhiteboardServletPattern(WebAppServlet.SERVLET_PATH + "/*")
@NonNullByDefault
public class WebAppServlet extends HttpServlet {

    private final Logger logger = LoggerFactory.getLogger(WebAppServlet.class);

    private static final long serialVersionUID = 3443749654545136365L;

    protected static final String CONFIG_URI = "ui:basic";

    /** the name of the servlet to be used in the URL */
    public static final String SERVLET_PATH = "/basicui/app";

    private static final String CONTENT_TYPE_ASYNC = "application/xml;charset=UTF-8";
    private static final String CONTENT_TYPE = "text/html;charset=UTF-8";

    private final PageRenderer renderer;
    private final SitemapSubscriptionService subscriptions;
    private final WebAppConfig config = new WebAppConfig();
    protected final Set<SitemapProvider> sitemapProviders = new CopyOnWriteArraySet<>();

    @Activate
    public WebAppServlet(final @Reference SitemapSubscriptionService subscriptions,
            final @Reference PageRenderer renderer) {
        this.subscriptions = subscriptions;
        this.renderer = renderer;
    }

    @Reference(cardinality = ReferenceCardinality.AT_LEAST_ONE, policy = ReferencePolicy.DYNAMIC)
    public void addSitemapProvider(SitemapProvider sitemapProvider) {
        sitemapProviders.add(sitemapProvider);
    }

    public void removeSitemapProvider(SitemapProvider sitemapProvider) {
        sitemapProviders.remove(sitemapProvider);
    }

    @Activate
    protected void activate(Map<String, Object> configProps, BundleContext bundleContext) {
        modified(configProps);
    }

    @Modified
    protected void modified(Map<String, Object> configProps) {
        config.applyConfig(configProps);
        renderer.setConfig(config);
    }

    @Deactivate
    protected void deactivate() {
        logger.info("Stopped Basic UI");
    }

    private void showSitemapList(ServletResponse res) throws IOException, RenderException {
        res.setContentType(CONTENT_TYPE);
        res.getWriter().append(renderer.renderSitemapList(sitemapProviders));
    }

    private void showSettings(ServletResponse res) throws IOException, RenderException {
        res.setContentType(CONTENT_TYPE);
        res.getWriter().append(renderer.renderSettings());
    }

    @Override
    protected void service(@NonNullByDefault({}) HttpServletRequest req, @NonNullByDefault({}) HttpServletResponse res)
            throws ServletException, IOException {
        logger.debug("Servlet request received!");

        // read request parameters
        String sitemapName = req.getParameter("sitemap");
        String widgetId = req.getParameter("w");
        String subscriptionId = req.getParameter("subscriptionId");
        boolean async = "true".equalsIgnoreCase(req.getParameter("__async"));

        if (sitemapName == null) {
            sitemapName = config.getDefaultSitemap();
        }

        StringBuilder result = new StringBuilder();
        Sitemap sitemap = null;

        for (SitemapProvider sitemapProvider : sitemapProviders) {
            sitemap = sitemapProvider.getSitemap(sitemapName);
            if (sitemap != null) {
                break;
            }
        }

        try {
            if ("/settings".equals(req.getPathInfo())) {
                showSettings(res);
                return;
            }

            if (sitemap == null) {
                showSitemapList(res);
                return;
            }

            if (widgetId == null || widgetId.isEmpty() || widgetId.equals(sitemapName)) {
                // we are at the homepage, so we render the children of the sitemap root node
                if (subscriptionId != null) {
                    if (subscriptions.exists(subscriptionId)) {
                        subscriptions.updateSubscriptionLocation(subscriptionId, sitemap.getName(), sitemapName);
                    } else {
                        logger.debug("Basic UI requested a non-existing event subscription id ({})", subscriptionId);
                    }
                }
                String label = sitemap.getLabel() != null ? sitemap.getLabel() : sitemapName;
                EList<Widget> children = renderer.getItemUIRegistry().getChildren(sitemap);
                result.append(renderer.processPage(sitemapName, sitemapName, label, children, async));
            } else if (!"Colorpicker".equals(widgetId) && !"Colortemperaturepicker".equals(widgetId)) {
                // we are on some subpage, so we have to render the children of the widget that has been selected
                if (subscriptionId != null) {
                    if (subscriptions.exists(subscriptionId)) {
                        subscriptions.updateSubscriptionLocation(subscriptionId, sitemap.getName(), widgetId);
                    } else {
                        logger.debug("Basic UI requested a non-existing event subscription id ({})", subscriptionId);
                    }
                }
                Widget w = renderer.getItemUIRegistry().getWidget(sitemap, widgetId);
                if (w != null) {
                    String label = renderer.getItemUIRegistry().getLabel(w);
                    if (label == null) {
                        label = "undefined";
                    }
                    if (!(w instanceof LinkableWidget)) {
                        throw new RenderException("Widget '" + w + "' can not have any content");
                    }
                    EList<Widget> children = renderer.getItemUIRegistry().getChildren((LinkableWidget) w);
                    result.append(renderer.processPage(renderer.getItemUIRegistry().getWidgetId(w), sitemapName, label,
                            children, async));
                }
            }
        } catch (RenderException e) {
            throw new ServletException(e.getMessage(), e);
        }
        if (async) {
            res.setContentType(CONTENT_TYPE_ASYNC);
        } else {
            res.setContentType(CONTENT_TYPE);
        }
        res.getWriter().append(result);
        res.getWriter().close();
    }
}
