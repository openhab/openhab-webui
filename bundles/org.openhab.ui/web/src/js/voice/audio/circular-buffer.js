/**
 * This utility reuses the same buffer to run the callback ensuring a constant buffer size.
 * It can be feed with buffers of any chunk size.
 */
export class CircularBufferExecutor {
  constructor (buffer, cb, options) {
    this.offset = 0
    this.buffer = buffer
    this.cb = cb
    this.cloneData = options?.clone ?? false
  }

  /**
     * Process this chunk.
     * Take in account the inner operation may run zero, one or multiple times, depending on the chunk length and the offset of the internal buffer.
     * @param chunk typed array of the same type of the buffer.
     */
  async process (chunk) {
    const requiredSamples = this.buffer.length - this.offset
    if (chunk.length >= requiredSamples) {
      this.buffer.set(chunk.subarray(0, requiredSamples), this.offset)
      const result = this.cb(this.getBuffer())
      if (result) await result
      const remaining = chunk.subarray(requiredSamples)
      if (remaining.length >= this.buffer.length) {
        this.offset = 0
        await this.process(chunk)
      } else if (remaining.length > 0) {
        this.offset = remaining.length
        this.buffer.set(remaining, 0)
      } else {
        this.offset = 0
      }
    } else {
      this.buffer.set(chunk, this.offset)
      this.offset = this.offset + chunk.length
    }
  }

  flush () {
    return this.process(new Float32Array(this.buffer.length - this.offset))
  }

  getBuffer () {
    if (this.cloneData) {
      return this.buffer.slice()
    }
    return this.buffer
  }
}
