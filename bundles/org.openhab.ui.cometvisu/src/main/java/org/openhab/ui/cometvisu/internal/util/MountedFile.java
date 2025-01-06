/*
 * Copyright (c) 2010-2025 Contributors to the openHAB project
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
package org.openhab.ui.cometvisu.internal.util;

import java.io.File;
import java.nio.file.Path;

import javax.ws.rs.core.Response.Status;

import org.openhab.ui.cometvisu.internal.ManagerSettings;
import org.openhab.ui.cometvisu.internal.MountPoint;

/**
 * A File that can be places in a MountPoint
 *
 * @author Tobias Bräutigam - initial contribution
 *
 */
public class MountedFile {
    private MountPoint mount;
    private Path path;
    private Path relativeTargetPath;

    public MountedFile(String pathname) throws FileOperationException {
        this.path = Path.of(normalize(pathname));
        this.relativeTargetPath = this.path;
        // find a mount point
        for (final MountPoint mount : ManagerSettings.getInstance().getMounts()) {
            if (mount.contains(this.path)) {
                this.mount = mount;
                // remove the mount target from the path
                this.path = this.mount.getTargetPath().relativize(this.path);
                break;
            }
        }
    }

    public MountedFile(MountPoint mount) {
        this.path = mount.getTargetPath();
        this.mount = mount;
    }

    public MountPoint getMount() {
        return mount;
    }

    public String getMountPath() {
        return mount != null ? mount.getTargetPath().toString() : "";
    }

    public Path getAbsolutePath() {
        if (mount != null) {
            return mount.getAbsoluteSource().resolve(path);
        } else {
            return ManagerSettings.getInstance().getConfigPath().resolve(path);
        }
    }

    public boolean isReadonlyMount() {
        return mount != null && !mount.isWriteable();
    }

    public String getPath() {
        return relativeTargetPath.toString();
    }

    public File toFile() {
        return getAbsolutePath().toFile();
    }

    public boolean exists() {
        return toFile().exists();
    }

    public boolean canWrite() {
        return toFile().canWrite();
    }

    public boolean isDirectory() {
        return toFile().isDirectory();
    }

    public String getName() {
        return toFile().getName();
    }

    public boolean hasChildren() {
        return toFile().list().length > 0;
    }

    private String normalize(String path) throws FileOperationException {
        String normalizedPath = ".".equals(path) ? "" : path;
        while (normalizedPath.startsWith(File.separator)) {
            normalizedPath = path.substring(1);
        }
        if (normalizedPath.contains(".." + File.separator) || normalizedPath.contains(File.separator + "..")) {
            throw new FileOperationException("path not allowed", Status.NOT_ACCEPTABLE);
        }
        if (File.separator.equals("\\")) {
            // special case for windows that also supports "/" beneath the official file separator
            if (normalizedPath.contains("../") || normalizedPath.contains("/..")) {
                throw new FileOperationException("path not allowed", Status.NOT_ACCEPTABLE);
            }
        }
        return normalizedPath;
    }
}
