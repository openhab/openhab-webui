/**
 * Copyright (c) 2010-2022 Contributors to the openHAB project
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

import javax.measure.Unit;

import org.eclipse.emf.common.util.ECollections;
import org.eclipse.emf.common.util.EList;
import org.eclipse.jdt.annotation.NonNullByDefault;
import org.openhab.core.i18n.LocaleProvider;
import org.openhab.core.i18n.TranslationProvider;
import org.openhab.core.library.types.QuantityType;
import org.openhab.core.model.sitemap.sitemap.Slider;
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
 * <p>
 * This is an implementation of the {@link WidgetRenderer} interface, which can produce HTML code for Slider widgets.
 *
 * <p>
 * Note: As the WebApp.Net framework cannot render real sliders in the UI, we instead show buttons to increase or
 * decrease the value.
 *
 * @author Kai Kreuzer - Initial contribution and API
 * @author Vlad Ivanov - BasicUI changes
 * @author Florian Schmidt - Make min and max value configurable in Sitemap
 */
@Component(service = WidgetRenderer.class)
@NonNullByDefault
public class SliderRenderer extends AbstractWidgetRenderer {

    @Activate
    public SliderRenderer(final BundleContext bundleContext, final @Reference TranslationProvider i18nProvider,
            final @Reference ItemUIRegistry itemUIRegistry, final @Reference LocaleProvider localeProvider) {
        super(bundleContext, i18nProvider, itemUIRegistry, localeProvider);
    }

    @Override
    public boolean canRender(Widget w) {
        return w instanceof Slider;
    }

    @Override
    public EList<Widget> renderWidget(Widget w, StringBuilder sb, String sitemap) throws RenderException {
        Slider s = (Slider) w;

        String snippetName = "slider";
        String snippet = getSnippet(snippetName);

        // set the default send-update frequency to 200ms
        String frequency = s.getFrequency() == 0 ? "200" : Integer.toString(s.getFrequency());

        String unit = getUnitForWidget(w);
        if (unit == null) {
            // Search the unit in the item state
            // Do not use itemUIRegistry.getState(w) as it will return a DecimalType for a slider widget
            // even if the item state is a QuantityType
            String itemName = w.getItem();
            State state = itemName != null ? itemUIRegistry.getItemState(itemName) : null;
            if (state instanceof QuantityType<?>) {
                Unit<?> stateUnit = ((QuantityType<?>) state).getUnit();
                unit = stateUnit.toString();
            }
        }

        snippet = preprocessSnippet(snippet, w);
        snippet = snippet.replace("%frequency%", frequency);
        snippet = snippet.replace("%switch%", s.isSwitchEnabled() ? "1" : "0");
        snippet = snippet.replace("%unit%", unit == null ? "" : unit);
        snippet = snippet.replace("%minValue%", minValueOf(s));
        snippet = snippet.replace("%maxValue%", maxValueOf(s));
        snippet = snippet.replace("%step%", stepOf(s));

        // Process the color tags
        snippet = processColor(w, snippet);

        sb.append(snippet);
        return ECollections.emptyEList();
    }

    private String maxValueOf(Slider slider) {
        if (slider.getMaxValue() != null) {
            return slider.getMaxValue().toString();
        }
        return "100";
    }

    private String minValueOf(Slider slider) {
        if (slider.getMinValue() != null) {
            return slider.getMinValue().toString();
        }
        return "0";
    }

    private String stepOf(Slider slider) {
        if (slider.getStep() != null) {
            return slider.getStep().toString();
        }
        return "1";
    }
}
