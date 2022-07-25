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

import org.eclipse.emf.common.util.ECollections;
import org.eclipse.emf.common.util.EList;
import org.eclipse.jdt.annotation.NonNullByDefault;
import org.openhab.core.i18n.LocaleProvider;
import org.openhab.core.i18n.TranslationProvider;
import org.openhab.core.library.types.HSBType;
import org.openhab.core.model.sitemap.sitemap.Colorpicker;
import org.openhab.core.model.sitemap.sitemap.Widget;
import org.openhab.core.types.State;
import org.openhab.core.ui.items.ItemUIRegistry;
import org.openhab.ui.basic.internal.servlet.WebAppServlet;
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

        // set the default send-update frequency to 200ms
        String frequency = cp.getFrequency() == 0 ? "200" : Integer.toString(cp.getFrequency());

        // get RGB hex value
        State state = itemUIRegistry.getState(cp);
        String hexValue = "#ffffff";
        if (state instanceof HSBType) {
            HSBType hsbState = (HSBType) state;
            hexValue = "#" + Integer.toHexString(hsbState.getRGB()).substring(2);
        }
        String purelabel = itemUIRegistry.getLabel(w);
        if (purelabel != null) {
            purelabel = purelabel.replaceAll("\\\"", "\\\\'");
        }

        // Should be called before preprocessSnippet
        snippet = snippet.replace("%state%", hexValue);
        snippet = snippet.replace("%state_in_url%", escapeURL(hexValue));

        snippet = preprocessSnippet(snippet, w);
        if (purelabel != null) {
            snippet = snippet.replace("%purelabel%", purelabel);
        }
        snippet = snippet.replace("%frequency%", frequency);
        snippet = snippet.replace("%servletname%", WebAppServlet.SERVLET_PATH);

        String style = "";
        String color = itemUIRegistry.getLabelColor(w);
        if (color != null) {
            style = "color:" + color;
        }
        snippet = snippet.replace("%labelstyle%", style);

        style = "";
        color = itemUIRegistry.getValueColor(w);
        if (color != null) {
            style = "color:" + color;
        }
        snippet = snippet.replace("%valuestyle%", style);

        sb.append(snippet);
        return ECollections.emptyEList();
    }
}
