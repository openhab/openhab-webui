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

import static org.openhab.ui.habassistant.websockets.HABAssistantWebSocketServlet.ALT_AUTH_HEADER;
import static org.openhab.ui.habassistant.websockets.HABAssistantWebSocketServlet.NAME;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.ByteBuffer;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.WebSocketAdapter;
import org.openhab.core.audio.AudioSink;
import org.openhab.core.audio.AudioSource;
import org.openhab.ui.habassistant.audio.HABAssistantAudioSink;
import org.openhab.ui.habassistant.audio.HABAssistantAudioSource;
import org.osgi.framework.ServiceRegistration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * The {@link HABAssistantWebSocketHandler} class controls an individual WebSocket client connection
 *
 * @author Miguel Álvarez - Initial contribution
 */
@NonNullByDefault
public class HABAssistantWebSocketHandler extends WebSocketAdapter {
    private final Logger logger = LoggerFactory.getLogger(HABAssistantWebSocketHandler.class);
    private final HABAssistantWebSocketServlet servlet;
    private final ScheduledExecutorService executor;
    private String id = "";
    private String label = "";
    private int requiredSinkSampleRate = 0;
    private final ConcurrentLinkedQueue<OutputStream> listeners = new ConcurrentLinkedQueue<>();
    private @Nullable ScheduledFuture<?> scheduledDisconnection = null;
    private boolean initialized = false;

    public HABAssistantWebSocketHandler(HABAssistantWebSocketServlet servlet, ScheduledExecutorService executor) {
        this.servlet = servlet;
        this.executor = executor;
    }

    public void handleCommand(WebsocketInputCommand command, Map<String, Object> data) {
        logger.debug("Handling command {}", command);
        switch (command) {
            case INITIALIZE:
                id = (String) data.getOrDefault("id", "");
                label = (String) data.getOrDefault("label", id);
                requiredSinkSampleRate = (int) data.get("sampleRate");
                @Nullable
                String token = (String) data.get("token");
                if (token == null) {
                    // Allow access to the websocket using user generated tokens
                    token = getSession().getUpgradeRequest().getHeader(ALT_AUTH_HEADER);
                }
                scheduledDisconnection.cancel(true);
                if (isValidAccess(token)) {
                    registerAudioComponents();
                } else {
                    logger.warn("Unauthorized access, disconnecting client");
                    try {
                        getSession().disconnect();
                    } catch (IOException ignored) {
                    }
                }
                break;
            case START_DIALOG:
                startDialog();
                break;
            case STOP_DIALOG:
                stopDialog();
                break;
            default:
                logger.warn("Unhandled JSON command: {}", data);
        }
    }

    private boolean isValidAccess(@Nullable String token) {
        if (!servlet.getConfig().secure) {
            return true;
        }
        if (token == null) {
            logger.debug("Token is missed.");
            return false;
        }
        return servlet.isValidToken(token);
    }

    private void startDialog() {
        var sink = servlet.audioManager.getSink(getSinkId());
        var source = servlet.audioManager.getSource(getSourceId());
        if (sink == null || source == null) {
            logger.warn("Missing audio components");
            return;
        }
        try {
            servlet.voiceManager.listenAndAnswer(null, null, null, List.of(), source, sink, null, null);
        } catch (IllegalStateException e) {
            logger.warn("Error while running listenAndAnswer", e);
        }
    }

    private void stopDialog() {
        var source = servlet.audioManager.getSource(getSourceId());
        if (source != null) {
            try {
                servlet.voiceManager.stopDialog(source);
            } catch (IllegalStateException e) {
                logger.debug("Unable to stop dialog for {}", getSourceId());
            }
        }
    }

    public void sendAudio(byte b[]) {
        try {
            getRemote().sendBytes(ByteBuffer.wrap(b));
        } catch (IOException e) {
            logger.warn("IOException while sending audio");
        }
    }

    public void registerListener(OutputStream output) {
        synchronized (listeners) {
            listeners.add(output);
            if (listeners.size() == 1) {
                sendClientCommand(WebsocketOutputCommand.START_LISTENING);
            }
        }
    }

    public void unregisterListener(OutputStream output) {
        synchronized (listeners) {
            listeners.remove(output);
            if (listeners.size() == 0) {
                sendClientCommand(WebsocketOutputCommand.STOP_LISTENING);
            }
        }
    }

    @Override
    public void onWebSocketConnect(@Nullable Session sess) {
        super.onWebSocketConnect(sess);
        if (sess == null) {
            // never
            return;
        }
        servlet.handlers.add(this);
        logger.info("New client connected.");
        scheduledDisconnection = executor.schedule(() -> {
            try {
                sess.disconnect();
            } catch (IOException ignored) {
            }
        }, 5, TimeUnit.SECONDS);
    }

    private synchronized void registerAudioComponents() {
        try {
            if (id.isBlank() || label.isBlank()) {
                throw new IOException("Unable to register audio components");
            }
            var sourceId = getSourceId();
            logger.debug("Registering audio source {}", sourceId);
            if (servlet.audioComponentRegistrations.containsKey(sourceId)) {
                throw new IOException("Source already registered");
            }
            var sinkId = getSinkId();
            logger.debug("Registering audio sink {}", sinkId);
            if (servlet.audioComponentRegistrations.containsKey(sinkId)) {
                throw new IOException("Sink already registered");
            }
            initialized = true;
            // register source
            servlet.audioComponentRegistrations.put(sourceId,
                    servlet.bundleContext.registerService(AudioSource.class.getName(),
                            new HABAssistantAudioSource(sourceId, label, this), new Hashtable<>()));
            // register sink
            servlet.audioComponentRegistrations.put(sinkId,
                    servlet.bundleContext.registerService(AudioSink.class.getName(),
                            new HABAssistantAudioSink(sinkId, label, requiredSinkSampleRate, this), new Hashtable<>()));
            sendClientCommand(WebsocketOutputCommand.INITIALIZED);
        } catch (IOException e) {
            logger.warn("Disconnecting client: {}", e.getMessage());
            var session = getSession();
            if (session != null) {
                try {
                    session.disconnect();
                } catch (IOException ignored) {
                }
            }
        }
    }

    private void unregisterAudioComponents() {
        var sourceId = getSourceId();
        ServiceRegistration<?> sourceReg = servlet.audioComponentRegistrations.remove(sourceId);
        if (sourceReg != null) {
            logger.debug("Unregistering audio source {}", sourceId);
            sourceReg.unregister();
        }
        var sinkId = getSinkId();
        ServiceRegistration<?> sinkReg = servlet.audioComponentRegistrations.remove(sinkId);
        if (sinkReg != null) {
            logger.debug("Unregistering audio sink {}", sinkId);
            sinkReg.unregister();
        }
    }

    private void sendClientCommand(WebsocketOutputCommand command) {
        sendClientCommand(command, new HashMap<>());
    }

    private void sendClientCommand(WebsocketOutputCommand command, Map<String, Object> args) {
        args.put("cmd", command.toString());
        try {
            getRemote().sendString(new ObjectMapper().writeValueAsString(args));
        } catch (JsonProcessingException e) {
            logger.warn("JsonProcessingException writing JSON message: ", e);
        } catch (IOException e) {
            logger.debug("IOException sending client command: ", e);
        }
    }

    private String getSinkId() {
        return NAME + "::" + id + "::sink";
    }

    private String getSourceId() {
        return NAME + "::" + id + "::source";
    }

    @Override
    public void onWebSocketBinary(byte @Nullable [] payload, int offset, int len) {
        logger.trace("Received binary data of length {}", len);
        if (payload != null) {
            writeToListeners(payload);
        }
    }

    private void writeToListeners(byte[] payload) {
        for (var listener : listeners) {
            try {
                listener.write(payload);
            } catch (IOException e) {
                logger.debug("IOException while piping to source: {}", e.getMessage());
            }
        }
    }

    @Override
    public void onWebSocketText(@Nullable String message) {
        try {
            var messageJson = new ObjectMapper().readValue(message, HashMap.class);
            handleCommand(WebsocketInputCommand.valueOf((String) Objects.requireNonNull(messageJson.get("cmd"))),
                    messageJson);
        } catch (JsonProcessingException e) {
            logger.warn("Exception parsing JSON message: ", e);
        }
    }

    @Override
    public void onWebSocketError(@Nullable Throwable cause) {
        logger.warn("WebSocket Error: ", cause);
    }

    @Override
    public void onWebSocketClose(int statusCode, @Nullable String reason) {
        super.onWebSocketClose(statusCode, reason);
        logger.debug("Session closed with code {}: {}", statusCode, reason);
        servlet.handlers.remove(this);
        if (initialized) {
            stopDialog();
            unregisterAudioComponents();
        }
    }

    private enum WebsocketInputCommand {
        INITIALIZE,
        START_DIALOG,
        STOP_DIALOG,
    }

    private enum WebsocketOutputCommand {
        INITIALIZED,
        START_LISTENING,
        STOP_LISTENING,
    }
}
