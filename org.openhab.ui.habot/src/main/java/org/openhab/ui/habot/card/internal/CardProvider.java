/**
 * Copyright (c) 2010-2018 by the respective copyright holders.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habot.card.internal;

import org.eclipse.jdt.annotation.NonNull;
import org.eclipse.smarthome.core.common.registry.DefaultAbstractManagedProvider;
import org.eclipse.smarthome.core.common.registry.ManagedProvider;
import org.eclipse.smarthome.core.storage.StorageService;
import org.openhab.ui.habot.card.Card;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferencePolicy;

/**
 * The @link {@link ManagedProvider} for {@link Card} elements
 *
 * @author Yannick Schaus
 */
@Component(service = CardProvider.class, immediate = true)
public class CardProvider extends DefaultAbstractManagedProvider<Card, String> {

    @Override
    protected String getStorageName() {
        return "habot_cards";
    }

    @Override
    protected @NonNull String keyToString(@NonNull String key) {
        return key;
    }

    @Reference(policy = ReferencePolicy.DYNAMIC)
    @Override
    protected void setStorageService(StorageService storageService) {
        super.setStorageService(storageService);
    }

    @Override
    protected void unsetStorageService(StorageService storageService) {
        super.unsetStorageService(storageService);
    }
}
