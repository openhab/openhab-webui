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
package org.openhab.ui.basic.internal.render;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;

import org.eclipse.emf.common.util.ECollections;
import org.eclipse.emf.common.util.EList;
import org.eclipse.emf.ecore.EObject;
import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.i18n.LocaleProvider;
import org.openhab.core.i18n.TranslationProvider;
import org.openhab.core.model.sitemap.SitemapProvider;
import org.openhab.core.model.sitemap.sitemap.Frame;
import org.openhab.core.model.sitemap.sitemap.Sitemap;
import org.openhab.core.model.sitemap.sitemap.Widget;
import org.openhab.core.ui.items.ItemUIRegistry;
import org.openhab.ui.basic.internal.WebAppConfig;
import org.openhab.ui.basic.internal.servlet.WebAppServlet;
import org.openhab.ui.basic.render.RenderException;
import org.openhab.ui.basic.render.WidgetRenderer;
import org.osgi.framework.BundleContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This is an implementation of the {@link WidgetRenderer} interface, which
 * is the main entry point for HTML code construction.
 *
 * It provides the HTML header and skeleton and delegates the rendering of
 * widgets on the page to the dedicated widget renderers.
 *
 * @author Kai Kreuzer - Initial contribution and API
 * @author Vlad Ivanov - BasicUI changes
 * @author Laurent Garnier - primary/secondary colors
 */
@Component(service = { PageRenderer.class })
@NonNullByDefault
public class PageRenderer extends AbstractWidgetRenderer {

    private final Logger logger = LoggerFactory.getLogger(PageRenderer.class);

    private List<WidgetRenderer> widgetRenderers = new ArrayList<>();

    @Activate
    public PageRenderer(final BundleContext bundleContext, final @Reference TranslationProvider i18nProvider,
            final @Reference ItemUIRegistry itemUIRegistry, final @Reference LocaleProvider localeProvider) {
        super(bundleContext, i18nProvider, itemUIRegistry, localeProvider);
    }

    @Reference(cardinality = ReferenceCardinality.MULTIPLE, policy = ReferencePolicy.DYNAMIC)
    public void addWidgetRenderer(WidgetRenderer widgetRenderer) {
        widgetRenderer.setConfig(config);
        widgetRenderers.add(widgetRenderer);
    }

    public void removeWidgetRenderer(WidgetRenderer widgetRenderer) {
        widgetRenderers.remove(widgetRenderer);
    }

    /**
     * This is the main method, which is called to produce the HTML code for a servlet request.
     *
     * @param id the id of the parent widget whose children are about to appear on this page
     * @param sitemap the sitemap to use
     * @param label the title of this page
     * @param children a list of widgets that should appear on this page
     * @param async true, if this is an asynchronous request. This will use a different HTML skeleton
     * @return a string builder with the produced HTML code
     * @throws RenderException if an error occurs during the processing
     */
    public StringBuilder processPage(String id, String sitemap, String label, EList<Widget> children, boolean async)
            throws RenderException {
        String snippet = getSnippet(async ? "layer" : "main");
        String offlineMsg = localizeText("@text/main.offline-msg");
        if (offlineMsg != null) {
            snippet = snippet.replaceAll("%main.offline-msg%", offlineMsg);
        }
        String longPollingModeMsg = localizeText("@text/main.long-polling-mode-msg");
        if (longPollingModeMsg != null) {
            snippet = snippet.replaceAll("%main.long-polling-mode-msg%", longPollingModeMsg);
        }
        snippet = snippet.replaceAll("%id%", id);
        snippet = snippet.replace("%config.web-audio%", Boolean.toString(config.isWebAudio()));

        // if the label contains a value span, we remove this span as
        // the title of a page/layer cannot deal with this
        // Note: we can have a span here, if the parent widget had a label
        // with some value defined (e.g. "Windows [%d]"), which getLabel()
        // will convert into a "Windows <span>5</span>".
        String labelPlain = label;
        if (labelPlain.contains("[") && labelPlain.endsWith("]")) {
            labelPlain = labelPlain.replace("[", "").replace("]", "");
        }
        snippet = snippet.replace("%label%", escapeHtml(labelPlain));
        snippet = snippet.replace("%servletname%", WebAppServlet.SERVLET_PATH);
        snippet = snippet.replace("%sitemap%", sitemap);
        snippet = snippet.replace("%htmlclass%", config.getCssClassList());
        snippet = snippet.replace("%icon_type%", ICON_TYPE);
        snippet = snippet.replace("%inline%", config.isInlineSvgEnabled() ? "true" : "false");
        snippet = snippet.replace("%theme%", config.getTheme());
        snippet = snippet.replace("%sitemapquery%", String.format("?sitemap=%s", sitemap));
        snippet = snippet.replace("%primarycolor%", PRIMARY_COLOR);
        snippet = snippet.replace("%secondarycolor%", SECONDARY_COLOR);

        String[] parts = snippet.split("%children%");

        StringBuilder preChildren = new StringBuilder(parts[0]);
        StringBuilder postChildren = new StringBuilder(parts[1]);

        if (parts.length == 2) {
            processChildren(preChildren, postChildren, children, sitemap);
        } else if (parts.length > 2) {
            logger.error("Snippet '{}' contains multiple %children% sections, but only one is allowed!",
                    async ? "layer" : "main");
        }
        return preChildren.append(postChildren);
    }

    private void processChildren(StringBuilder sb_pre, StringBuilder sb_post, EList<Widget> children, String sitemap)
            throws RenderException {
        // put a single frame around all children widgets, if there are no explicit frames
        if (!children.isEmpty()) {
            EObject firstChild = children.get(0);
            EObject parent = itemUIRegistry.getParent((Widget) firstChild);
            if (!(firstChild instanceof Frame || parent instanceof Frame || parent instanceof Sitemap)) {
                String frameSnippet = getSnippet("frame");
                frameSnippet = frameSnippet.replace("%widget_id%", "");
                frameSnippet = frameSnippet.replace("%label%", "");
                frameSnippet = frameSnippet.replace("%frame_class%", "mdl-form--no-label");

                String[] parts = frameSnippet.split("%children%");
                if (parts.length > 1) {
                    sb_pre.append(parts[0]);
                    sb_post.insert(0, parts[1]);
                }
                if (parts.length > 2) {
                    logger.error("Snippet 'frame' contains multiple %children% sections, but only one is allowed!");
                }
            }
        }

        for (Widget w : children) {
            StringBuilder newPre = new StringBuilder();
            StringBuilder newPost = new StringBuilder();
            StringBuilder widgetSB = new StringBuilder();
            EList<Widget> nextChildren = renderWidget(w, widgetSB, sitemap);
            if (!nextChildren.isEmpty()) {
                String[] parts = widgetSB.toString().split("%children%");
                // no %children% placeholder found or at the end
                if (parts.length == 1) {
                    newPre.append(widgetSB);
                }
                // %children% section found
                if (parts.length > 1) {
                    newPre.append(parts[0]);
                    newPost.insert(0, parts[1]);
                }
                // multiple %children% sections found -> log an error and ignore all code starting from the second
                // occurance
                if (parts.length > 2) {
                    String widgetType = w.eClass().getInstanceTypeName()
                            .substring(w.eClass().getInstanceTypeName().lastIndexOf(".") + 1);
                    logger.error(
                            "Snippet for widget '{}' contains multiple %children% sections, but only one is allowed!",
                            widgetType);
                }
                processChildren(newPre, newPost, nextChildren, sitemap);
                sb_pre.append(newPre);
                sb_pre.append(newPost);
            } else {
                sb_pre.append(widgetSB);
            }
        }
    }

    @Override
    public EList<Widget> renderWidget(Widget w, StringBuilder sb, String sitemap) throws RenderException {
        for (WidgetRenderer renderer : widgetRenderers) {
            if (renderer.canRender(w)) {
                return renderer.renderWidget(w, sb, sitemap);
            }
        }
        return ECollections.emptyEList();
    }

    @Override
    public boolean canRender(Widget w) {
        return false;
    }

    @Override
    public void setConfig(WebAppConfig config) {
        this.config = config;
        for (WidgetRenderer renderer : widgetRenderers) {
            renderer.setConfig(config);
        }
    }

    public CharSequence renderSitemapList(Set<SitemapProvider> sitemapProviders) throws RenderException {
        List<String> sitemapList = new LinkedList<String>();

        for (SitemapProvider sitemapProvider : sitemapProviders) {
            Set<String> sitemaps = sitemapProvider.getSitemapNames();
            for (String sitemap : sitemaps) {
                if (!"_default".equals(sitemap)) {
                    sitemapList.add(sitemap);
                }
            }
        }

        String pageSnippet = getSnippet("main_static");
        String listSnippet = getSnippet("sitemaps_list");
        String sitemapSnippet = getSnippet("sitemaps_list_item");

        StringBuilder sb = new StringBuilder();
        if (sitemapList.isEmpty()) {
            String listEmptySnippet = getSnippet("sitemaps_list_empty");
            String text = localizeText("@text/sitemaps-list-empty.info");
            if (text != null) {
                listEmptySnippet = listEmptySnippet.replace("%sitemaps-list-empty.info%", text);
            }
            sb.append(listEmptySnippet);
        } else {
            for (String sitemap : sitemapList) {
                sb.append(sitemapSnippet.replace("%sitemap%", sitemap));
            }
        }

        String text = localizeText("@text/sitemaps-list.welcome");
        if (text != null) {
            listSnippet = listSnippet.replace("%sitemaps-list.welcome%", text);
        }

        text = localizeText("@text/sitemaps-list.available-sitemaps");
        if (text != null) {
            listSnippet = listSnippet.replace("%sitemaps-list.available-sitemaps%", text);
        }

        listSnippet = listSnippet.replace("%items%", sb.toString());

        pageSnippet = pageSnippet.replace("%title%", "BasicUI");
        pageSnippet = pageSnippet.replace("%htmlclass%", config.getCssClassList() + " page-welcome-sitemaps");
        pageSnippet = pageSnippet.replace("%theme%", config.getTheme());
        pageSnippet = pageSnippet.replace("%content%", listSnippet);

        return pageSnippet;
    }

    public CharSequence renderManifest(@Nullable String sitemapName) throws RenderException {
        String manifestSnippet = getSnippet("manifest", ".json");
        manifestSnippet = manifestSnippet.replace("%sitemapquery%",
                sitemapName == null ? "" : String.format("?sitemap=%s", sitemapName));
        return manifestSnippet;
    }
}
