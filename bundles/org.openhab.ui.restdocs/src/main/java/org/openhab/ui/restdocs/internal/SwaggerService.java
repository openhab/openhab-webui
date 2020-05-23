/**
 * Copyright (c) 2010-2020 Contributors to the openHAB project
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
package org.openhab.ui.restdocs.internal;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.http.HttpService;
import org.osgi.service.http.NamespaceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This service registers the Swagger UI as a web resource on the HTTP service.
 *
 * @author Kai Kreuzer - Initial contribution
 */
@Component(immediate = true)
@NonNullByDefault
public class SwaggerService {

    private static final String ALIAS = "/doc";

    private final Logger logger = LoggerFactory.getLogger(SwaggerService.class);

    private final HttpService httpService;

    @Activate
    public SwaggerService(final @Reference HttpService httpService) {
        this.httpService = httpService;

        try {
            httpService.registerResources(ALIAS, "swagger", httpService.createDefaultHttpContext());
        } catch (NamespaceException e) {
            logger.error("Could not start up REST documentation service: {}", e.getMessage());
        }
    }

    @Deactivate
    protected void deactivate() {
        httpService.unregister(ALIAS);
    }
}
