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

import org.osgi.service.component.ComponentContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Enables the {@link WebPushNotificationModuleHandlerFactory} on activation - allows the
 * org.openhab.core.automation dependency to remain optional.
 *
 * @author Yannick Schaus - Initial contribution
 */
@Component
public class ModuleHandlerFactoryStarter {

    private final Logger logger = LoggerFactory.getLogger(ModuleHandlerFactoryStarter.class);

    @Activate
    protected void activate(ComponentContext context) {
        try {
            context.enableComponent(WebPushNotificationModuleHandlerFactory.class.getName());
            logger.info("WebPushNotificationModuleHandlerFactory started by ModuleHandlerFactoryStarter");
        } catch (NoClassDefFoundError e) {
            logger.info(
                    "Not registering WebPushNotificationModuleHandlerFactory - make sure the automation engine add-on is installed");
        }
    }

    @Deactivate
    protected void deactivate(ComponentContext context) {
        try {
            context.disableComponent(WebPushNotificationModuleHandlerFactory.class.getName());
        } catch (NoClassDefFoundError e) {
            logger.info(
                    "Not unregistering WebPushNotificationModuleHandlerFactory - make sure the automation engine add-on is installed");
        }
    }
}
