/**
 * Copyright (c) 2010-2018 by the respective copyright holders.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habot.notification.internal;

import static org.bouncycastle.jce.provider.BouncyCastleProvider.PROVIDER_NAME;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.InvalidAlgorithmParameterException;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.Security;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

import javax.ws.rs.core.Response;

import org.apache.commons.io.IOUtils;
import org.bouncycastle.jce.ECNamedCurveTable;
import org.bouncycastle.jce.interfaces.ECPrivateKey;
import org.bouncycastle.jce.interfaces.ECPublicKey;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.jce.spec.ECNamedCurveParameterSpec;
import org.eclipse.smarthome.config.core.ConfigConstants;
import org.jose4j.lang.JoseException;
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
 * @author Yannick Schaus
 */
@Component(service = NotificationService.class, immediate = true)
public class NotificationService {

    private final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    private static final String VAPID_KEYS_FILE_NAME = "habot" + File.separator + "vapid_keys";
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
        if (this.subscriptionProvider.get(subscription.keys) == null) {
            this.subscriptionProvider.add(subscription);
        }
    }

    /**
     * Broadcast a web push notification to all subscriptions
     *
     * @param payload the payload to push
     * @throws GeneralSecurityException
     */
    public void broadcastNotification(String payload) throws GeneralSecurityException {
        for (Subscription subscription : this.subscriptionProvider.getAll()) {
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
            return this.pushService.send(notification);
        } catch (IOException | JoseException | ExecutionException | InterruptedException e) {
            logger.error("Unable to send the notification to {}: {}",
                    this.subscriptionProvider.keyToString(subscription.keys), e.toString());
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

        List<String> encodedKeys = new ArrayList<String>();
        encodedKeys.add(BaseEncoding.base64Url().encode(publicKey));
        encodedKeys.add(BaseEncoding.base64Url().encode(privateKey));

        // write the public key, then the private key in encoded form on separate lines in the file
        File file = new File(ConfigConstants.getUserDataFolder() + File.separator + VAPID_KEYS_FILE_NAME);
        file.getParentFile().mkdirs();
        IOUtils.writeLines(encodedKeys, System.lineSeparator(), new FileOutputStream(file));

        this.publicVAPIDKey = encodedKeys.get(0);
        this.privateVAPIDKey = encodedKeys.get(1);
    }

    /**
     * Loads the VAPID keypair from the file, or generate them if they don't exist.
     */
    private void loadVAPIDKeys() {
        try {
            List<String> encodedKeys = IOUtils.readLines(
                    new FileInputStream(ConfigConstants.getUserDataFolder() + File.separator + VAPID_KEYS_FILE_NAME));
            this.publicVAPIDKey = encodedKeys.get(0);
            this.privateVAPIDKey = encodedKeys.get(1);
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
        if (this.pushService == null) {
            loadVAPIDKeys();
            this.pushService = new PushService(this.publicVAPIDKey, this.privateVAPIDKey, SUBJECT_NAME);
        }
        return this.pushService;
    }

}
