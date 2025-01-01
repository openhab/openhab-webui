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
package org.openhab.ui.basic.internal;

import java.util.Map;

import org.eclipse.jdt.annotation.NonNullByDefault;

/**
 * This class holds BasicUI configuration values
 * and validates newly applied values.
 *
 * @author Vlad Ivanov - Initial contribution
 * @author Laurent Garnier - New config parameter "enableIconify"
 * @author Laurent Garnier - Replace almost all (server) settings by browser settings
 */
@NonNullByDefault
public class WebAppConfig {
    private static final String DEFAULT_SITEMAP = "default";
    private static final String DEFAULT_INLINE_SVG = "false";

    private String defaultSitemap = DEFAULT_SITEMAP;
    private boolean inlineSvg = Boolean.parseBoolean(DEFAULT_INLINE_SVG);

    public void applyConfig(Map<String, Object> configProps) {
        defaultSitemap = (String) configProps.getOrDefault("defaultSitemap", DEFAULT_SITEMAP);
        inlineSvg = "true".equalsIgnoreCase((String) configProps.getOrDefault("inlineSvg", DEFAULT_INLINE_SVG));
    }

    public String getDefaultSitemap() {
        return defaultSitemap;
    }

    public boolean isInlineSvgEnabled() {
        return inlineSvg;
    }
}
