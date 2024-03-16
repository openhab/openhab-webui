import { resample } from 'wave-resampler'
export async function createResampler (
  resampleMode,
  inputSampleRate,
  outputSampleRate,
  channels
) {
  if (inputSampleRate === outputSampleRate) {
    console.debug('No resampling needed for this stream')
    return new ResamplerNoop()
  }
  const resampler = new ResamplerJS(
    inputSampleRate,
    outputSampleRate,
    channels,
    resampleMode
  )
  await resampler.init()
  return resampler
}
export class ResamplerNoop {
  init () {
    return Promise.resolve()
  }

  resample (samples) {
    return samples
  }

  close () {}
}
export class ResamplerJS {
  constructor (sampleRate, targetSampleRate, channels, resampleMode) {
    this.sampleRate = sampleRate
    this.targetSampleRate = targetSampleRate
    this.channels = channels
    this.resampleMethod = this.getMethod(resampleMode)
  }

  init () {
    return Promise.resolve()
  }

  resample (samples) {
    const deinterlacedAudio = []
    const samplesPerChannel = Math.floor(samples.length / this.channels)
    for (let sampleN = 0; sampleN < samplesPerChannel; sampleN++) {
      for (let channel = 0; channel < this.channels; channel++) {
        const audioChannel =
          deinterlacedAudio[channel] ??
          (deinterlacedAudio[channel] = new Float32Array(samplesPerChannel))
        audioChannel[sampleN] = samples[sampleN * this.channels + channel]
      }
    }
    for (let i = 0; i < deinterlacedAudio.length; i++) {
      deinterlacedAudio[i] = resample(
        deinterlacedAudio[i],
        this.sampleRate,
        this.targetSampleRate,
        { method: this.resampleMethod }
      )
    }
    const interlacedAudio = new Float32Array(
      deinterlacedAudio.reduce((t, audioChannel) => t + audioChannel.length, 0)
    )
    for (let sampleN = 0; sampleN < deinterlacedAudio[0].length; sampleN++) {
      for (let channel = 0; channel < this.channels; channel++) {
        interlacedAudio[sampleN * this.channels + channel] =
          deinterlacedAudio[channel][sampleN]
      }
    }
    return interlacedAudio
  }

  getMethod (resampleMode) {
    const allowedMethods = ['point', 'linear', 'cubic', 'sinc']
    return allowedMethods.includes(resampleMode.toLocaleLowerCase())
      ? resampleMode.toLocaleLowerCase()
      : allowedMethods[0]
  }

  close () {}
}
