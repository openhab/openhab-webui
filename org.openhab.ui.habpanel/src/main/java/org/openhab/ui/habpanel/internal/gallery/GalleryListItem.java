/**
 * Copyright (c) 2015-2017 by the respective copyright holders.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habpanel.internal.gallery;

import java.util.Date;

/**
 * The base interface for an item in a list of gallery items.
 *
 * @author Yannick Schaus - Initial contribution
 *
 */
public abstract class GalleryListItem {
    public String id;

    public String title;
    public String description;
    public Integer likes;
    public Integer views;
    public Integer posts;
    public String imageUrl;
    public Date createdDate;
}
