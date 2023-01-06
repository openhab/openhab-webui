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
package org.openhab.ui.cometvisu.internal.util;

import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.Random;
import java.util.regex.Pattern;
import java.util.zip.CRC32;
import java.util.zip.CheckedInputStream;
import java.util.zip.CheckedOutputStream;

import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.openhab.ui.cometvisu.internal.ManagerSettings;
import org.openhab.ui.cometvisu.internal.MountPoint;
import org.openhab.ui.cometvisu.internal.backend.model.rest.FsEntry;
import org.openhab.ui.cometvisu.internal.backend.model.rest.FsEntry.TypeEnum;
import org.openhab.ui.cometvisu.internal.backend.model.rest.ReadResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Filesystem helper that supports all file operation in the installed CometVisus config folder
 *
 * @author Tobias Bräutigam - initial contribution
 *
 */
public class FsUtil {
    private final Logger logger = LoggerFactory.getLogger(FsUtil.class);
    private static FsUtil instance;
    private DateFormat dateFormat = new SimpleDateFormat("yyyyMMddHHmmss");

    public static FsUtil getInstance() {
        if (FsUtil.instance == null) {
            FsUtil.instance = new FsUtil();
        }
        return FsUtil.instance;
    }

    public ReadResponse listDir(MountedFile mdir, boolean recursive) {
        FsUtil fs = FsUtil.getInstance();
        ReadResponse read = new ReadResponse();
        File dir = mdir.toFile();
        boolean trashExists = false;
        boolean isConfigFolder = dir.toPath().equals(ManagerSettings.getInstance().getConfigFolder().toPath());
        for (final File fileEntry : dir.listFiles()) {
            boolean isTrash = false;
            if (isConfigFolder) {
                if (fileEntry.getName().equals(ManagerSettings.getInstance().getTrashFolder())) {
                    trashExists = true;
                    isTrash = true;
                }
            }
            if (!fileEntry.isHidden() || isTrash) {
                FsEntry entry = fs.getEntry(fileEntry, recursive, mdir);
                if (isTrash) {
                    entry.setTrash(true);
                    entry.setWriteable(false);
                }
                read.add(entry);
            }
        }
        // some special customizations in the config folder
        if (isConfigFolder) {
            // add mounts (when the config folder is requested)
            Path requestedPath = dir.toPath();
            for (final MountPoint mount : ManagerSettings.getInstance().getMounts()) {
                if (mount.getAbsoluteTarget().getParent().equals(requestedPath)) {
                    read.add(fs.getEntry(new MountedFile(mount), recursive));
                }
            }
            if (!trashExists) {
                // add trash folder even if it does not exist
                FsEntry trash = new FsEntry();
                trash.setName(ManagerSettings.getInstance().getTrashFolder());
                trash.setType(TypeEnum.DIR);
                trash.setReadable(true);
                trash.setTrash(true);
                read.add(trash);
            }
        }
        return read;
    }

    public boolean isInTrash(File file) {
        String absPath = file.getAbsolutePath();
        String absTrashPath = ManagerSettings.getInstance().getTrashPath();
        return absPath.startsWith(absTrashPath) && absPath.length() > absTrashPath.length();
    }

    public void saveFile(File file, InputStream fileInputStream, String hash) throws FileOperationException {
        File parentDir = new File(file.getParent());
        if (!parentDir.exists()) {
            parentDir.mkdirs();
        }
        // check hash
        try {
            BufferedInputStream buffered = new BufferedInputStream(fileInputStream);
            CheckedInputStream cis = new CheckedInputStream(buffered, new CRC32());
            cis.mark(Integer.MAX_VALUE);
            byte[] buffer = new byte[1024];
            while (cis.read(buffer) > 0) {
                continue;
            }
            long contentChecksum = cis.getChecksum().getValue();
            cis.reset();
            if (hash != null && !hash.isEmpty() && "ignore".equalsIgnoreCase(hash)) {
                // compare hashes
                if (contentChecksum != Long.parseLong(hash)) {
                    throw new FileOperationException(
                            "data has been corrupted during transport " + hash + " != " + contentChecksum,
                            Status.METHOD_NOT_ALLOWED);
                }
            }
            ManagerSettings settings = ManagerSettings.getInstance();

            // 1. check if we need to create a backup
            boolean backup = false;
            for (final Pattern pattern : settings.getBackupOnChange()) {
                if (pattern.matcher(file.getName()).find()) {
                    backup = true;
                    break;
                }
            }
            boolean exists = file.exists();
            File backupFile = null;
            if (backup && exists) {
                String name = file.getName();
                int lastIndexOf = name.lastIndexOf(".");
                String extension = lastIndexOf >= 0 ? name.substring(lastIndexOf) : "";
                String filename = lastIndexOf == -1 ? name : name.substring(0, lastIndexOf);

                String backupFileName = filename + "-" + this.dateFormat.format(new Date());
                if (!extension.isEmpty()) {
                    backupFileName += "." + extension;
                }
                backupFile = new File(settings.getBackupPath() + backupFileName);
                try {
                    Files.copy(file.toPath(), backupFile.toPath());
                } catch (IOException e) {
                    throw new FileOperationException("backup failed, please check if the backup folder is writeable",
                            Status.METHOD_NOT_ALLOWED);
                }
            }
            Random rand = new Random();
            int backupSuffix = rand.nextInt();
            File tempBackup = null;
            if (exists) {
                // create a temporary backup of existing file
                try {
                    tempBackup = new File(file.getAbsoluteFile() + String.valueOf(backupSuffix));
                    Files.copy(file.toPath(), tempBackup.toPath());
                } catch (IOException e) {
                    logger.error("{}", e.getMessage());
                    tempBackup = null;
                }
            }
            // now write new content
            try {
                // Files.write(file.toPath(), bytes);
                int read = 0;
                CheckedOutputStream out = new CheckedOutputStream(new FileOutputStream(file), new CRC32());

                while ((read = cis.read(buffer)) != -1) {
                    out.write(buffer, 0, read);
                }
                out.flush();
                out.close();
                cis.close();

                // check written hash

                if (contentChecksum != out.getChecksum().getValue()) {
                    // something went wrong, restore old data
                    if (tempBackup != null) {
                        Files.copy(tempBackup.toPath(), file.toPath());
                    }
                    if (backupFile != null && backupFile.exists()) {
                        // backup not needed as nothing have been written
                        backupFile.delete();
                    }
                    throw new FileOperationException("hash mismatch on written content", Status.METHOD_NOT_ALLOWED);
                }

                // remove temporary backup
                if (tempBackup != null && tempBackup.exists()) {
                    tempBackup.delete();
                }
            } catch (IOException e) {
                // remove temporary backup
                if (tempBackup != null && tempBackup.exists()) {
                    tempBackup.delete();
                }
                throw new FileOperationException("file not written", Status.METHOD_NOT_ALLOWED);
            }
        } catch (IOException e1) {
            logger.error("{}", e1.getMessage());
            throw new FileOperationException("error reading content", Status.METHOD_NOT_ALLOWED);
        }
    }

    public void saveFile(File file, String content, String hash) throws FileOperationException {
        this.saveFile(file, new ByteArrayInputStream(content.getBytes(StandardCharsets.UTF_8)), hash);
    }

    /**
     *
     * @param path Path to check for MointPoints
     * @return A list of MointPoints that are mounted as directories in this path
     */
    public ArrayList<MountPoint> getMounts(Path path) {
        ArrayList<MountPoint> mounts = new ArrayList<MountPoint>();
        for (final MountPoint mount : ManagerSettings.getInstance().getMounts()) {
            if (mount.getAbsoluteTarget().startsWith(path)) {
                mounts.add(mount);
            }
        }
        return mounts;
    }

    public FsEntry getEntry(File file, boolean recursive, MountedFile mount) {
        FsEntry entry = new FsEntry();
        entry.setType(file.isDirectory() ? FsEntry.TypeEnum.DIR : FsEntry.TypeEnum.FILE);
        entry.setName(file.getName());
        entry.setHasChildren(file.isDirectory() && file.listFiles().length > 0);
        entry.setParentFolder(mount.getPath());
        entry.setWriteable(mount.isReadonlyMount() ? false : file.canWrite());
        entry.setReadable(file.canRead());
        entry.setMounted(false);
        entry.setInTrash(this.isInTrash(file));
        if (recursive && entry.getHasChildren()) {
            for (final File fileEntry : file.listFiles()) {
                if (!fileEntry.isHidden()) {
                    entry.getChildren().add(this.getEntry(fileEntry, recursive, mount));
                }
            }
        }

        return entry;
    }

    public FsEntry getEntry(MountedFile mfile, boolean recursive) {
        MountPoint mount = mfile.getMount();
        Path mountTarget = mount.getTargetPath();
        File file = mount.getAbsoluteSource().toFile();
        FsEntry entry = new FsEntry();
        entry.setType(FsEntry.TypeEnum.DIR);
        entry.setName(mount.getName());
        entry.setHasChildren(file.listFiles().length > 0);
        entry.setParentFolder(mountTarget.getParent() == null ? "" : mountTarget.getParent().toString());
        entry.setWriteable(mount.isWriteable() && file.canWrite());
        entry.setReadable(file.canRead());
        entry.setMounted(true);
        if (recursive && entry.getHasChildren()) {
            for (final File fileEntry : file.listFiles()) {
                if (!fileEntry.isHidden() && (fileEntry.isFile() || mount.isShowSubDirs())) {
                    entry.getChildren().add(this.getEntry(fileEntry, recursive, mfile));
                }
            }
        }

        return entry;
    }

    public static Response createErrorResponse(FileOperationException e) {
        return FsUtil.createErrorResponse(e.getStatus(), e.getCause().toString());
    }

    public static Response createErrorResponse(Status status, String message) {
        return Response.status(status).entity(new ErrorResponse(message)).type(MediaType.APPLICATION_JSON).build();
    }
}
