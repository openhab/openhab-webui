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
package org.openhab.ui.habot.notification.internal.webpush;

import org.eclipse.jdt.annotation.NonNull;
import org.eclipse.smarthome.core.common.registry.Identifiable;
import org.openhab.ui.habot.notification.internal.webpush.Subscription.Keys;

/**
 * This code in this package is mostly borrowed from
 * <a href=
 * "https://github.com/web-push-libs/webpush-java/tree/master/src/main/java/nl/martijndwars/webpush">webpush-java</a>.
 *
 * @author Martijn Dwars - Initial contribution
 * @author Yannick Schaus - integration for HABot
 */
public class Subscription implements Identifiable<Keys> {
    public String endpoint;

    @NonNull
    public Keys keys;

    public Subscription(String endpoint, @NonNull Keys keys) {
        this.endpoint = endpoint;
        this.keys = keys;
    }

    public class Keys {
        public String p256dh;

        public String auth;

        public Keys() {
            // No-args constructor
        }

        public Keys(String p256dh, String auth) {
            this.p256dh = p256dh;
            this.auth = auth;
        }
    }

    @Override
    public Keys getUID() {
        return keys;
    }
}
