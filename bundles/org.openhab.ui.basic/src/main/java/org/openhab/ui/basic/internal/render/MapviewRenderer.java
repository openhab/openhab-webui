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

import org.eclipse.emf.common.util.ECollections;
import org.eclipse.emf.common.util.EList;
import org.eclipse.jdt.annotation.NonNullByDefault;
import org.openhab.core.i18n.LocaleProvider;
import org.openhab.core.i18n.TranslationProvider;
import org.openhab.core.library.types.PointType;
import org.openhab.core.model.sitemap.sitemap.Mapview;
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
 * can produce HTML code for Text widgets.
 *
 * @author Gaël L'hopital - Initial contribution
 */
@Component(service = WidgetRenderer.class)
@NonNullByDefault
public class MapviewRenderer extends AbstractWidgetRenderer {

    private static final String MAP_URL = "//www.openstreetmap.org/export/embed.html?bbox=%lonminus%,%latminus%,%lonplus%,%latplus%&marker=%lat%,%lon%";
    private static final double MAP_ZOOM = 0.01;

    @Activate
    public MapviewRenderer(final BundleContext bundleContext, final @Reference TranslationProvider i18nProvider,
            final @Reference ItemUIRegistry itemUIRegistry, final @Reference LocaleProvider localeProvider) {
        super(bundleContext, i18nProvider, itemUIRegistry, localeProvider);
    }

    @Override
    public boolean canRender(Widget w) {
        return w instanceof Mapview;
    }

    @Override
    public EList<Widget> renderWidget(Widget w, StringBuilder sb, String sitemap) throws RenderException {
        Mapview mapview = (Mapview) w;
        boolean showHeaderRow = w.getLabel() != null;
        String snippet = (showHeaderRow ? getSnippet("header_row") : "") + getSnippet("mapview");

        snippet = snippet.replace("%header_row%", showHeaderRow ? "true" : "");

        snippet = preprocessSnippet(snippet, mapview, true);

        // Process the color tags
        snippet = processColor(w, snippet);

        State state = itemUIRegistry.getState(mapview);
        if (state instanceof PointType pointState) {
            double latitude = pointState.getLatitude().doubleValue();
            double longitude = pointState.getLongitude().doubleValue();
            snippet = snippet.replace("%url%", MAP_URL);
            snippet = snippet.replace("%lat%", Double.toString(latitude));
            snippet = snippet.replace("%lon%", Double.toString(longitude));
            snippet = snippet.replace("%lonminus%", Double.toString(longitude - MAP_ZOOM));
            snippet = snippet.replace("%lonplus%", Double.toString(longitude + MAP_ZOOM));
            snippet = snippet.replace("%latminus%", Double.toString(latitude - MAP_ZOOM));
            snippet = snippet.replace("%latplus%", Double.toString(latitude + MAP_ZOOM));
        } else {
            snippet = snippet.replace("%url%", "images/map-marker-off.png");
        }

        snippet = snippet.replace("%map_url%", MAP_URL);
        snippet = snippet.replace("%map_zoom%", Double.toString(MAP_ZOOM));

        int height = mapview.getHeight();
        if (height == 0) {
            height = 4; // set default height to something viewable
        }
        height = height * 36;
        snippet = snippet.replace("%height%", Integer.toString(height));

        sb.append(snippet);
        return ECollections.emptyEList();
    }
}
