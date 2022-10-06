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

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;

import javax.sound.sampled.AudioInputStream;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.UnsupportedAudioFileException;

import org.eclipse.jdt.annotation.NonNullByDefault;
import org.eclipse.jdt.annotation.Nullable;
import org.openhab.core.audio.AudioFormat;
import org.openhab.core.audio.AudioStream;
import org.openhab.core.audio.FixedLengthAudioStream;
import org.openhab.core.audio.UnsupportedAudioFormatException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This class convert a stream to the normalized pcm
 * format wanted
 *
 * @author Gwendal Roulleau - Initial contribution
 * @author Miguel Álvarez - Initial contribution
 */
@NonNullByDefault
public class ConvertedInputStream extends InputStream {

    private final Logger logger = LoggerFactory.getLogger(ConvertedInputStream.class);

    private final AudioFormat audioFormat;
    private final javax.sound.sampled.AudioFormat targetFormat;
    private AudioInputStream pcmNormalizedInputStream;

    private long duration = -1;
    private long length = -1;

    public ConvertedInputStream(AudioStream innerInputStream, long targetSampleRate)
            throws UnsupportedAudioFormatException, UnsupportedAudioFileException, IOException {
        this.audioFormat = innerInputStream.getFormat();
        this.targetFormat = new javax.sound.sampled.AudioFormat(javax.sound.sampled.AudioFormat.Encoding.PCM_SIGNED,
                targetSampleRate, 16, 1, 2, targetSampleRate, false);

        if (innerInputStream instanceof FixedLengthAudioStream) {
            length = ((FixedLengthAudioStream) innerInputStream).length();
        }

        pcmNormalizedInputStream = getPCMStreamNormalized(getPCMStream(new BufferedInputStream(innerInputStream)));
    }

    @Override
    public int read(byte @Nullable [] b) throws IOException {
        return pcmNormalizedInputStream.read(b);
    }

    @Override
    public int read(byte @Nullable [] b, int off, int len) throws IOException {
        return pcmNormalizedInputStream.read(b, off, len);
    }

    @Override
    public byte[] readAllBytes() throws IOException {
        return pcmNormalizedInputStream.readAllBytes();
    }

    @Override
    public byte[] readNBytes(int len) throws IOException {
        return pcmNormalizedInputStream.readNBytes(len);
    }

    @Override
    public int readNBytes(byte @Nullable [] b, int off, int len) throws IOException {
        return pcmNormalizedInputStream.readNBytes(b, off, len);
    }

    @Override
    public int read() throws IOException {
        return pcmNormalizedInputStream.read();
    }

    @Override
    public void close() throws IOException {
        pcmNormalizedInputStream.close();
    }

    /**
     * Ensure right PCM format by converting if needed (sample rate, channel)
     *
     * @param pcmInputStream
     * @return A PCM normalized stream (2 channel, 16 bit signed) at the desired sampleRate
     */
    private AudioInputStream getPCMStreamNormalized(AudioInputStream pcmInputStream) {
        javax.sound.sampled.AudioFormat format = pcmInputStream.getFormat();
        if (format.getChannels() != targetFormat.getChannels()
                || !format.getEncoding().equals(targetFormat.getEncoding())
                || format.getSampleSizeInBits() != targetFormat.getSampleSizeInBits()
                || Math.abs(format.getFrameRate() - targetFormat.getFrameRate()) > 1000) {
            logger.debug("Sound is not in the target format. Trying to reencode it");
            return AudioSystem.getAudioInputStream(targetFormat, pcmInputStream);
        } else {
            return pcmInputStream;
        }
    }

    public long getDuration() {
        return duration;
    }

    /**
     * If necessary, this method convert MP3 to PCM, and try to
     * extract duration information.
     *
     * @param resetableInnerInputStream A stream supporting reset operation
     *            (reset is mandatory to parse formation without loosing data)
     * @return PCM stream
     */
    private AudioInputStream getPCMStream(InputStream resetableInnerInputStream)
            throws UnsupportedAudioFileException, IOException, UnsupportedAudioFormatException {
        if (AudioFormat.WAV.isCompatible(audioFormat)) {
            // return the same input stream, but try to compute the duration first
            AudioInputStream audioInputStream = AudioSystem.getAudioInputStream(resetableInnerInputStream);
            if (length > 0) {
                int frameSize = audioInputStream.getFormat().getFrameSize();
                float frameRate = audioInputStream.getFormat().getFrameRate();
                float durationInSeconds = (length / (frameSize * frameRate));
                duration = Math.round(durationInSeconds * 1000);
                logger.debug("Duration of input stream : {}", duration);
            }
            return audioInputStream;
        } else {
            throw new UnsupportedAudioFormatException("HABAssistant audio sink can only play pcm streams", audioFormat);
        }
    }
}
