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
import java.util.Set;
import java.util.stream.Collectors;

import org.eclipse.smarthome.core.items.GroupItem;
import org.eclipse.smarthome.core.items.Item;
import org.eclipse.smarthome.core.items.ItemRegistry;
import org.openhab.ui.habot.nlp.internal.AnswerFormatter;
import org.openhab.ui.habot.nlp.internal.NamedAttributesItemResolver;

/**
 * An abstract implmentation of a {@link Skill} with helper methods to find items matching an {@link Intent}
 * object and location entities.
 *
 * It also contains a default implementation of the training data sourcing (text file in train/(language)/(intent).txt).
 *
 * @author Yannick Schaus
 */
public abstract class AbstractItemIntentInterpreter implements Skill {

    protected ItemRegistry itemRegistry;
    protected ItemResolver itemResolver;
    protected AnswerFormatter answerFormatter;

    /**
     * Returns the items matching the entities in the intent.
     * It delegates this task to the {@link NamedAttributesItemResolver} to find named attributes
     * matching the entities.
     *
     * The resulting items should match the object AND the location if both are provided.
     *
     * @param intent the {@link Intent} containing the entities to match to items' tags.
     * @return the set of matching items
     * @throws UnsupportedLanguageException
     */
    protected Set<Item> findItems(Intent intent) {
        String object = intent.getEntities().get("object");
        String location = intent.getEntities().get("location");

        Set<Item> items = this.itemResolver.getMatchingItems(object, location).collect(Collectors.toSet());

        // expand group items
        for (Item item : items.toArray(new Item[0])) {
            if (item instanceof GroupItem) {
                GroupItem gItem = (GroupItem) item;
                items.addAll(gItem.getMembers());
            }
        }

        return items;
    }

    @Override
    public InputStream getTrainingData(String language) throws UnsupportedLanguageException {
        answerFormatter = new AnswerFormatter(language);

        InputStream trainingData = Skill.class.getClassLoader()
                .getResourceAsStream("train/" + language + "/" + this.getIntentId() + ".txt");

        if (trainingData == null) {
            throw new UnsupportedLanguageException(language);
        }

        return trainingData;
    }
}
