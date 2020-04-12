/**
 * Copyright (c) 2010-2020 Contributors to the openHAB project
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
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Configuration for the manager backend.
 *
 * @author Tobias Bräutigam - initial contribution
 *
 */
public class ManagerSettings implements IConfigChangeListener {
    private static ManagerSettings instance;
    private File baseDir;
    private File configFolder;
    private String resourcesDir = "resource";
    private String designsDir = resourcesDir + File.separator + "designs";
    private String trashFolderName = ".trash";
    private String backupFolderName = "backup";
    private ArrayList<Pattern> backupOnChange = new ArrayList<Pattern>();
    private Version cometVisuVersion;
    public static Pattern versionPattern = Pattern.compile("^(\\d+)\\.(\\d+)\\.(\\d+)-?(\\w)?$");

    private ArrayList<MountPoint> mounts = new ArrayList<MountPoint>();

    private ManagerSettings() {
        this.backupOnChange.add(Pattern.compile("visu_config.*\\.xml"));
        Config.addConfigChangeListener(this);
        this.init();

        // load mounts
        this.refreshMounts();
    }

    public static ManagerSettings getInstance() {
        if (ManagerSettings.instance == null) {
            ManagerSettings.instance = new ManagerSettings();
        }
        return ManagerSettings.instance;
    }

    private void init() {
        this.baseDir = new File(Config.cometvisuWebfolder);

        // set default version values
        this.cometVisuVersion = new Version();
        this.cometVisuVersion.major = 0;
        this.cometVisuVersion.minor = 12;
        this.cometVisuVersion.patch = 0;
        this.cometVisuVersion.dev = false;

        try {
            File versionFile = new File(this.baseDir.getAbsolutePath() + File.separator + "version");
            Scanner sc = new Scanner(versionFile);
            String versionContent = sc.nextLine();
            Matcher matcher = ManagerSettings.versionPattern.matcher(versionContent);
            if (matcher.find()) {
                this.cometVisuVersion.major = Integer.parseInt(matcher.group(1));
                this.cometVisuVersion.minor = Integer.parseInt(matcher.group(2));
                this.cometVisuVersion.patch = Integer.parseInt(matcher.group(3));
                this.cometVisuVersion.dev = matcher.group(4) == "dev";
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }

        if (this.cometVisuVersion.major == 0 && this.cometVisuVersion.minor < 11) {
            // non qx version
            this.configFolder = new File(this.baseDir.getAbsolutePath() + File.separator + "config");
        } else {
            // qx version with resource folder#
            this.configFolder = new File(
                    this.baseDir.getAbsolutePath() + File.separator + "resource" + File.separator + "config");
        }
    }

    private void refreshMounts() {
        this.mounts.clear();
        // always mount the demo folder
        this.mounts.add(new MountPoint(Paths.get("demo"), Paths.get("resource", "demo")));

        for (final String target : Config.mountPoints.keySet()) {
            if (!target.contains("..") && !target.equalsIgnoreCase("demo")) {
                String value = (String) Config.mountPoints.get(target);
                String[] parts = value.split(":");
                String source = parts[0];
                boolean writeable = parts.length > 1 ? parts[1].contains("w") : false;
                boolean showSubDirs = parts.length > 1 ? parts[1].contains("s") : false;

                if (!source.contains("..")) {
                    if (source.startsWith(File.separator)) {
                        source = source.substring(1);
                    }
                    MountPoint mount = new MountPoint(Paths.get(target), Paths.get(source), showSubDirs, writeable);
                    this.mounts.add(mount);
                }
            }
        }
    }

    /**
     *
     * @return The path where the CometVisu files are installed
     */
    public Path getCometVisuPath() {
        return this.baseDir.toPath();
    }

    /**
     * @return The absolute path to the cometvisus resource folder
     */
    public String getResourcesDir() {
        return this.configFolder.getAbsoluteFile() + File.pathSeparator + this.resourcesDir;
    }

    /**
     *
     * @return the internal mount points used for the manager
     */
    public ArrayList<MountPoint> getMounts() {
        return this.mounts;
    }

    /**
     *
     * @return the cometvisu's config folder
     */
    public File getConfigFolder() {
        return this.configFolder;
    }

    public String getBackupPath() {
        return this.configFolder.getAbsoluteFile() + File.pathSeparator + this.backupFolderName;
    }

    public String getTrashPath() {
        return this.configFolder.getAbsoluteFile() + File.pathSeparator + this.trashFolderName;
    }

    public String getDesignsDir() {
        return designsDir;
    }

    public ArrayList<Pattern> getBackupOnChange() {
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
        if (key.equals("cometvisuWebfolder")) {
            this.baseDir = new File(Config.cometvisuWebfolder);
        } else if (key.equals(Config.COMETVISU_MOUNTPOINTS)) {
            this.refreshMounts();
        }
    }

    public Path getConfigPath() {
        return this.configFolder.toPath();
    }
}
