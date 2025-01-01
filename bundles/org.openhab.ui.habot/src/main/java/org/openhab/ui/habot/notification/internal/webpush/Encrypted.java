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
package org.openhab.ui.habot.notification.internal.webpush;

import java.security.PublicKey;

/**
 * This code in this package is mostly borrowed from
 * <a href=
 * "https://github.com/web-push-libs/webpush-java/tree/master/src/main/java/nl/martijndwars/webpush">webpush-java</a>.
 *
 * @author Martijn Dwars - Initial contribution
 * @author Yannick Schaus - integration for HABot
 */
public class Encrypted {
    private final PublicKey publicKey;
    private final byte[] salt;
    private final byte[] ciphertext;

    public Encrypted(final PublicKey publicKey, final byte[] salt, final byte[] ciphertext) {
        this.publicKey = publicKey;
        this.salt = salt;
        this.ciphertext = ciphertext;
    }

    public PublicKey getPublicKey() {
        return publicKey;
    }

    public byte[] getSalt() {
        return salt;
    }

    public byte[] getCiphertext() {
        return ciphertext;
    }

    public static class Builder {
        private PublicKey publicKey;
        private byte[] salt;
        private byte[] ciphertext;

        public Builder withPublicKey(PublicKey publicKey) {
            this.publicKey = publicKey;

            return this;
        }

        public Builder withSalt(byte[] salt) {
            this.salt = salt;

            return this;
        }

        public Builder withCiphertext(byte[] ciphertext) {
            this.ciphertext = ciphertext;

            return this;
        }

        public Encrypted build() {
            return new Encrypted(publicKey, salt, ciphertext);
        }
    }
}
