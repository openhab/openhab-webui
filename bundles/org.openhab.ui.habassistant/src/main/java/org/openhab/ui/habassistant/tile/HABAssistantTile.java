/**
 * Copyright (c) 2010-2022 Contributors to the openHAB project
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
package org.openhab.ui.habassistant.tile;

import static org.openhab.ui.habassistant.HABAssistantConstants.SERVICE_NAME;

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
 * The tile and resource registering for HAB Assistant
 *
 * @author Miguel Álvarez - Initial contribution
 */
@Component(service = Tile.class, immediate = true, name = "org.openhab.habassistant.tile")
@NonNullByDefault
public class HABAssistantTile implements Tile {

    public static final String HABASSISTANT_ALIAS = "/habassistant";
    public static final String RESOURCES_BASE = "web/dist";

    private final Logger logger = LoggerFactory.getLogger(HABAssistantTile.class);

    private final HttpService httpService;

    @Activate
    public HABAssistantTile(Map<String, Object> configProps, BundleContext context,
            final @Reference HttpService httpService) {
        this.httpService = httpService;
        try {
            Object useGzipCompression = configProps.get("useGzipCompression");
            HttpContext httpContext = new HABAssistantHttpContext(httpService.createDefaultHttpContext(),
                    RESOURCES_BASE,
                    (useGzipCompression != null && Boolean.parseBoolean(useGzipCompression.toString())));

            httpService.registerResources(HABASSISTANT_ALIAS, RESOURCES_BASE, httpContext);
            logger.info("Started {} at {}", SERVICE_NAME, HABASSISTANT_ALIAS);
        } catch (NamespaceException e) {
            logger.error("Error during HABAssistant startup: {}", e.getMessage());
        }
    }

    @Deactivate
    protected void deactivate() {
        httpService.unregister(HABASSISTANT_ALIAS);
        logger.debug("Stopped HABAssistant");
    }

    @Override
    public String getName() {
        return "HABAssistant";
    }

    @Override
    public String getUrl() {
        return "/habassistant/";
    }

    @Override
    public @Nullable String getOverlay() {
        return null;
    }

    @Override
    public String getImageUrl() {
        return "/habassistant/tile.png";
    }
}
