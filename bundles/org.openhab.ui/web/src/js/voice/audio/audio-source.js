import sourceWorkletURL from './audio-source-worklet?worker&url'
/**
 * Utility class to encapsulate the creation of a {@link MediaStreamAudioSourceNode}, and handle its connected {@link AudioNode} processors.
 *
 * It uses a {@link GainNode} to share the data across the connected nodes.
 *
 * We keep the gain node connected to the media source stream to avoid it gets paused.
 */
export class AudioSource {
  constructor(volume) {
    this.gainNode = this.getAudioContext().createGain()
    this.setVolume(volume)
  }

  static async configure(audioContext) {
    AudioSource.audioContext = audioContext
    await audioContext.audioWorklet.addModule(sourceWorkletURL, { name: 'audio-source-worklet' })
  }

  async init() {
    if (!this.stream) {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true
        },
        video: false
      })
    }
    if (!this.sourceNode) {
      this.sourceNode = this.getAudioContext().createMediaStreamSource(this.stream)
      // connect processor to source
      this.sourceNode.connect(this.gainNode)
    }
  }

  createWorkletNode() {
    return new AudioWorkletNode(AudioSource.audioContext, 'audio-source-worklet', {
      numberOfInputs: 1,
      numberOfOutputs: 0,
      channelCount: 1,
      channelCountMode: 'explicit'
    })
  }
  isSuspended() {
    return this.getAudioContext().state !== 'running'
  }

  async resume() {
    if (this.getAudioContext().state !== 'running') {
      console.debug('Voice: Resuming voice audio context')
      await this.getAudioContext().resume()
    }
    if (this.getAudioContext().state !== 'running') {
    } else if (!this.stream || !this.stream.active) {
      this.stream = undefined
      this.sourceNode?.disconnect()
      this.sourceNode = undefined
      await this.init()
    }
  }

  async start(...audioProcessors) {
    await this.resume()
    const currentProcessors = this.nodeProcessors ?? []
    audioProcessors.filter((p) => !currentProcessors.includes(p)).forEach((audioNode) => this.connectNode(audioNode))
    currentProcessors.filter((p) => !audioProcessors.includes(p)).forEach((audioNode) => this.disconnectNode(audioNode))
    this.nodeProcessors = audioProcessors
  }

  setVolume(value) {
    this.gainNode.gain.setValueAtTime(value / 100, this.getAudioContext().currentTime)
  }

  stop() {
    if (this.nodeProcessors) {
      for (const audioNode of this.nodeProcessors) {
        this.disconnectNode(audioNode)
      }
      this.nodeProcessors = undefined
    }
  }

  connectNode(audioNode) {
    this.gainNode.connect(audioNode)
    if (audioNode.numberOfOutputs > 0) {
      audioNode.connect(this.getAudioContext().destination)
    }
  }

  disconnectNode(audioNode) {
    this.gainNode.disconnect(audioNode)
    if (audioNode.numberOfOutputs > 0) {
      audioNode.disconnect(this.getAudioContext().destination)
    }
  }

  getAudioContext() {
    if (!AudioSource.audioContext) {
      throw new Error('Source class must be configured')
    }
    return AudioSource.audioContext
  }
}
