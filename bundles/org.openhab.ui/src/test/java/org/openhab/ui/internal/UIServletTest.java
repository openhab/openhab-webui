/*
 * Copyright (c) 2010-2026 Contributors to the openHAB project
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
package org.openhab.ui.internal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.openhab.ui.internal.UIServlet.ByteRange;

import jakarta.servlet.ServletConfig;
import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.WriteListener;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Tests for {@link UIServlet}.
 *
 * @author Holger Friedrich - Initial contribution
 */
@NonNullByDefault
public class UIServletTest {

    private static final String CONTENT = "0123456789abcdef";

    private @TempDir @NonNullByDefault({}) Path confDir;
    private @NonNullByDefault({}) UIServlet servlet;
    private @NonNullByDefault({}) HttpServletRequest request;
    private @NonNullByDefault({}) HttpServletResponse response;
    private final ByteArrayOutputStream body = new ByteArrayOutputStream();

    @BeforeEach
    public void setUp() throws Exception {
        Path html = Files.createDirectory(confDir.resolve("html"));
        Files.writeString(html.resolve("range.txt"), CONTENT);
        Files.writeString(html.resolve("My Image.txt"), "space");
        Files.writeString(confDir.resolve("secret.cfg"), "password=secret");

        UIContext uiContext = mock(UIContext.class);
        when(uiContext.handleSecurity(any(), any())).thenReturn(true);
        ServletConfig config = mock(ServletConfig.class);
        when(config.getServletContext()).thenReturn(mock(ServletContext.class));
        servlet = new UIServlet(uiContext, html);
        servlet.init(config);

        request = mock(HttpServletRequest.class);
        when(request.getDateHeader(anyString())).thenReturn(-1L);
        response = mock(HttpServletResponse.class);
        when(response.getOutputStream()).thenReturn(new ServletOutputStream() {
            @Override
            public void write(int b) throws IOException {
                body.write(b);
            }

            @Override
            public boolean isReady() {
                return true;
            }

            @Override
            public void setWriteListener(@Nullable WriteListener writeListener) {
            }
        });
    }

    private void get(String pathInfo) throws Exception {
        when(request.getPathInfo()).thenReturn(pathInfo);
        servlet.doGet(request, response);
    }

    private String body() {
        return body.toString(StandardCharsets.UTF_8);
    }

    @Test
    public void servesStaticFile() throws Exception {
        get("/static/range.txt");

        assertEquals(CONTENT, body());
        verify(response).setContentLengthLong(CONTENT.length());
        verify(response).setHeader("Accept-Ranges", "bytes");
        verify(response, never()).setStatus(anyInt());
    }

    @Test
    public void servesFileWithSpaceInName() throws Exception {
        // the container passes the decoded path, e.g. for /static/My%20Image.txt
        get("/static/My Image.txt");

        assertEquals("space", body());
    }

    @Test
    public void rejectsPathOutsideStaticDirectory() throws Exception {
        get("/static/../secret.cfg");

        assertEquals("", body());
        verify(response).sendError(HttpServletResponse.SC_NOT_FOUND);
    }

    @Test
    public void rejectsAbsolutePathInsideStaticDirectory() throws Exception {
        get("/static/" + confDir.resolve("secret.cfg"));

        assertEquals("", body());
        verify(response).sendError(HttpServletResponse.SC_NOT_FOUND);
    }

    @Test
    public void servesRequestedRange() throws Exception {
        when(request.getHeader("Range")).thenReturn("bytes=2-5");

        get("/static/range.txt");

        assertEquals("2345", body());
        verify(response).setStatus(HttpServletResponse.SC_PARTIAL_CONTENT);
        verify(response).setHeader("Content-Range", "bytes 2-5/16");
        verify(response).setContentLengthLong(4);
    }

    @Test
    public void servesSuffixRange() throws Exception {
        when(request.getHeader("Range")).thenReturn("bytes=-3");

        get("/static/range.txt");

        assertEquals("def", body());
        verify(response).setHeader("Content-Range", "bytes 13-15/16");
    }

    @Test
    public void rejectsUnsatisfiableRange() throws Exception {
        when(request.getHeader("Range")).thenReturn("bytes=16-");

        get("/static/range.txt");

        assertEquals("", body());
        verify(response).setStatus(HttpServletResponse.SC_REQUESTED_RANGE_NOT_SATISFIABLE);
        verify(response).setHeader("Content-Range", "bytes */16");
        verify(response, never()).sendError(anyInt());
    }

    @Test
    public void servesCompleteFileForMultipleRanges() throws Exception {
        when(request.getHeader("Range")).thenReturn("bytes=0-1,4-5");

        get("/static/range.txt");

        assertEquals(CONTENT, body());
        verify(response, never()).setStatus(anyInt());
    }

    @Test
    public void servesCompleteFileIfRangeDoesNotMatch() throws Exception {
        when(request.getHeader("Range")).thenReturn("bytes=2-5");
        when(request.getHeader("If-Range")).thenReturn("\"some-etag\"");
        when(request.getDateHeader("If-Range")).thenThrow(new IllegalArgumentException());

        get("/static/range.txt");

        assertEquals(CONTENT, body());
        verify(response, never()).setStatus(anyInt());
    }

    @Test
    public void servesRangeIfRangeMatchesLastModified() throws Exception {
        long lastModified = confDir.resolve("html/range.txt").toFile().lastModified();
        when(request.getHeader("Range")).thenReturn("bytes=2-5");
        when(request.getHeader("If-Range")).thenReturn("date");
        when(request.getDateHeader("If-Range")).thenReturn((lastModified / 1000) * 1000);

        get("/static/range.txt");

        assertEquals("2345", body());
    }

    @Test
    public void parseRange() {
        assertEquals(new ByteRange(0, 9), UIServlet.parseRange("bytes=0-9", 100));
        assertEquals(new ByteRange(90, 99), UIServlet.parseRange("bytes=90-", 100));
        assertEquals(new ByteRange(90, 99), UIServlet.parseRange("bytes=90-200", 100));
        assertEquals(new ByteRange(0, 99), UIServlet.parseRange("bytes=-200", 100));
        assertEquals(new ByteRange(80, 99), UIServlet.parseRange(" bytes=-20 ", 100));

        assertSame(ByteRange.UNSATISFIABLE, UIServlet.parseRange("bytes=100-", 100));
        assertSame(ByteRange.UNSATISFIABLE, UIServlet.parseRange("bytes=-0", 100));
        assertSame(ByteRange.UNSATISFIABLE, UIServlet.parseRange("bytes=-5", 0));

        assertNull(UIServlet.parseRange("bytes=9-0", 100));
        assertNull(UIServlet.parseRange("bytes=-", 100));
        assertNull(UIServlet.parseRange("bytes=0-1,5-6", 100));
        assertNull(UIServlet.parseRange("items=0-9", 100));
        assertNull(UIServlet.parseRange("bytes=0-99999999999999999999", 100));
    }
}
