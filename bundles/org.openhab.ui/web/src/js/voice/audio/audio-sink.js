/**
 * The {@link AudioSink} class plays the audio transmitted by an AudioNode using the audioContext destination or a MediaStreamDestination + a web AudioElement.
 */
export class AudioSink {
  constructor (id, channels, volume) {
    this.id = id
    this.channels = channels
    this.processorNode = new AudioWorkletNode(
      this.getAudioContext(),
      'websocket-sink-worklet',
      {
        numberOfInputs: 0,
        numberOfOutputs: 1,
        outputChannelCount: [channels],
        channelCountMode: 'explicit'
      }
    )
    this.gainNode = this.getAudioContext().createGain()
    this.gainNode.gain.value = volume / 100
  }

  static async configure (audioContext, useAudioElement) {
    await audioContext.audioWorklet.addModule(new URL('./audio-sink-worklet.js', import.meta.url))
    AudioSink.audioContext = audioContext
    if (useAudioElement) {
      console.debug('Voice: Using audio element to render sound')
      if (!AudioSink.destination) {
        AudioSink.destination = audioContext.createMediaStreamDestination()
      }
      if (!AudioSink.audioElement) {
        AudioSink.audioElement = new Audio()
        AudioSink.audioElement.srcObject = AudioSink.destination.stream
      }
    } else {
      console.debug(
        'Voice: Using audio context destination to render sound'
      )
      AudioSink.destination?.stream.getTracks().forEach((t) => t.stop())
      AudioSink.destination = undefined
      AudioSink.audioElement?.remove()
      AudioSink.audioElement = undefined
    }
  }

  async start () {
    AudioSink.connectedNodes++
    this.processorNode.connect(this.gainNode)
    if (!AudioSink.destination || !AudioSink.audioElement) {
      this.gainNode.connect(this.getAudioContext().destination)
    } else {
      this.gainNode.connect(AudioSink.destination)
      if (AudioSink.connectedNodes === 1) {
        console.debug('Voice: Play audio element')
        await AudioSink.audioElement.play()
      }
    }
  }

  getId () {
    return this.id
  }

  setVolume (value) {
    this.gainNode.gain.setValueAtTime(
      value / 100,
      this.getAudioContext().currentTime
    )
  }

  close () {
    AudioSink.connectedNodes--
    const audioElement = AudioSink.audioElement
    if (audioElement) {
      if (AudioSink.connectedNodes === 0) {
        console.debug('Voice: Pause audio element')
        audioElement.pause()
      }
    }
    this.processorNode.disconnect()
    this.gainNode.disconnect()
  }

  getMessagePort () {
    return this.processorNode.port
  }

  getAudioContext () {
    if (!AudioSink.audioContext) {
      throw new Error('Sink class must be configured')
    }
    return AudioSink.audioContext
  }
}
AudioSink.connectedNodes = 0
