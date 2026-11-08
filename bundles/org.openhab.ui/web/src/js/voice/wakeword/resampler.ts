/** Sample rate of the output, which wake word models take. */
export const OUTPUT_SAMPLE_RATE = 16000

/** Length of the low-pass filter, odd so that it has a center tap. */
const FILTER_TAPS = 127

/** Cutoff of the low-pass filter, a little below the 8 kHz Nyquist frequency of the output. */
const FILTER_CUTOFF_HZ = 7200

/**
 * Converts a stream of audio to 16 kHz.
 *
 * A windowed sinc low-pass filter removes the frequencies that 16 kHz can't hold, and output samples that fall
 * between two input samples are interpolated linearly, so any input sample rate works.
 */
export class Resampler {
  private readonly step: number
  private readonly filter: Float32Array | null
  private readonly half: number
  private buffer: Float32Array
  private length = 0
  /** Input sample index of the start of the buffer. */
  private bufferStart = 0
  /** Number of output samples since the stream started; output n lies at input index n * step. */
  private outputCount = 0

  constructor(inputSampleRate: number) {
    this.step = inputSampleRate / OUTPUT_SAMPLE_RATE
    this.filter = inputSampleRate > OUTPUT_SAMPLE_RATE ? lowPassFilter(FILTER_TAPS, FILTER_CUTOFF_HZ / inputSampleRate) : null
    this.half = this.filter ? (FILTER_TAPS - 1) / 2 : 0
    this.buffer = new Float32Array(4096)
    this.reset()
  }

  /**
   * Clears the stream state, so that the next samples start a new stream.
   */
  reset() {
    // the filter starts on silence
    this.buffer.fill(0, 0, this.half)
    this.length = this.half
    this.bufferStart = -this.half
    this.outputCount = 0
  }

  /**
   * Converts the next samples of the stream.
   *
   * @param input samples at the input sample rate
   * @returns the samples at 16 kHz that the input completes
   */
  process(input: Float32Array): Float32Array {
    this.append(input)
    // the interpolation reads one sample past the position, and the filter half its length further
    const limit = this.length - this.half - 1
    const output = new Float32Array(Math.max(0, Math.ceil((limit - this.position()) / this.step) + 1))
    let count = 0
    for (let position = this.position(); position < limit; position = this.position()) {
      const index = Math.floor(position)
      const fraction = position - index
      const current = this.filtered(index)
      output[count++] = fraction === 0 ? current : current + fraction * (this.filtered(index + 1) - current)
      this.outputCount++
    }
    // drop the samples that no later output needs
    const drop = Math.floor(this.position()) - this.half
    if (drop > 0) {
      this.buffer.copyWithin(0, drop, this.length)
      this.length -= drop
      this.bufferStart += drop
    }
    return output.subarray(0, count)
  }

  /**
   * The position of the next output sample in the buffer. It is computed from the output count rather than
   * accumulated, so the result doesn't depend on how the input is split into chunks.
   */
  private position(): number {
    return this.outputCount * this.step - this.bufferStart
  }

  private append(input: Float32Array) {
    if (this.length + input.length > this.buffer.length) {
      const grown = new Float32Array(Math.max(this.buffer.length * 2, this.length + input.length))
      grown.set(this.buffer.subarray(0, this.length))
      this.buffer = grown
    }
    this.buffer.set(input, this.length)
    this.length += input.length
  }

  private filtered(index: number): number {
    if (!this.filter) {
      return this.buffer[index]
    }
    let sum = 0
    const start = index - this.half
    for (let tap = 0; tap < this.filter.length; tap++) {
      sum += this.filter[tap] * this.buffer[start + tap]
    }
    return sum
  }
}

/**
 * A Hamming windowed sinc low-pass filter with a gain of 1.
 *
 * @param taps number of coefficients, odd
 * @param cutoff cutoff frequency as a fraction of the sample rate
 */
function lowPassFilter(taps: number, cutoff: number): Float32Array {
  const filter = new Float32Array(taps)
  const center = (taps - 1) / 2
  let sum = 0
  for (let n = 0; n < taps; n++) {
    const x = n - center
    const sinc = x === 0 ? 2 * cutoff : Math.sin(2 * Math.PI * cutoff * x) / (Math.PI * x)
    const window = 0.54 - 0.46 * Math.cos((2 * Math.PI * n) / (taps - 1))
    filter[n] = sinc * window
    sum += filter[n]
  }
  for (let n = 0; n < taps; n++) {
    filter[n] /= sum
  }
  return filter
}
