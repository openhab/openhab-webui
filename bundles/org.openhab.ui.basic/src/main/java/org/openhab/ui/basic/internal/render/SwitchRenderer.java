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
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.i18n.LocaleProvider;
import org.openhab.core.i18n.TranslationProvider;
import org.openhab.core.items.GroupItem;
import org.openhab.core.items.Item;
import org.openhab.core.items.ItemNotFoundException;
import org.openhab.core.library.items.NumberItem;
import org.openhab.core.library.items.PlayerItem;
import org.openhab.core.library.items.RollershutterItem;
import org.openhab.core.library.items.SwitchItem;
import org.openhab.core.library.types.OnOffType;
import org.openhab.core.library.types.QuantityType;
import org.openhab.core.model.sitemap.sitemap.Mapping;
import org.openhab.core.model.sitemap.sitemap.Switch;
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

/**
 * This is an implementation of the {@link WidgetRenderer} interface, which
 * can produce HTML code for Switch widgets.
 *
 * @author Kai Kreuzer - Initial contribution and API
 * @author Vlad Ivanov - BasicUI changes
 * @author Laurent Garnier - Use icon instead of label for button if icon is set
 */
@Component(service = WidgetRenderer.class)
@NonNullByDefault
public class SwitchRenderer extends AbstractWidgetRenderer {

    private final Logger logger = LoggerFactory.getLogger(SwitchRenderer.class);

    private static final int MAX_BUTTONS = 20;
    private static final int MAX_LABEL_SIZE = 15;
    private static final String ELLIPSIS = "\u2026";

    @Activate
    public SwitchRenderer(final BundleContext bundleContext, final @Reference TranslationProvider i18nProvider,
            final @Reference ItemUIRegistry itemUIRegistry, final @Reference LocaleProvider localeProvider) {
        super(bundleContext, i18nProvider, itemUIRegistry, localeProvider);
    }

    @Override
    public boolean canRender(Widget w) {
        return w instanceof Switch;
    }

    @Override
    public EList<Widget> renderWidget(Widget w, StringBuilder sb, String sitemap) throws RenderException {
        Switch s = (Switch) w;

        String snippetName = null;
        Item item = null;
        int nbButtons = 0;
        boolean multiline = false;
        try {
            item = itemUIRegistry.getItem(w.getItem());
            if (s.getMappings().isEmpty()) {
                if (item instanceof RollershutterItem) {
                    snippetName = "rollerblind";
                } else if (item instanceof SwitchItem) {
                    snippetName = "switch";
                } else if (item instanceof GroupItem && ((GroupItem) item).getBaseItem() instanceof RollershutterItem) {
                    snippetName = "rollerblind";
                } else {
                    final CommandDescription commandDescription = item.getCommandDescription();
                    final int optsSize = commandDescription == null ? -1
                            : commandDescription.getCommandOptions().size();
                    if (optsSize > 0 && optsSize <= MAX_BUTTONS) {
                        // Render with buttons only when a max of MAX_BUTTONS options are defined
                        snippetName = "buttons";
                        nbButtons = optsSize;
                        multiline = true;
                    } else {
                        snippetName = "switch";
                    }
                }
            } else {
                snippetName = "buttons";
                nbButtons = s.getMappings().size();
                multiline = !(item instanceof PlayerItem);
            }
        } catch (ItemNotFoundException e) {
            logger.debug("Failed to retrieve item during widget rendering: {}", e.getMessage());
            snippetName = "switch";
        }

        String snippet = getSnippet(snippetName);
        State state = itemUIRegistry.getState(w);

        if (nbButtons == 0) {
            snippet = preprocessSnippet(snippet, w);

            if (OnOffType.ON.equals(state)) {
                snippet = snippet.replaceAll("%checked%", "checked=true");
            } else {
                snippet = snippet.replaceAll("%checked%", "");
            }
        } else {
            // Show the value at left of all the buttons only if a state pattern is set on the sitemap widget
            if (!hasValue(w.getLabel())) {
                snippet = snippet.replace("%value%", "");
                snippet = snippet.replace("%has_value%", "false");
            }

            snippet = preprocessSnippet(snippet, w);

            if (multiline) {
                snippet = snippet //
                        .replaceAll("%height_auto%", "mdl-form__row--height-auto")
                        .replaceAll("%buttons_class%", "mdl-form__buttons-multiline")
                        .replaceAll("%label_class%", "mdl-form__label-multiline");
            } else {
                snippet = snippet //
                        .replaceAll("%height_auto%", "") //
                        .replaceAll("%buttons_class%", "mdl-form__buttons") //
                        .replaceAll("%label_class%", "");
            }

            StringBuilder buttons = new StringBuilder();
            if (s.getMappings().isEmpty() && item != null) {
                final CommandDescription commandDescription = item.getCommandDescription();
                if (commandDescription != null) {
                    for (CommandOption option : commandDescription.getCommandOptions()) {
                        // Truncate the button label to MAX_LABEL_SIZE characters
                        buildButton(s, option.getLabel(), option.getCommand(), null, null, MAX_LABEL_SIZE, item, state,
                                buttons);
                    }
                }
            } else {
                for (Mapping mapping : s.getMappings()) {
                    buildButton(s, mapping.getLabel(), mapping.getCmd(), mapping.getReleaseCmd(), mapping.getIcon(), -1,
                            item, state, buttons);
                }
            }
            snippet = snippet.replace("%buttons%", buttons.toString());
        }

        // Process the color tags
        snippet = processColor(w, snippet);

        sb.append(snippet);
        return ECollections.emptyEList();
    }

    private void buildButton(Switch w, @Nullable String lab, String cmd, @Nullable String releaseCmd,
            @Nullable String icon, int maxLabelSize, @Nullable Item item, @Nullable State state, StringBuilder buttons)
            throws RenderException {
        String button = getSnippet("button");

        String command = cmd;
        String releaseCommand = releaseCmd;
        String label = lab == null ? cmd : lab;

        if (item instanceof NumberItem && ((NumberItem) item).getDimension() != null) {
            String unit = getUnitForWidget(w);
            if (unit != null) {
                command = command.replace(UnitUtils.UNIT_PLACEHOLDER, unit);
                if (releaseCommand != null) {
                    releaseCommand = releaseCommand.replace(UnitUtils.UNIT_PLACEHOLDER, unit);
                }
                label = label.replace(UnitUtils.UNIT_PLACEHOLDER, unit);
            }
        }

        if (maxLabelSize >= 1 && label.length() > maxLabelSize) {
            label = label.substring(0, maxLabelSize - 1) + ELLIPSIS;
        }

        button = button.replace("%cmd%", escapeHtml(command));
        button = button.replace("%release_cmd%", releaseCommand == null ? "" : escapeHtml(releaseCommand));
        String buttonClass = "";
        button = button.replace("%label%", escapeHtml(label));
        if (icon == null) {
            button = button.replace("%textclass%", "mdl-button-text");
            button = button.replace("%icon_snippet%", "");
        } else {
            button = button.replace("%textclass%", "mdl-button-icon-text");
            button = preprocessIcon(button, icon, true);
            buttonClass = "mdl-button-icon";
        }

        State compareMappingState = state;
        if (state instanceof QuantityType) { // convert the item state to the command value for proper
                                             // comparison and buttonClass calculation
            compareMappingState = convertStateToLabelUnit((QuantityType<?>) state, command);
        }

        if (compareMappingState != null && compareMappingState.toString().equals(command)) {
            buttonClass += " mdl-button--accent";
        }
        button = button.replace("%class%", buttonClass);

        buttons.append(button);
    }
}
