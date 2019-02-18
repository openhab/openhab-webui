/**
 * Copyright (c) 2010-2018 by the respective copyright holders.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habot.nlp.internal;

import java.util.Arrays;
import java.util.stream.Stream;

import opennlp.tools.tokenize.SimpleTokenizer;
import opennlp.tools.util.Span;

/**
 * This tokenizer splits by ignoring all non alphanumeric characters.
 * It performs better than the white space tokenizer for certain languages.
 *
 * @author Yannick Schaus
 */
public class AlphaNumericTokenizer extends SimpleTokenizer {

    public static final AlphaNumericTokenizer INSTANCE;

    static {
        INSTANCE = new AlphaNumericTokenizer();
    }

    /**
     * @deprecated Use INSTANCE field instead to obtain an instance, constructor
     *             will be made private in the future.
     */
    @Deprecated
    public AlphaNumericTokenizer() {
    }

    @Override
    public Span[] tokenizePos(String s) {
        Span[] tokens = super.tokenizePos(s);
        Stream<Span> filteredTokens = Arrays.stream(tokens)
                .filter(span -> Character.isLetter(span.getCoveredText(s).charAt(0))
                        || Character.isDigit(span.getCoveredText(s).charAt(0)));

        return filteredTokens.toArray(Span[]::new);
    }

}
