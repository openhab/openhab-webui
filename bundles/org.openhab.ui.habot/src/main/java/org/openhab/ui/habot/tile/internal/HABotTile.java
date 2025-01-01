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
package org.openhab.ui.habot.tile.internal;

import java.util.Map;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.ui.tiles.Tile;
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
 * The tile and resource registering for HABot
 *
 * @author Yannick Schaus - Initial contribution
 */
@Component(service = Tile.class, immediate = true, name = "org.openhab.habot")
@NonNullByDefault
public class HABotTile implements Tile {

    public static final String HABOT_ALIAS = "/habot";
    public static final String RESOURCES_BASE = "web/dist/pwa-mat";

    private final Logger logger = LoggerFactory.getLogger(HABotTile.class);

    private final HttpService httpService;

    @Activate
    public HABotTile(Map<String, Object> configProps, BundleContext context, final @Reference HttpService httpService) {
        this.httpService = httpService;
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

    @Override
    public String getName() {
        return "HABot";
    }

    @Override
    public String getUrl() {
        return "/habot/";
    }

    @Override
    public @Nullable String getOverlay() {
        return null;
    }

    @Override
    public String getImageUrl() {
        return "/habot/statics/tile.png";
    }
}
