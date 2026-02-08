/**
 * The {@link AudioSinkWorklet} is the {@link AudioWorkletProcessor} implementation used by the {@link AudioSink} class,
 * it caches the data received through its {@link MessagePort} and feeds it to the connected {@link AudioProcessor}.
 */
class AudioSinkWorklet extends AudioWorkletProcessor {
  private audioCache: AudioCache = new AudioCache()
  /**
   * Indicates the audio data transmission has not ended
   */
  private streaming: boolean = true
  /**
   * Indicates all audio data has been played and the sink can be disposed
   */
  private done: boolean = false

  constructor() {
    super()
    // Setup message handler
    this.port.onmessage = (ev) => this.handlePortMessage(ev.data)
  }

  private handlePortMessage(data: Float32Array | Float32Array[] | boolean) {
    if (data instanceof Float32Array) {
      this.audioCache.writeAudioData(data)
    } else if (Array.isArray(data)) {
      data.forEach((buffer) => this.audioCache.writeAudioData(buffer))
    } else if (data === false) {
      this.streaming = false
    }
  }

  process(_: any, outputs: Float32Array[][]) {
    const frameLength = outputs[0]![0]!.length
    const channels = outputs[0]!.length
    const bufferSize = frameLength * channels
    const dataAvailable = this.audioCache.available(bufferSize)
    if (!dataAvailable) {
      if (this.streaming) {
        return true
      } else {
        if (this.audioCache.size() !== 0) {
          // send remaining audio
          const audioData = new Float32Array(bufferSize)
          audioData.set(this.audioCache.readAudioData(this.audioCache.size()), 0)
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

  private writeAudioSamples(audioData: Float32Array, outputs: Float32Array[][], channels: number) {
    if (channels === 1) {
      outputs[0]![0]!.set(audioData, 0)
    } else {
      // move the interlaced audio samples to the correct channel
      const channelsData = outputs[0]!
      audioData.forEach((sample, sampleNumber) => {
        const channelIndex = sampleNumber % channels
        channelsData[channelIndex]![(sampleNumber - channelIndex) / channels] = sample
      })
    }
  }
}

/**
 * The {@link AudioCache} class is a util to store the audio data received through the {@link MessagePort} so it can be consumed progressively.
 *
 * It acts as a First-In-First-Out (FIFO) buffer, allowing to read a specific number of samples regardless of how the data was originally chunked during transmission.
 */
class AudioCache {
  /**
   * Internal queue of audio data chunks
   */
  private buffers: Float32Array[] = []
  /**
   * The current read position index within the first buffer in the queue (`buffers[0]`)
   */
  private offset: number = 0
  /**
   * The total number of unread samples currently available in the cache
   * @private
   */
  private length: number = 0

  /**
   * Reads and consumes a specific number of audio samples from the cache.
   * Always check `available(n)` before calling this method.
   * @param n number of samples to read
   */
  readAudioData(n: number) {
    this.length -= n
    let currentBuffer = this.buffers[0]!
    const nextOffset = n + this.offset
    if (nextOffset <= currentBuffer.length) {
      // Scenario 1: The current buffer has enough samples to satisfy the request
      const chunk = currentBuffer.subarray(this.offset, nextOffset)
      if (nextOffset < currentBuffer.length) {
        this.offset = nextOffset
      } else {
        this.offset = 0
        this.buffers.shift()
      }
      return chunk
    } else {
      // Scenario 2: The request spans across multiple buffers
      // 1. Take the remainder of the current buffer
      const partialChunks = [currentBuffer.subarray(this.offset)]
      this.offset = 0
      this.buffers.shift()

      let required = n - partialChunks[0]!.length

      // 2. Consume subsequent buffers until we have enough samples to satisfy the request
      while (required > 0) {
        currentBuffer = this.buffers[0]!

        if (required >= currentBuffer.length) {
          // Scenario 2.1: Consume the whole buffer and probably even more
          partialChunks.push(currentBuffer)
          required -= currentBuffer.length
          this.offset = 0
          this.buffers.shift()
        } else {
          // Scenario 2.2: Consume only a part of the next buffer
          const partialBuffer = currentBuffer.subarray(this.offset, required)
          partialChunks.push(partialBuffer)
          this.offset = partialBuffer.length
          required -= partialBuffer.length
        }
      }

      // 3. Merge all partial chunks into a single buffer
      const chunk = new Float32Array(n)
      let resultOffset = 0
      for (const _chunk of partialChunks) {
        chunk.set(_chunk, resultOffset)
        resultOffset += _chunk.length
      }
      return chunk
    }
  }

  /**
   * Append a new audio buffer to the cache.
   * @param buffer
   */
  writeAudioData(buffer: Float32Array) {
    this.length += buffer.length
    this.buffers.push(buffer)
  }

  /**
   * Checks if the cache contains enough audio samples to satisfy a read request.
   * @param size
   */
  available(size: number) {
    return this.length >= size
  }

  /**
   * Returns the total number of unread samples in the cache.
   */
  size() {
    return this.length
  }

  /**
   * Clears the cache.
   */
  clean() {
    this.buffers = []
    this.offset = 0
    this.length = 0
  }
}

registerProcessor('audio-sink-worklet', AudioSinkWorklet)
