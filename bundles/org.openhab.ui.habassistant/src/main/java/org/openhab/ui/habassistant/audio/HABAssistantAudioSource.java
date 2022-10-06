/**
 * Copyright (c) 2010-2022 Contributors to the openHAB project
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
package org.openhab.ui.habassistant.audio;

import java.io.IOException;
import java.io.InputStream;
import java.io.PipedInputStream;
import java.io.PipedOutputStream;
import java.util.Locale;
import java.util.Set;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.audio.AudioException;
import org.openhab.core.audio.AudioFormat;
import org.openhab.core.audio.AudioSource;
import org.openhab.core.audio.AudioStream;
import org.openhab.ui.habassistant.websockets.HABAssistantWebSocketHandler;

/**
 * The {@link HABAssistantAudioSource} class defines the assistant Audio Sink
 *
 * @author Miguel Álvarez - Initial contribution
 */
@NonNullByDefault
public class HABAssistantAudioSource implements AudioSource {
    private static final AudioFormat HABASSISTANT_SOURCE_FORMAT = new AudioFormat(AudioFormat.CONTAINER_WAVE,
            AudioFormat.CODEC_PCM_SIGNED, false, 16, null, 16000L, 1);
    private final Set<AudioFormat> supportedFormats = Set.of(HABASSISTANT_SOURCE_FORMAT);
    private final String sourceId;
    private final String sourceLabel;
    private final HABAssistantWebSocketHandler wsHandler;

    public HABAssistantAudioSource(String id, String label, HABAssistantWebSocketHandler wsHandler) {
        this.sourceId = id;
        this.sourceLabel = label;
        this.wsHandler = wsHandler;
    }

    @Override
    public String getId() {
        return this.sourceId;
    }

    @Override
    public String getLabel(@Nullable Locale locale) {
        return this.sourceLabel;
    }

    @Override
    public Set<AudioFormat> getSupportedFormats() {
        return supportedFormats;
    }

    @Override
    public AudioStream getInputStream(AudioFormat audioFormat) throws AudioException {
        try {
            var pipeOutput = new PipedOutputStream();
            var pipeInput = new PipedInputStream(pipeOutput, 2730 * 20) {
                @Override
                public void close() throws IOException {
                    wsHandler.unregisterListener(pipeOutput);
                    super.close();
                }
            };
            wsHandler.registerListener(pipeOutput);
            return new HABAssistantAudioStream(HABASSISTANT_SOURCE_FORMAT, pipeInput);
        } catch (IOException e) {
            throw new AudioException(e);
        }
    }

    public class HABAssistantAudioStream extends AudioStream {
        private final InputStream input;
        private final AudioFormat format;
        private boolean closed = false;

        public HABAssistantAudioStream(AudioFormat format, InputStream input) {
            this.input = input;
            this.format = format;
        }

        @Override
        public AudioFormat getFormat() {
            return this.format;
        }

        @Override
        public int read() throws IOException {
            byte[] b = new byte[1];
            int bytesRead = read(b);
            if (-1 == bytesRead) {
                return bytesRead;
            }
            Byte bb = Byte.valueOf(b[0]);
            return bb.intValue();
        }

        @Override
        public int read(byte @Nullable [] b) throws IOException {
            return read(b, 0, b == null ? 0 : b.length);
        }

        @Override
        public int read(byte @Nullable [] b, int off, int len) throws IOException {
            if (b == null) {
                throw new IOException("Buffer is null");
            }
            if (closed) {
                throw new IOException("Stream is closed");
            }
            return input.read(b, off, len);
        }

        @Override
        public void close() throws IOException {
            closed = true;
            input.close();
        }
    }
}
