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
package org.openhab.ui.basic.internal;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.ui.tiles.Tile;
import org.osgi.service.component.annotations.Component;

/**
 * The tile for the Basic UI
 *
 * @author Kai Kreuzer - Initial contribution
 * @author Yannick Schaus - Remove dependency to dashboard
 */
@Component
@NonNullByDefault
public class BasicUITile implements Tile {

    @Override
    public String getName() {
        return "Basic UI";
    }

    @Override
    public String getUrl() {
        return "/basicui/app";
    }

    @Override
    public @Nullable String getOverlay() {
        return null;
    }

    @Override
    public String getImageUrl() {
        return "/res/img/basicui.png";
    }
}
