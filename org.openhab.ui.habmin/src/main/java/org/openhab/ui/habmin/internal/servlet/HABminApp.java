/**
 * Copyright (c) 2014 openHAB UG (haftungsbeschraenkt) and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habmin.internal.servlet;

import org.osgi.service.component.ComponentContext;
import org.osgi.service.http.HttpService;
import org.osgi.service.http.NamespaceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This component registers the HABmin Webapp.
 * 
 * @author Chris Jackson - Initial contribution
 */
public class HABminApp {

    public static final String HABMIN_ALIAS = "/habmin";
    private static final Logger logger = LoggerFactory.getLogger(HABminApp.class);

    protected HttpService httpService;

    protected void activate(ComponentContext componentContext) {
        try {
            httpService.registerResources(HABMIN_ALIAS, "web", null);
            logger.info("Started HABmin servlet at " + HABMIN_ALIAS);
        } catch (NamespaceException e) {
            logger.error("Error during HABmin servlet startup", e);
        }
    }

    protected void deactivate(ComponentContext componentContext) {
        httpService.unregister(HABMIN_ALIAS);
        logger.info("Stopped HABmin servlet");
    }

    protected void setHttpService(HttpService httpService) {
        this.httpService = httpService;
    }

    protected void unsetHttpService(HttpService httpService) {
        this.httpService = null;
    }
}
