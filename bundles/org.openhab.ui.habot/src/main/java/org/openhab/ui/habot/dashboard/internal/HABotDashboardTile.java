/**
 * Copyright (c) 2010-2019 Contributors to the openHAB project
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
package org.openhab.ui.habot.dashboard.internal;

import static java.util.stream.Collectors.toList;
import static org.openhab.ui.habot.dashboard.internal.HABotDashboardTile.*;

import java.net.URI;
import java.util.Collection;
import java.util.Locale;
import java.util.Map;

import org.eclipse.jdt.annotation.NonNull;
import org.eclipse.jdt.annotation.Nullable;
import org.eclipse.smarthome.config.core.ConfigOptionProvider;
import org.eclipse.smarthome.config.core.ConfigurableService;
import org.eclipse.smarthome.config.core.ParameterOption;
import org.eclipse.smarthome.core.voice.VoiceManager;
import org.openhab.ui.dashboard.DashboardTile;
import org.openhab.ui.habot.rest.internal.HABotResource;
import org.osgi.framework.BundleContext;
import org.osgi.framework.Constants;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Modified;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.http.HttpContext;
import org.osgi.service.http.HttpService;
import org.osgi.service.http.NamespaceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * The dashboard tile and resource registering for HABot
 *
 * @author Yannick Schaus - Initial contribution
 * @author Laurent Garnier - Consider the new setting defining the interpreter
 */
@Component(service = { DashboardTile.class,
        ConfigOptionProvider.class }, immediate = true, configurationPid = SERVICE_PID, property = {
                Constants.SERVICE_PID + "=" + SERVICE_PID,
                ConfigurableService.SERVICE_PROPERTY_DESCRIPTION_URI + "=" + SERVICE_URI,
                ConfigurableService.SERVICE_PROPERTY_LABEL + "=" + SERVICE_LABEL,
                ConfigurableService.SERVICE_PROPERTY_CATEGORY + "=" + SERVICE_CATEGORY })
public class HABotDashboardTile implements DashboardTile, ConfigOptionProvider {

    static final String SERVICE_LABEL = "HABot";
    static final String SERVICE_ID = "habot";
    static final String SERVICE_CATEGORY = "ui";
    static final String SERVICE_PID = "org.openhab." + SERVICE_ID;
    static final String SERVICE_URI = SERVICE_CATEGORY + ":" + SERVICE_ID;

    private static final String CONFIG_HLI = "interpreter";
    private static final String DEFAULT_HLI = "habotopennlp";

    @Override
    public String getName() {
        return SERVICE_LABEL;
    }

    @Override
    public String getUrl() {
        return "../habot/";
    }

    @Override
    public String getOverlay() {
        return null;
    }

    @Override
    public String getImageUrl() {
        return "../habot/statics/dashboardtile.png";
    }

    public static final String HABOT_ALIAS = "/habot";
    public static final String RESOURCES_BASE = "web/dist/pwa-mat";

    private final Logger logger = LoggerFactory.getLogger(HABotDashboardTile.class);

    protected HttpService httpService;
    private VoiceManager voiceManager;
    private HABotResource habotResource;

    private String hliId = null;

    @Activate
    protected void activate(Map<String, Object> configProps, BundleContext context) {
        try {
            Object useGzipCompression = configProps.get("useGzipCompression");
            HttpContext httpContext = new HABotHttpContext(httpService.createDefaultHttpContext(), RESOURCES_BASE,
                    (useGzipCompression != null && Boolean.parseBoolean(useGzipCompression.toString())));

            httpService.registerResources(HABOT_ALIAS, RESOURCES_BASE, httpContext);
            logger.info("Started HABot at " + HABOT_ALIAS);
        } catch (NamespaceException e) {
            logger.error("Error during HABot startup: {}", e.getMessage());
        }
        modified(configProps);
    }

    @Deactivate
    protected void deactivate() {
        httpService.unregister(HABOT_ALIAS);
        logger.info("Stopped HABot");
    }

    @Modified
    protected void modified(Map<String, Object> config) {
        if (config != null) {
            hliId = config.containsKey(CONFIG_HLI) ? config.get(CONFIG_HLI).toString() : DEFAULT_HLI;
        }
        habotResource.setHliId(hliId);
    }

    @Override
    public @Nullable Collection<@NonNull ParameterOption> getParameterOptions(@NonNull URI uri, @NonNull String param,
            @Nullable Locale locale) {
        if (uri.toString().equals(SERVICE_URI) && param.equals(CONFIG_HLI)) {
            return voiceManager.getHLIs().stream()
                    .sorted((hli1, hli2) -> hli1.getLabel(locale).compareToIgnoreCase(hli2.getLabel(locale)))
                    .map(hli -> new ParameterOption(hli.getId(), hli.getLabel(locale))).collect(toList());
        }
        return null;
    }

    @Reference
    protected void setHttpService(HttpService httpService) {
        this.httpService = httpService;
    }

    protected void unsetHttpService(HttpService httpService) {
        this.httpService = null;
    }

    @Reference
    public void setVoiceManager(VoiceManager voiceManager) {
        this.voiceManager = voiceManager;
    }

    public void unsetVoiceManager(VoiceManager voiceManager) {
        this.voiceManager = null;
    }

    @Reference
    public void setHabotResource(HABotResource habotResource) {
        this.habotResource = habotResource;
    }

    public void unsetHabotResource(HABotResource habotResource) {
        this.habotResource = null;
    }

}
