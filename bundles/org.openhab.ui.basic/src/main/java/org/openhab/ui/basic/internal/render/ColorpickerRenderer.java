/*
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

import org.eclipse.emf.common.util.ECollections;
import org.eclipse.emf.common.util.EList;
import org.eclipse.jdt.annotation.NonNullByDefault;
import org.openhab.core.i18n.LocaleProvider;
import org.openhab.core.i18n.TranslationProvider;
import org.openhab.core.sitemap.Colorpicker;
import org.openhab.core.sitemap.Widget;
import org.openhab.core.types.State;
import org.openhab.core.ui.items.ItemUIRegistry;
import org.openhab.ui.basic.render.RenderException;
import org.openhab.ui.basic.render.WidgetRenderer;
import org.osgi.framework.BundleContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * <p>
 * This is an implementation of the {@link WidgetRenderer} interface, which can produce HTML code for Colorpicker
 * widgets.
 *
 * <p>
 * Note: This renderer requires the files "jquery.miniColors.css" and "jquery.miniColors.js" in the web folder of this
 * bundle
 *
 * @author Kai Kreuzer - Initial contribution and API
 * @author Vlad Ivanov - BasicUI changes
 * @author Mark Herwege - Implement sitemap registry
 */
@Component(service = WidgetRenderer.class)
@NonNullByDefault
public class ColorpickerRenderer extends AbstractWidgetRenderer {

    @Activate
    public ColorpickerRenderer(final BundleContext bundleContext, final @Reference TranslationProvider i18nProvider,
            final @Reference ItemUIRegistry itemUIRegistry, final @Reference LocaleProvider localeProvider) {
        super(bundleContext, i18nProvider, itemUIRegistry, localeProvider);
    }

    @Override
    public boolean canRender(Widget w) {
        return w instanceof Colorpicker;
    }

    @Override
    public EList<Widget> renderWidget(Widget w, StringBuilder sb, String sitemap) throws RenderException {
        Colorpicker cp = (Colorpicker) w;

        String snippet = getSnippet("colorpicker");

        // get RGB hex value
        State state = itemUIRegistry.getState(cp);
        String hexValue = getRGBHexCodeFromItemState(state);

        // Should be called before preprocessSnippet
        snippet = snippet.replace("%state%", hexValue == null ? "#ffffff" : hexValue);

        snippet = preprocessSnippet(snippet, w);

        // Process the color tags
        snippet = processColor(w, snippet);

        sb.append(snippet);
        return ECollections.emptyEList();
    }
}
