/**
 * Copyright (c) 2010-2019 Contributors to the openHAB project
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
import java.util.Set;
import java.util.stream.Collectors;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.smarthome.core.events.EventPublisher;
import org.eclipse.smarthome.core.items.GroupItem;
import org.eclipse.smarthome.core.items.Item;
import org.eclipse.smarthome.core.items.events.ItemEventFactory;
import org.eclipse.smarthome.core.library.types.OnOffType;
import org.eclipse.smarthome.core.voice.text.Intent;
import org.eclipse.smarthome.core.voice.text.InterpretationException;
import org.eclipse.smarthome.core.voice.text.InterpretationResult;
import org.eclipse.smarthome.core.voice.text.ItemResolver;
import org.openhab.ui.habot.nlp.AbstractItemIntentInterpreter;
import org.openhab.ui.habot.nlp.AnswerFormatter;
import org.openhab.ui.habot.nlp.CardBuilder;
import org.openhab.ui.habot.nlp.Skill;
import org.osgi.service.component.annotations.Reference;

import com.google.common.collect.ImmutableMap;

/**
 * This {@link Skill} activates objects - sends the ON command to all matching items.
 *
 * @author Yannick Schaus - Initial contribution
 * @author Laurent Garnier - consider extended Skill interface + null annotations added
 */
@NonNullByDefault
@org.osgi.service.component.annotations.Component(service = Skill.class)
public class ActivateObjectSkill extends AbstractItemIntentInterpreter {

    private @NonNullByDefault({}) CardBuilder cardBuilder;
    private @NonNullByDefault({}) EventPublisher eventPublisher;

    @Override
    public String getIntentId() {
        return "activate-object";
    }

    @Override
    public boolean isSuitableForChat() {
        return true;
    }

    @Override
    public boolean isSuitableForVoice() {
        return false;
    }

    @Override
    public String interpretForVoice(Intent intent, String language) throws InterpretationException {
        throw new InterpretationException("Voice control not yet supported by the HABot OpenNLP interpreter");
    }

    @Override
    public InterpretationResult interpretForChat(Intent intent, String language) throws InterpretationException {
        InterpretationResult interpretation = new InterpretationResult(language, intent);
        AnswerFormatter formatter = answerFormatter;
        if (formatter == null) {
            formatter = answerFormatter = new AnswerFormatter(language);
        }

        Set<Item> matchedItems = findItems(intent);

        if (intent.getEntities().isEmpty()) {
            interpretation.setAnswer(formatter.getRandomAnswer("general_failure"));
            return interpretation;
        }
        if (matchedItems.isEmpty()) {
            interpretation.setAnswer(formatter.getRandomAnswer("nothing_activated"));
            interpretation.setHint(formatter.getStandardTagHint(intent.getEntities()));
        } else {
            interpretation.setMatchedItems(matchedItems);

            // filter out the items which can't receive an ON command
            List<Item> filteredItems = matchedItems.stream()
                    .filter(i -> !(i instanceof GroupItem) && i.getAcceptedCommandTypes().contains(OnOffType.class))
                    .collect(Collectors.toList());

            interpretation.setCard(cardBuilder.buildCard(intent, filteredItems));

            if (filteredItems.isEmpty()) {
                interpretation.setAnswer(formatter.getRandomAnswer("nothing_activated"));
                interpretation.setHint(formatter.getStandardTagHint(intent.getEntities()));
            } else if (filteredItems.size() == 1) {
                if (filteredItems.get(0).getState().equals(OnOffType.ON)) {
                    interpretation.setAnswer(formatter.getRandomAnswer("switch_already_on"));
                } else {
                    eventPublisher
                            .post(ItemEventFactory.createCommandEvent(filteredItems.get(0).getName(), OnOffType.ON));
                    interpretation.setAnswer(formatter.getRandomAnswer("switch_activated"));
                }
            } else {
                for (Item item : filteredItems) {
                    eventPublisher.post(ItemEventFactory.createCommandEvent(item.getName(), OnOffType.ON));
                }
                interpretation.setAnswer(formatter.getRandomAnswer("switches_activated",
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
