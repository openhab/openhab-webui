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

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.hli.Card;
import org.openhab.core.hli.Intent;
import org.openhab.ui.habot.nlp.AbstractItemIntentInterpreter;
import org.openhab.ui.habot.nlp.IntentInterpretation;
import org.openhab.ui.habot.nlp.ItemResolver;
import org.openhab.ui.habot.nlp.Skill;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Reference;

/**
 * This {@link Skill} is used to reply with a HbCreateRuleCard
 *
 * @author Yannick Schaus - Initial contribution
 */
@NonNullByDefault
@org.osgi.service.component.annotations.Component(service = Skill.class)
public class CreateRuleSkill extends AbstractItemIntentInterpreter {

    @Activate
    public CreateRuleSkill(final @Reference ItemResolver itemResolver) {
        super(itemResolver);
    }

    @Override
    public String getIntentId() {
        return "create-rule";
    }

    @Override
    public @Nullable IntentInterpretation interpret(Intent intent, String language) {
        IntentInterpretation interpretation = new IntentInterpretation();
        Card card = new Card("HbCreateRuleCard");
        // TODO: try to parse a day/time to pre-configure the new rule card
        interpretation.setAnswer(answerFormatter.getRandomAnswer("answer_create_rule"));
        interpretation.setCard(card);
        return interpretation;
    }
}
