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
package org.openhab.ui.internal;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.http.context.ServletContextHelper;
import org.osgi.service.http.whiteboard.HttpWhiteboardConstants;

/**
 * The {@link UIContext} is the shared context for Main UI servlets
 *
 * @author Jan N. Klug - Initial contribution
 */
@NonNullByDefault
@Component(property = { HttpWhiteboardConstants.HTTP_WHITEBOARD_CONTEXT_NAME + "=org.openhab.ui.context",
        HttpWhiteboardConstants.HTTP_WHITEBOARD_CONTEXT_PATH + "=/",
        HttpWhiteboardConstants.HTTP_WHITEBOARD_CONTEXT_INIT_PARAM_PREFIX + "acceptRanges=true",
        HttpWhiteboardConstants.HTTP_WHITEBOARD_CONTEXT_INIT_PARAM_PREFIX + "dirAllowed=false",
        HttpWhiteboardConstants.HTTP_WHITEBOARD_CONTEXT_INIT_PARAM_PREFIX + "redirectWelcome=false",
        HttpWhiteboardConstants.HTTP_WHITEBOARD_CONTEXT_INIT_PARAM_PREFIX + "preCompressed=true",
        HttpWhiteboardConstants.HTTP_WHITEBOARD_CONTEXT_INIT_PARAM_PREFIX
                + "etags=true" }, service = ServletContextHelper.class)
public class UIContext extends ServletContextHelper {
}
