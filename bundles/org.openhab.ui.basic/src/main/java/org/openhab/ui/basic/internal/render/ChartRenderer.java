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

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Objects;

import org.eclipse.emf.common.util.ECollections;
import org.eclipse.emf.common.util.EList;
import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.i18n.LocaleProvider;
import org.openhab.core.i18n.TranslationProvider;
import org.openhab.core.items.GroupItem;
import org.openhab.core.items.Item;
import org.openhab.core.items.ItemNotFoundException;
import org.openhab.core.sitemap.Chart;
import org.openhab.core.sitemap.Widget;
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
 * can produce HTML code for Chart widgets.
 *
 * @author Kai Kreuzer - Initial contribution and API
 * @author Vlad Ivanov - BasicUI changes
 * @author Laurent Garnier - Delegate the definition of certain chart URL parameters to the frontend (smarthome.js)
 * @author Mark Herwege - Implement sitemap registry
 */
@Component(service = WidgetRenderer.class)
@NonNullByDefault
public class ChartRenderer extends AbstractWidgetRenderer {

    @Activate
    public ChartRenderer(final BundleContext bundleContext, final @Reference TranslationProvider i18nProvider,
            final @Reference ItemUIRegistry itemUIRegistry, final @Reference LocaleProvider localeProvider) {
        super(bundleContext, i18nProvider, itemUIRegistry, localeProvider);
    }

    private final Logger logger = LoggerFactory.getLogger(ChartRenderer.class);

    private static final String URL_NONE_ICON = "images/none.png";

    @Override
    public boolean canRender(Widget w) {
        return w instanceof Chart;
    }

    @Override
    public EList<Widget> renderWidget(Widget w, StringBuilder sb, String sitemap) throws RenderException {
        Chart chart = (Chart) w;

        try {
            String itemParam = null;
            boolean forceAsItem = chart.forceAsItem();
            Item item = null;
            String itemName = Objects.requireNonNull(w.getItem()); // Checked at creation there is an item
            item = itemUIRegistry.getItem(itemName);
            if (item instanceof GroupItem && !forceAsItem) {
                itemParam = "groups=" + chart.getItem();
            } else {
                itemParam = "items=" + chart.getItem();
            }

            String chartUrl = "/chart?" + itemParam + "&period=" + chart.getPeriod();
            if (chart.getService() != null) {
                chartUrl += "&service=" + chart.getService();
            }

            if (chart.getYAxisDecimalPattern() != null) {
                chartUrl += "&yAxisDecimalPattern="
                        + URLEncoder.encode(chart.getYAxisDecimalPattern(), StandardCharsets.UTF_8);
            }

            // if legend parameter is given, add corresponding GET parameter
            boolean legend = chart.hasLegend();
            legend = legend || (item instanceof GroupItem && !forceAsItem);
            if (legend) {
                chartUrl += "&legend=true";
            } else {
                chartUrl += "&legend=false";
            }

            if (chart.getInterpolation() instanceof String interpolationMethod) {
                if ("step".equals(interpolationMethod)) {
                    chartUrl += "&interpolation=step";
                } else if ("linear".equals(interpolationMethod)) {
                    chartUrl += "&interpolation=linear";
                } else {
                    logger.warn("Unknown interpolation method '{}'", interpolationMethod);
                }
            }

            String snippet = getSnippet("chart");

            boolean showHeaderRow = chart.getLabel() != null;
            snippet = snippet.replace("%header_visibility_class%",
                    showHeaderRow ? "%visibility_class%" : "mdl-form__row--hidden");
            snippet = snippet.replace("%header_row%", Boolean.valueOf(showHeaderRow).toString());

            snippet = preprocessSnippet(snippet, w);

            // Process the color tags
            snippet = processColor(w, snippet);

            if (chart.getRefresh() > 0) {
                snippet = snippet.replace("%update_interval%", Integer.toString(chart.getRefresh()));
            } else {
                snippet = snippet.replace("%update_interval%", "0");
            }

            snippet = snippet.replace("%id%", itemUIRegistry.getWidgetId(w));
            snippet = snippet.replace("%proxied_url%", chartUrl);
            snippet = snippet.replace("%valid_url%", "true");
            // Let the frontend set the final URL with additional parameters depending on browser settings
            // and schedule the refresh
            snippet = snippet.replace("%ignore_refresh%", "true");
            snippet = snippet.replace("%url%", URL_NONE_ICON);
            snippet = snippet.replace("%legend%", Boolean.valueOf(legend).toString());

            List<List<String>> periods = List.of(//
                    // Periods in the past
                    List.of("Last 2 years", "2Y"), List.of("Last year", "Y"), List.of("Last 9 months", "9M"),
                    List.of("Last 6 months", "6M"), List.of("Last 4 months", "4M"), List.of("Last 3 months", "3M"),
                    List.of("Last 2 months", "2M"), List.of("Last month", "M"), List.of("Last 2 weeks", "2W"),
                    List.of("Last week", "W"), List.of("Last 3 days", "3D"), List.of("Last 2 days", "2D"),
                    List.of("Last day", "D"), List.of("Last 12 hours", "12h"), List.of("Last 8 hours", "8h"),
                    List.of("Last 4 hours", "4h"), List.of("Last 2 hours", "2h"), List.of("Last hour", "h"),
                    // Periods in the future
                    List.of("Next hour", "-h"), List.of("Next 2 hours", "-2h"), List.of("Next 4 hours", "-4h"),
                    List.of("Next 8 hours", "-8h"), List.of("Next 12 hours", "-12h"), List.of("Next day", "-D"),
                    List.of("Next 2 days", "-2D"), List.of("Next 3 days", "-3D"), List.of("Next week", "-W"),
                    List.of("Next 2 weeks", "-2W"), List.of("Next month", "-M"), List.of("Next 2 months", "-2M"),
                    List.of("Next 3 months", "-3M"), List.of("Next 4 months", "-4M"), List.of("Next 6 months", "-6M"),
                    List.of("Next 9 months", "-9M"), List.of("Next year", "-Y"), List.of("Next 2 years", "-2Y"));
            StringBuilder rowSB = new StringBuilder();
            for (List<String> period : periods) {
                buildRow(chart, period.get(0), period.get(1), chart.getPeriod(), rowSB);
            }
            snippet = snippet.replace("%period_rows%", rowSB.toString());

            sb.append(snippet);
        } catch (ItemNotFoundException e) {
            logger.warn("Chart cannot be rendered as item '{}' does not exist.", chart.getItem());
        }
        return ECollections.emptyEList();
    }

    private void buildRow(Chart w, @Nullable String lab, String cmd, String current, StringBuilder rowSB)
            throws RenderException {
        String rowSnippet = getSnippet("selection_row");

        String command = cmd;
        String label = lab == null ? cmd : lab;

        String itemName = w.getItem();
        rowSnippet = rowSnippet.replace("%item%", itemName != null ? itemName : "");
        rowSnippet = rowSnippet.replace("%cmd%", escapeHtml(command));
        rowSnippet = rowSnippet.replace("%label%", escapeHtml(label));

        if (command.equals(current)) {
            rowSnippet = rowSnippet.replace("%checked%", "checked=\"true\"");
        } else {
            rowSnippet = rowSnippet.replace("%checked%", "");
        }

        rowSB.append(rowSnippet);
    }
}
