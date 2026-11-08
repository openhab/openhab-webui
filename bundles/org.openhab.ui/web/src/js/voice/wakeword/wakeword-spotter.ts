import { Resampler } from './resampler.ts'

/** Number of 16 kHz samples that the detector takes per frame, 10 ms of audio. */
export const FRAME_SIZE = 160

/**
 * The part of a microWakeWord detector that the spotter uses.
 */
export interface FrameDetector {
  process(frame: Int16Array): boolean
  getFramesAfterWakeWord(): number
  reset(): void
}

/**
 * Feeds browser audio to a wake word detector: converts it to 16 kHz 16-bit samples and cuts it into frames.
 */
export class WakeWordSpotter {
  private readonly detector: FrameDetector
  private readonly resampler: Resampler
  private readonly frame = new Int16Array(FRAME_SIZE)
  private frameLength = 0

  /**
   * @param detector the detector, which this spotter resets after each detection
   * @param inputSampleRate sample rate of the audio passed to {@link push}
   */
  constructor(detector: FrameDetector, inputSampleRate: number) {
    this.detector = detector
    this.resampler = new Resampler(inputSampleRate)
  }

  /**
   * Processes the next samples of the stream.
   *
   * @param samples mono samples in [-1, 1] at the input sample rate
   * @returns null, or when the wake word was detected in these samples, the estimated number of 16 kHz samples
   *   between the end of the wake word and the end of these samples
   */
  push(samples: Float32Array): number | null {
    let samplesAfterWakeWord: number | null = null
    const resampled = this.resampler.process(samples)
    for (let i = 0; i < resampled.length; i++) {
      this.frame[this.frameLength++] = toInt16(resampled[i])
      if (this.frameLength === FRAME_SIZE) {
        this.frameLength = 0
        if (this.detector.process(this.frame)) {
          samplesAfterWakeWord = this.detector.getFramesAfterWakeWord() * FRAME_SIZE + resampled.length - 1 - i
          // the detector keeps reporting the wake word until it is reset
          this.detector.reset()
        }
      }
    }
    return samplesAfterWakeWord
  }

  /**
   * Clears the stream state, so that the next samples start a new stream.
   */
  reset() {
    this.resampler.reset()
    this.frameLength = 0
    this.detector.reset()
  }
}

function toInt16(sample: number): number {
  const clamped = Math.max(-1, Math.min(1, sample))
  return Math.round(clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff)
}
