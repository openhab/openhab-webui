/**
 * Copyright (c) 2010-2018 by the respective copyright holders.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habot.nlp;

import java.util.Locale;

/**
 * This exception is thrown when the particular language is not supported by a {@link Skill} - for instance, if it has
 * no training data for that language.
 *
 * @author Yannick Schaus
 */
public class UnsupportedLanguageException extends Exception {

    private Locale language;

    private static final long serialVersionUID = -7147837667959343830L;

    /**
     * Constructor for a particular language
     *
     * @param language the language (ISO-639 code)
     */
    public UnsupportedLanguageException(String language) {
        this.language = Locale.forLanguageTag(language);
    }

    public UnsupportedLanguageException(Locale locale) {
        this.language = locale;
    }

    @Override
    public String getMessage() {
        return String.format("Unsupported language: %s", language.toString());
    }
}
