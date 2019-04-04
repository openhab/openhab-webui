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
package org.openhab.ui.cometvisu.internal.backend;

import java.util.Map;

import org.eclipse.smarthome.core.items.Item;
import org.eclipse.smarthome.core.types.State;

/**
 * Broadcast state change events of items to listening clients
 *
 * @author Tobias Bräutigam - Initial contribution
 */
public interface EventBroadcaster {
    /**
     * Broadcasts an event described by the given parameters to all currently
     * listening clients.
     *
     * @param item
     *            - the item that should be broadcasted
     * @param eventObject
     *            - bean that can be converted to a JSON object.
     */
    public void broadcastEvent(final Object eventObject);

    /**
     * listens to state changes of the given item, if it is part of the
     * requested items
     *
     * @param item
     *            - the new item, that should be listened to
     */
    public void registerItem(Item item);

    /**
     * listens to state changes of the given item, if it is part of the
     * requested items
     *
     * @param item
     *            - the new item, that should be listened to
     */
    public void unregisterItem(Item item);

    /**
     * listen for state changes from the requested items
     */
    public void registerItems();

    /**
     * lists all client item names and the associated type which must be notified
     * when the item changes
     *
     * @param item
     *            - the item that is listened to
     * @return
     */
    public Map<String, Class<? extends State>> getClientItems(Item item);
}
