/**
 * Copyright (c) 2010-2023 Contributors to the openHAB project
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

/**
 * Interface for listeners to cometvisu backend config changes
 *
 * @author Tobias Bräutigam - Initial contribution
 *
 */
public interface IConfigChangeListener {

    /**
     * Called when an internal configuration setting of the CometVisu has changed
     *
     * @param key the key of the configuration option that has been changed
     */
    public void handleConfigChange(String key);
}
