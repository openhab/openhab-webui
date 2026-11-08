/**
 * Keeps the most recent samples of a stream in a ring buffer, addressed by their index in the stream.
 */
export class AudioHistory {
  private readonly buffer: Float32Array
  private total = 0

  /**
   * @param capacity number of samples to keep
   */
  constructor(capacity: number) {
    this.buffer = new Float32Array(capacity)
  }

  /**
   * Number of samples written since the stream started, which is the index of the next sample.
   */
  get length(): number {
    return this.total
  }

  write(samples: Float32Array) {
    const capacity = this.buffer.length
    // only the last capacity samples can be kept
    const kept = samples.length > capacity ? samples.subarray(samples.length - capacity) : samples
    const start = (this.total + samples.length - kept.length) % capacity
    const first = Math.min(kept.length, capacity - start)
    this.buffer.set(kept.subarray(0, first), start)
    this.buffer.set(kept.subarray(first), 0)
    this.total += samples.length
  }

  /**
   * Returns the samples from the given stream index to the latest one, or from the oldest one still kept.
   */
  readFrom(index: number): Float32Array {
    const capacity = this.buffer.length
    const start = Math.max(index, this.total - capacity, 0)
    const output = new Float32Array(Math.max(0, this.total - start))
    const offset = start % capacity
    const first = Math.min(output.length, capacity - offset)
    output.set(this.buffer.subarray(offset, offset + first))
    output.set(this.buffer.subarray(0, output.length - first), first)
    return output
  }
}
