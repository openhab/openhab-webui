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
package org.openhab.ui.habpanel.internal;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.ui.tiles.Tile;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.http.HttpService;
import org.osgi.service.http.NamespaceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * The tile and resource registering for HABPanel
 *
 * @author Yannick Schaus - Initial contribution
 *
 */
@Component(service = Tile.class, immediate = true)
@NonNullByDefault
public class HABPanelTile implements Tile {

    public static final String HABPANEL_ALIAS = "/habpanel";

    private final Logger logger = LoggerFactory.getLogger(HABPanelTile.class);

    private final HttpService httpService;

    @Activate
    public HABPanelTile(final @Reference HttpService httpService) {
        this.httpService = httpService;
        try {
            httpService.registerResources(HABPANEL_ALIAS, "web", null);
            logger.info("Started HABPanel at {}", HABPANEL_ALIAS);
        } catch (NamespaceException e) {
            logger.error("Error during HABPanel startup: {}", e.getMessage());
        }
    }

    @Deactivate
    protected void deactivate() {
        httpService.unregister(HABPANEL_ALIAS);
        logger.info("Stopped HABPanel");
    }

    @Override
    public String getName() {
        return "HABPanel";
    }

    @Override
    public String getUrl() {
        return "/habpanel/index.html";
    }

    @Override
    public @Nullable String getOverlay() {
        return null;
    }

    @Override
    public String getImageUrl() {
        return "/habpanel/tile.png";
    }
}
