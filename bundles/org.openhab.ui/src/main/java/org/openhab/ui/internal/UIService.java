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
package org.openhab.ui.internal;

import java.util.Map;

import org.openhab.core.net.HttpServiceUtil;
import org.osgi.framework.BundleContext;
import org.osgi.service.component.ComponentContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.http.HttpContext;
import org.osgi.service.http.HttpService;
import org.osgi.service.http.NamespaceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This service register the default UI's resources in the HTTP context.
 *
 * @author Yannick Schaus - Initial contribution
 */
@Component(immediate = true, name = "org.openhab.ui")
public class UIService {

    private final Logger logger = LoggerFactory.getLogger(UIService.class);

    protected HttpService httpService;

    @Activate
    protected void activate(ComponentContext componentContext, Map<String, Object> properties) {
        BundleContext bundleContext = componentContext.getBundleContext();
        HttpContext httpContext = httpService.createDefaultHttpContext();
        try {
            httpService.registerResources("/", "app", httpContext);
            if (HttpServiceUtil.getHttpServicePort(bundleContext) > 0) {
                logger.info("Started UI on port {}", HttpServiceUtil.getHttpServicePort(bundleContext));
            } else {
                logger.info("Started UI");
            }
        } catch (NamespaceException e) {
            logger.error("Error during UI startup: {}", e.getMessage());
        }
    }

    @Deactivate
    protected void deactivate(ComponentContext componentContext) {
        httpService.unregister("/");
        logger.info("Stopped UI");
    }

    @Reference
    protected void setHttpService(HttpService httpService) {
        this.httpService = httpService;
    }

    protected void unsetHttpService(HttpService httpService) {
        this.httpService = null;
    }
}
