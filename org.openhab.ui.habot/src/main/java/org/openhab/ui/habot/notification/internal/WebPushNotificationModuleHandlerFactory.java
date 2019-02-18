/**
 * Copyright (c) 2010-2018 by the respective copyright holders.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habot.notification.internal;

import java.util.Collection;
import java.util.Collections;

import org.eclipse.jdt.annotation.NonNull;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.automation.Action;
import org.openhab.core.automation.Module;
import org.openhab.core.automation.handler.BaseModuleHandlerFactory;
import org.openhab.core.automation.handler.ModuleHandler;
import org.openhab.core.automation.handler.ModuleHandlerFactory;
import org.openhab.ui.habot.notification.WebPushNotificationActionHandler;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * The {@link ModuleHandlerFactory} for {@link WebPushNotificationActionHandler} actions.
 *
 * @author Yannick Schaus
 */
@Component(service = ModuleHandlerFactory.class, enabled = false)
public class WebPushNotificationModuleHandlerFactory extends BaseModuleHandlerFactory {

    private NotificationService notificationService;

    @Override
    public Collection<@NonNull String> getTypes() {
        return Collections.singleton(WebPushNotificationActionHandler.TYPE_ID);
    }

    @Override
    protected @Nullable ModuleHandler internalCreate(@NonNull Module module, @NonNull String ruleUID) {
        return new WebPushNotificationActionHandler((Action) module, notificationService);
    }

    @Reference
    protected void setNotificationService(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    protected void unsetNotificationService(NotificationService notificationService) {
        this.notificationService = null;
    }
}
