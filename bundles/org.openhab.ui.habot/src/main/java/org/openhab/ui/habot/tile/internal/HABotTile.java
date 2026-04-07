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
package org.openhab.ui.habot.tile.internal;

import java.util.Dictionary;
import java.util.Hashtable;
import java.util.Map;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.ui.tiles.Tile;
import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceRegistration;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.servlet.context.ServletContextHelper;
import org.osgi.service.servlet.whiteboard.HttpWhiteboardConstants;
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
    private static final String CONTEXT_NAME = "org.openhab.ui.habot.context";

    private final Logger logger = LoggerFactory.getLogger(HABotTile.class);

    private final BundleContext bundleContext;
    private @Nullable ServiceRegistration<ServletContextHelper> contextRegistration;
    private @Nullable ServiceRegistration<Object> resourceRegistration;

    @Activate
    public HABotTile(Map<String, Object> configProps, BundleContext context) {
        this.bundleContext = context;

        Object useGzipCompression = configProps.get("useGzipCompression");
        boolean gzipEnabled = useGzipCompression != null && Boolean.parseBoolean(useGzipCompression.toString());

        Dictionary<String, Object> contextProps = new Hashtable<>();
        contextProps.put(HttpWhiteboardConstants.HTTP_WHITEBOARD_CONTEXT_NAME, CONTEXT_NAME);
        contextProps.put(HttpWhiteboardConstants.HTTP_WHITEBOARD_CONTEXT_PATH, HABOT_ALIAS);

        HABotHttpContext httpContext = new HABotHttpContext(context.getBundle(), RESOURCES_BASE, gzipEnabled);
        contextRegistration = bundleContext.registerService(ServletContextHelper.class, httpContext, contextProps);

        Dictionary<String, Object> resourceProps = new Hashtable<>();
        resourceProps.put(HttpWhiteboardConstants.HTTP_WHITEBOARD_RESOURCE_PATTERN, "/*");
        resourceProps.put(HttpWhiteboardConstants.HTTP_WHITEBOARD_RESOURCE_PREFIX, "/" + RESOURCES_BASE);
        resourceProps.put(HttpWhiteboardConstants.HTTP_WHITEBOARD_CONTEXT_SELECT,
                "(" + HttpWhiteboardConstants.HTTP_WHITEBOARD_CONTEXT_NAME + "=" + CONTEXT_NAME + ")");

        resourceRegistration = bundleContext.registerService(Object.class, new Object(), resourceProps);
        logger.info("Started HABot at {}", HABOT_ALIAS);
    }

    @Deactivate
    protected void deactivate() {
        if (resourceRegistration != null) {
            resourceRegistration.unregister();
            resourceRegistration = null;
        }
        if (contextRegistration != null) {
            contextRegistration.unregister();
            contextRegistration = null;
        }
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
