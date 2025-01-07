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
package org.openhab.ui.cometvisu.internal.backend.rest;

import java.util.Map;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.items.Item;
import org.openhab.core.types.State;

/**
 * Broadcast state change events of items to listening clients
 *
 * @author Tobias Bräutigam - Initial contribution
 */
@NonNullByDefault
public interface EventBroadcaster {
    /**
     * Broadcasts an event described by the given parameters to all currently
     * listening clients.
     *
     * @param eventObject bean that can be converted to a JSON object.
     */
    void broadcastEvent(final Object eventObject);

    /**
     * listens to state changes of the given item, if it is part of the
     * requested items
     *
     * @param item the new item, that should be listened to
     */
    void registerItem(Item item);

    /**
     * listens to state changes of the given item, if it is part of the
     * requested items
     *
     * @param item the new item, that should be listened to
     */
    void unregisterItem(Item item);

    /**
     * listen for state changes from the requested items
     */
    void registerItems();

    /**
     * lists all client item names and the associated type which must be notified
     * when the item changes
     *
     * @param item the item that is listened to
     * @return
     */
    Map<String, @Nullable Class<? extends State>> getClientItems(Item item);
}
