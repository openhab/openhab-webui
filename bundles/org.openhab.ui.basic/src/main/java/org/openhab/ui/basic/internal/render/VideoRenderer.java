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
package org.openhab.ui.basic.internal.render;

import java.util.Date;

import org.eclipse.emf.common.util.ECollections;
import org.eclipse.emf.common.util.EList;
import org.eclipse.jdt.annotation.NonNullByDefault;
import org.openhab.core.i18n.LocaleProvider;
import org.openhab.core.i18n.TranslationProvider;
import org.openhab.core.library.types.StringType;
import org.openhab.core.model.sitemap.sitemap.Video;
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
 * can produce HTML code for Video widgets.
 *
 * @author Kai Kreuzer - Initial contribution and API
 */
@Component(service = WidgetRenderer.class)
@NonNullByDefault
public class VideoRenderer extends AbstractWidgetRenderer {

    private static final String URL_NONE_ICON = "images/none.png";

    @Activate
    public VideoRenderer(final BundleContext bundleContext, final @Reference TranslationProvider i18nProvider,
            final @Reference ItemUIRegistry itemUIRegistry, final @Reference LocaleProvider localeProvider) {
        super(bundleContext, i18nProvider, itemUIRegistry, localeProvider);
    }

    @Override
    public boolean canRender(Widget w) {
        return w instanceof Video;
    }

    @Override
    public EList<Widget> renderWidget(Widget w, StringBuilder sb, String sitemap) throws RenderException {
        Video videoWidget = (Video) w;

        String widgetId = itemUIRegistry.getWidgetId(w);

        // we handle mjpeg streams as an html image as browser can usually handle this
        String snippetName = (videoWidget.getEncoding() != null
                && videoWidget.getEncoding().toLowerCase().contains("mjpeg")) ? "image" : "video";

        boolean showHeaderRow = w.getLabel() != null;
        String snippet = (("video".equals(snippetName) && showHeaderRow) ? getSnippet("header_row") : "")
                + getSnippet(snippetName);

        snippet = snippet.replace("%header_visibility_class%",
                showHeaderRow ? "%visibility_class%" : "mdl-form__row--hidden");
        snippet = snippet.replace("%header_row%",
                ("image".equals(snippetName) || showHeaderRow) ? Boolean.valueOf(showHeaderRow).toString() : "");

        snippet = preprocessSnippet(snippet, w, true);

        // Process the color tags
        snippet = processColor(w, snippet);

        State state = itemUIRegistry.getState(w);
        String url;
        if ("image".equals(snippetName)) {
            boolean validUrl = isValidURL(videoWidget.getUrl());
            String proxiedUrl = "../proxy?sitemap=" + sitemap + "&amp;widgetId=" + widgetId;
            if (!itemUIRegistry.getVisiblity(w)) {
                url = URL_NONE_ICON;
            } else if (state instanceof StringType || validUrl) {
                url = proxiedUrl + "&amp;t=" + (new Date()).getTime();
            } else {
                url = URL_NONE_ICON;
            }
            snippet = snippet.replace("%valid_url%", validUrl ? "true" : "false");
            snippet = snippet.replace("%proxied_url%", proxiedUrl);
            snippet = snippet.replace("%update_interval%", "0");
            snippet = snippet.replace("%ignore_refresh%", "true");
            snippet = snippet.replace("%url%", url);
        } else {
            String mediaType;
            if (videoWidget.getEncoding() != null && videoWidget.getEncoding().toLowerCase().contains("hls")) {
                // For HTTP Live Stream we don't proxy the URL and we set the appropriate media type
                url = (state instanceof StringType) ? state.toString() : videoWidget.getUrl();
                mediaType = "type=\"application/vnd.apple.mpegurl\"";
            } else {
                url = "../proxy?sitemap=" + sitemap + "&widgetId=" + widgetId;
                mediaType = "";
            }
            snippet = snippet.replace("%url%", url);
            snippet = snippet.replace("%media_type%", mediaType);
        }
        sb.append(snippet);
        return ECollections.emptyEList();
    }
}
