/**
 * Copyright (c) 2010-2023 Contributors to the openHAB project
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

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Set;
import java.util.stream.Collectors;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.items.Item;
import org.openhab.core.persistence.HistoricItem;
import org.openhab.core.persistence.extensions.PersistenceExtensions;
import org.openhab.core.transform.TransformationException;
import org.openhab.core.transform.TransformationHelper;
import org.openhab.core.types.State;
import org.openhab.core.types.StateDescription;
import org.openhab.ui.habot.card.Card;
import org.openhab.ui.habot.card.Component;
import org.openhab.ui.habot.card.internal.CardRegistry;
import org.openhab.ui.habot.nlp.AbstractItemIntentInterpreter;
import org.openhab.ui.habot.nlp.Intent;
import org.openhab.ui.habot.nlp.IntentInterpretation;
import org.openhab.ui.habot.nlp.ItemResolver;
import org.openhab.ui.habot.nlp.Skill;
import org.osgi.framework.FrameworkUtil;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Reference;

/**
 * This {@link Skill} tries to retrieves when the matching item (only supports a single item for now) was changed and
 * displays a card with an HbTimeline component.
 *
 * @author Yannick Schaus - Initial contribution
 */
@NonNullByDefault
@org.osgi.service.component.annotations.Component(service = Skill.class)
public class HistoryLastChangesSkill extends AbstractItemIntentInterpreter {

    private final CardRegistry cardRegistry;

    @Activate
    public HistoryLastChangesSkill(final @Reference ItemResolver itemResolver,
            final @Reference CardRegistry cardRegistry) {
        super(itemResolver);
        this.cardRegistry = cardRegistry;
    }

    @Override
    public String getIntentId() {
        return "get-history-last-changes";
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
            return interpretation;
        }

        Set<String> tags = (Set<String>) intent.getEntities().entrySet().stream()
                .map(e -> e.getKey() + ":" + e.getValue()).collect(Collectors.toSet());

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

    private @Nullable String formatState(Item item, State state) {
        if (item.getStateDescription() != null) {
            StateDescription stateDescription = item.getStateDescription();
            if (stateDescription != null) {
                final String pattern = stateDescription.getPattern();
                if (pattern != null) {
                    try {
                        String transformedState = TransformationHelper.transform(
                                FrameworkUtil.getBundle(HistoryLastChangesSkill.class).getBundleContext(), pattern,
                                state.toString());
                        if (transformedState != null && transformedState.equals(state.toString())) {
                            return state.format(pattern);
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
        } else {
            return state.toString();
        }
    }
}
