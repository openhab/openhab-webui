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
package org.openhab.ui.cometvisu.internal;

import java.io.File;
import java.util.ArrayList;
import java.util.Hashtable;

import org.openhab.core.OpenHAB;
import org.openhab.core.library.types.DateTimeType;
import org.openhab.core.library.types.DecimalType;
import org.openhab.core.library.types.HSBType;
import org.openhab.core.library.types.OnOffType;
import org.openhab.core.library.types.OpenClosedType;
import org.openhab.core.library.types.PointType;
import org.openhab.core.library.types.StringType;
import org.openhab.core.library.types.UpDownType;
import org.openhab.core.types.State;

/**
 * Utility class for constants.
 *
 * @author Tobias Bräutigam - Initial contribution
 *
 */
public class Config {
    private static ArrayList<IConfigChangeListener> listeners = new ArrayList<>();

    public static void addConfigChangeListener(IConfigChangeListener listener) {
        listeners.add(listener);
    }

    public static void removeConfigChangeListener(IConfigChangeListener listener) {
        listeners.remove(listener);
    }

    public static void setCometVisuFolder(String folder) {
        if (!Config.cometvisuWebfolder.equals(folder)) {
            Config.cometvisuWebfolder = folder;
            Config.triggerConfigChange(COMETVISU_WEBFOLDER_PROPERTY);
        }
    }

    public static void triggerConfigChange(String key) {
        for (final IConfigChangeListener listener : Config.listeners) {
            listener.handleConfigChange(key);
        }
    }

    public static final String COMETVISU_CONFIG = "org.openhab.cometvisu";
    public static final String COMETVISU_ICON_CONFIG = "icons";
    public static final String COMETVISU_ICON_MAPPING_CONFIG = "icons.mapping";
    public static final String COMETVISU_ICON_ENABLE_MAPPING_PROPERTY = "enableMapping";
    public static final String COMETVISU_WEBFOLDER_PROPERTY = "webFolder";
    public static final String COMETVISU_AUTODOWNLOAD_PROPERTY = "autoDownload";
    public static final String COMETVISU_WEBAPP_ALIAS_PROPERTY = "webAlias";
    public static final String COMETVISU_WEBAPP_USERFILE_FOLDER = File.separator + "cometvisu";
    public static final String COMETVISU_MOUNTPOINTS = "mount";

    public static String cometvisuWebfolder = OpenHAB.getUserDataFolder() + "/cometvisu";
    public static String cometvisuWebappAlias = "/cometvisu";
    public static boolean cometvisuAutoDownload = false;

    /*
     * path of the cometvisu backend (automatically prefixed by /rest/)
     * all the backend aliases must not be changed as they are hard coded in the CometVisu client
     */
    public static final String COMETVISU_BACKEND_ALIAS = "cv";
    public static final String COMETVISU_BACKEND_LOGIN_ALIAS = "l";
    public static final String COMETVISU_BACKEND_READ_ALIAS = "r";
    public static final String COMETVISU_BACKEND_WRITE_ALIAS = "w";
    public static final String COMETVISU_BACKEND_CHART_ALIAS = "rrdfetch";
    public static final String COMETVISU_BACKEND_CONFIG_ALIAS = "config";

    public static Hashtable<String, Object> iconConfig = new Hashtable<>();
    public static Hashtable<String, Object> iconMappings = new Hashtable<>();
    public static Hashtable<String, Object> mountPoints = new Hashtable<>();

    public static Hashtable<String, Hashtable<String, Object>> configMappings = new Hashtable<>();

    /**
     * maps CometVise address transform to State class
     */
    public static Hashtable<String, Class<? extends State>> itemTypeMapper = new Hashtable<>();

    static {
        configMappings.put(COMETVISU_ICON_CONFIG, iconConfig);
        configMappings.put(COMETVISU_ICON_MAPPING_CONFIG, iconMappings);
        configMappings.put(COMETVISU_MOUNTPOINTS, mountPoints);

        itemTypeMapper.put("number", DecimalType.class);
        itemTypeMapper.put("switch", OnOffType.class);
        itemTypeMapper.put("contact", OpenClosedType.class);
        itemTypeMapper.put("dimmer", DecimalType.class);
        itemTypeMapper.put("rollershutter", UpDownType.class);
        itemTypeMapper.put("string", StringType.class);
        itemTypeMapper.put("datetime", DateTimeType.class);
        itemTypeMapper.put("time", DateTimeType.class);
        itemTypeMapper.put("color", HSBType.class);
        itemTypeMapper.put("location", PointType.class);
    }
}
