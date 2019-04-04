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
package org.openhab.ui.habmin.internal;

import org.openhab.ui.dashboard.DashboardTile;

/**
 * The dashboard tile for the HABmin UI
 * 
 * @author Chris Jackson
 *
 */
public class HABminUIDashboardTile implements DashboardTile {

    @Override
    public String getName() {
        return "HABmin";
    }

    @Override
    public String getUrl() {
        return "../habmin/index.html";
    }
    
    @Override
    public String getImageUrl() {
        return "../habmin/assets/dashboardtile.png";
    }

    @Override
    public String getOverlay() {
        return null;
    }
}
