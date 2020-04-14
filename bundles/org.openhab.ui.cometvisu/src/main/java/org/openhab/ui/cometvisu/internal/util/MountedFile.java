package org.openhab.ui.cometvisu.internal.util;

import java.io.File;
import java.nio.file.Path;

import javax.ws.rs.core.Response.Status;

import org.openhab.ui.cometvisu.internal.ManagerSettings;
import org.openhab.ui.cometvisu.internal.MountPoint;

public class MountedFile {
    private MountPoint mount;
    private Path path;
    private Path relativeTargetPath;
    private String originalPath;

    public MountedFile(String pathname) throws FileOperationException {
        this.path = Path.of(normalize(pathname));
        this.relativeTargetPath = this.path;
        this.originalPath = pathname;
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
        return this.mount;
    }

    public String getMountPath() {
        return this.mount != null ? this.mount.getTargetPath().toString() : "";
    }

    public Path getAbsolutePath() {
        if (this.mount != null) {
            return this.mount.getAbsoluteSource().resolve(this.path);
        } else {
            return ManagerSettings.getInstance().getConfigPath().resolve(this.path);
        }
    }

    public boolean isReadonlyMount() {
        return this.mount != null && !this.mount.isWriteable();
    }

    public String getPath() {
        return this.relativeTargetPath.toString();
    }

    public File toFile() {
        return this.getAbsolutePath().toFile();
    }

    public boolean exists() {
        return this.toFile().exists();
    }

    public boolean isDirectory() {
        return this.toFile().isDirectory();
    }

    public String getName() {
        return this.toFile().getName();
    }

    public boolean hasChildren() {
        return this.toFile().list().length > 0;
    }

    private String normalize(String path) throws FileOperationException {
        String normalizedPath = path.equals(".") ? "" : path;
        while (normalizedPath.startsWith(File.separator)) {
            normalizedPath = path.substring(1);
        }
        if (normalizedPath.contains(".." + File.separator) || normalizedPath.contains(File.separator + "..")) {
            throw new FileOperationException("path not allowed", Status.NOT_ACCEPTABLE);
        }
        return normalizedPath;
    }
}
