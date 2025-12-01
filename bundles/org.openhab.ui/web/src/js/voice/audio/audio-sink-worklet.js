/**
 * The {@link AudioSinkWorklet} is the {@link AudioWorkletProcessor} implementation used by the {@link AudioSink} class,
 * it caches the data received through its {@link MessagePort} and feed it to the connected {@link AudioProcessor}
 *
 */
class AudioSinkWorklet extends AudioWorkletProcessor {
  constructor () {
    super()
    /**
     * Audio Cache
     */
    this.audioCache = new AudioCache()
    /**
     * Indicates the data transmission has not ended
     */
    this.streaming = true
    /**
     * Indicates all data has been played and the sink can be disposed
     */
    this.done = false
    // Setup message handler
    this.port.onmessage = (ev) => this.handlePortMessage(ev.data)
  }

  handlePortMessage (data) {
    if (data instanceof Float32Array) {
      this.audioCache.writeAudioData(data)
    } else if (Array.isArray(data)) {
      data.forEach((buffer) => this.audioCache.writeAudioData(buffer))
    } else if (data === false) {
      this.streaming = false
    }
  }

  process (_, outputs) {
    const frameLength = outputs[0][0].length
    const channels = outputs[0].length
    const bufferSize = frameLength * channels
    const dataAvailable = this.audioCache.available(bufferSize)
    if (!dataAvailable) {
      if (this.streaming) {
        return true
      } else {
        if (this.audioCache.size() !== 0) {
          // send remaining audio
          const audioData = new Float32Array(bufferSize)
          audioData.set(
            this.audioCache.readAudioData(this.audioCache.size()),
            0
          )
          this.writeAudioSamples(audioData, outputs, channels)
          return true
        } else if (!this.done) {
          this.done = true
          // notify completion
          this.port.postMessage(false)
          this.port.close()
        }
        return false
      }
    }
    const audioData = this.audioCache.readAudioData(bufferSize)
    this.writeAudioSamples(audioData, outputs, channels)
    return true
  }

  writeAudioSamples (audioData, outputs, channels) {
    if (channels === 1) {
      outputs[0][0].set(audioData, 0)
    } else {
      // move the interlaced audio samples to the correct channel
      const channelsData = outputs[0]
      audioData.forEach((sample, sampleNumber) => {
        const channelIndex = sampleNumber % channels
        channelsData[channelIndex][
          (sampleNumber - channelIndex) / channels
        ] = sample
      })
    }
  }
}

/**
 * The {@link AudioCache} class is an util to store the audio data received through the {@link MessagePort} so it can be consumed progressively.
 */
class AudioCache {
  constructor () {
    this.buffers = []
    this.offset = 0
    this.length = 0
  }

  readAudioData (n) {
    this.length -= n
    let currentBuffer = this.buffers[0]
    const nextOffset = n + this.offset
    if (nextOffset <= currentBuffer.length) {
      const chunk = currentBuffer.subarray(this.offset, nextOffset)
      if (nextOffset < currentBuffer.length) {
        this.offset = nextOffset
      } else {
        this.offset = 0
        this.buffers.shift()
      }
      return chunk
    } else {
      const partialChunks = [currentBuffer.subarray(this.offset)]
      this.offset = 0
      this.buffers.shift()
      let required = n - partialChunks[0].length
      while (required > 0) {
        currentBuffer = this.buffers[0]
        if (required >= currentBuffer.length) {
          partialChunks.push(currentBuffer)
          required -= currentBuffer.length
          this.offset = 0
          this.buffers.shift()
        } else {
          const partialBuffer = currentBuffer.subarray(this.offset, required)
          partialChunks.push(partialBuffer)
          this.offset = partialBuffer.length
          required -= partialBuffer.length
        }
      }
      const chunk = new Float32Array(n)
      let resultOffset = 0
      for (const _chunk of partialChunks) {
        chunk.set(_chunk, resultOffset)
        resultOffset += _chunk.length
      }
      return chunk
    }
  }

  writeAudioData (buffer) {
    this.length += buffer.length
    this.buffers.push(buffer)
  }

  available (size) {
    return this.length >= size
  }

  size () {
    return this.length
  }

  clean () {
    this.buffers = []
    this.offset = 0
    this.length = 0
  }
}

registerProcessor('audio-sink-worklet', AudioSinkWorklet)
