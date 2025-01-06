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
package org.openhab.ui.cometvisu.internal.util;

import javax.ws.rs.core.Response.Status;

/**
 * Exception on file system operations that return a status code for the rest response
 *
 * @author Tobias Bräutigam - Initial contribution
 *
 */
public class FileOperationException extends Exception {
    private static final long serialVersionUID = 1L;
    private Status status;

    public FileOperationException(String message, Status status) {
        super(message);
        this.status = status;
    }

    public Status getStatus() {
        return status;
    }
}
