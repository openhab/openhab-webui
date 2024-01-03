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
package org.openhab.ui.habpanel.internal.gallery;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.ui.habpanel.internal.gallery.community.CommunityWidgetGalleryProvider;

/**
 * This class instantiates the correct gallery provider given its name for a certain type of items.
 * It is very trivial at the moment... consider using declarative services in the future.
 *
 * @author Yannick Schaus - Initial contribution
 *
 */
@NonNullByDefault
public class GalleryProviderFactory {
    /**
     * Gets a gallery provider for widgets
     *
     * @param galleryName the name of the gallery
     * @return the appropriate {@link GalleryWidgetProvider}
     */
    public static @Nullable GalleryWidgetProvider getWidgetGalleryProvider(String galleryName) {
        if ("community".equals(galleryName)) {
            return new CommunityWidgetGalleryProvider();
        } else {
            return null;
        }
    }
}
