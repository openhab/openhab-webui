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

import org.eclipse.jdt.annotation.NonNullByDefault;

/**
 * This is the exception to use when a servlet access is forbidden because implicit user role setting is disabled.
 *
 * @author Laurent Garnier - Initial contribution
 */
@NonNullByDefault
public class ServletForbiddenAccessException extends Exception {

    private static final long serialVersionUID = 6441108424412835198L;

    public ServletForbiddenAccessException(String message) {
        super(message);
    }
}
