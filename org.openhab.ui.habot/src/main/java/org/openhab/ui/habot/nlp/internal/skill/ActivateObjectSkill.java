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
import java.util.Set;
import java.util.stream.Collectors;

import org.eclipse.smarthome.core.events.EventPublisher;
import org.eclipse.smarthome.core.items.GroupItem;
import org.eclipse.smarthome.core.items.Item;
import org.eclipse.smarthome.core.items.events.ItemEventFactory;
import org.eclipse.smarthome.core.library.types.OnOffType;
import org.openhab.ui.habot.card.CardBuilder;
import org.openhab.ui.habot.nlp.AbstractItemIntentInterpreter;
import org.openhab.ui.habot.nlp.Intent;
import org.openhab.ui.habot.nlp.IntentInterpretation;
import org.openhab.ui.habot.nlp.ItemResolver;
import org.openhab.ui.habot.nlp.Skill;
import org.osgi.service.component.annotations.Reference;

import com.google.common.collect.ImmutableMap;

/**
 * This {@link Skill} activates objects - sends the ON command to all matching items.
 *
 * @author Yannick Schaus
 */
@org.osgi.service.component.annotations.Component(service = Skill.class)
public class ActivateObjectSkill extends AbstractItemIntentInterpreter {

    private CardBuilder cardBuilder;
    private EventPublisher eventPublisher;

    @Override
    public String getIntentId() {
        return "activate-object";
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
            interpretation.setAnswer(answerFormatter.getRandomAnswer("nothing_activated"));
            interpretation.setHint(answerFormatter.getStandardTagHint(intent.getEntities()));
        } else {
            interpretation.setMatchedItems(matchedItems);

            // filter out the items which can't receive an ON command
            List<Item> filteredItems = matchedItems.stream()
                    .filter(i -> !(i instanceof GroupItem) && i.getAcceptedCommandTypes().contains(OnOffType.class))
                    .collect(Collectors.toList());

            interpretation.setCard(cardBuilder.buildCard(intent, filteredItems));

            if (filteredItems.isEmpty()) {
                interpretation.setAnswer(answerFormatter.getRandomAnswer("nothing_activated"));
                interpretation.setHint(answerFormatter.getStandardTagHint(intent.getEntities()));
            } else if (filteredItems.size() == 1) {
                if (filteredItems.get(0).getState().equals(OnOffType.ON)) {
                    interpretation.setAnswer(answerFormatter.getRandomAnswer("switch_already_on"));
                } else {
                    eventPublisher
                            .post(ItemEventFactory.createCommandEvent(filteredItems.get(0).getName(), OnOffType.ON));
                    interpretation.setAnswer(answerFormatter.getRandomAnswer("switch_activated"));
                }
            } else {
                for (Item item : filteredItems) {
                    eventPublisher.post(ItemEventFactory.createCommandEvent(item.getName(), OnOffType.ON));
                }
                interpretation.setAnswer(answerFormatter.getRandomAnswer("switches_activated",
                        ImmutableMap.of("count", String.valueOf(filteredItems.size()))));
            }
        }

        return interpretation;
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
