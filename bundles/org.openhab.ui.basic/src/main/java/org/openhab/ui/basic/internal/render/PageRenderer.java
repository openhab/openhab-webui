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

import com.google.gson.JsonObject;

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
 * @author Laurent Garnier - Build of new page for app settings
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
        snippet = snippet.replaceAll("%main.offline-msg%", localizeText("@text/main.offline-msg"));
        snippet = snippet.replaceAll("%main.long-polling-mode-msg%", localizeText("@text/main.long-polling-mode-msg"));
        snippet = snippet.replaceAll("%id%", id);

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
        snippet = snippet.replace("%icon_type%", ICON_TYPE);
        snippet = snippet.replace("%inline%", config.isInlineSvgEnabled() ? "true" : "false");
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

    private void processChildren(StringBuilder sbPre, StringBuilder sbPost, EList<Widget> children, String sitemap)
            throws RenderException {
        // put a single frame around all children widgets, if there are no explicit frames
        if (!children.isEmpty()) {
            Widget firstChild = children.get(0);
            EObject parent = itemUIRegistry.getParent(firstChild);
            if (!(firstChild instanceof Frame || parent instanceof Frame || parent instanceof Sitemap)) {
                String frameSnippet = getSnippet("frame");
                frameSnippet = frameSnippet.replace("%widget_id%", "");
                frameSnippet = frameSnippet.replace("%label%", "");
                frameSnippet = frameSnippet.replace("%frame_class%", "mdl-form--no-label");

                String[] parts = frameSnippet.split("%children%");
                if (parts.length > 1) {
                    sbPre.append(parts[0]);
                    sbPost.insert(0, parts[1]);
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
                sbPre.append(newPre);
                sbPre.append(newPost);
            } else {
                sbPre.append(widgetSB);
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
        List<Sitemap> sitemapList = new LinkedList<>();

        for (SitemapProvider sitemapProvider : sitemapProviders) {
            Set<String> sitemaps = sitemapProvider.getSitemapNames();
            for (String sitemapName : sitemaps) {
                if (!"_default".equals(sitemapName)) {
                    Sitemap sitemap = sitemapProvider.getSitemap(sitemapName);
                    if (sitemap != null) {
                        sitemapList.add(sitemap);
                    }
                }
            }
        }

        String listSnippet = getSnippet("sitemaps_list");
        String sitemapSnippet = getSnippet("sitemaps_list_item");

        StringBuilder sb = new StringBuilder();
        if (sitemapList.isEmpty()) {
            String listEmptySnippet = getSnippet("sitemaps_list_empty");
            listEmptySnippet = listEmptySnippet.replace("%sitemaps-list-empty.info%",
                    localizeText("@text/sitemaps-list-empty.info"));
            sb.append(listEmptySnippet);
        } else {
            sitemapList.sort((s1, s2) -> {
                String s1Label = s1.getLabel();
                String s2Label = s2.getLabel();
                s1Label = s1Label != null ? s1Label : s1.getName();
                s2Label = s2Label != null ? s2Label : s2.getName();
                int result = s1Label.compareTo(s2Label);
                if (result == 0) {
                    result = s1.getName().compareTo(s2.getName());
                }
                return result;
            });

            for (Sitemap sitemap : sitemapList) {
                String label = sitemap.getLabel();
                final String name = sitemap.getName();
                if (label != null) {
                    if (sitemapList.stream()
                            .filter(s -> sitemap.getLabel().equals(s.getLabel() != null ? s.getLabel() : s.getName()))
                            .count() > 1) {
                        label = label + " (" + name + ")";
                    }
                } else {
                    label = name;
                }
                sb.append(sitemapSnippet.replace("%label%", label).replace("%name%", name));
            }
        }

        listSnippet = listSnippet.replace("%sitemaps-list.welcome%", localizeText("@text/sitemaps-list.welcome"));
        listSnippet = listSnippet.replace("%sitemaps-list.available-sitemaps%",
                localizeText("@text/sitemaps-list.available-sitemaps"));

        listSnippet = listSnippet.replace("%items%", sb.toString());

        return getSnippet("main_static") //
                .replace("%title%", "Basic UI") //
                .replace("%htmlclass%", "page-welcome-sitemaps") //
                .replace("%relpath%", "") //
                .replace("%script%", "static.js") //
                .replace("%navigation%", "navigation-home") //
                .replace("%content%", listSnippet);
    }

    public CharSequence renderSettings() throws RenderException {
        StringBuilder sb = new StringBuilder();

        StringBuilder buttons = new StringBuilder();
        buildButton(localizeText("@text/ui.config.basic.theme.option.auto"), "", buttons);
        buildButton(localizeText("@text/ui.config.basic.theme.option.bright"), "light", buttons);
        buildButton(localizeText("@text/ui.config.basic.theme.option.dark"), "dark", buttons);

        sb.append(getSnippet("setting_buttons")
                .replace("%label%", escapeHtml(localizeText("@text/ui.config.basic.theme.label")))
                .replace("%description%", escapeHtml(localizeText("@text/ui.config.basic.theme.description")))
                .replace("%key%", "openhab.ui:theme.dark").replace("%default%", "")
                .replace("%buttons%", buttons.toString()));

        renderSwitchSetting(localizeText("@text/ui.config.basic.condensedLayout.label"),
                localizeText("@text/ui.config.basic.condensedLayout.description"), "condensedLayout",
                "openhab.ui.basic:condensedLayout", "enabled", "disabled", false, sb);

        renderSwitchSetting(localizeText("@text/ui.config.basic.biggerFontSize.label"),
                localizeText("@text/ui.config.basic.biggerFontSize.description"), "biggerFontSize",
                "openhab.ui.basic:biggerFontSize", "enabled", "disabled", false, sb);

        buttons = new StringBuilder();
        buildButton("1", "1", buttons);
        buildButton("2", "", buttons);

        sb.append(getSnippet("setting_buttons")
                .replace("%label%", escapeHtml(localizeText("@text/ui.config.basic.nbColumnsTablet.label")))
                .replace("%description%", escapeHtml(localizeText("@text/ui.config.basic.nbColumnsTablet.description")))
                .replace("%key%", "openhab.ui.basic:nbColumnsTablet").replace("%default%", "")
                .replace("%buttons%", buttons.toString()));

        buttons = new StringBuilder();
        buildButton("1", "1", buttons);
        buildButton("2", "2", buttons);
        buildButton("3", "", buttons);

        sb.append(getSnippet("setting_buttons")
                .replace("%label%", escapeHtml(localizeText("@text/ui.config.basic.nbColumnsDesktop.label")))
                .replace("%description%",
                        escapeHtml(localizeText("@text/ui.config.basic.nbColumnsDesktop.description")))
                .replace("%key%", "openhab.ui.basic:nbColumnsDesktop").replace("%default%", "")
                .replace("%buttons%", buttons.toString()));

        renderSwitchSetting(localizeText("@text/ui.config.basic.capitalizeValues.label"),
                localizeText("@text/ui.config.basic.capitalizeValues.description"), "capitalizeValues",
                "openhab.ui.basic:capitalizeValues", "enabled", "disabled", false, sb);

        renderSwitchSetting(localizeText("@text/ui.config.basic.enableIcons.label"),
                localizeText("@text/ui.config.basic.enableIcons.description"), "icons", "openhab.ui.basic:icons",
                "enabled", "disabled", true, sb);

        renderSwitchSetting(localizeText("@text/ui.config.basic.enableIconify.label"),
                localizeText("@text/ui.config.basic.enableIconify.description"), "iconify", "openhab.ui.basic:iconify",
                "enabled", "disabled", true, sb);

        StringBuilder rows = new StringBuilder();
        JsonObject jsonObject = new JsonObject();
        buildRow("chartSize", localizeText("@text/ui.config.basic.chartSize.option.default"), "", rows, jsonObject);
        for (String val : new String[] { "360x180", "480x240", "600x300", "720x360", "840x420", "960x480" }) {
            buildRow("chartSize", localizeText("@text/ui.config.basic.chartSize.option." + val), val, rows, jsonObject);
        }

        sb.append(getSnippet("setting_selection")
                .replace("%label%", escapeHtml(localizeText("@text/ui.config.basic.chartSize.label")))
                .replace("%description%", escapeHtml(localizeText("@text/ui.config.basic.chartSize.description")))
                .replace("%key%", "openhab.ui.basic:chartSize").replace("%default%", "")
                .replace("%value_map%", escapeHtml(jsonObject.toString())).replace("%rows%", rows.toString()));

        rows = new StringBuilder();
        jsonObject = new JsonObject();
        buildRow("chartDPI", localizeText("@text/ui.config.basic.chartDPI.option.96"), "", rows, jsonObject);
        for (String val : new String[] { "120", "144", "168", "192", "240" }) {
            buildRow("chartDPI", localizeText("@text/ui.config.basic.chartDPI.option." + val), val, rows, jsonObject);
        }

        sb.append(getSnippet("setting_selection")
                .replace("%label%", escapeHtml(localizeText("@text/ui.config.basic.chartDPI.label")))
                .replace("%description%", escapeHtml(localizeText("@text/ui.config.basic.chartDPI.description")))
                .replace("%key%", "openhab.ui.basic:chartDPI").replace("%default%", "")
                .replace("%value_map%", escapeHtml(jsonObject.toString())).replace("%rows%", rows.toString()));

        renderSwitchSetting(localizeText("@text/ui.config.basic.webAudio.label"),
                localizeText("@text/ui.config.basic.webAudio.description"), "webAudio", "openhab.ui:webaudio.enable",
                "enabled", "", false, sb);

        return getSnippet("main_static") //
                .replace("%title%", "Basic UI Settings") //
                .replace("%htmlclass%", "") //
                .replace("%relpath%", "../") //
                .replace("%script%", "settings.js") //
                .replace("%navigation%", "navigation-page") //
                .replace("%content%", sb.toString());
    }

    private void buildButton(String label, String cmd, StringBuilder buttons) throws RenderException {
        buttons.append(getSnippet("button") //
                .replace("%cmd%", escapeHtml(cmd)) //
                .replace("%label%", escapeHtml(label)) //
                .replace("%textclass%", "mdl-button-text") //
                .replace("%icon_snippet%", "") //
                .replace("%class%", ""));
    }

    private void buildRow(String setting, String label, String cmd, StringBuilder rows, JsonObject jsonObject)
            throws RenderException {
        jsonObject.addProperty(cmd.isEmpty() ? "_empty_" : cmd, label);
        rows.append(getSnippet("selection_row") //
                .replace("%cmd%", escapeHtml(cmd)) //
                .replace("%label%", escapeHtml(label)) //
                .replace("%item%", setting) //
                .replace("%checked%", ""));
    }

    private void renderSwitchSetting(String label, String description, String setting, String key, String valueOn,
            String valueOff, boolean defaultValue, StringBuilder builder) throws RenderException {
        builder.append(getSnippet("setting_switch") //
                .replace("%label%", escapeHtml(label)) //
                .replace("%description%", escapeHtml(description)) //
                .replace("%setting%", setting) //
                .replace("%key%", key) //
                .replace("%on%", valueOn) //
                .replace("%off%", valueOff) //
                .replace("%default%", defaultValue ? valueOn : valueOff));
    }

    public CharSequence renderManifest(@Nullable String sitemapName) throws RenderException {
        String manifestSnippet = getSnippet("manifest", ".json");
        manifestSnippet = manifestSnippet.replace("%sitemapquery%",
                sitemapName == null ? "" : String.format("?sitemap=%s", sitemapName));
        return manifestSnippet;
    }
}
