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

import java.io.IOException;
import java.net.URL;
import java.util.Arrays;
import java.util.Optional;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.auth.ManagedUser;
import org.openhab.core.auth.User;
import org.openhab.core.auth.UserRegistry;
import org.osgi.service.http.HttpContext;
import org.osgi.service.http.HttpService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * An implementation of {@link HttpContext} which will handle security to open ws connection.
 *
 * @author Miguel Álvarez - Initial contribution
 */
@NonNullByDefault
public class HABAssistantWebsocketContext implements HttpContext {
    private static final String SESSION_COOKIE = "X-OPENHAB-SESSIONID";
    private final Logger logger = LoggerFactory.getLogger(HABAssistantWebsocketContext.class);
    private final UserRegistry userRegistry;
    private final HttpContext defaultHttpContext;
    private final HABAssistantWebSocketServlet servlet;

    /**
     * Constructs an {@link HABAssistantWebsocketContext} with will another {@link HttpContext} as a base.
     *
     * @param defaultHttpContext the base {@link HttpContext} - use {@link HttpService#createDefaultHttpContext()} to
     *            create a default one
     */
    public HABAssistantWebsocketContext(HABAssistantWebSocketServlet servlet, UserRegistry userRegistry,
            HttpContext defaultHttpContext) {
        this.servlet = servlet;
        this.defaultHttpContext = defaultHttpContext;
        this.userRegistry = userRegistry;
    }

    @Override
    public boolean handleSecurity(@Nullable HttpServletRequest request, @Nullable HttpServletResponse response)
            throws IOException {
        if (request == null) {
            return false;
        }
        if (!servlet.getConfig().secure) {
            // security is disabled
            return defaultHttpContext.handleSecurity(request, response);
        }
        var accessToken = request.getHeader(ALT_AUTH_HEADER);
        if (accessToken != null) {
            // Allow access to the websocket using user generated tokens
            return servlet.isValidToken(accessToken);
        }
        Optional<User> user = Optional.empty();
        var cookies = request.getCookies();
        if (cookies != null && cookies.length > 0) {
            var sessionCookie = Arrays.stream(cookies).filter(cookie -> SESSION_COOKIE.equals(cookie.getName()))
                    .findAny();
            user = sessionCookie.flatMap(cookie -> userRegistry.getAll().stream()
                    .filter(u -> ((ManagedUser) u).getSessions().stream()
                            .anyMatch(s -> s.hasSessionCookie() && s.getSessionId().equals(cookie.getValue())))
                    .findAny());
            user.ifPresent((_user) -> logger.debug("Found active user session: {}", _user.getName()));
        }
        return user.isPresent();
    }

    @Override
    public URL getResource(@Nullable String name) {
        return defaultHttpContext.getResource(name);
    }

    @Override
    public String getMimeType(@Nullable String name) {
        return defaultHttpContext.getMimeType(name);
    }
}
