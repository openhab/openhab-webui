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

import java.util.Set;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.items.Item;
import org.openhab.ui.habot.card.CardBuilder;
import org.openhab.ui.habot.nlp.AbstractItemIntentInterpreter;
import org.openhab.ui.habot.nlp.Intent;
import org.openhab.ui.habot.nlp.IntentInterpretation;
import org.openhab.ui.habot.nlp.ItemResolver;
import org.openhab.ui.habot.nlp.Skill;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Reference;

/**
 * This {@link Skill} is used to show the status of objects to the user - builds or retrieves a card with the matching
 * items with the {@link CardBuilder}.
 *
 * @author Yannick Schaus - Initial contribution
 */
@NonNullByDefault
@org.osgi.service.component.annotations.Component(service = Skill.class, immediate = true)
public class GetStatusSkill extends AbstractItemIntentInterpreter {

    private final CardBuilder cardBuilder;

    @Activate
    public GetStatusSkill(final @Reference ItemResolver itemResolver, final @Reference CardBuilder cardBuilder) {
        super(itemResolver);
        this.cardBuilder = cardBuilder;
    }

    @Override
    public String getIntentId() {
        return "get-status";
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
            interpretation.setCard(cardBuilder.buildCard(intent, matchedItems));
            interpretation.setAnswer(answerFormatter.getRandomAnswer("info_found_simple"));
        }

        return interpretation;
    }
}
