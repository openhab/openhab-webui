/*
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

import java.io.InputStream;
import java.util.Set;
import java.util.stream.Collectors;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.items.GroupItem;
import org.openhab.core.items.Item;
import org.openhab.ui.habot.nlp.internal.AnswerFormatter;
import org.openhab.ui.habot.nlp.internal.NamedAttributesItemResolver;

/**
 * An abstract implmentation of a {@link Skill} with helper methods to find items matching an {@link Intent}
 * object and location entities.
 *
 * It also contains a default implementation of the training data sourcing (text file in train/(language)/(intent).txt).
 *
 * @author Yannick Schaus - Initial contribution
 */
@NonNullByDefault
public abstract class AbstractItemIntentInterpreter implements Skill {

    protected final ItemResolver itemResolver;
    protected AnswerFormatter answerFormatter = new AnswerFormatter("en");

    public AbstractItemIntentInterpreter(ItemResolver itemResolver) {
        this.itemResolver = itemResolver;
    }

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

        Set<Item> items = itemResolver.getMatchingItems(object, location).collect(Collectors.toSet());

        // expand group items
        for (Item item : items.toArray(new Item[0])) {
            if (item instanceof GroupItem gItem) {
                items.addAll(gItem.getMembers());
            }
        }

        return items;
    }

    @Override
    public @Nullable InputStream getTrainingData(String language) throws UnsupportedLanguageException {
        answerFormatter = new AnswerFormatter(language);

        InputStream trainingData = Skill.class.getClassLoader()
                .getResourceAsStream("train/" + language + "/" + this.getIntentId() + ".txt");

        if (trainingData == null) {
            throw new UnsupportedLanguageException(language);
        }

        return trainingData;
    }
}
