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
