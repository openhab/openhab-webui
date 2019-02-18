/**
 * Copyright (c) 2015-2017 by the respective copyright holders.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 */
package org.openhab.ui.habpanel.internal.gallery.community;

import java.io.InputStreamReader;
import java.io.Reader;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

import org.apache.commons.io.IOUtils;
import org.openhab.ui.habpanel.internal.gallery.GalleryWidgetAttachment;
import org.openhab.ui.habpanel.internal.gallery.GalleryWidgetProvider;
import org.openhab.ui.habpanel.internal.gallery.GalleryWidgetsItem;
import org.openhab.ui.habpanel.internal.gallery.GalleryWidgetsListItem;
import org.openhab.ui.habpanel.internal.gallery.community.DiscourseGalleryResponse.DiscourseTopic;
import org.openhab.ui.habpanel.internal.gallery.community.DiscourseTopicResponse.DiscoursePostLink;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

/**
 * This class is a {@link GalleryWidgetProvider} retrieving posts on community.openhab.org (Discourse) in the HABPanel
 * category and having the "widgetgallery" tag.
 *
 * @author Yannick Schaus - Initial contribution
 *
 */
public class CommunityWidgetGalleryProvider implements GalleryWidgetProvider {

    private static final Logger logger = LoggerFactory.getLogger(CommunityWidgetGalleryProvider.class);

    public final String COMMUNITY_BASE_URL = "https://community.openhab.org";
    public final String COMMUNITY_GALLERY_URL = COMMUNITY_BASE_URL
            + "/tags/c/apps-services/habpanel/widgetgallery.json";
    public final String COMMUNITY_TOPIC_URL = COMMUNITY_BASE_URL + "/t/";

    private Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").create();

    @Override
    public Stream<GalleryWidgetsListItem> getGalleryList() throws Exception {
        List<DiscourseGalleryResponse> pages = new ArrayList<DiscourseGalleryResponse>();

        URL url = new URL(COMMUNITY_GALLERY_URL);
        int pageNb = 1;
        while (url != null) {
            URLConnection connection = url.openConnection();

            try {
                Reader reader = new InputStreamReader(connection.getInputStream());
                DiscourseGalleryResponse parsed = gson.fromJson(reader, DiscourseGalleryResponse.class);
                pages.add(parsed);

                if (parsed.topic_list.more_topics_url != null) {
                    // Discourse URL for next page is wrong
                    url = new URL(COMMUNITY_GALLERY_URL + "?page=" + pageNb++);
                } else {
                    url = null;
                }
            } finally {
                IOUtils.closeQuietly(connection.getInputStream());
            }
        }

        return pages.stream().flatMap(p -> Stream.of(p.topic_list.topics)).map(t -> convertTopicToWidgetsListItem(t));
    }

    @Override
    public GalleryWidgetsItem getGalleryItem(String id) throws Exception {
        if (Integer.parseInt(id) < 1) {
            throw new IllegalArgumentException("invalid community gallery id");
        }
        URL url = new URL(String.format("%s%s.json", COMMUNITY_TOPIC_URL, id));
        URLConnection connection = url.openConnection();

        try {
            Reader reader = new InputStreamReader(connection.getInputStream());
            DiscourseTopicResponse parsed = gson.fromJson(reader, DiscourseTopicResponse.class);

            GalleryWidgetsItem item = new GalleryWidgetsItem();
            item.id = id;
            item.title = parsed.title;
            item.description = parsed.post_stream.posts[0].cooked;
            item.author = parsed.details.created_by.username;
            item.authorName = parsed.post_stream.posts[0].display_username;
            item.authorAvatarUrl = COMMUNITY_BASE_URL + parsed.details.created_by.avatar_template;
            item.createdDate = parsed.created_at;
            item.likes = parsed.like_count;
            item.views = parsed.views;
            item.posts = parsed.posts_count;

            item.widgets = new ArrayList<GalleryWidgetAttachment>();

            if (parsed.post_stream.posts[0].link_counts != null) {
                for (DiscoursePostLink link : parsed.post_stream.posts[0].link_counts) {
                    if (link.url.startsWith("https://github.com")) {
                        item.githubLink = String.join("/", Arrays.asList(link.url.split("/", 6)).subList(0, 5));
                    } else if (link.url.endsWith(".json")) {
                        GalleryWidgetAttachment widget = new GalleryWidgetAttachment();
                        if (link.url.startsWith("//")) {
                            link.url = "https:" + link.url;
                        }
                        widget.sourceUrl = link.url;
                        URL widgetUrl = new URL(link.url);
                        URLConnection widgetDownload = widgetUrl.openConnection();

                        try {
                            widget.contents = IOUtils.toString(widgetDownload.getInputStream());
                            String cDisp = widgetDownload.getHeaderField("Content-Disposition");
                            if (cDisp != null && cDisp.indexOf("=") != -1 && cDisp.indexOf(".widget.json") != -1) {

                                widget.id = cDisp.split("=")[1].replaceAll("\"", "").replaceAll("]", "")
                                        .replaceAll(".widget.json", "");

                                item.widgets.add(widget);
                            }
                        } finally {
                            IOUtils.closeQuietly(widgetDownload.getInputStream());
                        }

                    }
                }
            }

            return item;

        } finally {
            IOUtils.closeQuietly(connection.getInputStream());
        }
    }

    /**
     * Transforms a Discourse topic to a {@link GalleryWidgetsListItem}
     *
     * @param topic the topic
     * @return the list item
     */
    private GalleryWidgetsListItem convertTopicToWidgetsListItem(Object t) {
        DiscourseTopic topic = (DiscourseTopic) t;
        GalleryWidgetsListItem item = new GalleryWidgetsListItem();
        item.id = topic.id.toString();
        item.title = topic.title;
        item.imageUrl = topic.image_url;
        item.likes = topic.like_count;
        item.views = topic.views;
        item.posts = topic.posts_count;
        item.createdDate = topic.created_at;

        return item;
    }

}
