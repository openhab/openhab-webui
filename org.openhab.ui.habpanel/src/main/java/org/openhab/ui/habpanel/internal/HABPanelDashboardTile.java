/**
 * Copyright (c) 2010-2019 Contributors to the openHAB project
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
package org.openhab.ui.habpanel.internal;

import org.openhab.ui.dashboard.DashboardTile;
import org.osgi.service.http.HttpService;
import org.osgi.service.http.NamespaceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * The dashboard tile and resource registering for HABPanel
 *
 * @author Yannick Schaus - Initial contribution
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

    private final Logger logger = LoggerFactory.getLogger(HABPanelDashboardTile.class);

    protected HttpService httpService;

    protected void activate() {
        try {
            httpService.registerResources(HABPANEL_ALIAS, "web", null);
            logger.info("Started HABPanel at {}", HABPANEL_ALIAS);
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
