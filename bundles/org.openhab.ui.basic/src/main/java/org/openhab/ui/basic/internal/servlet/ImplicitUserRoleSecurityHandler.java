/**
 * Copyright (c) 2010-2023 Contributors to the openHAB project
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
package org.openhab.ui.basic.internal.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.config.core.ConfigParser;
import org.openhab.core.io.http.Handler;
import org.openhab.core.io.http.HandlerContext;
import org.openhab.core.io.http.HandlerPriorities;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Modified;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * HTTP request handler to verify that the implicit user role setting is enabled for certain URI.
 * If the setting is disabled, the HTTP request will return a 403 (forbidden) status.
 *
 * This is something to use by servlets that do not yet implement any authentication.
 *
 * @author Laurent Garnier - Initial contribution
 */
@Component(service = { ImplicitUserRoleSecurityHandler.class,
        Handler.class }, configurationPid = "org.openhab.restauth")
@NonNullByDefault
public class ImplicitUserRoleSecurityHandler implements Handler {

    private static final String CONFIG_IMPLICIT_USER_ROLE = "implicitUserRole";

    private static final String CONTENT_TYPE = "text/html;charset=UTF-8";

    private final Logger logger = LoggerFactory.getLogger(ImplicitUserRoleSecurityHandler.class);

    private boolean implicitUserRole = true;

    private Set<String> checkingUris = ConcurrentHashMap.newKeySet();

    @Activate
    protected void activate(@Nullable Map<String, Object> properties) {
        modified(properties);
    }

    @Modified
    protected void modified(@Nullable Map<String, Object> properties) {
        if (properties != null) {
            implicitUserRole = ConfigParser.valueAsOrElse(properties.get(CONFIG_IMPLICIT_USER_ROLE), Boolean.class,
                    true);
        }
    }

    public boolean addUriToChecks(String uri) {
        return checkingUris.add(uri);
    }

    public boolean removeUriFromChecks(String uri) {
        return checkingUris.remove(uri);
    }

    @Override
    public int getPriority() {
        // Higher priority than authentication to be sure that it will be called even
        // when org.openhab.auth:enabled is false
        return HandlerPriorities.AUTHENTICATION - 10;
    }

    @Override
    public void handle(@Nullable HttpServletRequest request, @Nullable HttpServletResponse response,
            @Nullable HandlerContext context) throws Exception {
        String requestUri = request == null ? null : request.getRequestURI();
        if (requestUri != null && !implicitUserRole) {
            for (String uri : checkingUris) {
                if (requestUri.startsWith(uri)) {
                    throw new ServletForbiddenAccessException("Access to servlet " + uri + " is forbidden");
                }
            }
        }
        if (context != null) {
            context.execute(request, response);
        }
    }

    @Override
    public void handleError(@Nullable HttpServletRequest request, @Nullable HttpServletResponse response,
            @Nullable HandlerContext context) {
        if (response != null && (response.getStatus() == 403 || response.getStatus() == 401)) {
            // already handled
            return;
        }

        Object error = request == null ? null : request.getAttribute(HandlerContext.ERROR_ATTRIBUTE);
        if (error instanceof ServletForbiddenAccessException) {
            try {
                if (response != null) {
                    response.setStatus(403);
                    response.setContentType(CONTENT_TYPE);
                    PrintWriter writer = response.getWriter();
                    writer.println("<html><body><p>" + ((ServletForbiddenAccessException) error).getMessage()
                            + "</p><p>Can't work until the implicit user role setting (in API security server settings) is enabled.</p></body></html>");
                    writer.flush();
                }
            } catch (IOException e) {
                logger.warn("Couldn't generate or send client response", e);
            }
        } else {
            // let other handler handle error
            if (context != null) {
                context.execute(request, response);
            }
        }
    }
}
