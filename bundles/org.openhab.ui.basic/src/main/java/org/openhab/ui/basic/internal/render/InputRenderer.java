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
import org.openhab.core.items.Item;
import org.openhab.core.items.ItemNotFoundException;
import org.openhab.core.model.sitemap.sitemap.Input;
import org.openhab.core.model.sitemap.sitemap.Widget;
import org.openhab.core.types.State;
import org.openhab.core.types.UnDefType;
import org.openhab.core.ui.items.ItemUIRegistry;
import org.openhab.ui.basic.render.RenderException;
import org.openhab.ui.basic.render.WidgetRenderer;
import org.osgi.framework.BundleContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This is an implementation of the {@link WidgetRenderer} interface, which
 * can produce HTML code for Input widgets.
 *
 * @author Mark Herwege - Initial contributor
 */
@Component(service = WidgetRenderer.class)
@NonNullByDefault
public class InputRenderer extends AbstractWidgetRenderer {

    private final Logger logger = LoggerFactory.getLogger(InputRenderer.class);

    @Activate
    public InputRenderer(final BundleContext bundleContext, final @Reference TranslationProvider i18nProvider,
            final @Reference ItemUIRegistry itemUIRegistry, final @Reference LocaleProvider localeProvider) {
        super(bundleContext, i18nProvider, itemUIRegistry, localeProvider);
    }

    @Override
    public boolean canRender(Widget w) {
        return w instanceof Input;
    }

    @Override
    public EList<Widget> renderWidget(Widget w, StringBuilder sb, String sitemap) throws RenderException {
        String snippet = getSnippet("input");

        snippet = preprocessSnippet(snippet, w);

        String dataState = getValue(w);
        State state = itemUIRegistry.getState(w);
        if (state == null || state instanceof UnDefType) {
            snippet = snippet.replace("%undef_state%", dataState);
            snippet = snippet.replace("%data_state%", "");
        } else {
            snippet = snippet.replace("%undef_state%", "");
            snippet = snippet.replace("%data_state%", dataState);
        }

        Item item = null;
        try {
            item = itemUIRegistry.getItem(w.getItem());
        } catch (ItemNotFoundException e) {
            logger.debug("Failed to retrieve item during widget rendering: {}", e.getMessage());
        }
        String dataType;
        if (item != null && item.getAcceptedDataTypes().stream().anyMatch(o -> Number.class.isAssignableFrom(o))) {
            dataType = "Number";
        } else {
            dataType = "Text";
        }
        snippet = snippet.replace("%data_type%", dataType);

        // Process the color tags
        snippet = processColor(w, snippet);

        sb.append(snippet);
        return ECollections.emptyEList();
    }
}
