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
 * A DTO class mapped to the Discourse topic API.
 *
 * @author Yannick Schaus - Initial contribution
 *
 */
public class DiscourseTopicResponse {
    public Integer id;

    public DiscoursePostStream post_stream;

    public String title;
    public Integer posts_count;

    public Date created_at;
    public Date last_posted;

    public Integer like_count;
    public Integer views;

    public DiscourseTopicDetails details;

    public class DiscoursePostAuthor {
        public Integer id;
        public String username;
        public String avatar_template;
    }

    public class DiscoursePostLink {
        public String url;
        public Boolean internal;
        public Integer clicks;
    }

    public class DiscoursePostStream {
        public DiscoursePost[] posts;
    }

    public class DiscoursePost {
        public Integer id;

        public String username;
        public String display_username;

        public Date created_at;
        public Date updated_at;

        public String cooked;

        public DiscoursePostLink[] link_counts;
    }

    public class DiscourseTopicDetails {
        public DiscoursePostAuthor created_by;
        public DiscoursePostAuthor last_poster;

        public DiscoursePostLink[] links;

    }
}
