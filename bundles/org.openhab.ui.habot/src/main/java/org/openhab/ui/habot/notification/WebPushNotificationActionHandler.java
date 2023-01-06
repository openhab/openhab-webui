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
import java.util.Map;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.automation.Action;
import org.openhab.core.automation.handler.ActionHandler;
import org.openhab.core.automation.handler.BaseModuleHandler;
import org.openhab.ui.habot.notification.internal.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;

/**
 * A module handler for an {@link Action} sending web push notification to all subscribed HABot clients.
 *
 * @author Yannick Schaus - Initial contribution
 */
@NonNullByDefault
public class WebPushNotificationActionHandler extends BaseModuleHandler<Action> implements ActionHandler {

    /**
     * The ID of this module type
     */
    public static final String TYPE_ID = "habot.WebPushNotificationAction";

    protected static final String PARAM_TITLE = "title";
    protected static final String PARAM_BODY = "body";
    protected static final String PARAM_CARD_UID = "cardUID";
    protected static final String PARAM_TAGS = "tags";

    private final Logger logger = LoggerFactory.getLogger(WebPushNotificationActionHandler.class);

    private final NotificationService notificationService;

    /**
     * Constructs a WebPushNotificationActionHandler instance
     *
     * @param module the {@link Action} module instance
     * @param notificationService the notification service to use to send the web push notifications
     */
    public WebPushNotificationActionHandler(Action module, NotificationService notificationService) {
        super(module);
        this.notificationService = notificationService;
    }

    @Override
    public @Nullable Map<String, Object> execute(Map<String, Object> context) {
        String title = (String) module.getConfiguration().get(PARAM_TITLE);
        String body = (String) module.getConfiguration().get(PARAM_BODY);
        String cardUID = (String) module.getConfiguration().get(PARAM_CARD_UID);
        @SuppressWarnings("unchecked")
        List<Object> tags = (List<Object>) module.getConfiguration().get(PARAM_TAGS);

        try {
            Gson gson = new Gson();
            HashMap<String, Object> payload = new HashMap<String, Object>();
            payload.put("title", (title != null) ? title : "HABot");
            payload.put("body", body);
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
            logger.error("Error while sending the web push notification", e);
        }

        return null;
    }
}
