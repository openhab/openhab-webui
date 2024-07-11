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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.eclipse.emf.common.util.ECollections;
import org.eclipse.emf.common.util.EList;
import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.i18n.LocaleProvider;
import org.openhab.core.i18n.TranslationProvider;
import org.openhab.core.items.Item;
import org.openhab.core.items.ItemNotFoundException;
import org.openhab.core.library.items.NumberItem;
import org.openhab.core.library.types.QuantityType;
import org.openhab.core.model.sitemap.sitemap.Button;
import org.openhab.core.model.sitemap.sitemap.ButtonDefinition;
import org.openhab.core.model.sitemap.sitemap.Buttongrid;
import org.openhab.core.model.sitemap.sitemap.Widget;
import org.openhab.core.types.State;
import org.openhab.core.types.util.UnitUtils;
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

        Map<Integer, Map<Integer, ButtonDefinition>> rowsButtons = new HashMap<>();
        Map<Integer, Map<Integer, List<Button>>> rowsButtonWidgets = new HashMap<>();

        int maxColumn = 0;
        int mawRow = 0;
        // Go through buttons defined in the "buttons" parameter of the Buttongrid to fill the map rows
        for (ButtonDefinition button : grid.getButtons()) {
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

            Map<Integer, ButtonDefinition> columnsButtons = rowsButtons.get(row);
            if (columnsButtons == null) {
                columnsButtons = new HashMap<>();
                rowsButtons.put(row, columnsButtons);
            }
            if (columnsButtons.get(column) != null) {
                logger.warn(
                        "Several buttons at row {} and column {} in \"buttons\" parameter; only the first is considered",
                        row, column);
            } else {
                columnsButtons.put(column, button);
            }
        }
        // Go through buttons defined as sub-element of the Buttongrid to fill the map rowsWidgets
        for (Widget widget : grid.getChildren()) {
            if (widget instanceof Button button) {
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

                Map<Integer, ButtonDefinition> columnsButtons = rowsButtons.get(row);
                if (columnsButtons != null && columnsButtons.get(column) != null) {
                    logger.warn(
                            "Several buttons at row {} and column {} in \"buttons\" parameter and as \"Button\" element; only the first is considered",
                            row, column);
                } else {
                    Map<Integer, List<Button>> columnsButtonWidgets = rowsButtonWidgets.get(row);
                    if (columnsButtonWidgets == null) {
                        columnsButtonWidgets = new HashMap<>();
                        rowsButtonWidgets.put(row, columnsButtonWidgets);
                    }
                    List<Button> buttonWidgets = columnsButtonWidgets.get(column);
                    if (buttonWidgets == null) {
                        buttonWidgets = new ArrayList<>();
                        buttonWidgets.add(button);
                        columnsButtonWidgets.put(column, buttonWidgets);
                    } else if (!buttonWidgets.get(0).getVisibility().isEmpty() && !button.getVisibility().isEmpty()) {
                        buttonWidgets.add(button);
                    } else {
                        logger.warn(
                                "Several \"Button\" elements at row {} and column {}; only the first button without visibility conditions is kept",
                                row, column);
                        if (!buttonWidgets.get(0).getVisibility().isEmpty() && button.getVisibility().isEmpty()) {
                            buttonWidgets.clear();
                            buttonWidgets.add(button);
                        }
                    }
                }
            }
        }

        if (mawRow > 50 || maxColumn > 12) {
            logger.warn("The button grid is too big ({},{})", mawRow, maxColumn);
            return ECollections.emptyEList();
        }

        boolean showHeaderRow = grid.getLabel() != null;
        String snippet = (showHeaderRow ? getSnippet("header_row") : "") + getSnippet("buttongrid");

        snippet = snippet.replace("%header_row%", showHeaderRow ? "true" : "");

        snippet = preprocessSnippet(snippet, w, true);

        // Process the color tags
        snippet = processColor(w, snippet);

        StringBuilder buttons = new StringBuilder();
        for (int row = 1; row <= mawRow; row++) {
            buildRow(maxColumn, rowsButtons.get(row), rowsButtonWidgets.get(row), buttons);
        }
        snippet = snippet.replace("%buttons%", buttons.toString());

        sb.append(snippet);
        return ECollections.emptyEList();
    }

    private void buildRow(int columns, @Nullable Map<Integer, ButtonDefinition> buttonsInRow,
            @Nullable Map<Integer, List<Button>> buttonWidgetsInRow, StringBuilder builder) throws RenderException {
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
            ButtonDefinition button = buttonsInRow == null ? null : buttonsInRow.get(col);
            List<Button> buttonWidgets = buttonWidgetsInRow == null ? null : buttonWidgetsInRow.get(col);
            if (button != null) {
                String buttonHtml = buildButton(null, button.getLabel(), button.getCmd(), "", button.getIcon(), true);
                buildCell(false, sizeDessktop, col > 8, sizeTablet, col > 4, sizePhone, buttonHtml, builder);
            } else if (buttonWidgets != null) {
                String buttonHtml = "";
                for (Button b : buttonWidgets) {
                    String icon = b.getStaticIcon() != null || b.getIcon() != null || !b.getIconRules().isEmpty()
                            ? getCategory(b)
                            : null;
                    buttonHtml += buildButton(b, b.getLabel(), b.getCmd(), b.getReleaseCmd(), icon, b.isStateless());
                }
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

    private String buildButton(@Nullable Button buttonWidget, @Nullable String lab, String cmd,
            @Nullable String releaseCmd, @Nullable String icon, boolean stateless) throws RenderException {
        String snippet = getSnippet(buttonWidget != null ? "button_element" : "button");

        String command = cmd;
        String releaseCommand = releaseCmd;
        String label = lab == null ? cmd : lab;

        State state = null;
        if (buttonWidget != null) {
            Item item = null;
            try {
                item = itemUIRegistry.getItem(buttonWidget.getItem());
            } catch (ItemNotFoundException e) {
                logger.debug("Failed to retrieve item during widget rendering: {}", e.getMessage());
            }
            state = itemUIRegistry.getState(buttonWidget);

            if (item instanceof NumberItem && ((NumberItem) item).getDimension() != null) {
                String unit = getUnitForWidget(buttonWidget);
                if (unit != null) {
                    command = command.replace(UnitUtils.UNIT_PLACEHOLDER, unit);
                    if (releaseCommand != null) {
                        releaseCommand = releaseCommand.replace(UnitUtils.UNIT_PLACEHOLDER, unit);
                    }
                    label = label.replace(UnitUtils.UNIT_PLACEHOLDER, unit);
                }
            }
        }

        snippet = snippet.replace("%cmd%", escapeHtml(command));
        snippet = snippet.replace("%release_cmd%", releaseCommand == null ? "" : escapeHtml(releaseCommand));
        snippet = snippet.replace("%stateless%", Boolean.valueOf(stateless).toString());

        snippet = snippet.replace("%label%", getLabel(label));
        String buttonClass = "buttongrid-button";
        if (icon == null) {
            snippet = snippet.replace("%textclass%", "mdl-button-text");
            snippet = snippet.replace("%icon_snippet%", "");
        } else {
            snippet = snippet.replace("%textclass%", "mdl-button-icon-text");
            snippet = preprocessIcon(snippet, icon, true);
            buttonClass += " mdl-button-icon";
        }
        if (!stateless) {
            State compareMappingState = state;
            if (state instanceof QuantityType) { // convert the item state to the command value for proper
                                                 // comparison and buttonClass calculation
                compareMappingState = convertStateToLabelUnit((QuantityType<?>) state, command);
            }

            if (compareMappingState != null && compareMappingState.toString().equals(command)) {
                buttonClass += " mdl-button--accent";
            }
        }
        snippet = snippet.replace("%class%", buttonClass);

        if (buttonWidget != null) {
            snippet = preprocessSnippet(snippet, buttonWidget, true);
            snippet = processColor(buttonWidget, snippet);
        }

        return snippet;
    }
}
