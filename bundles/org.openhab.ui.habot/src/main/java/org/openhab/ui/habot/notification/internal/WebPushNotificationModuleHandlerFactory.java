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
package org.openhab.ui.habot.notification.internal;

import java.util.Collection;
import java.util.Set;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.automation.Action;
import org.openhab.core.automation.Module;
import org.openhab.core.automation.handler.BaseModuleHandlerFactory;
import org.openhab.core.automation.handler.ModuleHandler;
import org.openhab.core.automation.handler.ModuleHandlerFactory;
import org.openhab.ui.habot.notification.WebPushNotificationActionHandler;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;

/**
 * The {@link ModuleHandlerFactory} for {@link WebPushNotificationActionHandler} actions.
 *
 * @author Yannick Schaus - Initial contribution
 */
@NonNullByDefault
@Component(service = ModuleHandlerFactory.class, enabled = false)
public class WebPushNotificationModuleHandlerFactory extends BaseModuleHandlerFactory {

    private final NotificationService notificationService;

    @Activate
    public WebPushNotificationModuleHandlerFactory(final @Reference NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Override
    @Deactivate
    public void deactivate() {
        super.deactivate();
    }

    @Override
    public Collection<String> getTypes() {
        return Set.of(WebPushNotificationActionHandler.TYPE_ID);
    }

    @Override
    protected @Nullable ModuleHandler internalCreate(Module module, String ruleUID) {
        return new WebPushNotificationActionHandler((Action) module, notificationService);
    }
}
