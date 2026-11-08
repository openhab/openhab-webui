import { describe, expect, it } from 'vitest'
import { LevelMeter } from './level-meter'

/** A meter whose analyser sees the given samples. */
function meter(sample: (i: number) => number): LevelMeter {
  const audioContext = {
    createAnalyser: () => ({
      fftSize: 2048,
      getFloatTimeDomainData: (samples: Float32Array) => samples.forEach((_, i) => (samples[i] = sample(i)))
    })
  }
  return new LevelMeter(audioContext as unknown as BaseAudioContext)
}

describe('LevelMeter', () => {
  it('shows silence as 0', () => {
    expect(meter(() => 0).level()).toBe(0)
  })

  it('shows loud audio as 1', () => {
    expect(meter((i) => Math.sin(i / 10)).level()).toBe(1)
  })

  it('scales the loudness in between', () => {
    // -35 dB of full scale, halfway between the quietest and loudest level
    expect(meter(() => 10 ** (-35 / 20)).level()).toBeCloseTo(0.5)
  })
})
