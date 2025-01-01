/**
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
package org.openhab.ui.habot.notification.internal;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.openhab.core.common.registry.DefaultAbstractManagedProvider;
import org.openhab.core.common.registry.ManagedProvider;
import org.openhab.core.storage.StorageService;
import org.openhab.ui.habot.notification.internal.webpush.Subscription;
import org.openhab.ui.habot.notification.internal.webpush.Subscription.Keys;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * The @link {@link ManagedProvider} for {@link Subscription} elements
 *
 * @author Yannick Schaus - Initial contribution
 */
@NonNullByDefault
@Component(service = SubscriptionProvider.class, immediate = true)
public class SubscriptionProvider extends DefaultAbstractManagedProvider<Subscription, Keys> {

    @Activate
    public SubscriptionProvider(final @Reference StorageService storageService) {
        super(storageService);
    }

    @Override
    protected String getStorageName() {
        return "habot_webpush_subscriptions";
    }

    @Override
    protected String keyToString(Keys key) {
        return String.format("%s.%s", key.p256dh, key.auth);
    }
}
