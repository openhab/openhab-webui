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
package org.openhab.ui.cometvisu.internal;

import java.io.File;
import java.io.FileNotFoundException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Configuration for the manager backend.
 *
 * @author Tobias Bräutigam - initial contribution
 *
 */
public class ManagerSettings implements IConfigChangeListener {
    private final Logger logger = LoggerFactory.getLogger(ManagerSettings.class);
    private static ManagerSettings instance;
    private File baseDir;
    private File configFolder;
    private String resourcesDir = "resource";
    private String designsDir = resourcesDir + File.separator + "designs";
    private String trashFolderName = ".trash";
    private String backupFolderName = "backup";
    private List<Pattern> backupOnChange = new ArrayList<>();
    private Version cometVisuVersion;
    public static Pattern versionPattern = Pattern.compile("^(\\d+)\\.(\\d+)\\.(\\d+)-?(\\w)?$");

    private List<MountPoint> mounts = new ArrayList<>();

    private ManagerSettings() {
        backupOnChange.add(Pattern.compile("visu_config.*\\.xml"));
        Config.addConfigChangeListener(this);
        init();

        // load mounts
        refreshMounts();
    }

    public static ManagerSettings getInstance() {
        if (ManagerSettings.instance == null) {
            ManagerSettings.instance = new ManagerSettings();
        }
        return ManagerSettings.instance;
    }

    private void init() {
        baseDir = new File(Config.cometvisuWebfolder);

        // set default version values
        cometVisuVersion = new Version();
        cometVisuVersion.major = 0;
        cometVisuVersion.minor = 12;
        cometVisuVersion.patch = 0;
        cometVisuVersion.dev = false;

        try {
            File versionFile = new File(baseDir.getAbsolutePath() + File.separator + "version");
            Scanner sc = new Scanner(versionFile);
            String versionContent = sc.nextLine();
            sc.close();
            Matcher matcher = ManagerSettings.versionPattern.matcher(versionContent);
            if (matcher.find()) {
                cometVisuVersion.major = Integer.parseInt(matcher.group(1));
                cometVisuVersion.minor = Integer.parseInt(matcher.group(2));
                cometVisuVersion.patch = Integer.parseInt(matcher.group(3));
                cometVisuVersion.dev = "dev".equals(matcher.group(4));
            }
        } catch (FileNotFoundException e) {
            logger.error("{}", e.getMessage());
        }

        if (cometVisuVersion.major == 0 && cometVisuVersion.minor < 11) {
            // non qx version
            configFolder = new File(baseDir.getAbsolutePath() + File.separator + "config");
        } else {
            // qx version with resource folder#
            configFolder = new File(
                    baseDir.getAbsolutePath() + File.separator + "resource" + File.separator + "config");
        }
    }

    private void refreshMounts() {
        mounts.clear();
        // always mount the demo folder
        mounts.add(new MountPoint(Paths.get("demo"), Paths.get("resource", "demo")));
        // when serving source version, a mount can lookup 2 directory levels
        boolean allowLookup = baseDir.getPath().endsWith("compiled/source");
        Pattern lookupMount = Pattern.compile("^(\\.\\.\\/){0,2}\\w+");

        for (final String target : Config.mountPoints.keySet()) {
            if (!target.contains("..") && !"demo".equalsIgnoreCase(target)) {
                String value = (String) Config.mountPoints.get(target);
                String[] parts = value.split(":");
                String source = parts[0];
                if (!source.contains("..") || (allowLookup && lookupMount.matcher(source).find())) {
                    boolean writeable = parts.length > 1 ? parts[1].contains("w") : false;
                    boolean showSubDirs = parts.length > 1 ? parts[1].contains("s") : false;
                    if (source.startsWith(File.separator)) {
                        source = source.substring(1);
                    }
                    MountPoint mount = new MountPoint(Paths.get(target), Paths.get(source), showSubDirs, writeable);
                    mounts.add(mount);
                }
            }
        }
    }

    /**
     *
     * @return The path where the CometVisu files are installed
     */
    public Path getCometVisuPath() {
        return baseDir.toPath();
    }

    /**
     * @return The absolute path to the cometvisus resource folder
     */
    public String getResourcesDir() {
        return configFolder.getAbsoluteFile() + File.separator + resourcesDir;
    }

    /**
     *
     * @return the internal mount points used for the manager
     */
    public List<MountPoint> getMounts() {
        return mounts;
    }

    /**
     *
     * @return the cometvisu's config folder
     */
    public File getConfigFolder() {
        return configFolder;
    }

    public String getBackupPath() {
        return configFolder.getAbsoluteFile() + File.separator + backupFolderName + File.separator;
    }

    public String getTrashFolder() {
        return trashFolderName;
    }

    public String getTrashPath() {
        return configFolder.getAbsoluteFile() + File.separator + trashFolderName + File.separator;
    }

    public String getDesignsDir() {
        return designsDir;
    }

    public File getDesignFolder() {
        return new File(baseDir, designsDir);
    }

    public List<Pattern> getBackupOnChange() {
        return backupOnChange;
    }

    public Version getCometVisuVersion() {
        return cometVisuVersion;
    }

    public void setResourcesDir(String resourcesDir) {
        this.resourcesDir = resourcesDir;
    }

    @Override
    public void handleConfigChange(String key) {
        if (key.equals(Config.COMETVISU_WEBFOLDER_PROPERTY)) {
            baseDir = new File(Config.cometvisuWebfolder);
        } else if (key.equals(Config.COMETVISU_MOUNTPOINTS)) {
            refreshMounts();
        }
    }

    public Path getConfigPath() {
        return configFolder.toPath();
    }
}
