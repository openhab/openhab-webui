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
package org.openhab.ui.cometvisu.internal.backend.rest;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.Part;

/**
 * Helper object for getting files from multi-part {@link HttpServletRequest}s.
 *
 * @author Wouter Born - Initial contribution
 */
public class MultipartRequestMap extends HashMap<String, List<Object>> {

    private static final long serialVersionUID = 1L;
    private static final String DEFAULT_ENCODING = "UTF-8";

    private String encoding;
    private String tempLocation;

    public MultipartRequestMap(HttpServletRequest request) {
        this(request, System.getProperty("java.io.tmpdir"));
    }

    public MultipartRequestMap(HttpServletRequest request, String tempLocation) {
        try {
            this.tempLocation = tempLocation;

            encoding = request.getCharacterEncoding();
            if (encoding == null) {
                try {
                    encoding = DEFAULT_ENCODING;
                    request.setCharacterEncoding(DEFAULT_ENCODING);
                } catch (UnsupportedEncodingException e) {
                    throw new IllegalStateException("Unsupported encoding: " + encoding, e);
                }
            }

            for (Part part : request.getParts()) {
                String fileName = part.getSubmittedFileName();
                if (fileName == null) {
                    putMulti(part.getName(), getValue(part));
                } else {
                    processFilePart(part, fileName);
                }
            }
        } catch (IOException | ServletException e) {
            throw new IllegalStateException("Failed to get request parts", e);
        }
    }

    public String getStringParameter(String name) {
        List<Object> list = get(name);
        return list != null ? (String) list.get(0) : null;
    }

    public File getFileParameter(String name) {
        List<Object> list = get(name);
        return list != null ? (File) list.get(0) : null;
    }

    private void processFilePart(Part part, String fileName) throws IOException {
        File tempFile = new File(tempLocation, fileName);
        tempFile.createNewFile();
        tempFile.deleteOnExit();

        try (BufferedInputStream input = new BufferedInputStream(part.getInputStream(), 8192);
                BufferedOutputStream output = new BufferedOutputStream(new FileOutputStream(tempFile), 8192)) {
            byte[] buffer = new byte[8192];
            for (int length = 0; ((length = input.read(buffer)) > 0);) {
                output.write(buffer, 0, length);
            }
        }
        part.delete();
        putMulti(part.getName(), tempFile);
    }

    private String getValue(Part part) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(part.getInputStream(), encoding));
        StringBuilder value = new StringBuilder();
        char[] buffer = new char[8192];
        for (int length; (length = reader.read(buffer)) > 0;) {
            value.append(buffer, 0, length);
        }
        return value.toString();
    }

    private <T> void putMulti(final String key, final T value) {
        List<Object> values = super.get(key);

        if (values == null) {
            values = new ArrayList<>();
            values.add(value);
            put(key, values);
        } else {
            values.add(value);
        }
    }
}
