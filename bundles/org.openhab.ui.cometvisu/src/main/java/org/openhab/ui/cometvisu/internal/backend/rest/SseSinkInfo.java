/**
 * Copyright (c) 2010-2024 Contributors to the openHAB project
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
package org.openhab.ui.cometvisu.internal.backend.rest;

import java.util.List;

import org.eclipse.jdt.annotation.NonNullByDefault;

/**
 * The specific information we need to hold for a SSE sink.
 *
 * @author Wouter Born - Initial contribution
 */
@NonNullByDefault
public class SseSinkInfo {

    public List<String> itemNames;
    public long index;
    public long time;

    public SseSinkInfo(List<String> itemNames, long index, long time) {
        this.itemNames = itemNames;
        this.index = index;
        this.time = time;
    }
}
