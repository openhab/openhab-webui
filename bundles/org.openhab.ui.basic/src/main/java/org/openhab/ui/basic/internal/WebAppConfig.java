/**
 * Copyright (c) 2010-2024 Contributors to the openHAB project
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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.eclipse.jdt.annotation.NonNullByDefault;

/**
 * This class holds BasicUI configuration values
 * and validates newly applied values.
 *
 * @author Vlad Ivanov - Initial contribution
 * @author Laurent Garnier - New config parameter "enableIconify"
 */
@NonNullByDefault
public class WebAppConfig {
    private static final String DEFAULT_SITEMAP = "default";

    public static final String THEME_NAME_BRIGHT = "bright";
    public static final String THEME_NAME_DARK = "dark";
    public static final String THEME_NAME_SYSTEM = "system";
    private static final String DEFAULT_THEME = THEME_NAME_BRIGHT;

    private static final String DEFAULT_ICONS = "true";
    private static final String DEFAULT_ICONIFY = "false";
    private static final String DEFAULT_INLINE_SVG = "false";
    private static final String DEFAULT_WEB_AUDIO = "false";

    private static final String DEFAULT_CONFIG_NB_COLUMNS = "3-2";
    private static final int DEFAULT_NB_COLUMNS_DESKTOP = 3;
    private static final int DEFAULT_NB_COLUMNS_TABLET = 2;

    private String defaultSitemap = DEFAULT_SITEMAP;
    private String theme = DEFAULT_THEME;
    private int nbColsDesktop = DEFAULT_NB_COLUMNS_DESKTOP;
    private int nbColsTablet = DEFAULT_NB_COLUMNS_TABLET;
    private boolean icons = Boolean.parseBoolean(DEFAULT_ICONS);
    private boolean iconify = Boolean.parseBoolean(DEFAULT_ICONIFY);
    private boolean inlineSvg = Boolean.parseBoolean(DEFAULT_INLINE_SVG);
    private boolean webAudio = Boolean.parseBoolean(DEFAULT_WEB_AUDIO);

    private List<String> cssClassList = new ArrayList<>();

    private static final Map<String, String> CSS_CLASSES;
    private static final Map<String, Boolean> CSS_DEFAULT_VALUES;

    private static final String CONFIG_ENABLE_ICONS = "enableIcons";
    private static final String CONFIG_CONDENSED_LAYOUT = "condensedLayout";
    private static final String CONFIG_NB_COLUMNS = "nbColumns";
    private static final String CONFIG_CAPITALIZE = "capitalizeValues";

    static {
        CSS_CLASSES = new HashMap<>();
        CSS_CLASSES.put(CONFIG_ENABLE_ICONS, "ui-icons-enabled");
        CSS_CLASSES.put(CONFIG_CONDENSED_LAYOUT, "ui-layout-condensed");
        CSS_CLASSES.put(CONFIG_CAPITALIZE, "ui-capitalize-values");

        CSS_DEFAULT_VALUES = new HashMap<>();
        CSS_DEFAULT_VALUES.put(CONFIG_ENABLE_ICONS, true);
        CSS_DEFAULT_VALUES.put(CONFIG_CONDENSED_LAYOUT, false);
        CSS_DEFAULT_VALUES.put(CONFIG_CAPITALIZE, false);
    }

    private void applyCssClasses(Map<String, Object> configProps) {
        cssClassList.clear();

        for (Entry<String, String> entry : CSS_CLASSES.entrySet()) {
            String key = entry.getKey();
            Boolean value = CSS_DEFAULT_VALUES.get(key);
            Object configValue = configProps.get(key);
            if (configValue != null) {
                value = "true".equalsIgnoreCase(configValue.toString());
            }
            if (value != null && value) {
                cssClassList.add(entry.getValue());
            }
        }
        if (nbColsDesktop == 3) {
            cssClassList.add("ui-large-window");
        }
    }

    public void applyConfig(Map<String, Object> configProps) {
        defaultSitemap = (String) configProps.getOrDefault("defaultSitemap", DEFAULT_SITEMAP);
        theme = (String) configProps.getOrDefault("theme", DEFAULT_THEME);
        // "default" was previously valid. For backward compatibility, accept it but convert it to DEFAULT_THEME
        if ("default".equals(theme)) {
            theme = DEFAULT_THEME;
        }
        String nbColumns = (String) configProps.getOrDefault(CONFIG_NB_COLUMNS, DEFAULT_CONFIG_NB_COLUMNS);
        if (nbColumns.length() == 3) {
            try {
                nbColsDesktop = Integer.parseInt(nbColumns.substring(0, 1));
            } catch (NumberFormatException e) {
                nbColsDesktop = DEFAULT_NB_COLUMNS_DESKTOP;
            }
            try {
                nbColsTablet = Integer.parseInt(nbColumns.substring(2, 3));
            } catch (NumberFormatException e) {
                nbColsTablet = DEFAULT_NB_COLUMNS_TABLET;
            }
        } else {
            nbColsDesktop = DEFAULT_NB_COLUMNS_DESKTOP;
            nbColsTablet = DEFAULT_NB_COLUMNS_TABLET;
        }
        icons = "true".equalsIgnoreCase((String) configProps.getOrDefault(CONFIG_ENABLE_ICONS, DEFAULT_ICONS));
        iconify = "true".equalsIgnoreCase((String) configProps.getOrDefault("enableIconify", DEFAULT_ICONIFY));
        inlineSvg = "true".equalsIgnoreCase((String) configProps.getOrDefault("inlineSvg", DEFAULT_INLINE_SVG));
        webAudio = "true".equalsIgnoreCase((String) configProps.getOrDefault("webAudio", DEFAULT_WEB_AUDIO));

        applyCssClasses(configProps);
    }

    public String getDefaultSitemap() {
        return defaultSitemap;
    }

    public String getTheme() {
        return theme;
    }

    public String getCssClassList() {
        String result = " ";
        for (String item : cssClassList) {
            result += item + " ";
        }
        return result;
    }

    public int getNbColsDesktop() {
        return nbColsDesktop;
    }

    public int getNbColsTablet() {
        return nbColsTablet;
    }

    public boolean isIconsEnabled() {
        return icons;
    }

    public boolean isIconifyEnabled() {
        return iconify;
    }

    public boolean isInlineSvgEnabled() {
        return inlineSvg;
    }

    public boolean isWebAudio() {
        return webAudio;
    }
}
