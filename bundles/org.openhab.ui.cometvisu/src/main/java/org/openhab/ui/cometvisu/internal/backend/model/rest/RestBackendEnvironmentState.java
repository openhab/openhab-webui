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
package org.openhab.ui.cometvisu.internal.backend.model.rest;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.openhab.core.OpenHAB;

/**
 * Provides some basic information about the backend environment, that is evaluated by the CometVisu
 * to determine the capabilities and compatibility for the CometVisu-manager.
 *
 * @author Tobias Bräutigam - Initial contribution
 *
 */
@NonNullByDefault
public class RestBackendEnvironmentState {
    // as we are just simulating we use a fixed version here to tell that we are compatible
    public int PHP_VERSION_ID = 80100;
    public String phpversion = "8.1.0";

    public String SERVER_SIGNATURE = "";
    public String SERVER_SOFTWARE = "";
    public String required_php_version = ">=7.4";

    // openHAB specific values
    public boolean isOpenHab = true;
    public boolean requiresAuth = true;
    public String server_release = "openHAB " + OpenHAB.getVersion();
}
