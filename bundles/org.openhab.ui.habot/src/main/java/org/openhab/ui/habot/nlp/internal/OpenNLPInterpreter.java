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
package org.openhab.ui.habot.nlp.internal;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.common.registry.RegistryChangeListener;
import org.openhab.core.config.core.ConfigurableService;
import org.openhab.core.items.Item;
import org.openhab.core.items.ItemRegistry;
import org.openhab.core.voice.text.HumanLanguageInterpreter;
import org.openhab.core.voice.text.InterpretationException;
import org.openhab.ui.habot.nlp.ChatReply;
import org.openhab.ui.habot.nlp.Intent;
import org.openhab.ui.habot.nlp.IntentInterpretation;
import org.openhab.ui.habot.nlp.ItemNamedAttribute;
import org.openhab.ui.habot.nlp.ItemNamedAttribute.AttributeType;
import org.openhab.ui.habot.nlp.ItemResolver;
import org.openhab.ui.habot.nlp.Skill;
import org.openhab.ui.habot.nlp.UnsupportedLanguageException;
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
 * @author Yannick Schaus - Initial contribution
 */
@NonNullByDefault
@Component(service = HumanLanguageInterpreter.class, immediate = true, name = "org.openhab.opennlphli")
@ConfigurableService(category = "voice", label = "OpenNLP Interpreter for HABot", description_uri = OpenNLPInterpreter.CONFIG_URI)
public class OpenNLPInterpreter implements HumanLanguageInterpreter {

    protected static final String CONFIG_URI = "voice:opennlphli";

    public static final Set<Locale> SUPPORTED_LOCALES = Set.of(Locale.ENGLISH, Locale.FRENCH, Locale.GERMAN);

    private @Nullable IntentTrainer intentTrainer = null;
    private @Nullable Locale currentLocale = null;
    private @Nullable String tokenizerId = null;

    private ItemRegistry itemRegistry;
    private ItemResolver itemResolver;

    private Map<String, Skill> skills = new HashMap<>();

    private RegistryChangeListener<Item> registryChangeListener = new RegistryChangeListener<>() {
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

    @Activate
    public OpenNLPInterpreter(Map<String, Object> configProps, final @Reference ItemResolver itemResolver,
            final @Reference ItemRegistry itemRegistry) {
        Object tokenizer = configProps.get("tokenizer");
        if (tokenizer != null) {
            tokenizerId = tokenizer.toString();
        }

        this.itemResolver = itemResolver;
        this.itemRegistry = itemRegistry;

        itemRegistry.addRegistryChangeListener(registryChangeListener);
    }

    @Modified
    protected void modified(Map<String, Object> configProps) {
        Object tokenizer = configProps.get("tokenizer");
        if (tokenizer != null) {
            tokenizerId = tokenizer.toString();
        }

        intentTrainer = null;
    }

    @Deactivate
    public void deactivate() {
        itemRegistry.removeRegistryChangeListener(registryChangeListener);
    }

    @Override
    public String getId() {
        return "opennlp";
    }

    @Override
    public String getLabel(@Nullable Locale locale) {
        return "HABot OpenNLP Interpreter";
    }

    @Override
    public String interpret(Locale locale, String text) throws InterpretationException {
        ChatReply reply = reply(locale, text);
        return reply.getAnswer() == null ? "" : reply.getAnswer();
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

        Stream<ItemNamedAttribute> attributes = itemAttributes.values().stream().flatMap(Collection::stream);

        attributes.forEach(attribute -> {
            if (attribute.getType() == AttributeType.LOCATION) {
                nameSamplesDoc.append(String.format("<START:location> %s <END>%n", attribute.getValue()));
            } else {
                nameSamplesDoc.append(String.format("<START:object> %s <END>%n", attribute.getValue()));
            }
        });

        return new ByteArrayInputStream(nameSamplesDoc.toString().getBytes(StandardCharsets.UTF_8));
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
        IntentTrainer intentTrainer = this.intentTrainer;
        if (!locale.equals(currentLocale) || intentTrainer == null) {
            try {
                itemResolver.setLocale(locale);
                intentTrainer = new IntentTrainer(locale.getLanguage(), skills.values().stream().sorted((o1, o2) -> {
                    if (o1.getIntentId().equals("get-status")) {
                        return -1;
                    }
                    if (o2.getIntentId().equals("get-status")) {
                        return 1;
                    }
                    return o1.getIntentId().compareTo(o2.getIntentId());
                }).collect(Collectors.toList()), getNameSamples(), this.tokenizerId);
                this.intentTrainer = intentTrainer;
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
        if (itemResolver.getMatchingItems(text, null).findAny().isPresent()) {
            intent = new Intent("get-status");
            intent.setEntities(new HashMap<>());
            intent.getEntities().put("object", text.toLowerCase());
        } else if (itemResolver.getMatchingItems(null, text).findAny().isPresent()) {
            intent = new Intent("get-status");
            intent.setEntities(new HashMap<>());
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
                    reply.setMatchedItems(
                            intentInterpretation.getMatchedItems().stream().map(Item::getName).toArray(String[]::new));
                }
                if (intentInterpretation.getCard() != null) {
                    reply.setCard(intentInterpretation.getCard());
                }
            }
        }

        return reply;
    }

    @Override
    public @Nullable String getGrammar(Locale locale, String format) {
        return null;
    }

    @Override
    public Set<Locale> getSupportedLocales() {
        return SUPPORTED_LOCALES;
    }

    @Override
    public Set<String> getSupportedGrammarFormats() {
        return Set.of();
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
}
