/**
 * Copyright (c) 2010-2018 by the respective copyright holders.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habot.nlp.internal.skill;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Set;
import java.util.stream.Collectors;

import org.eclipse.smarthome.core.items.Item;
import org.eclipse.smarthome.core.persistence.HistoricItem;
import org.eclipse.smarthome.core.transform.TransformationException;
import org.eclipse.smarthome.core.transform.TransformationHelper;
import org.eclipse.smarthome.core.types.State;
import org.eclipse.smarthome.core.types.StateDescription;
import org.eclipse.smarthome.model.persistence.extensions.PersistenceExtensions;
import org.openhab.ui.habot.card.Card;
import org.openhab.ui.habot.card.Component;
import org.openhab.ui.habot.card.internal.CardRegistry;
import org.openhab.ui.habot.nlp.AbstractItemIntentInterpreter;
import org.openhab.ui.habot.nlp.Intent;
import org.openhab.ui.habot.nlp.IntentInterpretation;
import org.openhab.ui.habot.nlp.ItemResolver;
import org.openhab.ui.habot.nlp.Skill;
import org.osgi.framework.FrameworkUtil;
import org.osgi.service.component.annotations.Reference;

/**
 * This {@link Skill} tries to retrieves when the matching item (only supports a single item for now) was changed and
 * displays a card with an HbTimeline component.
 *
 * @author Yannick Schaus
 */
@org.osgi.service.component.annotations.Component(service = Skill.class)
public class HistoryLastChangesSkill extends AbstractItemIntentInterpreter {

    private CardRegistry cardRegistry;

    @Override
    public String getIntentId() {
        return "get-history-last-changes";
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
            return interpretation;
        }

        Set<String> tags = intent.getEntities().entrySet().stream().map(e -> e.getKey() + ":" + e.getValue())
                .collect(Collectors.toSet());

        Card card = new Card("HbCard");
        card.addTags(tags);
        card.updateTimestamp();
        card.setEphemeral(true);
        card.setAddToDeckDenied(true);

        Component timeline = new Component("HbTimeline");

        if (matchedItems.size() == 1) {
            Item item = matchedItems.stream().findFirst().get();
            HistoricItem historicItem = PersistenceExtensions.previousState(item, false); // TODO figure out a solution
                                                                                          // for rrd4j

            if (historicItem == null) {
                interpretation.setAnswer(answerFormatter.getRandomAnswer("answer_nothing_found"));
                interpretation.setHint(answerFormatter.getRandomAnswer("no_historical_data"));
                return interpretation;
            }

            card.setTitle(item.getLabel());
            card.setSubtitle(item.getName());

            DateFormat dateFormat = new SimpleDateFormat();
            Component pastTimelineEntry = new Component("HbTimelineEntry");
            pastTimelineEntry.addConfig("title", formatState(item, historicItem.getState()));
            pastTimelineEntry.addConfig("subtitle", dateFormat.format(historicItem.getTimestamp()));
            timeline.addComponent("main", pastTimelineEntry);

            Component nowTimelineEntry = new Component("HbTimelineEntry");
            nowTimelineEntry.addConfig("title", formatState(item, historicItem.getState()));
            nowTimelineEntry.addConfig("subtitle", dateFormat.format(new Date()));
            timeline.addComponent("main", nowTimelineEntry);
        } else {
            interpretation.setAnswer(answerFormatter.getRandomAnswer("multiple_items_error"));
            return interpretation;
        }

        card.addComponent("main", timeline);

        this.cardRegistry.add(card);

        interpretation.setAnswer(answerFormatter.getRandomAnswer("info_found_simple"));
        interpretation.setCard(card);
        return interpretation;
    }

    private String formatState(Item item, State state) {
        if (item.getStateDescription() != null) {
            StateDescription stateDescription = item.getStateDescription();
            if (stateDescription != null && stateDescription.getPattern() != null) {
                try {
                    String transformedState = TransformationHelper.transform(
                            FrameworkUtil.getBundle(HistoryLastChangesSkill.class).getBundleContext(),
                            stateDescription.getPattern(), state.toString());
                    if (transformedState != null && transformedState.equals(state.toString())) {
                        return state.format(stateDescription.getPattern());
                    } else {
                        return transformedState;
                    }
                } catch (NoClassDefFoundError | TransformationException ex) {
                    // TransformationHelper is optional dependency, so ignore if class not found
                    // return state as it is without transformation
                    return state.toString();
                }
            } else {
                return state.toString();
            }
        } else {
            return state.toString();
        }
    }

    @Reference
    protected void setItemResolver(ItemResolver itemResolver) {
        this.itemResolver = itemResolver;
    }

    protected void unsetItemResolver(ItemResolver itemResolver) {
        this.itemResolver = null;
    }

    @Reference
    protected void setCardRegistry(CardRegistry cardRegistry) {
        this.cardRegistry = cardRegistry;
    }

    protected void unsetCardRegistry(CardRegistry cardRegistry) {
        this.cardRegistry = null;
    }

}
