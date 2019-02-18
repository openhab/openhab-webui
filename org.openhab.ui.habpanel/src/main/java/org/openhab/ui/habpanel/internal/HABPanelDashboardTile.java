/**
 * Copyright (c) 2015-2016 by the respective copyright holders.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habpanel.internal;

import org.openhab.ui.dashboard.DashboardTile;
import org.osgi.service.http.HttpService;
import org.osgi.service.http.NamespaceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * The dashboard tile and resource registering for HABPanel
 *
 * @author Yannick Schaus
 *
 */
public class HABPanelDashboardTile implements DashboardTile {

    @Override
    public String getName() {
        return "HABPanel";
    }

    @Override
    public String getUrl() {
        return "../habpanel/index.html";
    }

    @Override
    public String getOverlay() {
        return null;
    }

    @Override
    public String getImageUrl() {
        return "../habpanel/tile.png";
    }

    public static final String HABPANEL_ALIAS = "/habpanel";

    private static final Logger logger = LoggerFactory.getLogger(HABPanelDashboardTile.class);

    protected HttpService httpService;

    protected void activate() {
        try {
            httpService.registerResources(HABPANEL_ALIAS, "web", null);
            logger.info("Started HABPanel at " + HABPANEL_ALIAS);
        } catch (NamespaceException e) {
            logger.error("Error during HABPanel startup: {}", e.getMessage());
        }
    }

    protected void deactivate() {
        httpService.unregister(HABPANEL_ALIAS);
        logger.info("Stopped HABPanel");
    }

    protected void setHttpService(HttpService httpService) {
        this.httpService = httpService;
    }

    protected void unsetHttpService(HttpService httpService) {
        this.httpService = null;
    }

}
