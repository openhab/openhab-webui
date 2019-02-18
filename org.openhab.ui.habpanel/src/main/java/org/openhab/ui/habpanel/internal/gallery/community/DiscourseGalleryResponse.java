/**
 * Copyright (c) 2015-2017 by the respective copyright holders.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habpanel.internal.gallery.community;

import java.util.Date;

/**
 * A DTO class mapped to the Discourse tagged topic list API.
 *
 * @author Yannick Schaus - Initial contribution
 *
 */
public class DiscourseGalleryResponse {
    public DiscourseUser[] users;
    public DiscourseTopicList topic_list;

    public class DiscourseUser {
        public Integer id;
        public String username;
        public String avatar_template;
    }

    public class DiscourseTopicList {
        public String more_topics_url;
        public Integer per_page;
        public DiscourseTopic[] topics;
    }

    public class DiscourseTopic {
        public Integer id;
        public String title;
        public String slug;
        public Integer posts_count;
        public String image_url;
        public Date created_at;
        public Integer like_count;
        public Integer views;
    }
}
