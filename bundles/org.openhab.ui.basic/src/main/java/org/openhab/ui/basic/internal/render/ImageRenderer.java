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
package org.openhab.ui.basic.internal.render;

import java.util.Date;

import org.eclipse.emf.common.util.ECollections;
import org.eclipse.emf.common.util.EList;
import org.eclipse.jdt.annotation.NonNullByDefault;
import org.openhab.core.i18n.LocaleProvider;
import org.openhab.core.i18n.TranslationProvider;
import org.openhab.core.library.types.RawType;
import org.openhab.core.library.types.StringType;
import org.openhab.core.model.sitemap.sitemap.Image;
import org.openhab.core.model.sitemap.sitemap.Widget;
import org.openhab.core.types.State;
import org.openhab.core.ui.items.ItemUIRegistry;
import org.openhab.ui.basic.render.RenderException;
import org.openhab.ui.basic.render.WidgetRenderer;
import org.osgi.framework.BundleContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * This is an implementation of the {@link WidgetRenderer} interface, which
 * can produce HTML code for Image widgets.
 *
 * @author Kai Kreuzer - Initial contribution and API
 * @author Vlad Ivanov - BasicUI changes
 */
@Component(service = WidgetRenderer.class)
@NonNullByDefault
public class ImageRenderer extends AbstractWidgetRenderer {

    private static final String URL_NONE_ICON = "images/none.png";

    @Activate
    public ImageRenderer(final BundleContext bundleContext, final @Reference TranslationProvider i18nProvider,
            final @Reference ItemUIRegistry itemUIRegistry, final @Reference LocaleProvider localeProvider) {
        super(bundleContext, i18nProvider, itemUIRegistry, localeProvider);
    }

    @Override
    public boolean canRender(Widget w) {
        return w instanceof Image;
    }

    @Override
    public EList<Widget> renderWidget(Widget w, StringBuilder sb, String sitemap) throws RenderException {
        Image image = (Image) w;
        String snippet = (!image.getChildren().isEmpty()) ? getSnippet("image_link") : getSnippet("image");

        boolean showHeaderRow = image.getLabel() != null;
        snippet = snippet.replace("%header_visibility_class%",
                showHeaderRow ? "%visibility_class%" : "mdl-form__row--hidden");
        snippet = snippet.replace("%header_row%", Boolean.valueOf(showHeaderRow).toString());

        if (image.getRefresh() > 0) {
            snippet = snippet.replace("%update_interval%", Integer.toString(image.getRefresh()));
        } else {
            snippet = snippet.replace("%update_interval%", "0");
        }

        String widgetId = itemUIRegistry.getWidgetId(w);
        snippet = snippet.replace("%id%", widgetId);
        snippet = preprocessSnippet(snippet, w, true);

        // Process the color tags
        snippet = processColor(w, snippet);

        boolean validUrl = isValidURL(image.getUrl());
        String proxiedUrl = "../proxy?sitemap=" + sitemap + "&amp;widgetId=" + widgetId;
        State state = itemUIRegistry.getState(w);
        String url;
        boolean ignoreRefresh;
        if (!itemUIRegistry.getVisiblity(w)) {
            url = URL_NONE_ICON;
            ignoreRefresh = true;
        } else if (state instanceof RawType) {
            url = state.toFullString();
            ignoreRefresh = true;
        } else if (state instanceof StringType || validUrl) {
            url = proxiedUrl + "&amp;t=" + (new Date()).getTime();
            ignoreRefresh = false;
        } else {
            url = URL_NONE_ICON;
            ignoreRefresh = true;
        }
        snippet = snippet.replace("%valid_url%", validUrl ? "true" : "false");
        snippet = snippet.replace("%proxied_url%", proxiedUrl);
        snippet = snippet.replace("%ignore_refresh%", ignoreRefresh ? "true" : "false");
        snippet = snippet.replace("%url%", url);

        sb.append(snippet);
        return ECollections.emptyEList();
    }
}
