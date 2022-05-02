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
package org.openhab.ui.habpanel.internal;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.openhab.core.common.registry.ManagedProvider;
import org.openhab.core.common.registry.Provider;
import org.openhab.core.storage.StorageService;
import org.openhab.core.ui.components.UIComponentProvider;
import org.openhab.core.ui.components.UIProvider;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * A managed habpanel provider which stores their definition in storage layer.
 *
 * @author Jan N. Klug - Initial contribution
 */
@NonNullByDefault
@Component(service = { Provider.class, ManagedProvider.class, UIProvider.class })
public class ManagedHABPanelProvider extends UIComponentProvider {

    @Activate
    public ManagedHABPanelProvider(@Reference StorageService storageService) {
        super("habpanel:panelconfig", storageService);
    }
}
