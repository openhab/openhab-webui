/**
 * Copyright (c) 2010-2018 by the respective copyright holders.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habot.nlp.internal.skill;

import java.util.List;
import java.util.Locale;
import java.util.MissingResourceException;
import java.util.ResourceBundle;
import java.util.Set;
import java.util.stream.Collectors;

import org.eclipse.smarthome.core.events.EventPublisher;
import org.eclipse.smarthome.core.items.GroupItem;
import org.eclipse.smarthome.core.items.Item;
import org.eclipse.smarthome.core.items.events.ItemEventFactory;
import org.eclipse.smarthome.core.library.types.DecimalType;
import org.eclipse.smarthome.core.library.types.HSBType;
import org.eclipse.smarthome.core.library.types.PercentType;
import org.openhab.ui.habot.card.CardBuilder;
import org.openhab.ui.habot.nlp.AbstractItemIntentInterpreter;
import org.openhab.ui.habot.nlp.Intent;
import org.openhab.ui.habot.nlp.IntentInterpretation;
import org.openhab.ui.habot.nlp.ItemResolver;
import org.openhab.ui.habot.nlp.Skill;
import org.osgi.service.component.annotations.Reference;

import com.google.common.collect.ImmutableMap;

/**
 * This {@link Skill} sets the matching item(s) to the specified numerical value (for dimmers, thermostats etc.) or
 * color (for Color items).
 *
 * @author Yannick Schaus
 */
@org.osgi.service.component.annotations.Component(service = Skill.class)
public class SetValueSkill extends AbstractItemIntentInterpreter {

    private CardBuilder cardBuilder;
    private EventPublisher eventPublisher;

    @Override
    public String getIntentId() {
        return "set-value";
    }

    @Override
    public IntentInterpretation interpret(Intent intent, String language) {
        IntentInterpretation interpretation = new IntentInterpretation();

        Set<Item> matchedItems = findItems(intent);

        if (intent.getEntities().isEmpty()) {
            interpretation.setAnswer(answerFormatter.getRandomAnswer("general_failure"));
            return interpretation;
        }
        if (matchedItems == null || matchedItems.isEmpty()) {
            interpretation.setAnswer(answerFormatter.getRandomAnswer("answer_nothing_found"));
            interpretation.setHint(answerFormatter.getStandardTagHint(intent.getEntities()));
        } else {
            interpretation.setMatchedItems(matchedItems);

            if (intent.getEntities().containsKey("color")) {
                interpretSetColor(intent, language, interpretation, matchedItems);
            } else if (intent.getEntities().containsKey("value")) {
                interpretSetValue(intent, language, interpretation, matchedItems);
            } else {
                interpretation.setAnswer(answerFormatter.getRandomAnswer("value_misunderstood"));
            }
        }

        return interpretation;
    }

    private void interpretSetColor(Intent intent, String language, IntentInterpretation interpretation,
            Set<Item> matchedItems) {
        String colorString = intent.getEntities().get("color");

        // filter out the items which can't receive an HSB command
        List<Item> filteredItems = matchedItems.stream()
                .filter(i -> !(i instanceof GroupItem) && i.getAcceptedCommandTypes().contains(HSBType.class))
                .collect(Collectors.toList());

        String hsbValue;
        try {
            ResourceBundle colors = ResourceBundle.getBundle("colors", new Locale(language));
            hsbValue = colors.getString("color_" + colorString);
        } catch (MissingResourceException e) {
            interpretation.setAnswer(
                    answerFormatter.getRandomAnswer("set_color_unknown", ImmutableMap.of("color", colorString)));
            return;
        }

        if (filteredItems.isEmpty()) {
            interpretation.setAnswer(
                    answerFormatter.getRandomAnswer("set_color_no_item", ImmutableMap.of("color", colorString)));
            interpretation.setHint(answerFormatter.getStandardTagHint(intent.getEntities()));
        } else if (filteredItems.size() == 1) {
            interpretation.setCard(cardBuilder.buildCard(intent, filteredItems));
            eventPublisher
                    .post(ItemEventFactory.createCommandEvent(filteredItems.get(0).getName(), new HSBType(hsbValue)));
            interpretation.setAnswer(
                    answerFormatter.getRandomAnswer("set_color_single", ImmutableMap.of("color", colorString)));
        } else {
            interpretation.setCard(cardBuilder.buildCard(intent, filteredItems));
            for (Item item : filteredItems) {
                eventPublisher.post(ItemEventFactory.createCommandEvent(item.getName(), new HSBType(hsbValue)));
            }
            interpretation.setAnswer(answerFormatter.getRandomAnswer("set_color_multiple",
                    ImmutableMap.of("count", String.valueOf(filteredItems.size()), "color", colorString)));
        }
    }

    private void interpretSetValue(Intent intent, String language, IntentInterpretation interpretation,
            Set<Item> matchedItems) {

        String rawValue = intent.getEntities().get("value");

        // Set a color
        String cleanedValue = rawValue.replaceAll("[^0-9\\.,]", "");

        // only consider items which can receive an DecimalType command - includes PercentType, HSBType
        List<Item> filteredItems = matchedItems.stream()
                .filter(i -> !(i instanceof GroupItem) && i.getAcceptedCommandTypes().contains(DecimalType.class)
                        || i.getAcceptedCommandTypes().contains(PercentType.class))
                .collect(Collectors.toList());

        if (filteredItems.isEmpty()) {
            interpretation.setAnswer(
                    answerFormatter.getRandomAnswer("nothing_set_no_item", ImmutableMap.of("value", rawValue)));
            interpretation.setHint(answerFormatter.getStandardTagHint(intent.getEntities()));
        } else if (filteredItems.size() == 1) {
            DecimalType value = (filteredItems.get(0).getAcceptedCommandTypes().contains(DecimalType.class))
                    ? DecimalType.valueOf(cleanedValue)
                    : PercentType.valueOf(cleanedValue);
            interpretation.setCard(cardBuilder.buildCard(intent, filteredItems));
            eventPublisher.post(ItemEventFactory.createCommandEvent(filteredItems.get(0).getName(), value));
            interpretation
                    .setAnswer(answerFormatter.getRandomAnswer("set_value_single", ImmutableMap.of("value", rawValue)));
        } else {
            interpretation.setCard(cardBuilder.buildCard(intent, filteredItems));
            for (Item item : filteredItems) {
                DecimalType value = (item.getAcceptedCommandTypes().contains(DecimalType.class))
                        ? DecimalType.valueOf(cleanedValue)
                        : PercentType.valueOf(cleanedValue);
                eventPublisher.post(ItemEventFactory.createCommandEvent(item.getName(), value));
            }
            interpretation.setAnswer(answerFormatter.getRandomAnswer("set_value_multiple",
                    ImmutableMap.of("count", String.valueOf(filteredItems.size()), "value", rawValue)));
        }
    }

    @Reference
    protected void setCardBuilder(CardBuilder cardBuilder) {
        this.cardBuilder = cardBuilder;
    }

    protected void unsetCardBuilder(CardBuilder cardBuilder) {
        this.cardBuilder = null;
    }

    @Reference
    protected void setItemResolver(ItemResolver itemResolver) {
        this.itemResolver = itemResolver;
    }

    protected void unsetItemResolver(ItemResolver itemResolver) {
        this.itemResolver = null;
    }

    @Reference
    protected void setEventPublisher(EventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    protected void unsetEventPublisher(EventPublisher eventPublisher) {
        this.eventPublisher = null;
    }
}
