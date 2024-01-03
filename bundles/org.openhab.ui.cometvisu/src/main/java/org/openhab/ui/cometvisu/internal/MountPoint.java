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

import java.nio.file.Path;

/**
 * Defines a mount point used in the backend filesystem
 *
 * @author Tobias Bräutigam - initial contribution
 *
 */
public class MountPoint {
    /**
     * Target path for the mount, relative to the CometVisu config folder
     */
    private Path targetPath;
    /**
     * Source path for the mount, relative to the CometVisu root folder
     */
    private Path sourcePath;
    private boolean showSubDirs = false;
    private boolean writeable = false;

    public MountPoint(Path target, Path source) {
        this(target, source, false, false);
    }

    public MountPoint(Path target, Path source, boolean showSub, boolean writeable) {
        this.targetPath = target;
        this.sourcePath = source;
        this.showSubDirs = showSub;
        this.writeable = writeable;
    }

    public boolean contains(Path path) {
        return path.startsWith(this.targetPath);
    }

    public boolean isShowSubDirs() {
        return showSubDirs;
    }

    public void setShowSubDirs(boolean showSubDirs) {
        this.showSubDirs = showSubDirs;
    }

    public boolean isWriteable() {
        return writeable;
    }

    public void setWriteable(boolean writeable) {
        this.writeable = writeable;
    }

    public Path getTargetPath() {
        return targetPath;
    }

    public Path getSourcePath() {
        return sourcePath;
    }

    public String getName() {
        return this.targetPath.getName(this.targetPath.getNameCount() - 1).toString();
    }

    /**
     *
     * @return Absolute path to the source of this mount
     */
    public Path getAbsoluteSource() {
        return ManagerSettings.getInstance().getCometVisuPath().resolve(this.sourcePath);
    }

    /**
     *
     * @return Absolute path to the target of this mount
     */
    public Path getAbsoluteTarget() {
        return ManagerSettings.getInstance().getConfigFolder().toPath().resolve(this.targetPath);
    }
}
