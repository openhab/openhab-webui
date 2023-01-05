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
package org.openhab.ui.cometvisu.internal.util;

import java.util.Date;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.sse.OutboundSseEvent;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.openhab.ui.cometvisu.internal.StateBeanMessageBodyWriter;
import org.openhab.ui.cometvisu.internal.backend.model.StateBean;

/**
 * Utility class containing helper methods for the SSE implementation.
 *
 * @author Tobias Bräutigam - Initial Contribution and API
 * @author Wouter Born - Migrated to JAX-RS Whiteboard Specification
 */
@NonNullByDefault
public class SseUtil {

    /**
     * Creates a new {@link OutboundEvent} object containing an
     * {@link StateBean} created for the given eventType, objectIdentifier,
     * eventObject.
     *
     * @param eventType the event type for the event
     * @param objectIdentifier the identifier for the main event object
     * @param eventObject the eventObject to be included
     * @return a new OutboundSseEvent
     */
    public static OutboundSseEvent buildEvent(OutboundSseEvent.Builder eventBuilder, Object eventObject) {
        StateBeanMessageBodyWriter writer = new StateBeanMessageBodyWriter();
        Date date = new Date();
        return eventBuilder.mediaType(MediaType.TEXT_PLAIN_TYPE).data(writer.serialize(eventObject))
                .id(String.valueOf(date.getTime())).build();
    }

    /**
     * Used to mark our current thread(request processing) that SSE blocking
     * should be enabled.
     */
    private static ThreadLocal<Boolean> blockingSseEnabled = new ThreadLocal<>() {
        @Override
        protected Boolean initialValue() {
            return false;
        }
    };

    /**
     * Returns true if the current thread is processing an SSE request that
     * should block.
     *
     * @return
     */
    public static boolean shouldAsyncBlock() {
        return blockingSseEnabled.get().booleanValue();
    }

    /**
     * Marks the current thread as processing a blocking sse request.
     */
    public static void enableBlockingSse() {
        blockingSseEnabled.set(true);
    }
}
