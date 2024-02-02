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

import java.util.HashMap;
import java.util.Map;

import org.eclipse.emf.common.util.ECollections;
import org.eclipse.emf.common.util.EList;
import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.i18n.LocaleProvider;
import org.openhab.core.i18n.TranslationProvider;
import org.openhab.core.model.sitemap.sitemap.Button;
import org.openhab.core.model.sitemap.sitemap.Buttongrid;
import org.openhab.core.model.sitemap.sitemap.Widget;
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
 * can produce HTML code for Buttongrid widgets.
 *
 * @author Laurent Garnier - Initial contribution
 */
@Component(service = WidgetRenderer.class)
@NonNullByDefault
public class ButtongridRenderer extends AbstractWidgetRenderer {

    private final Logger logger = LoggerFactory.getLogger(ButtongridRenderer.class);

    @Activate
    public ButtongridRenderer(final BundleContext bundleContext, final @Reference TranslationProvider i18nProvider,
            final @Reference ItemUIRegistry itemUIRegistry, final @Reference LocaleProvider localeProvider) {
        super(bundleContext, i18nProvider, itemUIRegistry, localeProvider);
    }

    @Override
    public boolean canRender(Widget w) {
        return w instanceof Buttongrid;
    }

    @Override
    public EList<Widget> renderWidget(Widget w, StringBuilder sb, String sitemap) throws RenderException {
        Buttongrid grid = (Buttongrid) w;

        Map<Integer, Map<Integer, Button>> rows = new HashMap<>();

        int maxColumn = 0;
        int mawRow = 0;
        for (Button button : grid.getButtons()) {
            int row = button.getRow();
            int column = button.getColumn();
            if (row < 1 || column < 1) {
                logger.warn("Invalid row or column number; button at position {}:{} is ignored", row, column);
                continue;
            }
            if (row > mawRow) {
                mawRow = row;
            }
            if (column > maxColumn) {
                maxColumn = column;
            }

            Map<Integer, Button> columns = rows.get(row);
            if (columns == null) {
                columns = new HashMap<>();
                rows.put(row, columns);
            }
            columns.put(column, button);
        }

        if (mawRow > 50 || maxColumn > 12) {
            logger.warn("The button grid is too big ({},{})", mawRow, maxColumn);
            return ECollections.emptyEList();
        }

        String snippet = getSnippet("buttongrid");

        boolean showHeaderRow = grid.getLabel() != null;
        snippet = snippet.replace("%header_visibility_class%",
                showHeaderRow ? "%visibility_class%" : "mdl-form__row--hidden");
        snippet = snippet.replace("%header_row%", Boolean.valueOf(showHeaderRow).toString());

        snippet = preprocessSnippet(snippet, w, true);

        // Process the color tags
        snippet = processColor(w, snippet);

        StringBuilder buttons = new StringBuilder();
        for (int row = 1; row <= mawRow; row++) {
            buildRow(grid.getItem(), maxColumn, rows.get(row), buttons);
        }
        snippet = snippet.replace("%buttons%", buttons.toString());

        sb.append(snippet);
        return ECollections.emptyEList();
    }

    private void buildRow(String item, int columns, @Nullable Map<Integer, Button> buttonsInRow, StringBuilder builder)
            throws RenderException {
        // Add extra cells to fill the row
        // Try to center the grid at best with one extra cell at beginning of row and one at end of row
        int extraCellSizeDesktop = 12 % columns;
        int extraCellSizeTablet = columns > 8 ? 0 : 8 % columns;
        int column = columns + 1;
        // Extra cell at beginning
        if (extraCellSizeDesktop > 0) {
            buildEmptyCell((extraCellSizeDesktop / 2) == 0, Math.max(1, extraCellSizeDesktop / 2),
                    (column > 8) || ((extraCellSizeTablet / 2) == 0), Math.max(1, extraCellSizeTablet / 2), true, 1,
                    builder);
        } else if (extraCellSizeTablet > 0 && columns < 8) {
            buildEmptyCell(true, 1, (extraCellSizeTablet / 2) == 0, Math.max(1, extraCellSizeTablet / 2), true, 1,
                    builder);
        }

        // Match the grid to a mdl-grid
        int sizeDessktop = Math.max(1, 12 / columns);
        int sizeTablet = Math.max(1, 8 / columns);
        int sizePhone = Math.max(1, 4 / columns);
        for (int col = 1; col <= columns; col++) {
            Button button = buttonsInRow == null ? null : buttonsInRow.get(col);
            if (button != null) {
                String buttonHtml = buildButton(item, button.getLabel(), button.getCmd(), button.getIcon());
                buildCell(false, sizeDessktop, col > 8, sizeTablet, col > 4, sizePhone, buttonHtml, builder);
            } else {
                buildEmptyCell(false, sizeDessktop, col > 8, sizeTablet, col > 4, sizePhone, builder);
            }
        }

        // Extra cell at end
        if (extraCellSizeDesktop > 0) {
            buildEmptyCell(false, extraCellSizeDesktop / 2 + extraCellSizeDesktop % 2, column > 8,
                    Math.max(1, extraCellSizeTablet / 2 + extraCellSizeTablet % 2), column > 4, 1, builder);
        } else if (extraCellSizeTablet > 0 && columns < 8) {
            buildEmptyCell(true, 1, false, extraCellSizeTablet / 2 + extraCellSizeTablet % 2, column > 4, 1, builder);
        }
    }

    private void buildEmptyCell(boolean hideDesktop, int sizeDessktop, boolean hideTablet, int sizeTablet,
            boolean hidePhone, int sizePhone, StringBuilder builder) throws RenderException {
        buildCell(hideDesktop, sizeDessktop, hideTablet, sizeTablet, hidePhone, sizePhone, "", builder);
    }

    private void buildCell(boolean hideDesktop, int sizeDessktop, boolean hideTablet, int sizeTablet, boolean hidePhone,
            int sizePhone, String buttonHtml, StringBuilder builder) throws RenderException {
        String divClass = "";
        if (hideDesktop) {
            divClass += " mdl-cell--hide-desktop";
        }
        if (hideTablet) {
            divClass += " mdl-cell--hide-tablet";
        }
        if (hidePhone) {
            divClass += " mdl-cell--hide-phone";
        }
        String buttonDiv = getSnippet("buttoncell");
        buttonDiv = buttonDiv.replace("%size_desktop%", String.valueOf(sizeDessktop));
        buttonDiv = buttonDiv.replace("%size_tablet%", String.valueOf(sizeTablet));
        buttonDiv = buttonDiv.replace("%size_phone%", String.valueOf(sizePhone));
        buttonDiv = buttonDiv.replace("%class%", divClass);
        buttonDiv = buttonDiv.replace("%button%", buttonHtml);
        builder.append(buttonDiv);
    }

    private String buildButton(String item, @Nullable String lab, String cmd, @Nullable String icon)
            throws RenderException {
        String button = getSnippet("button");

        String label = lab == null ? cmd : lab;

        button = button.replace("%item%", item);
        button = button.replace("%cmd%", escapeHtml(cmd));
        String buttonClass = "buttongrid-button";

        button = button.replace("%label%", escapeHtml(label));
        if (icon == null) {
            button = button.replace("%textclass%", "mdl-button-text");
            button = button.replace("%icon_snippet%", "");
        } else {
            button = button.replace("%textclass%", "mdl-button-icon-text");
            button = preprocessIcon(button, icon, true);
            buttonClass += " mdl-button-icon";
        }
        button = button.replace("%class%", buttonClass);

        return button;
    }
}
