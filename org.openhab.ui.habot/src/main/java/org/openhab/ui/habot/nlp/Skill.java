/**
 * Copyright (c) 2010-2018 by the respective copyright holders.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habot.nlp;

import java.io.InputStream;

/**
 * This interface must be implemented to add support for a certain intent.
 * It covers both the training data to supply to OpenNLP for the intent categorization (and token extraction),
 * and the method to call when the intent is recognized.
 *
 * @author Yannick Schaus
 */
public interface Skill {
    /**
     * Gets the internal name of the intent handled by this skill.
     *
     * @return the id of the intent covered by this skill
     */
    String getIntentId();

    /**
     * Get an input stream containing the training data for the specified intent to feed to the OpenNLP document
     * categorizer. The data consists in a series of sentences to be associated with the intent, and containing named
     * entities with standard OpenNLP tags. Example:
     * what's the &lt;START:object&gt;temperature&lt;END&gt; in the &lt;START:location&gt;living room&lt;END&gt;
     *
     * @param language the language (ISO-639 code) containing the expected language for the NLP training data
     * @throws UnsupportedLanguageException if the specified language is not supported by this skill
     * @return the input stream containing the training data
     */
    InputStream getTrainingData(String language) throws UnsupportedLanguageException;

    /**
     * Interprets the recognized intent.
     *
     * @param intent the intent to interpret
     * @param language the language of the query (ISO-639 code)
     * @return the {@link IntentInterpretation} containing the results of the interpretation
     */
    IntentInterpretation interpret(Intent intent, String language);
}
