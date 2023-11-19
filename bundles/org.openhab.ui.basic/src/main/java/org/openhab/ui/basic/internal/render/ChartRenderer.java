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

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

import org.eclipse.emf.common.util.ECollections;
import org.eclipse.emf.common.util.EList;
import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.i18n.LocaleProvider;
import org.openhab.core.i18n.TranslationProvider;
import org.openhab.core.items.GroupItem;
import org.openhab.core.items.Item;
import org.openhab.core.items.ItemNotFoundException;
import org.openhab.core.model.sitemap.sitemap.Chart;
import org.openhab.core.model.sitemap.sitemap.Widget;
import org.openhab.core.ui.items.ItemUIRegistry;
import org.openhab.ui.basic.internal.WebAppConfig;
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
            boolean forceAsItem = false;
            if (chart.getForceAsItem() != null) {
                forceAsItem = chart.getForceAsItem();
            }
            Item item = itemUIRegistry.getItem(chart.getItem());
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
            boolean legend = item instanceof GroupItem && !forceAsItem;
            if (chart.getLegend() != null) {
                legend = chart.getLegend();
                if (chart.getLegend()) {
                    chartUrl += "&legend=true";
                } else {
                    chartUrl += "&legend=false";
                }
            }
            // add theme GET parameter
            String chartTheme = null;
            switch (config.getTheme()) {
                case WebAppConfig.THEME_NAME_BRIGHT:
                    chartTheme = "bright";
                    break;
                case WebAppConfig.THEME_NAME_DARK:
                    chartTheme = "dark";
                    break;
            }
            if (chartTheme != null) {
                chartUrl += "&theme=" + chartTheme;
            }
            String url;
            boolean ignoreRefresh;
            if (!itemUIRegistry.getVisiblity(w)) {
                url = URL_NONE_ICON;
                ignoreRefresh = true;
            } else {
                // add timestamp to circumvent browser cache
                url = chartUrl + "&t=" + (new Date()).getTime();
                ignoreRefresh = false;
            }

            String snippet = getSnippet("chart");

            boolean showHeaderRow = chart.getLabel() != null;
            snippet = snippet.replace("%header_visibility_class%",
                    showHeaderRow ? "%visibility_class%" : "mdl-form__row--hidden");
            snippet = snippet.replace("%header_row%", Boolean.valueOf(showHeaderRow).toString());

            snippet = preprocessSnippet(snippet, w, true);

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
            snippet = snippet.replace("%ignore_refresh%", ignoreRefresh ? "true" : "false");
            snippet = snippet.replace("%url%", url);
            snippet = snippet.replace("%legend%", Boolean.valueOf(legend).toString());

            List<List<String>> periods = List.of(List.of("Last hour", "h"), List.of("Last 4 hours", "4h"),
                    List.of("Last 8 hours", "8h"), List.of("Last 12 hours", "12h"), List.of("Last day", "D"),
                    List.of("Last 2 days", "2D"), List.of("Last 3 days", "3D"), List.of("Last week", "W"),
                    List.of("Last 2 weeks", "2W"), List.of("Last month", "M"), List.of("Last 2 months", "2M"),
                    List.of("Last 4 months", "4M"), List.of("Last year", "Y"));
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

        rowSnippet = rowSnippet.replace("%item%", w.getItem() != null ? w.getItem() : "");
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
