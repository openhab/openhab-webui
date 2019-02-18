/**
 * Copyright (c) 2010-2018 by the respective copyright holders.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habot.nlp.internal.skill;

import org.openhab.ui.habot.card.Card;
import org.openhab.ui.habot.nlp.AbstractItemIntentInterpreter;
import org.openhab.ui.habot.nlp.Intent;
import org.openhab.ui.habot.nlp.IntentInterpretation;
import org.openhab.ui.habot.nlp.Skill;

/**
 * This {@link Skill} is used to reply with a HbCreateRuleCard
 *
 * @author Yannick Schaus
 */
@org.osgi.service.component.annotations.Component(service = Skill.class)
public class CreateRuleSkill extends AbstractItemIntentInterpreter {

    @Override
    public String getIntentId() {
        return "create-rule";
    }

    @Override
    public IntentInterpretation interpret(Intent intent, String language) {
        IntentInterpretation interpretation = new IntentInterpretation();
        Card card = new Card("HbCreateRuleCard");
        // TODO: try to parse a day/time to pre-configure the new rule card
        interpretation.setAnswer(answerFormatter.getRandomAnswer("answer_create_rule"));
        interpretation.setCard(card);
        return interpretation;
    }

}
