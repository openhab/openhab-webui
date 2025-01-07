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

import java.math.BigDecimal;
import java.util.Objects;

import javax.measure.Unit;

import org.eclipse.emf.common.util.ECollections;
import org.eclipse.emf.common.util.EList;
import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.i18n.LocaleProvider;
import org.openhab.core.i18n.TranslationProvider;
import org.openhab.core.items.Item;
import org.openhab.core.items.ItemNotFoundException;
import org.openhab.core.library.CoreItemFactory;
import org.openhab.core.library.types.QuantityType;
import org.openhab.core.library.unit.Units;
import org.openhab.core.model.sitemap.sitemap.Colortemperaturepicker;
import org.openhab.core.model.sitemap.sitemap.Widget;
import org.openhab.core.thing.DefaultSystemChannelTypeProvider;
import org.openhab.core.types.State;
import org.openhab.core.types.StateDescription;
import org.openhab.core.types.util.UnitUtils;
import org.openhab.core.ui.items.ItemUIRegistry;
import org.openhab.core.util.ColorUtil;
import org.openhab.ui.basic.render.RenderException;
import org.openhab.ui.basic.render.WidgetRenderer;
import org.osgi.framework.BundleContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * <p>
 * This is an implementation of the {@link WidgetRenderer} interface, which can produce HTML code for
 * Colortemperaturepicker widgets.
 *
 * @author Laurent Garnier - Initial contribution
 */
@Component(service = WidgetRenderer.class)
@NonNullByDefault
public class ColortemppickerRenderer extends AbstractWidgetRenderer {

    private static final BigDecimal MIN_TEMPERATURE_KELVIN = Objects.requireNonNull(Objects
            .requireNonNull(DefaultSystemChannelTypeProvider.SYSTEM_COLOR_TEMPERATURE_ABS.getState()).getMinimum());
    private static final BigDecimal MAX_TEMPERATURE_KELVIN = Objects.requireNonNull(Objects
            .requireNonNull(DefaultSystemChannelTypeProvider.SYSTEM_COLOR_TEMPERATURE_ABS.getState()).getMaximum());
    private static final double GRADIENT_INCREMENT_PERCENT = 2.5;

    private final Logger logger = LoggerFactory.getLogger(ColortemppickerRenderer.class);

    @Activate
    public ColortemppickerRenderer(final BundleContext bundleContext, final @Reference TranslationProvider i18nProvider,
            final @Reference ItemUIRegistry itemUIRegistry, final @Reference LocaleProvider localeProvider) {
        super(bundleContext, i18nProvider, itemUIRegistry, localeProvider);
    }

    @Override
    public boolean canRender(Widget w) {
        return w instanceof Colortemperaturepicker;
    }

    @Override
    public EList<Widget> renderWidget(Widget w, StringBuilder sb, String sitemap) throws RenderException {
        Colortemperaturepicker ctp = (Colortemperaturepicker) w;

        BigDecimal currentK = null;
        String currentRGB = null;
        Unit<?> unit = UnitUtils.parseUnit(getUnitForWidget(w));
        BigDecimal minK = MIN_TEMPERATURE_KELVIN;
        BigDecimal maxK = MAX_TEMPERATURE_KELVIN;
        String[] colorsRGB = null;
        String itemType = null;
        String itemName = w.getItem();
        if (itemName != null) {
            try {
                Item item = itemUIRegistry.getItem(itemName);
                itemType = item.getType();
                if ((CoreItemFactory.NUMBER + ":Temperature").equals(itemType)) {
                    State state = itemUIRegistry.getState(w);
                    if (state instanceof QuantityType<?> quantity) {
                        if (unit == null) {
                            unit = quantity.getUnit();
                        }
                        quantity = quantity.toInvertibleUnit(Units.KELVIN);
                        if (quantity != null) {
                            currentK = quantity.toBigDecimal();
                            try {
                                int[] rgb = ColorUtil
                                        .hsbToRgb(ColorUtil.xyToHsb(ColorUtil.kelvinToXY(currentK.doubleValue())));
                                logger.debug("Current {} K => RGB {} {} {}", currentK, rgb[0], rgb[1], rgb[2]);
                                currentRGB = "#%02x%02x%02x".formatted(rgb[0], rgb[1], rgb[2]);
                            } catch (IllegalArgumentException | IndexOutOfBoundsException e) {
                                logger.debug("Can't get RGB for {} Kelvin, bypassing color gradient!", currentK);
                            }
                        }
                    }
                    if (unit == Units.KELVIN || unit == Units.MIRED) {
                        minK = getMinimumInKelvin(ctp, unit, item.getStateDescription());
                        maxK = getMaximumInKelvin(ctp, unit, item.getStateDescription());
                        logger.debug("ColortemppickerRenderer current={} unit={} min={} max={}", currentK, unit, minK,
                                maxK);

                        double valueKelvin = 0d;
                        try {
                            colorsRGB = new String[(int) Math.round(100 / GRADIENT_INCREMENT_PERCENT) + 1];
                            for (int i = 0; Math.round(i * GRADIENT_INCREMENT_PERCENT) <= 100; i++) {
                                valueKelvin = (maxK.doubleValue() - minK.doubleValue()) * i * GRADIENT_INCREMENT_PERCENT
                                        / 100.0 + minK.doubleValue();
                                int[] rgb = ColorUtil.hsbToRgb(ColorUtil.xyToHsb(ColorUtil.kelvinToXY(valueKelvin)));
                                logger.debug("Gradient {}%: {} K => RGB {} {} {}", i * GRADIENT_INCREMENT_PERCENT,
                                        valueKelvin, rgb[0], rgb[1], rgb[2]);
                                colorsRGB[i] = "#%02x%02x%02x".formatted(rgb[0], rgb[1], rgb[2]);
                            }
                        } catch (IllegalArgumentException | IndexOutOfBoundsException e) {
                            logger.debug("Can't get RGB for {} Kelvin, bypassing color gradient!", valueKelvin);
                            colorsRGB = null;
                        }
                    } else {
                        logger.warn("Invalid unit {} for Colortemperaturepicker element", unit);
                    }
                } else {
                    logger.warn("Invalid item type {} for Colortemperaturepicker element", itemType);
                }
            } catch (ItemNotFoundException e) {
            }
        }

        String snippet = getSnippet((CoreItemFactory.NUMBER + ":Temperature").equals(itemType)
                && (unit == Units.KELVIN || unit == Units.MIRED) ? "colortemppicker" : "text");

        snippet = preprocessSnippet(snippet, w, true);
        snippet = snippet.replace("%currentKelvin%", currentK == null ? "" : String.valueOf(currentK.doubleValue()));
        snippet = snippet.replace("%currentRGB%", currentRGB == null ? "" : currentRGB);
        snippet = snippet.replace("%minValue%", String.valueOf(minK.doubleValue()));
        snippet = snippet.replace("%maxValue%", String.valueOf(maxK.doubleValue()));
        snippet = snippet.replace("%gradientColors%", colorsRGB == null ? "" : String.join(",", colorsRGB));

        // Process the color tags
        snippet = processColor(w, snippet);

        sb.append(snippet);
        return ECollections.emptyEList();
    }

    private BigDecimal getMinimumInKelvin(Colortemperaturepicker widget, Unit<?> widgetUnit,
            @Nullable StateDescription stateDescription) {
        BigDecimal min = null;
        BigDecimal val;
        if (widgetUnit == Units.KELVIN) {
            min = widget.getMinValue();
        } else {
            val = widget.getMaxValue();
            QuantityType<?> quantity = val == null ? null
                    : QuantityType.valueOf(val.doubleValue(), Units.MIRED).toInvertibleUnit(Units.KELVIN);
            min = quantity == null ? null : quantity.toBigDecimal();
        }
        // Search the min in the item state description if not defined in the widget
        if (min == null && stateDescription != null) {
            if (isUnitInKelvin(stateDescription)) {
                min = stateDescription.getMinimum();
            } else {
                val = stateDescription.getMaximum();
                QuantityType<?> quantity = val == null ? null
                        : QuantityType.valueOf(val.doubleValue(), Units.MIRED).toInvertibleUnit(Units.KELVIN);
                min = quantity == null ? null : quantity.toBigDecimal();
            }
        }
        return min != null ? min : MIN_TEMPERATURE_KELVIN;
    }

    private BigDecimal getMaximumInKelvin(Colortemperaturepicker widget, Unit<?> widgetUnit,
            @Nullable StateDescription stateDescription) {
        BigDecimal max = null;
        BigDecimal val;
        if (widgetUnit == Units.KELVIN) {
            max = widget.getMaxValue();
        } else {
            val = widget.getMinValue();
            QuantityType<?> quantity = val == null ? null
                    : QuantityType.valueOf(val.doubleValue(), Units.MIRED).toInvertibleUnit(Units.KELVIN);
            max = quantity == null ? null : quantity.toBigDecimal();
        }
        // Search the max in the item state description if not defined in the widget
        if (max == null && stateDescription != null) {
            if (isUnitInKelvin(stateDescription)) {
                max = stateDescription.getMaximum();
            } else {
                val = stateDescription.getMinimum();
                QuantityType<?> quantity = val == null ? null
                        : QuantityType.valueOf(val.doubleValue(), Units.MIRED).toInvertibleUnit(Units.KELVIN);
                max = quantity == null ? null : quantity.toBigDecimal();
            }
        }
        return max != null ? max : MAX_TEMPERATURE_KELVIN;
    }

    private boolean isUnitInKelvin(StateDescription stateDescription) {
        // Using the pattern to determine the unit of min/max is not fully reliable
        // because the user can override the pattern and set a different unit than
        // the one defined by binding developer at channel level.
        // So we consider the values of min/max to determine the unit of the range.
        // If values are lower than 1000, we assume values are in mirek.
        // If values are greater than 1000, we assume values are in Kelvin.
        boolean inKelvin;
        BigDecimal min = stateDescription.getMinimum();
        BigDecimal max = stateDescription.getMaximum();
        if (min != null) {
            inKelvin = min.doubleValue() >= MIN_TEMPERATURE_KELVIN.doubleValue();
        } else if (max != null) {
            inKelvin = max.doubleValue() > MIN_TEMPERATURE_KELVIN.doubleValue();
        } else {
            // If no pattern or pattern with no unit, assume unit is Kelvin
            Unit<?> unit = UnitUtils.parseUnit(stateDescription.getPattern());
            inKelvin = unit == null || unit == Units.KELVIN;
        }
        return inKelvin;
    }
}
