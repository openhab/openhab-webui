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
import java.io.OutputStream;
import java.nio.ByteBuffer;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

import javax.sound.sampled.UnsupportedAudioFileException;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.audio.AudioFormat;
import org.openhab.core.audio.AudioSink;
import org.openhab.core.audio.AudioStream;
import org.openhab.core.audio.FixedLengthAudioStream;
import org.openhab.core.audio.UnsupportedAudioFormatException;
import org.openhab.core.audio.UnsupportedAudioStreamException;
import org.openhab.core.library.types.PercentType;
import org.openhab.ui.habassistant.websockets.HABAssistantWebSocketHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * The {@link HABAssistantAudioSink} class defines the assistant Audio Sink
 *
 * @author Miguel Álvarez - Initial contribution
 */
// @Component(service = HABAssistantAudioSink.class, immediate = true, name = "org.openhab.habassistant.websockets")
@NonNullByDefault
public class HABAssistantAudioSink implements AudioSink {
    private static final HashSet<AudioFormat> SUPPORTED_FORMATS = new HashSet<>();
    private static final HashSet<Class<? extends AudioStream>> SUPPORTED_STREAMS = new HashSet<>();

    static {
        SUPPORTED_FORMATS.add(AudioFormat.WAV);
        SUPPORTED_STREAMS.add(FixedLengthAudioStream.class);
    }
    private final Logger logger = LoggerFactory.getLogger(HABAssistantAudioSink.class);

    private final String sinkId;
    private final String sinkLabel;
    private final HABAssistantWebSocketHandler wsHandler;
    private final long targetSampleRate;

    public HABAssistantAudioSink(String id, String label, long targetSampleRate,
            HABAssistantWebSocketHandler wsHandler) {
        this.sinkId = id;
        this.sinkLabel = label;
        this.targetSampleRate = targetSampleRate;
        this.wsHandler = wsHandler;
    }

    @Override
    public String getId() {
        return this.sinkId;
    }

    @Override
    public @Nullable String getLabel(@Nullable Locale locale) {
        return this.sinkLabel;
    }

    @Override
    public void process(@Nullable AudioStream audioStream)
            throws UnsupportedAudioFormatException, UnsupportedAudioStreamException {
        if (audioStream == null) {
            return;
        }
        try (ConvertedInputStream convertedInputStream = new ConvertedInputStream(audioStream, targetSampleRate)) {
            convertedInputStream.transferTo(new HABAssistantWebSocketOutputStream(wsHandler));
        } catch (UnsupportedAudioFileException e) {
            logger.warn("UnsupportedAudioFileException: {}", e.getMessage());
        } catch (IOException e) {
            logger.warn("IOException: {}", e.getMessage());
        }
    }

    @Override
    public Set<AudioFormat> getSupportedFormats() {
        return SUPPORTED_FORMATS;
    }

    @Override
    public Set<Class<? extends AudioStream>> getSupportedStreams() {
        return SUPPORTED_STREAMS;
    }

    @Override
    public PercentType getVolume() throws IOException {
        return PercentType.valueOf("0");
    }

    @Override
    public void setVolume(PercentType percentType) throws IOException {
    }

    private static class HABAssistantWebSocketOutputStream extends OutputStream {
        private final HABAssistantWebSocketHandler wsHandler;

        public HABAssistantWebSocketOutputStream(HABAssistantWebSocketHandler wsHandler) {
            this.wsHandler = wsHandler;
        }

        @Override
        public void write(int b) throws IOException {
            write(ByteBuffer.allocate(4).putInt(b).array());
        }

        @Override
        public void write(byte @Nullable [] b, int off, int len) throws IOException {
            if (b != null) {
                wsHandler.sendAudio(b);
            }
        }
    }
}
