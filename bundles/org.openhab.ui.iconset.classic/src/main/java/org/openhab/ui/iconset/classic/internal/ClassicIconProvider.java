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
package org.openhab.ui.iconset.classic.internal;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.Collections;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.i18n.TranslationProvider;
import org.openhab.core.ui.icon.AbstractResourceIconProvider;
import org.openhab.core.ui.icon.IconProvider;
import org.openhab.core.ui.icon.IconSet;
import org.openhab.core.ui.icon.IconSet.Format;
import org.osgi.framework.BundleContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This icon provider provides the classic icons (dating from openHAB). They are packaged
 * within this bundle and served from there.
 *
 * @author Kai Kreuzer - Initial contribution
 */
@Component
@NonNullByDefault
public class ClassicIconProvider extends AbstractResourceIconProvider implements IconProvider {

    static final String ICONSET_ID = "classic";
    private static final String DEFAULT_LABEL = "Classic Icons";
    private static final String DEFAULT_DESCRIPTION = "This is a modernized version of the original icon set of openHAB 1.";

    private final Logger logger = LoggerFactory.getLogger(ClassicIconProvider.class);

    private final BundleContext context;

    @Activate
    public ClassicIconProvider(final BundleContext context, final @Reference TranslationProvider i18nProvider) {
        super(i18nProvider);
        this.context = context;
    }

    @Override
    public Set<IconSet> getIconSets(@Nullable Locale locale) {
        Set<Format> formats = new HashSet<>(2);
        formats.add(Format.PNG);
        formats.add(Format.SVG);

        String label = i18nProvider.getText(context.getBundle(), "iconset.label", DEFAULT_LABEL, locale);
        label = label == null ? DEFAULT_LABEL : label;

        String description = i18nProvider.getText(context.getBundle(), "iconset.description", DEFAULT_DESCRIPTION,
                locale);
        description = description == null ? DEFAULT_DESCRIPTION : description;

        IconSet iconSet = new IconSet(ICONSET_ID, label, description, formats);
        return Collections.singleton(iconSet);
    }

    @Override
    protected @Nullable InputStream getResource(String iconSetId, String resourceName) {
        if (ClassicIconProvider.ICONSET_ID.equals(iconSetId)) {
            URL iconResource = context.getBundle().getEntry("icons/" + resourceName);
            try {
                return iconResource.openStream();
            } catch (IOException e) {
                logger.error("Failed to read icon '{}': {}", resourceName, e.getMessage());
                return null;
            }
        } else {
            return null;
        }
    }

    @Override
    protected boolean hasResource(String iconSetId, String resourceName) {
        if (ClassicIconProvider.ICONSET_ID.equals(iconSetId)) {
            URL iconResource = context.getBundle().getEntry("icons/" + resourceName);
            return iconResource != null;
        } else {
            return false;
        }
    }

    @Override
    protected Integer getPriority() {
        return 0;
    }
}
