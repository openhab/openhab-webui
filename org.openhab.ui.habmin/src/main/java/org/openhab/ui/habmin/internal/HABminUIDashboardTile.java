/**
 * Copyright (c) 2014-2015 openHAB UG (haftungsbeschraenkt) and others.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
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
