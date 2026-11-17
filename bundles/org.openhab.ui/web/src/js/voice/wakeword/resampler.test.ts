import { describe, expect, it } from 'vitest'
import { OUTPUT_SAMPLE_RATE, Resampler } from './resampler'

function sine(frequency: number, sampleRate: number, length: number): Float32Array {
  return Float32Array.from({ length }, (_, i) => Math.sin((2 * Math.PI * frequency * i) / sampleRate))
}

/** Processes the input in chunks of the size that audio worklets deliver, and joins the output. */
function resample(resampler: Resampler, input: Float32Array, chunkSize = 128): Float32Array {
  const chunks: Float32Array[] = []
  for (let i = 0; i < input.length; i += chunkSize) {
    chunks.push(resampler.process(input.subarray(i, i + chunkSize)))
  }
  const output = new Float32Array(chunks.reduce((sum, chunk) => sum + chunk.length, 0))
  let offset = 0
  for (const chunk of chunks) {
    output.set(chunk, offset)
    offset += chunk.length
  }
  return output
}

function peak(samples: Float32Array): number {
  return samples.reduce((max, sample) => Math.max(max, Math.abs(sample)), 0)
}

describe('Resampler', () => {
  it('passes 16 kHz audio through unchanged', () => {
    const input = sine(440, OUTPUT_SAMPLE_RATE, 1000)
    const output = resample(new Resampler(OUTPUT_SAMPLE_RATE), input)

    // the last sample comes out with the next chunk
    expect(output.length).toBe(input.length - 1)
    expect(Array.from(output)).toEqual(Array.from(input.subarray(0, output.length)))
  })

  it.each([48000, 44100, 22050])('outputs 16000 samples per second of %i Hz audio', (sampleRate) => {
    const output = resample(new Resampler(sampleRate), sine(440, sampleRate, sampleRate))

    // the filter holds back half its length
    expect(output.length).toBeGreaterThan(OUTPUT_SAMPLE_RATE - 50)
    expect(output.length).toBeLessThanOrEqual(OUTPUT_SAMPLE_RATE)
  })

  it.each([48000, 44100])('keeps speech frequencies of %i Hz audio', (sampleRate) => {
    const output = resample(new Resampler(sampleRate), sine(1000, sampleRate, sampleRate))
    const settled = output.subarray(1000)

    expect(peak(settled)).toBeGreaterThan(0.97)
    expect(peak(settled)).toBeLessThan(1.03)
    // a 1 kHz tone crosses zero 2000 times per second
    let crossings = 0
    for (let i = 1; i < settled.length; i++) {
      if (settled[i - 1] < 0 !== settled[i] < 0) {
        crossings++
      }
    }
    expect(Math.abs(crossings - (2000 * settled.length) / OUTPUT_SAMPLE_RATE)).toBeLessThan(3)
  })

  it.each([48000, 44100])('removes frequencies that 16 kHz cannot hold from %i Hz audio', (sampleRate) => {
    const output = resample(new Resampler(sampleRate), sine(12000, sampleRate, sampleRate))

    expect(peak(output.subarray(1000))).toBeLessThan(0.01)
  })

  it('gives the same output for any chunk size', () => {
    const input = sine(700, 44100, 10000)

    expect(Array.from(resample(new Resampler(44100), input, 1))).toEqual(Array.from(resample(new Resampler(44100), input, 4096)))
  })

  it('starts a new stream on reset', () => {
    const input = sine(700, 48000, 4800)
    const resampler = new Resampler(48000)
    const first = resample(resampler, input)
    resample(resampler, sine(300, 48000, 1000))
    resampler.reset()

    expect(Array.from(resample(resampler, input))).toEqual(Array.from(first))
  })
})
