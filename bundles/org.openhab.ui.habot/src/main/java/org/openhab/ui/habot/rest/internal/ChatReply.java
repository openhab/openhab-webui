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
package org.openhab.ui.habot.rest.internal;

import java.util.Locale;
import java.util.stream.Collectors;

import org.eclipse.smarthome.core.voice.chat.Card;
import org.eclipse.smarthome.core.voice.text.Intent;
import org.eclipse.smarthome.core.voice.text.InterpretationResult;

/**
 * The complete DTO object representing an HABot chat reply, returned by the REST API.
 * It includes the original query, language, natural language answer and hint, recognized intent (name and entities),
 * matched items and card.
 *
 * @author Yannick Schaus - Initial contribution
 * @author Laurent Garnier - class moved + new constructor added
 */
public class ChatReply {

    String language;
    String query;
    String answer;
    String hint;
    Intent intent;
    String[] matchedItemNames;
    Card card;

    /**
     * Constructs a ChatReply for the specified {@link Locale}
     *
     * @param locale the locale
     */
    public ChatReply(Locale locale) {
        this.language = locale.getLanguage();
    }

    /**
     * Constructs a ChatReply for the specified {@link Locale} and query
     *
     * @param locale
     * @param query
     */
    public ChatReply(Locale locale, String query) {
        this.language = locale.getLanguage();
        this.query = query;
    }

    /**
     * Constructs a ChatReply for the specified query and {@link InterpretationResult}
     *
     * @param query the user query
     * @param result the result of the interpretation
     */
    public ChatReply(String query, InterpretationResult result) {
        this.query = query;
        if (result != null) {
            this.language = result.getLanguage();
            this.answer = result.getAnswer();
            this.hint = result.getHint();
            this.intent = result.getIntent();
            this.matchedItemNames = result.getMatchedItems().stream().map(i -> i.getName()).collect(Collectors.toList())
                    .toArray(new String[0]);
            this.card = result.getCard();
        }
    }

    /**
     * Gets the language of the reply
     *
     * @return the ISO-639 code of the language
     */
    public String getLanguage() {
        return language;
    }

    /**
     * Gets the user's original query
     *
     * @return the user query
     */
    public String getQuery() {
        return query;
    }

    /**
     * Sets the user's original query
     *
     * @param query the user query
     */
    public void setQuery(String query) {
        this.query = query;
    }

    /**
     * Gets the natural language answer
     *
     * @return the answer
     */
    public String getAnswer() {
        return answer;
    }

    /**
     * Sets the natural language answer
     *
     * @param answer the answer
     */
    public void setAnswer(String answer) {
        this.answer = answer;
    }

    /**
     * Gets the hint - usually an indication why the interpretation failed.
     *
     * @return the hint
     */
    public String getHint() {
        return hint;
    }

    /**
     * Sets the hint - usually an indication why the interpretation failed.
     *
     * @param hint the hint
     */
    public void setHint(String hint) {
        this.hint = hint;
    }

    /**
     * Gets the recognized intent
     *
     * @return the intent
     */
    public Intent getIntent() {
        return intent;
    }

    /**
     * Sets the recognized intent
     *
     * @param intent the intent
     */
    public void setIntent(Intent intent) {
        this.intent = intent;
    }

    /**
     * Gets the item names matched by the intent entities
     *
     * @return the matched item names
     */
    public String[] getMatchedItemNames() {
        return matchedItemNames;
    }

    /**
     * Sets the item names matched by the intent entities
     *
     * @param matchedItemNames the matched item names
     */
    public void setMatchedItems(String[] matchedItemNames) {
        this.matchedItemNames = matchedItemNames;
    }

    /**
     * Gets the {@link Card} to present with the answer
     *
     * @return the card
     */
    public Card getCard() {
        return card;
    }

    /**
     * Sets the {@link Card} to present with the answer
     *
     * @return the card
     */
    public void setCard(Card card) {
        this.card = card;
    }

}
