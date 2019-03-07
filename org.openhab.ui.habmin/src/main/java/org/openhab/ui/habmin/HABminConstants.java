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
package org.openhab.ui.habmin;

public class HABminConstants {
    public final static String HABMIN_DATA_DIR = "/habmin/";
    private final static String USERDATA_DIR_PROG_ARGUMENT = "smarthome.userdata";

    public static String getDataDirectory() {
        final String eshUserDataFolder = System.getProperty(USERDATA_DIR_PROG_ARGUMENT);
        if (eshUserDataFolder != null) {
            return eshUserDataFolder + HABMIN_DATA_DIR;
        }
        return null;
    }
}
