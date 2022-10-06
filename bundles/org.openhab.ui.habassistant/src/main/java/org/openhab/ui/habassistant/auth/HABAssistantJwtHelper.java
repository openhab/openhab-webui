/**
 * Copyright (c) 2010-2022 Contributors to the openHAB project
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
package org.openhab.ui.habassistant.auth;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.jose4j.jwa.AlgorithmConstraints;
import org.jose4j.jwk.JsonWebKey;
import org.jose4j.jwk.RsaJsonWebKey;
import org.jose4j.jws.AlgorithmIdentifiers;
import org.jose4j.jwt.JwtClaims;
import org.jose4j.jwt.MalformedClaimException;
import org.jose4j.jwt.consumer.InvalidJwtException;
import org.jose4j.jwt.consumer.JwtConsumer;
import org.jose4j.jwt.consumer.JwtConsumerBuilder;
import org.jose4j.lang.JoseException;
import org.openhab.core.OpenHAB;
import org.openhab.core.auth.Authentication;
import org.openhab.core.auth.AuthenticationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * An implementation of {@link HABAssistantJwtHelper} which will validate jwt tokens.
 *
 * @author Miguel Álvarez - Initial contribution
 */
@NonNullByDefault
public class HABAssistantJwtHelper {
    private final Logger logger = LoggerFactory.getLogger(HABAssistantJwtHelper.class);

    private static final String KEY_FILE_PATH = OpenHAB.getUserDataFolder() + File.separator + "secrets"
            + File.separator + "rsa_json_web_key.json";

    private static final String ISSUER_NAME = "openhab";
    private static final String AUDIENCE = "openhab";

    private RsaJsonWebKey jwtWebKey;

    public HABAssistantJwtHelper() {
        try {
            jwtWebKey = loadKey();
        } catch (Exception e) {
            logger.error("Error while initializing the JWT helper", e);
            throw new IllegalStateException(e.getMessage(), e);
        }
    }

    private RsaJsonWebKey loadKey() throws FileNotFoundException, JoseException, IOException {
        try (final BufferedReader reader = Files.newBufferedReader(Paths.get(KEY_FILE_PATH))) {
            return (RsaJsonWebKey) JsonWebKey.Factory.newJwk(reader.readLine());
        } catch (IOException | JoseException e) {
            throw e;
        }
    }

    /**
     * Performs verifications on a JWT token, then parses it into a {@link AuthenticationException} instance
     *
     * @param jwt the base64-encoded JWT token from the request
     * @return the {@link Authentication} derived from the information in the token
     * @throws AuthenticationException
     */
    public Authentication verifyAndParseJwtAccessToken(String jwt) throws AuthenticationException {
        JwtConsumer jwtConsumer = new JwtConsumerBuilder().setRequireExpirationTime().setAllowedClockSkewInSeconds(30)
                .setRequireSubject().setExpectedIssuer(ISSUER_NAME).setExpectedAudience(AUDIENCE)
                .setVerificationKey(jwtWebKey.getKey()).setJwsAlgorithmConstraints(
                        AlgorithmConstraints.ConstraintType.WHITELIST, AlgorithmIdentifiers.RSA_USING_SHA256)
                .build();

        try {
            JwtClaims jwtClaims = jwtConsumer.processToClaims(jwt);
            String username = jwtClaims.getSubject();
            List<String> roles = jwtClaims.getStringListClaimValue("role");
            String scope = jwtClaims.getStringClaimValue("scope");
            return new Authentication(username, roles.toArray(new String[roles.size()]), scope);
        } catch (InvalidJwtException | MalformedClaimException e) {
            throw new AuthenticationException("Error while processing JWT token", e);
        }
    }
}
