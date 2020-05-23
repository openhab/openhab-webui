/**
 * Copyright (c) 2010-2020 Contributors to the openHAB project
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
package org.openhab.ui.restdocs.internal;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.ui.tiles.Tile;
import org.osgi.service.component.annotations.Component;

/**
 * The tile for the REST API,
 *
 * @author Kai Kreuzer - Initial contribution
 * @author Yannick Schaus - remove dependency to dashboard
 */
@Component
@NonNullByDefault
public class RESTTile implements Tile {

    @Override
    public String getName() {
        return "REST API";
    }

    @Override
    public String getUrl() {
        return "../doc/index.html";
    }

    @Override
    public @Nullable String getOverlay() {
        return null;
    }

    @Override
    public String getImageUrl() {
        return "../doc/images/tile.png";
    }
}
