/** Loudness in dB of full scale that shows as 0, about the noise of a quiet room. */
const MIN_DB = -55
/** Loudness in dB of full scale that shows as 1, about speech close to the microphone. */
const MAX_DB = -15

/**
 * Measures the loudness of the audio connected to its node.
 */
export class LevelMeter {
  readonly node: AnalyserNode
  private readonly samples: Float32Array<ArrayBuffer>

  constructor(audioContext: BaseAudioContext) {
    this.node = audioContext.createAnalyser()
    this.samples = new Float32Array(this.node.fftSize)
  }

  /**
   * The loudness of the latest audio, from 0 for silence to 1 for loud speech.
   */
  level() {
    this.node.getFloatTimeDomainData(this.samples)
    let sum = 0
    for (const sample of this.samples) {
      sum += sample * sample
    }
    const db = 10 * Math.log10(sum / this.samples.length)
    return Math.min(Math.max((db - MIN_DB) / (MAX_DB - MIN_DB), 0), 1)
  }
}
