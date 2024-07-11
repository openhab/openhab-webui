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

import org.eclipse.emf.common.util.ECollections;
import org.eclipse.emf.common.util.EList;
import org.eclipse.jdt.annotation.NonNullByDefault;
import org.openhab.core.i18n.LocaleProvider;
import org.openhab.core.i18n.TranslationProvider;
import org.openhab.core.model.sitemap.sitemap.Webview;
import org.openhab.core.model.sitemap.sitemap.Widget;
import org.openhab.core.ui.items.ItemUIRegistry;
import org.openhab.ui.basic.render.RenderException;
import org.openhab.ui.basic.render.WidgetRenderer;
import org.osgi.framework.BundleContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * This is an implementation of the {@link WidgetRenderer} interface, which
 * can produce HTML code for Webview widgets.
 *
 * @author Kai Kreuzer - Initial contribution
 */
@Component(service = WidgetRenderer.class)
@NonNullByDefault
public class WebviewRenderer extends AbstractWidgetRenderer {

    @Activate
    public WebviewRenderer(final BundleContext bundleContext, final @Reference TranslationProvider i18nProvider,
            final @Reference ItemUIRegistry itemUIRegistry, final @Reference LocaleProvider localeProvider) {
        super(bundleContext, i18nProvider, itemUIRegistry, localeProvider);
    }

    @Override
    public boolean canRender(Widget w) {
        return w instanceof Webview;
    }

    @Override
    public EList<Widget> renderWidget(Widget w, StringBuilder sb, String sitemap) throws RenderException {
        Webview webview = (Webview) w;
        boolean showHeaderRow = w.getLabel() != null;
        String snippet = (showHeaderRow ? getSnippet("header_row") : "") + getSnippet("webview");

        snippet = snippet.replace("%header_row%", showHeaderRow ? "true" : "");

        snippet = preprocessSnippet(snippet, webview, true);

        // Process the color tags
        snippet = processColor(w, snippet);

        snippet = snippet.replace("%url%", webview.getUrl());

        int height = webview.getHeight();
        if (height == 0) {
            height = 4; // set default height to something viewable
        }
        height = height * 36;
        snippet = snippet.replace("%height%", Integer.toString(height));

        sb.append(snippet);
        return ECollections.emptyEList();
    }
}
