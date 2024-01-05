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

import static org.bouncycastle.jce.provider.BouncyCastleProvider.PROVIDER_NAME;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.security.GeneralSecurityException;
import java.security.InvalidAlgorithmParameterException;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.Security;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.stream.Collectors;

import javax.ws.rs.core.Response;

import org.bouncycastle.jce.ECNamedCurveTable;
import org.bouncycastle.jce.interfaces.ECPrivateKey;
import org.bouncycastle.jce.interfaces.ECPublicKey;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.jce.spec.ECNamedCurveParameterSpec;
import org.jose4j.lang.JoseException;
import org.openhab.core.OpenHAB;
import org.openhab.ui.habot.notification.internal.webpush.Notification;
import org.openhab.ui.habot.notification.internal.webpush.PushService;
import org.openhab.ui.habot.notification.internal.webpush.Subscription;
import org.openhab.ui.habot.notification.internal.webpush.Utils;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferencePolicy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.io.BaseEncoding;

/**
 * Handles the web push notifications.
 *
 * @author Yannick Schaus - Initial contribution
 */
@Component(service = NotificationService.class, immediate = true)
public class NotificationService {

    private final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    private static final Path VAPID_KEYS_PATH = Path.of(OpenHAB.getUserDataFolder(), "habot", "vapid_keys");
    private static final String SUBJECT_NAME = "habot@openhab.org";

    private SubscriptionProvider subscriptionProvider;
    private String publicVAPIDKey;
    private String privateVAPIDKey;

    private PushService pushService = null;

    public NotificationService() {
        // Add BouncyCastle as an algorithm provider
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }

    /**
     * Gets the public VAPID key
     *
     * @return the string representation of the public key
     */
    public String getVAPIDPublicKey() {
        loadVAPIDKeys();
        return publicVAPIDKey;
    }

    /**
     * Store a new subscription
     *
     * @param subscription the subscription to store
     */
    public void addSubscription(Subscription subscription) {
        if (subscriptionProvider.get(subscription.keys) == null) {
            subscriptionProvider.add(subscription);
        }
    }

    /**
     * Broadcast a web push notification to all subscriptions
     *
     * @param payload the payload to push
     * @throws GeneralSecurityException
     */
    public void broadcastNotification(String payload) throws GeneralSecurityException {
        for (Subscription subscription : subscriptionProvider.getAll()) {
            sendNotification(subscription, payload);
        }
    }

    /**
     * Sends a web push notification to a specified subscription
     *
     * @param subscription the subscription to send the notification to
     * @param payload the payload to push
     * @return the {@link Future} for the {@link Response} to the push server
     * @throws GeneralSecurityException
     */
    public Future<Response> sendNotification(Subscription subscription, String payload)
            throws GeneralSecurityException {
        getPushService();

        Notification notification = new Notification(subscription, payload);
        try {
            return pushService.send(notification);
        } catch (IOException | JoseException | ExecutionException | InterruptedException e) {
            logger.error("Unable to send the notification to {}: {}",
                    subscriptionProvider.keyToString(subscription.keys), e.toString());
            return null;
        }
    }

    @Reference(policy = ReferencePolicy.DYNAMIC)
    protected void setSubscriptionProvider(SubscriptionProvider subscriptionProvider) {
        this.subscriptionProvider = subscriptionProvider;
    }

    protected void unsetSubscriptionProvider(SubscriptionProvider subscriptionProvider) {
        this.subscriptionProvider = null;
    }

    /**
     * Generate an EC keypair on the prime256v1 curve and save them to a file for later usage.
     *
     * Some code borrowed from
     * <a href=
     * "https://github.com/web-push-libs/webpush-java/blob/master/src/main/java/nl/martijndwars/webpush/cli/handlers/GenerateKeyHandler.java">webpush-java</a>.
     *
     * @author Martijn Dwars
     *
     * @throws InvalidAlgorithmParameterException
     * @throws NoSuchProviderException
     * @throws NoSuchAlgorithmException
     * @throws IOException
     * @throws FileNotFoundException
     */
    private void generateVAPIDKeyPair() throws InvalidAlgorithmParameterException, NoSuchProviderException,
            NoSuchAlgorithmException, FileNotFoundException, IOException {
        ECNamedCurveParameterSpec parameterSpec = ECNamedCurveTable.getParameterSpec(Utils.CURVE);

        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance(Utils.ALGORITHM, PROVIDER_NAME);
        keyPairGenerator.initialize(parameterSpec);

        KeyPair keyPair = keyPairGenerator.generateKeyPair();
        byte[] publicKey = Utils.savePublicKey((ECPublicKey) keyPair.getPublic());
        byte[] privateKey = Utils.savePrivateKey((ECPrivateKey) keyPair.getPrivate());

        List<String> encodedKeys = List.of(BaseEncoding.base64Url().encode(publicKey),
                BaseEncoding.base64Url().encode(privateKey));

        // write the public key, then the private key in encoded form on separate lines in the file
        Files.createDirectories(VAPID_KEYS_PATH.getParent());
        String lines = encodedKeys.stream().collect(Collectors.joining(System.lineSeparator()));
        Files.writeString(VAPID_KEYS_PATH, lines, StandardOpenOption.TRUNCATE_EXISTING);

        publicVAPIDKey = encodedKeys.get(0);
        privateVAPIDKey = encodedKeys.get(1);
    }

    /**
     * Loads the VAPID keypair from the file, or generate them if they don't exist.
     */
    private void loadVAPIDKeys() {
        try {
            List<String> encodedKeys = Files.readAllLines(VAPID_KEYS_PATH);
            publicVAPIDKey = encodedKeys.get(0);
            privateVAPIDKey = encodedKeys.get(1);
        } catch (IOException e) {
            try {
                generateVAPIDKeyPair();
            } catch (InvalidAlgorithmParameterException | NoSuchProviderException | NoSuchAlgorithmException
                    | IOException e1) {
                RuntimeException ex = new RuntimeException("Cannot get the VAPID keypair for push notifications");
                ex.initCause(e1);
                throw ex;
            }
        }
    }

    private PushService getPushService() throws GeneralSecurityException {
        if (pushService == null) {
            loadVAPIDKeys();
            pushService = new PushService(publicVAPIDKey, privateVAPIDKey, SUBJECT_NAME);
        }
        return pushService;
    }
}
