/**
 * Copyright (c) 2010-2018 by the respective copyright holders.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habot.dashboard.internal;

import java.util.Map;

import org.openhab.ui.dashboard.DashboardTile;
import org.osgi.framework.BundleContext;
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
 * The dashboard tile and resource registering for HABot
 *
 * @author Yannick Schaus
 *
 */
@Component(service = DashboardTile.class, immediate = true, name = "org.openhab.habot", property = {
        "service.config.description.uri=ui:habot", "service.config.label=HABot", "service.config.category=ui" })
public class HABotDashboardTile implements DashboardTile {

    @Override
    public String getName() {
        return "HABot";
    }

    @Override
    public String getUrl() {
        return "../habot/";
    }

    @Override
    public String getOverlay() {
        return null;
    }

    @Override
    public String getImageUrl() {
        return "../habot/statics/dashboardtile.png";
    }

    public static final String HABOT_ALIAS = "/habot";
    public static final String RESOURCES_BASE = "web/dist/pwa-mat";

    private final Logger logger = LoggerFactory.getLogger(HABotDashboardTile.class);

    protected HttpService httpService;

    @Activate
    protected void activate(Map<String, Object> configProps, BundleContext context) {
        try {
            Object useGzipCompression = configProps.get("useGzipCompression");
            HttpContext httpContext = new HABotHttpContext(httpService.createDefaultHttpContext(), RESOURCES_BASE,
                    (useGzipCompression != null && Boolean.parseBoolean(useGzipCompression.toString())));

            httpService.registerResources(HABOT_ALIAS, RESOURCES_BASE, httpContext);
            logger.info("Started HABot at " + HABOT_ALIAS);
        } catch (NamespaceException e) {
            logger.error("Error during HABot startup: {}", e.getMessage());
        }
    }

    @Deactivate
    protected void deactivate() {
        httpService.unregister(HABOT_ALIAS);
        logger.info("Stopped HABot");
    }

    @Reference
    protected void setHttpService(HttpService httpService) {
        this.httpService = httpService;
    }

    protected void unsetHttpService(HttpService httpService) {
        this.httpService = null;
    }

}
