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
package org.openhab.ui.basic.internal.render;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang3.StringEscapeUtils;
import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.i18n.I18nUtil;
import org.openhab.core.i18n.LocaleProvider;
import org.openhab.core.i18n.TranslationProvider;
import org.openhab.core.items.Item;
import org.openhab.core.items.ItemNotFoundException;
import org.openhab.core.library.types.HSBType;
import org.openhab.core.library.types.QuantityType;
import org.openhab.core.model.sitemap.sitemap.Widget;
import org.openhab.core.types.State;
import org.openhab.core.ui.items.ItemUIRegistry;
import org.openhab.ui.basic.internal.WebAppConfig;
import org.openhab.ui.basic.render.RenderException;
import org.openhab.ui.basic.render.WidgetRenderer;
import org.osgi.framework.BundleContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This is an abstract implementation of a widget renderer. It provides
 * methods that are very useful for any widget renderer implementation,
 * so it should be subclassed by most concrete implementations.
 *
 * @author Kai Kreuzer - Initial contribution and API
 * @author Vlad Ivanov - BasicUI changes
 * @author Laurent Garnier - Refactor icon management to support other iconsets
 * @author Laurent Garnier - primary/secondary colors
 */
@NonNullByDefault
public abstract class AbstractWidgetRenderer implements WidgetRenderer {

    private static final String ICON_SOURCE_OH = "oh";
    private static final String ICON_SOURCE_IF = "if";
    private static final String ICON_SOURCE_ICONIFY = "iconify";
    private static final String ICON_SOURCE_MATERIAL = "material";
    private static final String ICON_SOURCE_FRAMEWORK7 = "f7";
    private static final String ICON_SET_OH_CLASSIC = "classic";
    private static final String DEFAULT_ICON_SOURCE = ICON_SOURCE_OH;
    private static final String DEFAULT_ICON_SET = ICON_SET_OH_CLASSIC;
    private static final String DEFAULT_ICON_NAME = "none";

    public static final String ICON_TYPE = "svg";

    public static final String PRIMARY_COLOR = "#3f51b5";
    public static final String SECONDARY_COLOR = "#ff4081";

    private final Logger logger = LoggerFactory.getLogger(AbstractWidgetRenderer.class);

    private final BundleContext bundleContext;
    protected final TranslationProvider i18nProvider;
    protected final ItemUIRegistry itemUIRegistry;
    protected final LocaleProvider localeProvider;

    protected WebAppConfig config = new WebAppConfig();

    @Activate
    public AbstractWidgetRenderer(final BundleContext bundleContext, final @Reference TranslationProvider i18nProvider,
            final @Reference ItemUIRegistry itemUIRegistry, final @Reference LocaleProvider localeProvider) {
        this.bundleContext = bundleContext;
        this.i18nProvider = i18nProvider;
        this.itemUIRegistry = itemUIRegistry;
        this.localeProvider = localeProvider;
    }

    /* the file extension of the snippets */
    protected static final String SNIPPET_EXT = ".html";

    /* the snippet location inside this bundle */
    protected static final String SNIPPET_LOCATION = "snippets/";

    /* a local cache so we do not have to read the snippets over and over again from the bundle */
    protected static final Map<String, String> SNIPPET_CACHE = new HashMap<>(30);

    public ItemUIRegistry getItemUIRegistry() {
        return itemUIRegistry;
    }

    /**
     * Replace some common values in the widget template
     *
     * @param snippet snippet HTML code
     * @param w corresponding widget
     * @return HTML code
     */
    protected String preprocessSnippet(String originalSnippet, Widget w) {
        return preprocessSnippet(originalSnippet, w, w.getStaticIcon() != null);
    }

    /**
     * Replace some common values in the widget template
     *
     * @param snippet snippet HTML code
     * @param w corresponding widget
     * @param ignoreStateForIcon true if state has to be ignored when requesting the icon
     * @return HTML code
     */
    protected String preprocessSnippet(String originalSnippet, Widget w, boolean ignoreStateForIcon) {
        String snippet = preprocessIcon(originalSnippet, getCategory(w), ignoreStateForIcon);

        snippet = snippet.replace("%cells%", String.valueOf(12 / config.getNbColsDesktop()));
        snippet = snippet.replace("%cells_tablet%", String.valueOf(8 / config.getNbColsTablet()));
        snippet = snippet.replace("%widget_id%", itemUIRegistry.getWidgetId(w));
        snippet = snippet.replace("%icon_with_state%", Boolean.valueOf(!ignoreStateForIcon).toString());
        snippet = snippet.replace("%item%", w.getItem() != null ? w.getItem() : "");
        // Optimization: avoid calling 3 times itemUIRegistry.getLabel(w)
        String text = itemUIRegistry.getLabel(w);
        snippet = snippet.replace("%label%", getLabel(text));
        snippet = snippet.replace("%value%", getValue(text));
        snippet = snippet.replace("%has_value%", Boolean.valueOf(hasValue(text)).toString());
        snippet = snippet.replace("%visibility_class%", itemUIRegistry.getVisiblity(w) ? "" : "mdl-form__row--hidden");

        String state = getState(w);
        snippet = snippet.replace("%state%", escapeHtml(state));
        snippet = snippet.replace("%state_in_url%", escapeURL(state));

        return snippet;
    }

    protected String preprocessIcon(String originalSnippet, @Nullable String icon, boolean ignoreState) {
        String iconSource = DEFAULT_ICON_SOURCE;
        String iconSet = DEFAULT_ICON_SET;
        String iconName = DEFAULT_ICON_NAME;
        if (icon != null) {
            String[] segments = icon.split(":", 3);
            if (segments.length == 1) {
                iconName = segments[0];
            } else if (segments.length == 2) {
                iconSource = segments[0];
                iconName = segments[1];
            } else if (segments.length == 3) {
                iconSource = segments[0];
                iconSet = segments[1];
                iconName = segments[2];
            }
        }

        String iconSnippet = null;
        try {
            switch (iconSource.toLowerCase()) {
                case ICON_SOURCE_OH:
                    iconSnippet = getSnippet(ignoreState ? "icon_oh_no_state" : "icon_oh");
                    break;
                case ICON_SOURCE_IF:
                case ICON_SOURCE_ICONIFY:
                    if (config.isIconifyEnabled()) {
                        iconSnippet = getSnippet("icon_iconify");
                    }
                    break;
                case ICON_SOURCE_MATERIAL:
                    iconSnippet = getSnippet("icon_material");
                    break;
                case ICON_SOURCE_FRAMEWORK7:
                    iconSnippet = getSnippet("icon_framework7");
                    break;
                default:
                    break;
            }
            if (iconSnippet == null) {
                iconSnippet = getSnippet("icon_oh_no_state");
                iconSource = DEFAULT_ICON_SOURCE;
                iconSet = DEFAULT_ICON_SET;
                iconName = DEFAULT_ICON_NAME;
            }
        } catch (RenderException e) {
            iconSnippet = "";
        }

        String snippet = originalSnippet;
        snippet = snippet.replace("%icon_snippet%", iconSnippet);

        snippet = snippet.replace("%icon_type%", ICON_TYPE);
        snippet = snippet.replace("%icon_set%", iconSet);
        snippet = snippet.replace("%icon_set_in_url%", escapeURL(iconSet));
        snippet = snippet.replace("%icon_name%", iconName);
        snippet = snippet.replace("%icon_name_in_url%", escapeURL(iconName));

        return snippet;
    }

    /**
     * This method provides the snippet for a given elementType and snippetExt of the sitemap model.
     *
     * @param elementType the name of the model type (e.g. "Group" or "Switch")
     * @param snippetExt the extension of the snippet file (e.g. ".html" or ".json")
     * @return the snippet to be used in the UI (including placeholders for variables)
     * @throws RenderException if snippet could not be read
     */
    protected synchronized String getSnippet(String elementType, String snippetExt) throws RenderException {
        String lowerTypeElementType = elementType.toLowerCase();
        String snippet = SNIPPET_CACHE.get(lowerTypeElementType);
        if (snippet != null) {
            return snippet;
        }

        String snippetLocation = SNIPPET_LOCATION + lowerTypeElementType + snippetExt;
        URL entry = bundleContext.getBundle().getEntry(snippetLocation);
        if (entry == null) {
            throw new RenderException("Cannot find a snippet for element type '" + lowerTypeElementType + "'");
        }

        try {
            snippet = new String(entry.openStream().readAllBytes(), StandardCharsets.UTF_8);
            SNIPPET_CACHE.put(lowerTypeElementType, snippet);
            return snippet;
        } catch (IOException e) {
            throw new RenderException("Cannot load snippet for element type '" + lowerTypeElementType + "'");
        }
    }

    /**
     * This method provides the html snippet for a given elementType of the sitemap model.
     *
     * @param elementType the name of the model type (e.g. "Group" or "Switch")
     * @return the html snippet to be used in the UI (including placeholders for variables)
     * @throws RenderException if snippet could not be read
     */
    protected synchronized String getSnippet(String elementType) throws RenderException {
        return getSnippet(elementType, SNIPPET_EXT);
    }

    /**
     * Retrieves the label for a widget
     *
     * @param w the widget to retrieve the label for
     * @return the label to use for the widget
     */
    public String getLabel(Widget w) {
        return getLabel(itemUIRegistry.getLabel(w));
    }

    /**
     * Retrieves the label for a widget
     *
     * @param text the text containing the label and an optional value around []
     * @return the label extracted from the text
     */
    protected String getLabel(@Nullable String text) {
        if (text == null) {
            return "";
        }

        int index = text.indexOf('[');

        if (index != -1) {
            return escapeHtml(text.substring(0, index));
        } else {
            return escapeHtml(text);
        }
    }

    /**
     * Returns formatted value of the item associated to widget
     *
     * @param w widget to get value for
     * @return value to use for the widget
     */
    public String getValue(Widget w) {
        return getValue(itemUIRegistry.getLabel(w));
    }

    /**
     * Returns formatted value of the item associated to widget
     *
     * @param text the text containing the label and an optional value around []
     * @return the value extracted from the text or "" if not present
     */
    protected String getValue(@Nullable String text) {
        if (text == null) {
            return "";
        }

        int index = text.indexOf('[');

        if (index != -1) {
            return escapeHtml(text.substring(index + 1, text.length() - 1));
        } else {
            return "";
        }
    }

    /**
     * Returns whether the item associated to widget has a value or not
     *
     * @param w widget
     * @return true if the item associated to widget has a value
     */
    public boolean hasValue(Widget w) {
        return hasValue(itemUIRegistry.getLabel(w));
    }

    /**
     * Returns whether the item associated to widget has a value or not
     *
     * @param text the text containing the label and an optional value around []
     * @return true if the text contains a value
     */
    protected boolean hasValue(@Nullable String text) {
        return text != null && text.indexOf('[') != -1;
    }

    /**
     * Escapes parts of a URL. This means, that for example the
     * path "/hello world" gets escaped to "/hello+world".
     *
     * @param string The string that has to be escaped
     * @return The escaped string
     */
    protected String escapeURL(@Nullable String string) {
        if (string == null) {
            return "";
        }

        try {
            return URLEncoder.encode(string, "UTF-8");
        } catch (UnsupportedEncodingException use) {
            logger.warn("Cannot escape string '{}'. Returning unmodified string.", string);
            return string;
        }
    }

    /**
     * Process the color tags - labelcolor and valuecolor
     *
     * @param w
     *            The widget to process
     * @param snippet
     *            The snippet to translate
     * @return The updated snippet
     */
    protected String processColor(Widget w, String originalSnippet) {
        String style = "";
        String color = "";
        String snippet = originalSnippet;

        State itemState = null;
        if (w.getItem() != null) {
            try {
                Item item = itemUIRegistry.getItem(w.getItem());
                itemState = item.getState();
            } catch (ItemNotFoundException e) {
                logger.debug("{}", e.getMessage());
            }
        }

        color = itemUIRegistry.getLabelColor(w);
        color = convertSpecialColors(color, itemState);

        if (color != null) {
            style = "style=\"color:" + color + "\"";
        }
        snippet = snippet.replace("%labelstyle%", style);

        style = "";
        color = itemUIRegistry.getValueColor(w);
        color = convertSpecialColors(color, itemState);

        if (color != null) {
            style = "style=\"color:" + color + "\"";
        }
        snippet = snippet.replace("%valuestyle%", style);

        style = "";
        color = itemUIRegistry.getIconColor(w);
        color = convertSpecialColors(color, itemState);

        if (color != null) {
            style = "style=\"color:" + color + "\"";
        } else {
            switch (config.getTheme()) {
                case WebAppConfig.THEME_NAME_BRIGHT:
                    style = "style=\"color-scheme: light\"";
                    break;
                case WebAppConfig.THEME_NAME_DARK:
                    style = "style=\"color-scheme: dark\"";
                    break;
                default:
                    break;
            }

        }
        snippet = snippet.replace("%iconstyle%", style);

        return snippet;
    }

    private @Nullable String convertSpecialColors(@Nullable String color, @Nullable State itemState) {
        if ("primary".equals(color)) {
            return PRIMARY_COLOR;
        } else if ("secondary".equals(color)) {
            return SECONDARY_COLOR;
        } else if ("itemValue".equals(color)) {
            return getRGBHexCodeFromItemState(itemState);
        }
        return color;
    }

    protected @Nullable String getRGBHexCodeFromItemState(@Nullable State itemState) {
        if (itemState instanceof HSBType) {
            HSBType hsbState = (HSBType) itemState;
            return "#" + Integer.toHexString(hsbState.getRGB()).substring(2);
        }
        return null;
    }

    protected @Nullable String getCategory(Widget w) {
        return itemUIRegistry.getCategory(w);
    }

    protected String getState(Widget w) {
        State state = itemUIRegistry.getState(w);
        if (state != null) {
            return state.toString();
        } else {
            return "NULL";
        }
    }

    protected String escapeHtml(@Nullable String s) {
        return StringEscapeUtils.escapeHtml4(s);
    }

    @Override
    public void setConfig(WebAppConfig config) {
        this.config = config;
    }

    protected @Nullable String localizeText(String key) {
        String result = "";
        if (I18nUtil.isConstant(key)) {
            result = i18nProvider.getText(bundleContext.getBundle(), I18nUtil.stripConstant(key), "",
                    localeProvider.getLocale());
        }
        return result;
    }

    protected @Nullable String getUnitForWidget(Widget widget) {
        return itemUIRegistry.getUnitForWidget(widget);
    }

    protected @Nullable State convertStateToLabelUnit(QuantityType<?> state, String label) {
        return itemUIRegistry.convertStateToLabelUnit(state, label);
    }

    protected boolean isValidURL(@Nullable String url) {
        if (url != null && !url.isEmpty()) {
            try {
                new URL(url).toURI();
                return true;
            } catch (MalformedURLException | URISyntaxException ex) {
            }
        }
        return false;
    }
}
