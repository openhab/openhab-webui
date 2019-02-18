/**
 * Copyright (c) 2010-2018 by the respective copyright holders.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habot.notification.internal.webpush;

import java.security.PublicKey;

/**
 * This code in this package is mostly borrowed from
 * <a href=
 * "https://github.com/web-push-libs/webpush-java/tree/master/src/main/java/nl/martijndwars/webpush">webpush-java</a>.
 *
 * @author Martijn Dwars
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
