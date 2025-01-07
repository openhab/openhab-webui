/*
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

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.SecureRandom;
import java.security.interfaces.ECPrivateKey;
import java.security.spec.InvalidKeySpecException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.Invocation;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedHashMap;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Variant;

import org.bouncycastle.jce.ECNamedCurveTable;
import org.bouncycastle.jce.interfaces.ECPublicKey;
import org.bouncycastle.jce.spec.ECNamedCurveParameterSpec;
import org.bouncycastle.math.ec.ECPoint;
import org.jose4j.jws.AlgorithmIdentifiers;
import org.jose4j.jws.JsonWebSignature;
import org.jose4j.jwt.JwtClaims;
import org.jose4j.lang.JoseException;

import com.google.common.io.BaseEncoding;

/**
 * This code in this package is mostly borrowed from
 * <a href=
 * "https://github.com/web-push-libs/webpush-java/tree/master/src/main/java/nl/martijndwars/webpush">webpush-java</a>.
 *
 * @author Martijn Dwars - Initial contribution
 * @author Yannick Schaus - integration for HABot, replaced Apache HTTP client with JAX-RS
 */
public class PushService {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    /**
     * The Google Cloud Messaging API key (for pre-VAPID in Chrome)
     */
    private String gcmApiKey;

    /**
     * Subject used in the JWT payload (for VAPID)
     */
    private String subject;

    /**
     * The public key (for VAPID)
     */
    private PublicKey publicKey;

    /**
     * The private key (for VAPID)
     */
    private PrivateKey privateKey;

    public PushService() {
    }

    public PushService(String gcmApiKey) {
        this.gcmApiKey = gcmApiKey;
    }

    public PushService(KeyPair keyPair, String subject) {
        this.publicKey = keyPair.getPublic();
        this.privateKey = keyPair.getPrivate();
        this.subject = subject;
    }

    public PushService(String publicKey, String privateKey, String subject) throws GeneralSecurityException {
        this.publicKey = Utils.loadPublicKey(publicKey);
        this.privateKey = Utils.loadPrivateKey(privateKey);
        this.subject = subject;
    }

    /**
     * Encrypt the getPayload using the user's public key using Elliptic Curve
     * Diffie Hellman cryptography over the prime256v1 curve.
     *
     * @return An Encrypted object containing the public key, salt, and
     *         ciphertext, which can be sent to the other party.
     */
    public static Encrypted encrypt(byte[] buffer, PublicKey userPublicKey, byte[] userAuth, int padSize)
            throws GeneralSecurityException, IOException {
        ECNamedCurveParameterSpec parameterSpec = ECNamedCurveTable.getParameterSpec("prime256v1");

        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("ECDH", "BC");
        keyPairGenerator.initialize(parameterSpec);

        KeyPair serverKey = keyPairGenerator.generateKeyPair();

        Map<String, KeyPair> keys = new HashMap<>();
        keys.put("server-key-id", serverKey);

        Map<String, String> labels = new HashMap<>();
        labels.put("server-key-id", "P-256");

        byte[] salt = new byte[16];
        SECURE_RANDOM.nextBytes(salt);

        HttpEce httpEce = new HttpEce(keys, labels);
        byte[] ciphertext = httpEce.encrypt(buffer, salt, null, "server-key-id", userPublicKey, userAuth, padSize);

        return new Encrypted.Builder().withSalt(salt).withPublicKey(serverKey.getPublic()).withCiphertext(ciphertext)
                .build();
    }

    /**
     * Send a notification and wait for the response.
     *
     * @param notification
     * @return
     * @throws GeneralSecurityException
     * @throws IOException
     * @throws JoseException
     * @throws ExecutionException
     * @throws InterruptedException
     */
    public Future<Response> send(Notification notification)
            throws GeneralSecurityException, IOException, JoseException, ExecutionException, InterruptedException {
        assert (verifyKeyPair());

        BaseEncoding base64url = BaseEncoding.base64Url();

        Encrypted encrypted = encrypt(notification.getPayload(), notification.getUserPublicKey(),
                notification.getUserAuth(), notification.getPadSize());

        byte[] dh = Utils.savePublicKey((ECPublicKey) encrypted.getPublicKey());
        byte[] salt = encrypted.getSalt();

        Invocation.Builder invocationBuilder = ClientBuilder.newClient().target(notification.getEndpoint()).request();
        MultivaluedMap<String, Object> headers = new MultivaluedHashMap<>();
        headers.add("TTL", String.valueOf(notification.getTTL()));

        if (notification.hasPayload()) {
            headers.add("Content-Type", "application/octet-stream");
            headers.add("Content-Encoding", "aesgcm");
            headers.add("Encryption", "salt=" + base64url.omitPadding().encode(salt));
            headers.add("Crypto-Key", "dh=" + base64url.encode(dh));
        }

        if (notification.isGcm()) {
            if (gcmApiKey == null) {
                throw new IllegalStateException(
                        "An GCM API key is needed to send a push notification to a GCM endpoint.");
            }

            headers.add("Authorization", "key=" + gcmApiKey);
        }

        if (vapidEnabled() && !notification.isGcm()) {
            JwtClaims claims = new JwtClaims();
            claims.setAudience(notification.getOrigin());
            claims.setExpirationTimeMinutesInTheFuture(12 * 60);
            claims.setSubject(subject);

            JsonWebSignature jws = new JsonWebSignature();
            jws.setHeader("typ", "JWT");
            jws.setHeader("alg", "ES256");
            jws.setPayload(claims.toJson());
            jws.setKey(privateKey);
            jws.setAlgorithmHeaderValue(AlgorithmIdentifiers.ECDSA_USING_P256_CURVE_AND_SHA256);

            headers.add("Authorization", "WebPush " + jws.getCompactSerialization());

            byte[] pk = Utils.savePublicKey((ECPublicKey) publicKey);

            if (headers.containsKey("Crypto-Key")) {
                headers.putSingle("Crypto-Key",
                        headers.getFirst("Crypto-Key") + ";p256ecdsa=" + base64url.omitPadding().encode(pk));
            } else {
                headers.add("Crypto-Key", "p256ecdsa=" + base64url.encode(pk));
            }
        }

        invocationBuilder.headers(headers);

        if (notification.hasPayload()) {
            return invocationBuilder.async().post(Entity.entity(encrypted.getCiphertext(),
                    new Variant(MediaType.APPLICATION_OCTET_STREAM_TYPE, (String) null, "aesgcm")));
        } else {
            return invocationBuilder.async().post(null);
        }
    }

    private boolean verifyKeyPair() {
        ECNamedCurveParameterSpec curveParameters = ECNamedCurveTable.getParameterSpec(Utils.CURVE);
        ECPoint g = curveParameters.getG();
        ECPoint sG = g.multiply(((ECPrivateKey) privateKey).getS());

        return sG.equals(((ECPublicKey) publicKey).getQ());
    }

    /**
     * Set the Google Cloud Messaging (GCM) API key
     *
     * @param gcmApiKey
     * @return
     */
    public PushService setGcmApiKey(String gcmApiKey) {
        this.gcmApiKey = gcmApiKey;

        return this;
    }

    /**
     * Set the JWT subject (for VAPID)
     *
     * @param subject
     * @return
     */
    public PushService setSubject(String subject) {
        this.subject = subject;

        return this;
    }

    /**
     * Set the public and private key (for VAPID).
     *
     * @param keyPair
     * @return
     */
    public PushService setKeyPair(KeyPair keyPair) {
        setPublicKey(keyPair.getPublic());
        setPrivateKey(keyPair.getPrivate());

        return this;
    }

    public PublicKey getPublicKey() {
        return publicKey;
    }

    /**
     * Set the public key using a base64url-encoded string.
     *
     * @param publicKey
     * @return
     */
    public PushService setPublicKey(String publicKey)
            throws NoSuchAlgorithmException, NoSuchProviderException, InvalidKeySpecException {
        setPublicKey(Utils.loadPublicKey(publicKey));

        return this;
    }

    public PrivateKey getPrivateKey() {
        return privateKey;
    }

    public KeyPair getKeyPair() {
        return new KeyPair(publicKey, privateKey);
    }

    /**
     * Set the public key (for VAPID)
     *
     * @param publicKey
     * @return
     */
    public PushService setPublicKey(PublicKey publicKey) {
        this.publicKey = publicKey;

        return this;
    }

    /**
     * Set the public key using a base64url-encoded string.
     *
     * @param privateKey
     * @return
     */
    public PushService setPrivateKey(String privateKey)
            throws NoSuchAlgorithmException, NoSuchProviderException, InvalidKeySpecException {
        setPrivateKey(Utils.loadPrivateKey(privateKey));

        return this;
    }

    /**
     * Set the private key (for VAPID)
     *
     * @param privateKey
     * @return
     */
    public PushService setPrivateKey(PrivateKey privateKey) {
        this.privateKey = privateKey;

        return this;
    }

    /**
     * Check if VAPID is enabled
     *
     * @return
     */
    protected boolean vapidEnabled() {
        return publicKey != null && privateKey != null;
    }
}
