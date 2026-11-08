import { describe, expect, it } from 'vitest'
import { FRAME_SIZE, type FrameDetector, WakeWordSpotter } from './wakeword-spotter'

/** Records the frames it gets, and detects the wake word in the frames listed. */
class FakeDetector implements FrameDetector {
  readonly frames: Int16Array[] = []
  resets = 0
  framesAfterWakeWord = 0
  private readonly detectAt: number[]

  constructor(...detectAt: number[]) {
    this.detectAt = detectAt
  }

  process(frame: Int16Array): boolean {
    this.frames.push(frame.slice())
    return this.detectAt.includes(this.frames.length - 1)
  }

  getFramesAfterWakeWord(): number {
    return this.framesAfterWakeWord
  }

  reset() {
    this.resets++
  }
}

describe('WakeWordSpotter', () => {
  it('passes 10 ms frames of 16 kHz audio to the detector', () => {
    const detector = new FakeDetector()
    const spotter = new WakeWordSpotter(detector, 48000)
    for (let i = 0; i < 375; i++) {
      spotter.push(new Float32Array(128))
    }

    // one second of audio, less the latency of the resampler
    expect(detector.frames.length).toBe(99)
    expect(detector.frames.every((frame) => frame.length === FRAME_SIZE)).toBe(true)
  })

  it('converts samples to 16-bit integers', () => {
    const detector = new FakeDetector()
    const spotter = new WakeWordSpotter(detector, 16000)
    const samples = new Float32Array(FRAME_SIZE + 1)
    samples.set([1, -1, 0.5, -0.5, 2, -2])
    spotter.push(samples)

    expect(Array.from(detector.frames[0].subarray(0, 6))).toEqual([32767, -32768, 16384, -16384, 32767, -32768])
  })

  it('reports a detection and resets the detector', () => {
    const detector = new FakeDetector(2)
    detector.framesAfterWakeWord = 3
    const spotter = new WakeWordSpotter(detector, 16000)

    expect(spotter.push(new Float32Array(2 * FRAME_SIZE + 1))).toBeNull()
    expect(detector.resets).toBe(0)
    expect(spotter.push(new Float32Array(FRAME_SIZE))).toBe(3 * FRAME_SIZE)
    expect(detector.resets).toBe(1)
    expect(spotter.push(new Float32Array(FRAME_SIZE))).toBeNull()
  })

  it('counts the samples after the wake word to the end of the pushed samples', () => {
    const detector = new FakeDetector(0)
    detector.framesAfterWakeWord = 2
    const spotter = new WakeWordSpotter(detector, 16000)

    // detected in the first of three frames, so two more frames follow it in the same push
    expect(spotter.push(new Float32Array(3 * FRAME_SIZE + 1))).toBe(4 * FRAME_SIZE)
  })

  it('drops a partial frame on reset', () => {
    const detector = new FakeDetector()
    const spotter = new WakeWordSpotter(detector, 16000)
    spotter.push(new Float32Array(100).fill(0.5))
    spotter.reset()
    spotter.push(new Float32Array(FRAME_SIZE + 1).fill(-0.5))

    expect(detector.frames.length).toBe(1)
    expect(detector.frames[0].every((sample) => sample === -16384)).toBe(true)
    expect(detector.resets).toBe(1)
  })
})
