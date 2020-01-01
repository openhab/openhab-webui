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
package org.openhab.ui.cometvisu.internal;

import org.glassfish.jersey.media.sse.SseFeature;
import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceRegistration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Bundle activator for CometVisu backend.
 *
 * @author Tobias Bräutigam - Initial Contribution and API
 *
 */
public class CvActivator implements BundleActivator {

    private final Logger logger = LoggerFactory.getLogger(CvActivator.class);

    private static BundleContext context;

    private ServiceRegistration<?> sseFeatureRegistration;

    private ServiceRegistration<?> blockingAsyncFeatureRegistration;

    /**
     * Called whenever the OSGi framework starts our bundle
     */
    @Override
    public void start(BundleContext bc) throws Exception {
        context = bc;

        String featureName = SseFeature.class.getName();
        if (bc.getServiceReference(featureName) == null) {
            sseFeatureRegistration = bc.registerService(featureName, new SseFeature(), null);

            logger.debug("SSE API - SseFeature registered.");
        }
        logger.debug("SSE API has been started.");
    }

    /**
     * Called whenever the OSGi framework stops our bundle
     */
    @Override
    public void stop(BundleContext bc) throws Exception {
        context = null;

        if (sseFeatureRegistration != null) {
            sseFeatureRegistration.unregister();
            logger.debug("SseFeature unregistered.");
        }

        if (blockingAsyncFeatureRegistration != null) {
            blockingAsyncFeatureRegistration.unregister();
            logger.debug("BlockingAsyncFeature unregistered.");
        }

        logger.debug("SSE API has been stopped.");
    }

    /**
     * Returns the bundle context of this bundle
     *
     * @return the bundle context
     */
    public static BundleContext getContext() {
        return context;
    }
}
