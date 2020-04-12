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
package org.openhab.ui.cometvisu.internal.util;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.Random;
import java.util.regex.Pattern;
import java.util.zip.CRC32;

import javax.ws.rs.core.Response.Status;

import org.openhab.ui.cometvisu.backend.rest.model.FsEntry;
import org.openhab.ui.cometvisu.backend.rest.model.ReadResponse;
import org.openhab.ui.cometvisu.internal.ManagerSettings;
import org.openhab.ui.cometvisu.internal.MountPoint;
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
    private MountedFile rootDir = new MountedFile(new MountPoint(Paths.get(""), Paths.get("resource", "config")));

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
        for (final File fileEntry : dir.listFiles()) {
            if (!fileEntry.isHidden()) {
                read.add(fs.getEntry(fileEntry, recursive, mdir));
            }
        }
        // add mounts (when the config folder is requested)
        if (dir.toPath().equals(ManagerSettings.getInstance().getConfigFolder().toPath())) {
            Path requestedPath = dir.toPath();
            for (final MountPoint mount : ManagerSettings.getInstance().getMounts()) {
                if (mount.getAbsoluteTarget().getParent().equals(requestedPath)) {
                    read.add(fs.getEntry(new MountedFile(mount), recursive));
                }
            }
        }
        return read;
    }

    public void saveFile(File file, InputStream fileInputStream, String hash) throws FileOperationException {
        File parentDir = new File(file.getParent());
        if (!parentDir.exists()) {
            parentDir.mkdirs();
        }
        // check hash
        byte[] bytes;
        try {
            bytes = new byte[fileInputStream.available()];
            fileInputStream.read(bytes);
            CRC32 contentHash = new CRC32();
            contentHash.update(bytes, 0, bytes.length);
            if (!hash.isEmpty() && hash.equalsIgnoreCase("ignore")) {
                // compare hashes
                if (contentHash.getValue() != Long.parseLong(hash)) {
                    throw new FileOperationException(
                            "data has been corrupted during transport " + hash + " != " + contentHash,
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
                    logger.error(e.getMessage());
                    tempBackup = null;
                }
            }
            // now write new content
            try {
                Files.write(file.toPath(), bytes);

                // check written hash
                CRC32 writtenHash = new CRC32();
                byte[] writtenBytes = Files.readAllBytes(file.toPath());
                writtenHash.update(writtenBytes, 0, writtenBytes.length);

                if (!contentHash.equals(writtenHash)) {
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
            logger.error(e1.getMessage());
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

    private String getFileWithoutExtension(File file) {
        String name = file.getName();
        int lastIndexOf = name.lastIndexOf(".");
        if (lastIndexOf == -1) {
            return name;
        }
        return name.substring(0, lastIndexOf);
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
        // entry.setTrash(false);
        // entry.setHash();
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
}
