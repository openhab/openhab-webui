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
package org.openhab.ui.habot.notification;

import java.security.GeneralSecurityException;
import java.util.HashMap;
import java.util.List;

import org.openhab.core.model.script.engine.action.ActionDoc;
import org.openhab.core.model.script.engine.action.ActionService;
import org.openhab.ui.habot.notification.internal.NotificationService;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;

/**
 * An @link {@link ActionService} to send web push notifications to HABot clients from rules and scripts.
 *
 * @author Yannick Schaus - Initial contribution
 */
@Component(service = { ActionService.class }, immediate = true)
public class WebPushNotificationAction implements ActionService {

    private static NotificationService notificationService;

    /**
     * Sends a web push notification to all HABot subscribed clients with the specified message
     *
     * @param message the message to send
     */
    @ActionDoc(text = "Sends a web push notification to all HABot subscribed clients")
    public static void sendHABotNotification(String message) {
        sendHABotNotificationExt("HABot", message, null, null);
    }

    /**
     * Sends a web push notification to all HABot subscribed clients with a reference to a card UID to display alongside
     * the message
     *
     * @param message the message to send
     * @param cardUID the card UID to display with the message
     */
    @ActionDoc(text = "Sends a web push notification to all HABot subscribed clients")
    public static void sendHABotNotificationWithCard(String message, String cardUID) {
        sendHABotNotificationExt("HABot", message, cardUID, null);
    }

    /**
     * Sends a web push notification to all HABot subscribed clients with a reference to tags used to retrieve a card
     *
     * @param message the message to send
     * @param tags the tags associated with the notification - cards matching these tags will be displayed alongside
     *            the
     *            message
     */
    @ActionDoc(text = "Sends a web push notification to all HABot subscribed clients")
    public static void sendHABotNotificationWithTags(String message, List<Object> tags) {
        sendHABotNotificationExt("HABot", message, null, tags);
    }

    /**
     * Sends a web push notification to all HABot subscribed clients (extended version)
     *
     * @param title the title of the notification (will only be used for native notifications, won't appear in the
     *            chat)
     * @param message the message to send
     * @param cardUID the optional card UID to display with the message
     * @param tags the optional tags associated with the notification - cards matching these tags will be displayed
     *            alongside the message
     */
    @ActionDoc(text = "Sends a web push notification to all HABot subscribed clients")
    public static void sendHABotNotificationExt(String title, String message, String cardUID, List<Object> tags) {
        try {
            Gson gson = new Gson();
            HashMap<String, Object> payload = new HashMap<String, Object>();
            payload.put("title", title);
            payload.put("body", message);
            HashMap<String, Object> data = new HashMap<String, Object>();
            if (cardUID != null) {
                data.put("cardUID", cardUID);
            }
            if (tags != null) {
                data.put("tags", tags);
            }
            payload.put("data", data);

            String payloadJson = gson.toJson(payload);
            notificationService.broadcastNotification(payloadJson);
        } catch (GeneralSecurityException e) {
            Logger logger = LoggerFactory.getLogger(WebPushNotificationAction.class);
            logger.error("Error while sending web push notification", e);
        }
    }

    @Reference
    protected void setNotificationService(NotificationService notificationService) {
        WebPushNotificationAction.notificationService = notificationService;
    }

    protected void unsetNotificationService(NotificationService notificationService) {
        WebPushNotificationAction.notificationService = null;
    }

    @Override
    public String getActionClassName() {
        return WebPushNotificationAction.class.getCanonicalName();
    }

    @Override
    public Class<?> getActionClass() {
        return WebPushNotificationAction.class;
    }
}
