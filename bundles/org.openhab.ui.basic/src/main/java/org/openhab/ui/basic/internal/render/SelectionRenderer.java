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
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.i18n.LocaleProvider;
import org.openhab.core.i18n.TranslationProvider;
import org.openhab.core.items.Item;
import org.openhab.core.items.ItemNotFoundException;
import org.openhab.core.library.items.NumberItem;
import org.openhab.core.library.types.QuantityType;
import org.openhab.core.model.sitemap.sitemap.Mapping;
import org.openhab.core.model.sitemap.sitemap.Selection;
import org.openhab.core.model.sitemap.sitemap.Widget;
import org.openhab.core.types.CommandDescription;
import org.openhab.core.types.CommandOption;
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

import com.google.gson.JsonObject;

/**
 * This is an implementation of the {@link WidgetRenderer} interface, which
 * can produce HTML code for Selection widgets.
 *
 * @author Kai Kreuzer - Initial contribution and API
 * @author Vlad Ivanov - BasicUI changes
 */
@Component(service = WidgetRenderer.class)
@NonNullByDefault
public class SelectionRenderer extends AbstractWidgetRenderer {

    private final Logger logger = LoggerFactory.getLogger(SelectionRenderer.class);

    @Activate
    public SelectionRenderer(final BundleContext bundleContext, final @Reference TranslationProvider i18nProvider,
            final @Reference ItemUIRegistry itemUIRegistry, final @Reference LocaleProvider localeProvider) {
        super(bundleContext, i18nProvider, itemUIRegistry, localeProvider);
    }

    @Override
    public boolean canRender(Widget w) {
        return w instanceof Selection;
    }

    @Override
    public EList<Widget> renderWidget(Widget w, StringBuilder sb, String sitemap) throws RenderException {
        String snippet = getSnippet("selection");

        snippet = preprocessSnippet(snippet, w);

        State state = itemUIRegistry.getState(w);
        Selection selection = (Selection) w;
        String mappingLabel = null;
        String rowMappingLabel;

        Item item = null;
        try {
            item = itemUIRegistry.getItem(w.getItem());
        } catch (ItemNotFoundException e) {
            logger.debug("Failed to retrieve item during widget rendering: {}", e.getMessage());
        }

        JsonObject jsonObject = new JsonObject();
        StringBuilder rowSB = new StringBuilder();
        if (selection.getMappings().isEmpty() && item != null) {
            final CommandDescription commandDescription = item.getCommandDescription();
            if (commandDescription != null) {
                for (CommandOption option : commandDescription.getCommandOptions()) {
                    jsonObject.addProperty(option.getCommand(), option.getLabel());
                    rowMappingLabel = buildRow(selection, option.getLabel(), option.getCommand(), item, state, rowSB);
                    if (rowMappingLabel != null) {
                        mappingLabel = rowMappingLabel;
                    }
                }
            }
        } else {
            for (Mapping mapping : selection.getMappings()) {
                jsonObject.addProperty(mapping.getCmd(), mapping.getLabel());
                rowMappingLabel = buildRow(selection, mapping.getLabel(), mapping.getCmd(), item, state, rowSB);
                if (rowMappingLabel != null) {
                    mappingLabel = rowMappingLabel;
                }
            }
        }
        snippet = snippet.replace("%rows%", rowSB.toString());
        snippet = snippet.replace("%value_map%", escapeHtml(jsonObject.toString()));
        snippet = snippet.replace("%label_header%", getLabel(w));
        snippet = snippet.replace("%value_header%", mappingLabel != null ? mappingLabel : getValue(w));

        // Process the color tags
        snippet = processColor(w, snippet);

        sb.append(snippet);
        return ECollections.emptyEList();
    }

    private @Nullable String buildRow(Selection w, @Nullable String lab, String cmd, @Nullable Item item,
            @Nullable State state, StringBuilder rowSB) throws RenderException {
        String mappingLabel = null;
        String rowSnippet = getSnippet("selection_row");

        String command = cmd;
        String label = lab == null ? cmd : lab;

        if (item instanceof NumberItem && ((NumberItem) item).getDimension() != null) {
            String unit = getUnitForWidget(w);
            if (unit != null) {
                command = command.replace(UnitUtils.UNIT_PLACEHOLDER, unit);
                label = label.replace(UnitUtils.UNIT_PLACEHOLDER, unit);
            }
        }

        rowSnippet = rowSnippet.replace("%item%", w.getItem() != null ? w.getItem() : "");
        rowSnippet = rowSnippet.replace("%cmd%", escapeHtml(command));
        rowSnippet = rowSnippet.replace("%label%", escapeHtml(label));

        State compareMappingState = state;
        if (state instanceof QuantityType) { // convert the item state to the command value for proper
                                             // comparison and "checked" attribute calculation
            compareMappingState = convertStateToLabelUnit((QuantityType<?>) state, command);
        }

        if (compareMappingState != null && compareMappingState.toString().equals(command)) {
            mappingLabel = label;
            rowSnippet = rowSnippet.replace("%checked%", "checked=\"true\"");
        } else {
            rowSnippet = rowSnippet.replace("%checked%", "");
        }

        rowSB.append(rowSnippet);

        return mappingLabel;
    }
}
