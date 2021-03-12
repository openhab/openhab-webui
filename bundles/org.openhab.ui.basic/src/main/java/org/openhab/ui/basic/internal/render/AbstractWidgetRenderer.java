/**
 * Copyright (c) 2010-2021 Contributors to the openHAB project
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
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringEscapeUtils;
import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.i18n.I18nUtil;
import org.openhab.core.i18n.LocaleProvider;
import org.openhab.core.i18n.TranslationProvider;
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
 */
@NonNullByDefault
public abstract class AbstractWidgetRenderer implements WidgetRenderer {

    private final Logger logger = LoggerFactory.getLogger(AbstractWidgetRenderer.class);

    public static final String ICON_TYPE = "svg";

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
     * @param snippet snippet html code
     * @param w corresponding widget
     * @return
     */
    protected String preprocessSnippet(String originalSnippet, Widget w) {
        String snippet = originalSnippet;
        snippet = snippet.replace("%widget_id%", itemUIRegistry.getWidgetId(w));
        snippet = snippet.replace("%icon_type%", ICON_TYPE);
        snippet = snippet.replace("%item%", w.getItem() != null ? w.getItem() : "");
        // Optimization: avoid calling 3 times itemUIRegistry.getLabel(w)
        String text = itemUIRegistry.getLabel(w);
        snippet = snippet.replace("%label%", getLabel(text));
        snippet = snippet.replace("%value%", getValue(text));
        snippet = snippet.replace("%has_value%", Boolean.valueOf(hasValue(text)).toString());
        snippet = snippet.replace("%visibility_class%", itemUIRegistry.getVisiblity(w) ? "" : "mdl-form__row--hidden");

        String state = getState(w);
        snippet = snippet.replace("%state%", escapeURL(state));

        String category = getCategory(w);
        snippet = snippet.replace("%category%", escapeURL(category));

        return snippet;
    }

    /**
     * This method provides the html snippet for a given elementType of the sitemap model.
     *
     * @param elementType the name of the model type (e.g. "Group" or "Switch")
     * @return the html snippet to be used in the UI (including placeholders for variables)
     * @throws RenderException if snippet could not be read
     */
    protected synchronized String getSnippet(String elementType) throws RenderException {
        String lowerTypeElementType = elementType.toLowerCase();
        String snippet = SNIPPET_CACHE.get(lowerTypeElementType);
        if (snippet != null) {
            return snippet;
        }

        String snippetLocation = SNIPPET_LOCATION + lowerTypeElementType + SNIPPET_EXT;
        URL entry = bundleContext.getBundle().getEntry(snippetLocation);
        if (entry == null) {
            throw new RenderException("Cannot find a snippet for element type '" + lowerTypeElementType + "'");
        }

        try {
            snippet = IOUtils.toString(entry.openStream());
            SNIPPET_CACHE.put(lowerTypeElementType, snippet);
            return snippet;
        } catch (IOException e) {
            throw new RenderException("Cannot load snippet for element type '" + lowerTypeElementType + "'");
        }
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

        color = itemUIRegistry.getLabelColor(w);

        if (color != null) {
            style = "style=\"color:" + color + "\"";
        }
        snippet = snippet.replace("%labelstyle%", style);

        style = "";
        color = itemUIRegistry.getValueColor(w);

        if (color != null) {
            style = "style=\"color:" + color + "\"";
        }
        snippet = snippet.replace("%valuestyle%", style);

        return snippet;
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
