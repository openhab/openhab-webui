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
package org.openhab.ui.cometvisu.internal.listeners;

import java.util.Map;

import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.items.GroupItem;
import org.openhab.core.items.Item;
import org.openhab.core.items.StateChangeListener;
import org.openhab.core.types.State;
import org.openhab.ui.cometvisu.internal.backend.model.StateBean;
import org.openhab.ui.cometvisu.internal.backend.rest.EventBroadcaster;

/**
 * listens to state changes on items and send them to an EventBroadcaster
 *
 * @author Tobias Bräutigam - Initial contribution
 */
public class StateEventListener implements StateChangeListener {

    private EventBroadcaster eventBroadcaster;

    public StateEventListener(EventBroadcaster eventBroadcaster) {
        this.eventBroadcaster = eventBroadcaster;
    }

    public void setEventBroadcaster(EventBroadcaster eventBroadcaster) {
        this.eventBroadcaster = eventBroadcaster;
    }

    protected void unsetEventBroadcaster(EventBroadcaster eventBroadcaster) {
        this.eventBroadcaster = null;
    }

    @Override
    public void stateChanged(Item item, State oldState, State newState) {
        Map<String, @Nullable Class<? extends State>> clientItems = eventBroadcaster.getClientItems(item);
        if (!clientItems.isEmpty()) {
            for (String cvItemName : clientItems.keySet()) {
                Class<? extends State> stateClass = clientItems.get(cvItemName);
                StateBean stateBean = new StateBean();
                stateBean.name = cvItemName;
                if (stateClass != null) {
                    stateBean.state = item.getStateAs(stateClass).toString();
                } else {
                    stateBean.state = item.getState().toString();
                }
                eventBroadcaster.broadcastEvent(stateBean);
            }
        } else {
            StateBean stateBean = new StateBean();
            stateBean.name = item.getName();
            stateBean.state = newState.toString();
            eventBroadcaster.broadcastEvent(stateBean);
        }
    }

    @Override
    public void stateUpdated(Item item, State state) {
        if (item instanceof GroupItem) {
            // group item update could be relevant for the client, although the state of switch group does not change
            // wenn more the one are on, the number-groupFunction changes
            Map<String, @Nullable Class<? extends State>> clientItems = eventBroadcaster.getClientItems(item);
            for (String cvItemName : clientItems.keySet()) {
                Class<? extends State> stateClass = clientItems.get(cvItemName);
                if (stateClass != null) {
                    StateBean stateBean = new StateBean();
                    stateBean.name = cvItemName;
                    stateBean.state = item.getStateAs(stateClass).toString();

                    eventBroadcaster.broadcastEvent(stateBean);
                }
            }
        }
    }
}
