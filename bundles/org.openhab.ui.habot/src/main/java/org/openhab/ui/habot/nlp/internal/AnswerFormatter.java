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
package org.openhab.ui.habot.nlp.internal;

import java.util.Locale;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Random;
import java.util.ResourceBundle;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;

/**
 * This class helps building natural language answers by selecting random answers from a resource bundle.
 *
 * @author Yannick Schaus - Initial contribution
 */
@NonNullByDefault
public class AnswerFormatter {

    private final ResourceBundle answers;
    private final Locale locale;

    public AnswerFormatter(Locale locale) {
        this.locale = locale;
        this.answers = ResourceBundle.getBundle("answers", locale,
                ResourceBundle.Control.getNoFallbackControl(ResourceBundle.Control.FORMAT_DEFAULT));
    }

    public AnswerFormatter(String language) {
        this.locale = new Locale(language);
        this.answers = ResourceBundle.getBundle("answers", locale,
                ResourceBundle.Control.getNoFallbackControl(ResourceBundle.Control.FORMAT_DEFAULT));
    }

    public String getRandomAnswer(String key, @Nullable Map<String, String> placeholderValues) {
        String alternativesStr = answers.getString(key);

        String[] alternatives = alternativesStr.split("\\|");

        Random random = new Random();
        String answer = alternatives[random.nextInt(alternatives.length)].trim();

        if (placeholderValues != null) {
            for (Entry<String, String> entry : placeholderValues.entrySet()) {
                answer = answer.replace("{" + entry.getKey() + "}", entry.getValue());
            }
        }

        return answer;
    }

    public String getRandomAnswer(String key) {
        return getRandomAnswer(key, null);
    }

    public String getStandardTagHint(Map<String, String> entities) {
        return getRandomAnswer("standard_hint",
                Map.of("attributes",
                        String.join(" & ",
                                entities.entrySet().stream()
                                        .filter(e -> e.getKey().equals("object") || e.getKey().equals("location"))
                                        .map(e -> String.format("\"%s\"", e.getValue())).toArray(String[]::new))));
    }
}
