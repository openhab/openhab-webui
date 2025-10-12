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
package org.openhab.ui.habot.nlp.internal.skill;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.events.EventPublisher;
import org.openhab.core.hli.Intent;
import org.openhab.core.items.GroupItem;
import org.openhab.core.items.Item;
import org.openhab.core.items.events.ItemEventFactory;
import org.openhab.core.library.types.OnOffType;
import org.openhab.ui.habot.card.CardBuilder;
import org.openhab.ui.habot.nlp.AbstractItemIntentInterpreter;
import org.openhab.ui.habot.nlp.IntentInterpretation;
import org.openhab.ui.habot.nlp.ItemResolver;
import org.openhab.ui.habot.nlp.Skill;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Reference;

/**
 * This {@link Skill} deactivates objects - sends the OFF command to all matching items.
 *
 * @author Yannick Schaus - Initial contribution
 */
@NonNullByDefault
@org.osgi.service.component.annotations.Component(service = Skill.class)
public class DeactivateObjectSkill extends AbstractItemIntentInterpreter {

    private final CardBuilder cardBuilder;
    private final EventPublisher eventPublisher;

    @Activate
    public DeactivateObjectSkill(final @Reference ItemResolver itemResolver, final @Reference CardBuilder cardBuilder,
            final @Reference EventPublisher eventPublisher) {
        super(itemResolver);
        this.cardBuilder = cardBuilder;
        this.eventPublisher = eventPublisher;
    }

    @Override
    public String getIntentId() {
        return "deactivate-object";
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
            interpretation.setAnswer(answerFormatter.getRandomAnswer("nothing_deactivated"));
            interpretation.setHint(answerFormatter.getStandardTagHint(intent.getEntities()));
        } else {
            interpretation.setMatchedItems(matchedItems);

            // filter out the items which can't receive an OFF command
            List<Item> filteredItems = matchedItems.stream()
                    .filter(i -> !(i instanceof GroupItem) && i.getAcceptedCommandTypes().contains(OnOffType.class))
                    .collect(Collectors.toList());

            interpretation.setCard(cardBuilder.buildCard(intent, filteredItems));

            if (filteredItems.isEmpty()) {
                interpretation.setAnswer(answerFormatter.getRandomAnswer("nothing_deactivated"));
                interpretation.setHint(answerFormatter.getStandardTagHint(intent.getEntities()));
            } else if (filteredItems.size() == 1) {
                if (filteredItems.get(0).getState().equals(OnOffType.OFF)) {
                    interpretation.setAnswer(answerFormatter.getRandomAnswer("switch_already_off"));
                } else {
                    eventPublisher
                            .post(ItemEventFactory.createCommandEvent(filteredItems.get(0).getName(), OnOffType.OFF));
                    interpretation.setAnswer(answerFormatter.getRandomAnswer("switch_deactivated"));
                }
            } else {
                for (Item item : filteredItems) {
                    eventPublisher.post(ItemEventFactory.createCommandEvent(item.getName(), OnOffType.OFF));
                }
                interpretation.setAnswer(answerFormatter.getRandomAnswer("switches_deactivated",
                        Map.of("count", String.valueOf(filteredItems.size()))));
            }
        }

        return interpretation;
    }
}
