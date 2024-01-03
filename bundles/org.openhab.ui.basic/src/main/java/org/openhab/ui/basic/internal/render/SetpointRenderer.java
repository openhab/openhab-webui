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

import java.math.BigDecimal;

import javax.measure.Unit;

import org.eclipse.emf.common.util.ECollections;
import org.eclipse.emf.common.util.EList;
import org.eclipse.jdt.annotation.NonNullByDefault;
import org.openhab.core.i18n.LocaleProvider;
import org.openhab.core.i18n.TranslationProvider;
import org.openhab.core.library.types.QuantityType;
import org.openhab.core.model.sitemap.sitemap.Setpoint;
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
 * can produce HTML code for Setpoint widgets.
 *
 * @author Kai Kreuzer - Initial contribution and API
 * @author Vlad Ivanov - BasicUI changes
 */
@Component(service = WidgetRenderer.class)
@NonNullByDefault
public class SetpointRenderer extends AbstractWidgetRenderer {

    @Activate
    public SetpointRenderer(final BundleContext bundleContext, final @Reference TranslationProvider i18nProvider,
            final @Reference ItemUIRegistry itemUIRegistry, final @Reference LocaleProvider localeProvider) {
        super(bundleContext, i18nProvider, itemUIRegistry, localeProvider);
    }

    @Override
    public boolean canRender(Widget w) {
        return w instanceof Setpoint;
    }

    @Override
    public EList<Widget> renderWidget(Widget w, StringBuilder sb, String sitemap) throws RenderException {
        Setpoint sp = (Setpoint) w;

        // set defaults for min, max and step
        BigDecimal step = sp.getStep();
        if (step == null) {
            step = BigDecimal.ONE;
        }
        BigDecimal minValue = sp.getMinValue();
        if (minValue == null) {
            minValue = BigDecimal.ZERO;
        }
        BigDecimal maxValue = sp.getMaxValue();
        if (maxValue == null) {
            maxValue = BigDecimal.valueOf(100);
        }

        String unit = getUnitForWidget(w);
        if (unit == null) {
            // Search the unit in the item state
            State state = itemUIRegistry.getState(w);
            if (state instanceof QuantityType<?>) {
                Unit<?> stateUnit = ((QuantityType<?>) state).getUnit();
                unit = stateUnit.toString();
            }
        }

        String snippet = getSnippet("setpoint");

        snippet = preprocessSnippet(snippet, w);
        snippet = snippet.replace("%minValue%", minValue.toString());
        snippet = snippet.replace("%maxValue%", maxValue.toString());
        snippet = snippet.replace("%step%", step.toString());
        snippet = snippet.replace("%unit%", unit == null ? "" : unit);

        // Process the color tags
        snippet = processColor(w, snippet);

        sb.append(snippet);
        return ECollections.emptyEList();
    }
}
