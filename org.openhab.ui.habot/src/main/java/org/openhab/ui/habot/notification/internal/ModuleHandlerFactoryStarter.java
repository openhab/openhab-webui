/**
 * Copyright (c) 2010-2018 by the respective copyright holders.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
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
 * org.eclipse.smarthome.automation dependency to remain optional.
 *
 * @author Yannick Schaus
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
