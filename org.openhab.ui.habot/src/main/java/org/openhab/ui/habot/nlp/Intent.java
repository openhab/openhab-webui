/**
 * Copyright (c) 2010-2018 by the respective copyright holders.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habot.nlp;

import java.util.HashMap;
import java.util.Map;

/**
 * An Intent consists of an identifier of the type of intent, and one or several entities.
 * It is the result of the categorization (for the intent name) and token extraction (for the entities) performed by
 * the OpenNLP interpreter.
 *
 * @author Yannick Schaus
 */
public class Intent {
    String name;

    Map<String, String> entities;

    /**
     * Gets the intent's name (identifier of the type of intent)
     *
     * @return
     */
    public String getName() {
        return name;
    }

    /**
     * Gets the intent's entities
     *
     * @return the map of entities
     */
    public Map<String, String> getEntities() {
        return entities;
    }

    /**
     * Sets the intent's entities
     *
     * @param slots the map of entities
     */
    public void setEntities(Map<String, String> entities) {
        this.entities = entities;
    }

    @Override
    public String toString() {
        return "Intent [name=" + name + ", entities=" + entities + "]";
    }

    /**
     * Constructs an intent with the specified name
     *
     * @param name the name (ie. type identifier) of the intent
     */
    public Intent(String name) {
        this.name = name;
        this.entities = new HashMap<String, String>();
    }
}
