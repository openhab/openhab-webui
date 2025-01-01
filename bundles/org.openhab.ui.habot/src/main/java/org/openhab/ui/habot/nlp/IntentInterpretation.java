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
package org.openhab.ui.habot.nlp;

import java.util.Collection;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.items.Item;
import org.openhab.ui.habot.card.Card;

/**
 * A intent interpretation is the result of the interpretation of an {@link Intent} by a {@link Skill}.
 * It contains a natural language answer, an optional "hint" (second line of the answer), and a {@link Card} to present
 * to the user.
 *
 * @author Yannick Schaus - Initial contribution
 */
@NonNullByDefault
public class IntentInterpretation {

    @Nullable
    String answer;
    @Nullable
    String hint;

    @Nullable
    Collection<Item> matchedItems;

    @Nullable
    Card card;

    /**
     * Retrieves the items matched as part of the interpretation.
     *
     * @return the collection of matched items
     */
    public @Nullable Collection<Item> getMatchedItems() {
        return matchedItems;
    }

    /**
     * Sets the collection of items matched as part of the interpretation.
     *
     * @param matchedItems the collection of matched items
     */
    public void setMatchedItems(@Nullable Collection<Item> matchedItems) {
        this.matchedItems = matchedItems;
    }

    /**
     * Gets the natural language answer
     *
     * @return the answer
     */
    public @Nullable String getAnswer() {
        return answer;
    }

    /**
     * Sets the natural language answer
     *
     * @param answer the answer
     */
    public void setAnswer(@Nullable String answer) {
        this.answer = answer;
    }

    /**
     * Gets the hint - usually an indication why the interpretation failed.
     *
     * @return the hint
     */
    public @Nullable String getHint() {
        return hint;
    }

    /**
     * Sets the hint - usually an indication why the interpretation failed.
     *
     * @param hint the hint
     */
    public void setHint(@Nullable String hint) {
        this.hint = hint;
    }

    /**
     * Gets the {@link Card} presented as part of the answer.
     *
     * @return the card
     */
    public @Nullable Card getCard() {
        return card;
    }

    /**
     * Sets the {@link Card} presented as part of the answer.
     *
     * @param card the card
     */
    public void setCard(@Nullable Card card) {
        this.card = card;
    }
}
