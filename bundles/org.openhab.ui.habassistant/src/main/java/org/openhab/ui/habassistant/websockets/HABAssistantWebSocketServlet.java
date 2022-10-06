/**
 * Copyright (c) 2010-2022 Contributors to the openHAB project
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
package org.openhab.ui.habassistant.websockets;

import static org.openhab.ui.habassistant.HABAssistantConstants.*;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

import javax.servlet.ServletException;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.eclipse.jetty.websocket.servlet.WebSocketServlet;
import org.eclipse.jetty.websocket.servlet.WebSocketServletFactory;
import org.openhab.core.audio.AudioManager;
import org.openhab.core.auth.Authentication;
import org.openhab.core.auth.AuthenticationException;
import org.openhab.core.auth.User;
import org.openhab.core.auth.UserApiTokenCredentials;
import org.openhab.core.auth.UserRegistry;
import org.openhab.core.common.ThreadPoolManager;
import org.openhab.core.config.core.ConfigurableService;
import org.openhab.core.config.core.Configuration;
import org.openhab.core.voice.VoiceManager;
import org.openhab.ui.habassistant.HABAssistantConfig;
import org.openhab.ui.habassistant.auth.HABAssistantJwtHelper;
import org.osgi.framework.BundleContext;
import org.osgi.framework.Constants;
import org.osgi.framework.ServiceRegistration;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Modified;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.http.HttpService;
import org.osgi.service.http.NamespaceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * The {@link HABAssistantWebSocketServlet} class defines the WebSocket servlet
 *
 * @author Miguel Álvarez - Initial contribution
 */
@Component(service = HABAssistantWebSocketServlet.class, immediate = true, configurationPid = SERVICE_PID, property = Constants.SERVICE_PID
        + "=" + SERVICE_PID)
@ConfigurableService(category = SERVICE_CATEGORY, label = SERVICE_NAME + " UI", description_uri = SERVICE_CATEGORY + ":"
        + SERVICE_ID)
@NonNullByDefault
public class HABAssistantWebSocketServlet extends WebSocketServlet {

    public static final String NAME = "habassistant";
    public static final String WS_PATH = "/" + NAME + "/ws";
    private final Logger logger = LoggerFactory.getLogger(HABAssistantWebSocketServlet.class);

    private final HttpService httpService;
    protected final List<HABAssistantWebSocketHandler> handlers = new ArrayList<>();
    private final ScheduledExecutorService executor = ThreadPoolManager.getScheduledPool("OH-ui-habassistant");
    protected final Map<String, ServiceRegistration<?>> audioComponentRegistrations = new ConcurrentHashMap<>();
    protected final BundleContext bundleContext;
    protected final VoiceManager voiceManager;
    protected final AudioManager audioManager;
    private final UserRegistry userRegistry;
    private final HABAssistantJwtHelper jwtHelper;
    private final ScheduledFuture<?> pingTask;
    private HABAssistantConfig serviceConfig = new HABAssistantConfig();
    private static final String API_TOKEN_PREFIX = "oh.";
    protected static final String ALT_AUTH_HEADER = "X-OPENHAB-TOKEN";

    @Activate
    public HABAssistantWebSocketServlet(Map<String, Object> configProps, BundleContext bundleContext,
            final @Reference HttpService httpService, final @Reference AudioManager audioManager,
            final @Reference VoiceManager voiceManager, final @Reference UserRegistry userRegistry) {
        this.bundleContext = bundleContext;
        this.httpService = httpService;
        this.audioManager = audioManager;
        this.voiceManager = voiceManager;
        this.userRegistry = userRegistry;
        this.jwtHelper = new HABAssistantJwtHelper();
        pingTask = executor.scheduleWithFixedDelay(this::pingHandlers, 60, 30, TimeUnit.SECONDS);
        modified(configProps);
        registerServlet();
    }

    private void registerServlet() {
        try {
            httpService.registerServlet(WS_PATH, this, null,
                    new HABAssistantWebsocketContext(this, userRegistry, httpService.createDefaultHttpContext()));
            logger.debug("Started HABAssistant at " + WS_PATH);
        } catch (NamespaceException | ServletException e) {
            logger.error("Error during HABAssistant startup: {}", e.getMessage());
        }
    }

    @Activate
    public void activate(BundleContext bundleContext, Map<String, Object> config) {
        modified(config);
    }

    @SuppressWarnings("null")
    @Modified
    public void modified(Map<String, Object> config) {
        this.serviceConfig = new Configuration(config).as(HABAssistantConfig.class);
    }

    public HABAssistantConfig getConfig() {
        return this.serviceConfig;
    }

    private void pingHandlers() {
        logger.debug("Pinging {} clients...", handlers.size());
        for (var handler : handlers) {
            try {
                if (handler != null) {
                    var remote = handler.getRemote();
                    if (remote != null) {
                        remote.sendPing(ByteBuffer.wrap("oh".getBytes(StandardCharsets.UTF_8)));
                    }
                }
            } catch (IOException e) {
                logger.debug("Ping failed: {}", e.getMessage());
            }
        }
    }

    private void disconnectHandlers() {
        logger.debug("Disconnecting {} clients...", handlers.size());
        for (var handler : handlers) {
            try {
                handler.getSession().disconnect();
            } catch (IOException e) {
                logger.debug("Disconnect failed: {}", e.getMessage());
            }
        }
    }

    protected boolean isValidToken(String token) {
        try {
            if (token.startsWith(API_TOKEN_PREFIX)) {
                // Allow access to the websocket using user generated tokens
                logger.debug("Validating access through oh token");
                UserApiTokenCredentials credentials = new UserApiTokenCredentials(token);
                Authentication auth = userRegistry.authenticate(credentials);
                User user = userRegistry.get(auth.getUsername());
                if (user == null) {
                    throw new AuthenticationException("User not found in registry");
                }
                return true;
            } else {
                logger.debug("Validating jwt token");
                jwtHelper.verifyAndParseJwtAccessToken(token);
                return true;
            }
        } catch (AuthenticationException e) {
            logger.debug("AuthenticationException: {}", e.getMessage());
            return false;
        }
    }

    @Deactivate
    public void deactivate() {
        pingTask.cancel(true);
        httpService.unregister(WS_PATH);
        disconnectHandlers();
        handlers.clear();
    }

    @Override
    public void configure(@Nullable WebSocketServletFactory webSocketServletFactory) {
        if (webSocketServletFactory != null) {
            webSocketServletFactory.getPolicy().setIdleTimeout(60000);
            webSocketServletFactory.setCreator((request, response) -> new HABAssistantWebSocketHandler(this, executor));
        }
    }
}
