/**
 * Copyright (c) 2010-2018 by the respective copyright holders.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habot.nlp.internal;

import java.io.InputStream;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.apache.commons.io.IOUtils;
import org.eclipse.jdt.annotation.NonNull;
import org.eclipse.smarthome.core.common.registry.RegistryChangeListener;
import org.eclipse.smarthome.core.events.EventPublisher;
import org.eclipse.smarthome.core.items.Item;
import org.eclipse.smarthome.core.items.ItemRegistry;
import org.eclipse.smarthome.core.voice.text.HumanLanguageInterpreter;
import org.eclipse.smarthome.core.voice.text.InterpretationException;
import org.openhab.ui.habot.nlp.ChatReply;
import org.openhab.ui.habot.nlp.Intent;
import org.openhab.ui.habot.nlp.IntentInterpretation;
import org.openhab.ui.habot.nlp.ItemNamedAttribute;
import org.openhab.ui.habot.nlp.ItemNamedAttribute.AttributeType;
import org.openhab.ui.habot.nlp.ItemResolver;
import org.openhab.ui.habot.nlp.Skill;
import org.openhab.ui.habot.nlp.UnsupportedLanguageException;
import org.osgi.framework.BundleContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Modified;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;

/**
 * The OpenNLP-based interpreter used by HABot.
 *
 * @author Yannick Schaus
 */
@Component(service = HumanLanguageInterpreter.class, immediate = true, name = "org.openhab.opennlphli", property = {
        "service.config.description.uri=voice:opennlphli", "service.config.label=OpenNLP Interpreter for HABot",
        "service.config.category=voice" })
public class OpenNLPInterpreter implements HumanLanguageInterpreter {

    public static final Set<Locale> SUPPORTED_LOCALES = Collections
            .unmodifiableSet(new HashSet<>(Arrays.asList(Locale.ENGLISH, Locale.FRENCH, Locale.GERMAN)));

    private IntentTrainer intentTrainer = null;
    private Locale currentLocale = null;
    private String tokenizerId = null;

    private ItemRegistry itemRegistry;
    private ItemResolver itemResolver;
    private EventPublisher eventPublisher;

    private HashMap<String, Skill> skills = new HashMap<String, Skill>();

    private @NonNull RegistryChangeListener<Item> registryChangeListener = new RegistryChangeListener<Item>() {
        @Override
        public void added(Item element) {
            intentTrainer = null;
        }

        @Override
        public void removed(Item element) {
            intentTrainer = null;
        }

        @Override
        public void updated(Item oldElement, Item element) {
            intentTrainer = null;
        }
    };

    @Override
    public String getId() {
        return "opennlp";
    }

    @Override
    public String getLabel(Locale locale) {
        return "HABot OpenNLP Interpreter";
    }

    @Override
    public String interpret(Locale locale, String text) throws InterpretationException {
        ChatReply reply = reply(locale, text);
        if (reply == null) {
            return null;
        }

        return reply.getAnswer();
    }

    /**
     * Get an {@link InputStream} of additional name samples to feed to
     * the {@link IntentTrainer} to improve the recognition.
     *
     * @return an OpenNLP compatible input stream with the tagged name samples on separate lines
     */
    protected InputStream getNameSamples() throws UnsupportedLanguageException {
        StringBuilder nameSamplesDoc = new StringBuilder();
        Map<Item, Set<ItemNamedAttribute>> itemAttributes = itemResolver.getAllItemNamedAttributes();

        Stream<ItemNamedAttribute> attributes = itemAttributes.values().stream().flatMap(a -> a.stream());

        attributes.forEach(attribute -> {
            if (attribute.getType() == AttributeType.LOCATION) {
                nameSamplesDoc.append(String.format("<START:location> %s <END>%n", attribute.getValue()));
            } else {
                nameSamplesDoc.append(String.format("<START:object> %s <END>%n", attribute.getValue()));
            }
        });

        return IOUtils.toInputStream(nameSamplesDoc.toString());
    }

    /**
     * This variant of interpret() returns a more complete interpretation result.
     *
     * @param locale the locale of the query
     * @param text the query text
     * @return the interpretation result as a {@link ChatReply} object
     * @throws InterpretationException
     */
    public ChatReply reply(Locale locale, String text) throws InterpretationException {
        if (!locale.equals(currentLocale) || intentTrainer == null) {
            try {
                itemResolver.setLocale(locale);
                intentTrainer = new IntentTrainer(locale.getLanguage(),
                        skills.values().stream().sorted(new Comparator<Skill>() {

                            @Override
                            public int compare(Skill o1, Skill o2) {
                                if (o1.getIntentId().equals("get-status")) {
                                    return -1;
                                }
                                if (o2.getIntentId().equals("get-status")) {
                                    return 1;
                                }
                                return o1.getIntentId().compareTo(o2.getIntentId());
                            }

                        }).collect(Collectors.toList()), getNameSamples(), this.tokenizerId);
                currentLocale = locale;
            } catch (Exception e) {
                InterpretationException fe = new InterpretationException(
                        "Error during trainer initialization: " + e.getMessage());
                fe.initCause(e);
                throw fe;
            }
        }

        ChatReply reply = new ChatReply(locale, text);

        Intent intent;

        // Shortcut: if there are any items whose named attributes match the query (case insensitive), consider
        // it a "get-status" intent with this attribute as the corresponding entity.
        // This allows the user to query a named attribute quickly by simply stating it - and avoid a
        // misinterpretation by the categorizer.
        if (this.itemResolver.getMatchingItems(text, null).findAny().isPresent()) {
            intent = new Intent("get-status");
            intent.setEntities(new HashMap<String, String>());
            intent.getEntities().put("object", text.toLowerCase());
        } else if (this.itemResolver.getMatchingItems(null, text).findAny().isPresent()) {
            intent = new Intent("get-status");
            intent.setEntities(new HashMap<String, String>());
            intent.getEntities().put("location", text.toLowerCase());
        } else {
            // Else, run it through the IntentTrainer
            intent = intentTrainer.interpret(text);
        }
        reply.setIntent(intent);
        Skill skill = skills.get(intent.getName());

        if (skill != null) {
            IntentInterpretation intentInterpretation = skill.interpret(intent, locale.getLanguage());
            if (intentInterpretation != null) {
                reply.setAnswer(intentInterpretation.getAnswer());
                if (intentInterpretation.getHint() != null) {
                    reply.setHint(intentInterpretation.getHint());
                }
                if (intentInterpretation.getMatchedItems() != null) {
                    reply.setMatchedItems(intentInterpretation.getMatchedItems().stream().map(i -> i.getName())
                            .collect(Collectors.toList()).toArray(new String[0]));
                }
                if (intentInterpretation.getCard() != null) {
                    reply.setCard(intentInterpretation.getCard());
                }
            }
        }

        return reply;
    }

    @Override
    public String getGrammar(Locale locale, String format) {
        throw new UnsupportedOperationException();
    }

    @Override
    public Set<Locale> getSupportedLocales() {
        return SUPPORTED_LOCALES;
    }

    @Override
    public Set<String> getSupportedGrammarFormats() {
        return Collections.emptySet();
    }

    @Reference
    protected void setItemRegistry(ItemRegistry itemRegistry) {
        if (this.itemRegistry == null) {
            this.itemRegistry = itemRegistry;
            this.itemRegistry.addRegistryChangeListener(registryChangeListener);
        }
    }

    protected void unsetItemRegistry(ItemRegistry itemRegistry) {
        if (itemRegistry == this.itemRegistry) {
            this.itemRegistry.removeRegistryChangeListener(registryChangeListener);
            this.itemRegistry = null;
        }
    }

    @Reference
    protected void setItemResolver(ItemResolver itemResolver) {
        this.itemResolver = itemResolver;
    }

    protected void unsetItemResolver(ItemResolver itemResolver) {
        this.itemResolver = null;
    }

    @Reference
    protected void setEventPublisher(EventPublisher eventPublisher) {
        if (this.eventPublisher == null) {
            this.eventPublisher = eventPublisher;
        }
    }

    protected void unsetEventPublisher(EventPublisher eventPublisher) {
        if (eventPublisher == this.eventPublisher) {
            this.eventPublisher = null;
        }
    }

    @Reference(cardinality = ReferenceCardinality.MULTIPLE, policy = ReferencePolicy.DYNAMIC)
    protected void addSkill(Skill skill) {
        this.skills.put(skill.getIntentId(), skill);
        // reset the trainer
        this.intentTrainer = null;
    }

    protected void removeSkill(Skill skill) {
        this.skills.remove(skill.getIntentId());
        // reset the trainer
        this.intentTrainer = null;
    }

    @Activate
    protected void activate(Map<String, Object> configProps, BundleContext bundleContext) {
        if (configProps.containsKey("tokenizer")) {
            this.tokenizerId = configProps.get("tokenizer").toString();
        }

        this.intentTrainer = null;
    }

    @Modified
    protected void modified(Map<String, Object> configProps) {
        if (configProps.containsKey("tokenizer")) {
            this.tokenizerId = configProps.get("tokenizer").toString();
        }

        this.intentTrainer = null;
    }

    @Deactivate
    protected void deactivate() {

    }
}
