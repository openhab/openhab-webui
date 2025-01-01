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
package org.openhab.ui.habot.nlp.internal.skill;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.MissingResourceException;
import java.util.ResourceBundle;
import java.util.Set;
import java.util.stream.Collectors;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.events.EventPublisher;
import org.openhab.core.items.GroupItem;
import org.openhab.core.items.Item;
import org.openhab.core.items.events.ItemEventFactory;
import org.openhab.core.library.types.DecimalType;
import org.openhab.core.library.types.HSBType;
import org.openhab.core.library.types.PercentType;
import org.openhab.ui.habot.card.CardBuilder;
import org.openhab.ui.habot.nlp.AbstractItemIntentInterpreter;
import org.openhab.ui.habot.nlp.Intent;
import org.openhab.ui.habot.nlp.IntentInterpretation;
import org.openhab.ui.habot.nlp.ItemResolver;
import org.openhab.ui.habot.nlp.Skill;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Reference;

/**
 * This {@link Skill} sets the matching item(s) to the specified numerical value (for dimmers, thermostats etc.) or
 * color (for Color items).
 *
 * @author Yannick Schaus - Initial contribution
 */
@NonNullByDefault
@org.osgi.service.component.annotations.Component(service = Skill.class)
public class SetValueSkill extends AbstractItemIntentInterpreter {

    private final CardBuilder cardBuilder;
    private final EventPublisher eventPublisher;

    @Activate
    public SetValueSkill(final @Reference ItemResolver itemResolver, final @Reference CardBuilder cardBuilder,
            final @Reference EventPublisher eventPublisher) {
        super(itemResolver);
        this.cardBuilder = cardBuilder;
        this.eventPublisher = eventPublisher;
    }

    @Override
    public String getIntentId() {
        return "set-value";
    }

    @Override
    public @Nullable IntentInterpretation interpret(Intent intent, String language) {
        IntentInterpretation interpretation = new IntentInterpretation();

        Set<Item> matchedItems = findItems(intent);

        if (intent.getEntities().isEmpty()) {
            interpretation.setAnswer(answerFormatter.getRandomAnswer("general_failure"));
            return interpretation;
        }
        if (matchedItems.isEmpty()) {
            interpretation.setAnswer(answerFormatter.getRandomAnswer("answer_nothing_found"));
            interpretation.setHint(answerFormatter.getStandardTagHint(intent.getEntities()));
        } else {
            interpretation.setMatchedItems(matchedItems);

            String colorString = intent.getEntities().get("color");
            String valueString = intent.getEntities().get("value");
            if (colorString != null) {
                interpretSetColor(intent, language, interpretation, matchedItems, colorString);
            } else if (valueString != null) {
                interpretSetValue(intent, language, interpretation, matchedItems, valueString);
            } else {
                interpretation.setAnswer(answerFormatter.getRandomAnswer("value_misunderstood"));
            }
        }

        return interpretation;
    }

    private void interpretSetColor(Intent intent, String language, IntentInterpretation interpretation,
            Set<Item> matchedItems, String colorString) {
        // filter out the items which can't receive an HSB command
        List<Item> filteredItems = matchedItems.stream()
                .filter(i -> !(i instanceof GroupItem) && i.getAcceptedCommandTypes().contains(HSBType.class))
                .collect(Collectors.toList());

        String hsbValue;
        try {
            ResourceBundle colors = ResourceBundle.getBundle("colors", new Locale(language));
            hsbValue = colors.getString("color_" + colorString);
        } catch (MissingResourceException e) {
            interpretation
                    .setAnswer(answerFormatter.getRandomAnswer("set_color_unknown", Map.of("color", colorString)));
            return;
        }

        if (filteredItems.isEmpty()) {
            interpretation
                    .setAnswer(answerFormatter.getRandomAnswer("set_color_no_item", Map.of("color", colorString)));
            interpretation.setHint(answerFormatter.getStandardTagHint(intent.getEntities()));
        } else if (filteredItems.size() == 1) {
            interpretation.setCard(cardBuilder.buildCard(intent, filteredItems));
            eventPublisher
                    .post(ItemEventFactory.createCommandEvent(filteredItems.get(0).getName(), new HSBType(hsbValue)));
            interpretation.setAnswer(answerFormatter.getRandomAnswer("set_color_single", Map.of("color", colorString)));
        } else {
            interpretation.setCard(cardBuilder.buildCard(intent, filteredItems));
            for (Item item : filteredItems) {
                eventPublisher.post(ItemEventFactory.createCommandEvent(item.getName(), new HSBType(hsbValue)));
            }
            interpretation.setAnswer(answerFormatter.getRandomAnswer("set_color_multiple",
                    Map.of("count", String.valueOf(filteredItems.size()), "color", colorString)));
        }
    }

    private void interpretSetValue(Intent intent, String language, IntentInterpretation interpretation,
            Set<Item> matchedItems, String rawValue) {
        // Set a color
        String cleanedValue = rawValue.replaceAll("[^0-9\\.,]", "");

        // only consider items which can receive an DecimalType command - includes PercentType, HSBType
        List<Item> filteredItems = matchedItems.stream()
                .filter(i -> !(i instanceof GroupItem) && i.getAcceptedCommandTypes().contains(DecimalType.class)
                        || i.getAcceptedCommandTypes().contains(PercentType.class))
                .collect(Collectors.toList());

        if (filteredItems.isEmpty()) {
            interpretation.setAnswer(answerFormatter.getRandomAnswer("nothing_set_no_item", Map.of("value", rawValue)));
            interpretation.setHint(answerFormatter.getStandardTagHint(intent.getEntities()));
        } else if (filteredItems.size() == 1) {
            DecimalType value = (filteredItems.get(0).getAcceptedCommandTypes().contains(DecimalType.class))
                    ? DecimalType.valueOf(cleanedValue)
                    : PercentType.valueOf(cleanedValue);
            interpretation.setCard(cardBuilder.buildCard(intent, filteredItems));
            eventPublisher.post(ItemEventFactory.createCommandEvent(filteredItems.get(0).getName(), value));
            interpretation.setAnswer(answerFormatter.getRandomAnswer("set_value_single", Map.of("value", rawValue)));
        } else {
            interpretation.setCard(cardBuilder.buildCard(intent, filteredItems));
            for (Item item : filteredItems) {
                DecimalType value = (item.getAcceptedCommandTypes().contains(DecimalType.class))
                        ? DecimalType.valueOf(cleanedValue)
                        : PercentType.valueOf(cleanedValue);
                eventPublisher.post(ItemEventFactory.createCommandEvent(item.getName(), value));
            }
            interpretation.setAnswer(answerFormatter.getRandomAnswer("set_value_multiple",
                    Map.of("count", String.valueOf(filteredItems.size()), "value", rawValue)));
        }
    }
}
