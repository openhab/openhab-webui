/**
 * Copyright (c) 2010-2018 by the respective copyright holders.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habot.nlp.internal;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import opennlp.tools.util.ObjectStream;

/**
 * Converts the training data to lowercase.
 *
 * @author Yannick Schaus
 */
public class LowerCasePlainTextByLineStream implements ObjectStream<String> {

    BufferedReader in;
    InputStream inputStream;
    final String encoding = "UTF-8";

    public LowerCasePlainTextByLineStream(InputStream inputStream) throws IOException {
        this.inputStream = inputStream;
        reset();
    }

    @Override
    public String read() throws IOException {
        String line = in.readLine();
        if (line == null) {
            return null;
        }
        return line.toLowerCase().replace("<start:", "<START:").replace("<end>", "<END>");
    }

    @Override
    public void reset() throws IOException {
        in = new BufferedReader(new InputStreamReader(inputStream, encoding));
    }

    @Override
    public void close() throws IOException {
        if (in != null) {
            in.close();
        }
    }
}
