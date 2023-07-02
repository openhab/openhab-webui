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

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.eclipse.emf.common.util.ECollections;
import org.eclipse.emf.common.util.EList;
import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.i18n.LocaleProvider;
import org.openhab.core.i18n.TranslationProvider;
import org.openhab.core.items.Item;
import org.openhab.core.items.ItemNotFoundException;
import org.openhab.core.library.items.NumberItem;
import org.openhab.core.library.types.DateTimeType;
import org.openhab.core.library.types.DecimalType;
import org.openhab.core.library.types.PercentType;
import org.openhab.core.library.types.StringType;
import org.openhab.core.model.sitemap.sitemap.Input;
import org.openhab.core.model.sitemap.sitemap.Widget;
import org.openhab.core.types.State;
import org.openhab.core.types.StateDescription;
import org.openhab.core.types.UnDefType;
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
 * can produce HTML code for Input widgets.
 *
 * @author Mark Herwege - Initial contribution
 */
@Component(service = WidgetRenderer.class)
@NonNullByDefault
public class InputRenderer extends AbstractWidgetRenderer {

    private static final Pattern NUMBER_PATTERN = Pattern.compile("^(\\+|-)?[0-9\\.,]+((e|E)(\\+|-)?[0-9]+)?");
    private static final Pattern COMMA_SEPARATOR_PATTERN = Pattern
            .compile("^(\\+|-)?(([1-9][0-9]{0,2}(\\.[0-9]{3})*)|([0-9]*))?(,[0-9]+)?((e|E)(\\+|-)?[0-9]+)?$");
    private static final Pattern LABEL_PATTERN = Pattern.compile("[^\\[]*?\\[([^%]*)(%\\S+)? ?(\\S+)?(.*)\\]");

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
        Input input = (Input) w;

        String snippet = getSnippet("input");
        snippet = preprocessSnippet(snippet, w);

        Item item = null;
        try {
            item = itemUIRegistry.getItem(w.getItem());
        } catch (ItemNotFoundException e) {
            logger.debug("Failed to retrieve item during widget rendering: {}", e.getMessage());
            return ECollections.emptyEList();
        }

        String dataType;
        if (item.getAcceptedCommandTypes().stream()
                .anyMatch(o -> (!StringType.class.isAssignableFrom(o) && Number.class.isAssignableFrom(o)))) {
            dataType = "number";
        } else if (item.getAcceptedCommandTypes().stream()
                .anyMatch(o -> (!StringType.class.isAssignableFrom(o) && DateTimeType.class.isAssignableFrom(o)))) {
            dataType = "datetime";
        } else {
            dataType = "text";
        }
        snippet = snippet.replace("%data_type%", dataType);

        String inputHint = input.getInputHint();
        List<Class<? extends State>> dataTypes = item.getAcceptedDataTypes();
        if (("number".equals(inputHint)
                && !(dataTypes.contains(DecimalType.class) || dataTypes.contains(PercentType.class)))
                || (("date".equals(inputHint) || "time".equals(inputHint) || "datetime".equals(inputHint))
                        && !dataTypes.contains(DateTimeType.class))) {
            logger.warn("Invalid inputHint {} for item {} of type {}, set to default", inputHint, item.getName(),
                    item.getType());
            inputHint = null;
        }
        if ("datetime".equals(dataType) && ((inputHint == null) || inputHint.isEmpty() || "text".equals(inputHint))) {
            inputHint = "datetime";
        }
        snippet = snippet.replace("%input_hint%", inputHint == null ? "" : inputHint);

        String inputType = "text";
        String inputPattern = "";
        if ("number".equals(inputHint)) {
            inputType = "number";
            inputPattern = "pattern=\"[0-9]*([\\.|,][0-9]*)?\"";
        } else if ("date".equals(inputHint)) {
            inputType = "date";
            inputPattern = "pattern=\"[0-9]{4}-[0-9]d{2}-[0-9]d{2}\"";
        } else if ("time".equals(inputHint)) {
            inputType = "time";
            inputPattern = "pattern=\"[0-9]{2}:[0-9]{2}?\"";
        } else if ("datetime".equals(inputHint)) {
            inputType = "datetime-local";
            inputPattern = "pattern=\"[0-9]{4}-[0-9]d{2}-[0-9]d{2} [0-9]{2}:[0-9]{2}\"";
        }
        snippet = snippet.replace("%input_type%", inputType);
        snippet = snippet.replace("%input_pattern%", inputPattern);

        String displayState = getValue(w, item);
        State state = itemUIRegistry.getState(w);

        String prefix = getPrefix(w, item);
        String postfix = getPostfix(w, item);
        String prefixSnippet = !prefix.isBlank()
                ? "<span %valuestyle% class=\"mdl-form__input-prefix\">" + prefix + "</span>"
                : "";
        String postfixSnippet = !postfix.isBlank()
                ? "<span %valuestyle% class=\"mdl-form__input-postfix\">" + postfix + "</span>"
                : "";
        snippet = snippet.replace("%prefix_snippet%", prefixSnippet);
        snippet = snippet.replace("%postfix_snippet%", postfixSnippet);

        String undefState = "";
        if (state == null || state instanceof UnDefType) {
            if ("number".equals(inputHint)) {
                String[] stateArray = displayState.split(" ");
                undefState = stateArray.length > 0 ? stateArray[0] : undefState;
            } else if (!("date".equals(inputHint) || "time".equals(inputHint) || "datetime".equals(inputHint))) {
                undefState = displayState;
            }
        }
        snippet = snippet.replace("%undef_state%", undefState);

        String dataState = "";
        String itemState = "";
        if ((state == null) || (state instanceof UnDefType)) {
            itemState = "";
        } else {
            itemState = state.toString();
            dataState = displayState;
            if ("number".equals(inputHint)) {
                String[] stateArray = dataState.trim().split(" ");
                dataState = parseNumber(stateArray[0]);
            } else if (state instanceof DateTimeType) {
                if ("date".equals(inputHint)) {
                    dataState = ((DateTimeType) state).format("%1$tY-%1$tm-%1$td");
                } else if ("time".equals(inputHint)) {
                    dataState = ((DateTimeType) state).format("%1$tR");
                } else if ("datetime".equals(inputHint)) {
                    dataState = ((DateTimeType) state).format("%1$tY-%1$tm-%1$tdT%1$tR");
                }
            }
        }
        snippet = snippet.replace("%data_state%", dataState);
        snippet = snippet.replace("%item_state%", itemState);

        String unitSnippet = "";
        String unit = "";
        if (item instanceof NumberItem) {
            NumberItem numberItem = (NumberItem) item;
            if (numberItem.getDimension() != null) {
                unit = getUnit(w, numberItem);
                if ("number".equals(inputHint)) {
                    unitSnippet = "<span %valuestyle% class=\"mdl-form__input-unit\">" + unit + "</span>";
                }
            }
        }
        snippet = snippet.replace("%item_unit%", unit);
        snippet = snippet.replace("%unit_snippet%", unitSnippet);

        // Process the color tags
        snippet = processColor(w, snippet);

        sb.append(snippet);

        return ECollections.emptyEList();
    }

    private String parseNumber(String value) {
        String newValue = value.trim();
        Matcher numberMatcher = NUMBER_PATTERN.matcher(newValue);
        if (numberMatcher.find()) {
            String numberValue = numberMatcher.group(0);
            String unitValue = newValue.substring(numberValue.length()).trim();
            newValue = numberValue.replace("/^\\+/", "");
            if (COMMA_SEPARATOR_PATTERN.matcher(newValue).find()) {
                newValue = newValue.replace("/\\./g", "").replace(",", ".");
            }
            if (unitValue.length() > 0) {
                newValue = newValue + " " + unitValue;
            }
            return newValue;
        } else {
            return value;
        }
    }

    private String getValue(Widget w, Item item) {
        String value = cleanValue(getValue(w), w, item);
        if (value.isBlank()) {
            State state = itemUIRegistry.getState(w);
            if (state != null && !(state instanceof UnDefType)) {
                value = state.toString();
            } else {
                value = "-";
            }
        }
        if (item instanceof NumberItem) {
            NumberItem numberItem = (NumberItem) item;
            if (numberItem.getDimension() != null) {
                String[] stateArray = value.split(" ");
                if (stateArray.length <= 1) {
                    value = (stateArray.length > 0 ? stateArray[0] : value) + " " + getUnit(w, numberItem);
                }
            }
        }
        return value;
    }

    private String cleanValue(String value, Widget w, Item item) {
        String prefix = getPrefix(w, item);
        String postfix = getPostfix(w, item);
        String newValue = value.startsWith(prefix) ? value.substring(prefix.length()) : value;
        newValue = value.endsWith(postfix) ? newValue.substring(0, newValue.lastIndexOf(postfix)) : newValue;
        return newValue.trim();
    }

    private String getUnit(Widget w, NumberItem item) {
        String unit = "";
        if (w.getLabel() != null) {
            unit = getUnitFromLabel(item, w.getLabel());
        }
        // required when item is defined through UI and the label contains the value format pattern
        if ((unit != null) && unit.isBlank() && (item.getLabel() != null)) {
            unit = getUnitFromLabel(item, item.getLabel());
        }
        // required when the value pattern is in the state description (text definition or meta data)
        if ((unit != null) && unit.isBlank()) {
            StateDescription stateDescription = item.getStateDescription();
            if (stateDescription != null) {
                String pattern = stateDescription.getPattern();
                if (pattern != null) {
                    unit = getUnitFromLabel(item, "[" + pattern + "]");
                }
            }
        }
        if (unit == null || unit.isBlank()) {
            unit = item.getUnitSymbol();
        }
        unit = (unit == null) ? "" : unit;
        return unit;
    }

    private @Nullable String getUnitFromLabel(NumberItem item, @Nullable String label) {
        String unit = null;
        if (label != null && !label.isBlank()) {
            Matcher m = LABEL_PATTERN.matcher(label);
            if (m.matches()) {
                unit = m.group(3);
                if (unit != null) {
                    unit = unit.trim();
                }
            } else {
                unit = "";
            }
            if (UnitUtils.UNIT_PLACEHOLDER.equals(unit)) {
                unit = item.getUnitSymbol();
            }
            unit = "%%".equals(unit) ? "%" : unit;
        }
        return unit;
    }

    private String getPrefix(Widget w, Item item) {
        if (w.getLabel() != null) {
            return getPrefixFromLabel(w.getLabel());
        } else if (item.getLabel() != null) {
            return getPrefixFromLabel(item.getLabel());
        } else {
            return "";
        }
    }

    private String getPrefixFromLabel(@Nullable String label) {
        if (label != null && !label.isBlank()) {
            Matcher m = LABEL_PATTERN.matcher(label);
            if (m.matches()) {
                String prefix = m.group(1);
                if (prefix != null && !prefix.isBlank()) {
                    return prefix;
                }
            }
        }
        return "";
    }

    private String getPostfix(Widget w, Item item) {
        boolean hasUnit = false;
        if (item instanceof NumberItem) {
            NumberItem numberItem = (NumberItem) item;
            if (numberItem.getDimension() != null) {
                hasUnit = true;
            }
        }
        if (w.getLabel() != null) {
            return getPostfixFromLabel(w.getLabel(), hasUnit);
        } else if (item.getLabel() != null) {
            return getPostfixFromLabel(item.getLabel(), hasUnit);
        } else {
            return "";
        }
    }

    private String getPostfixFromLabel(@Nullable String label, boolean hasUnit) {
        String postfix = "";
        if (label != null && !label.isBlank()) {
            Matcher m = LABEL_PATTERN.matcher(label);
            if (m.matches()) {
                if (!hasUnit && m.group(3) != null) {
                    postfix = m.group(3);
                }
                if (m.group(4) != null) {
                    postfix = postfix + m.group(4);
                }
            }
        }
        return postfix;
    }
}
