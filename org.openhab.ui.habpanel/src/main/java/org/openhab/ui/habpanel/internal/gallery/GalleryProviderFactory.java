/**
 * Copyright (c) 2015-2017 by the respective copyright holders.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habpanel.internal.gallery;

import org.openhab.ui.habpanel.internal.gallery.community.CommunityWidgetGalleryProvider;

/**
 * This class instantiates the correct gallery provider given its name for a certain type of items.
 * It is very trivial at the moment... consider using declarative services in the future.
 *
 * @author Yannick Schaus - Initial contribution
 *
 */
public class GalleryProviderFactory {
    /**
     * Gets a gallery provider for widgets
     *
     * @param galleryName the name of the gallery
     * @return the appropriate {@link GalleryWidgetProvider}
     */
    public static GalleryWidgetProvider getWidgetGalleryProvider(String galleryName) {
        if (galleryName.equals("community")) {
            return new CommunityWidgetGalleryProvider();
        } else {
            return null;
        }
    }
}
