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
package org.openhab.ui.habassistant;

import org.eclipse.jdt.annotation.NonNullByDefault;

/**
 * The {@link HABAssistantConstants} class defines common constants, which are
 * used across the whole addon.
 *
 * @author Miguel Álvarez - Initial contribution
 */
@NonNullByDefault
public class HABAssistantConstants {

    /**
     * Service name
     */
    public static final String SERVICE_NAME = "HAB Assistant";

    /**
     * Service id
     */
    public static final String SERVICE_ID = "habassistant";

    /**
     * Service category
     */
    public static final String SERVICE_CATEGORY = "ui";

    /**
     * Service pid
     */
    public static final String SERVICE_PID = "org.openhab." + SERVICE_ID;
}
