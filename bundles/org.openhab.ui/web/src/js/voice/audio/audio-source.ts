import sourceWorkletURL from './audio-source-worklet.ts?worker&url'

/**
 * Utility class to encapsulate the creation of a {@link MediaStreamAudioSourceNode}, and handle its connected {@link AudioNode} processors.
 *
 * It uses a {@link GainNode} to share the data across the connected nodes.
 * We keep the gain node connected to the media source stream to avoid it gets paused.
 */
export class AudioSource {
  /**
   * The shared AudioContext used by all source components.
   */
  private static audioContext: AudioContext

  /**
   * The central gain node used to control the volume and share the audio data across the connected nodes.
   */
  private readonly gainNode: GainNode
  /**
   * The raw media stream obtained from the microphone.
   */
  private stream?: MediaStream
  /**
   * The Web Audio API wrapper around the media stream.
   */
  private sourceNode?: MediaStreamAudioSourceNode
  /**
   * The list of currently active audio processors connected to this source.
   * @private
   */
  private nodeProcessors: AudioNode[] = []

  /**
   * Creates a new AudioSource instance.
   * @param volume volume percentage (in [0, 100])
   */
  constructor(volume: number) {
    this.gainNode = this.getAudioContext().createGain()
    this.setVolume(volume)
  }

  /**
   * Configures the static AudioContext and loads the required AudioWorklet module.
   * This method must be called before creating any instance of the AudioSource class.
   * @param audioContext
   */
  static async configure(audioContext: AudioContext) {
    AudioSource.audioContext = audioContext
    await audioContext.audioWorklet.addModule(sourceWorkletURL)
  }

  /**
   * Initializes the microphone stream and the source node.
   */
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

  /**
   * Creates a new AudioWorkletNode for the 'audio-source-worklet' processor.
   */
  createWorkletNode() {
    return new AudioWorkletNode(AudioSource.audioContext, 'audio-source-worklet', {
      numberOfInputs: 1,
      numberOfOutputs: 0,
      channelCount: 1,
      channelCountMode: 'explicit'
    })
  }

  /**
   * Checks if the underlying AudioContext is suspended.
   */
  isSuspended() {
    return this.getAudioContext().state !== 'running'
  }

  /**
   * Resumes the audio context if suspended and re-initializes if required.
   */
  async resume() {
    if (this.getAudioContext().state !== 'running') {
      console.debug('Voice: Resuming voice audio context')
      await this.getAudioContext().resume()
    }
    if (this.getAudioContext().state !== 'running') {
      throw new Error('Voice: Failed to resume audio context')
    } else if (!this.stream || !this.stream.active) {
      this.stream = undefined
      this.sourceNode?.disconnect()
      this.sourceNode = undefined
      await this.init()
    }
  }

  /**
   * Starts audio processing by connecting the provided processors.
   * If existing processors are not provided, they are disconnected.
   * @param audioProcessors
   */
  async start(...audioProcessors: AudioNode[]) {
    await this.resume()
    const currentProcessors = this.nodeProcessors
    audioProcessors.filter((p) => !currentProcessors.includes(p)).forEach((audioNode) => this.connectNode(audioNode))
    currentProcessors.filter((p) => !audioProcessors.includes(p)).forEach((audioNode) => this.disconnectNode(audioNode))
    this.nodeProcessors = audioProcessors
  }

  /**
   * Sets the volume of the internal gain node.
   * @param value volume percentage (in [0, 100])
   */
  setVolume(value: number) {
    this.gainNode.gain.setValueAtTime(value / 100, this.getAudioContext().currentTime)
  }

  /**
   * Stops audio processing by disconnecting all connected processors.
   */
  stop() {
    for (const audioNode of this.nodeProcessors) {
      this.disconnectNode(audioNode)
    }
    this.nodeProcessors = []
  }

  /**
   * Connects the provided audio node to the source node and the destination node if outputs are present.
   * @param audioNode
   */
  connectNode(audioNode: AudioNode) {
    this.gainNode.connect(audioNode)
    if (audioNode.numberOfOutputs > 0) {
      audioNode.connect(this.getAudioContext().destination)
    }
  }

  /**
   * Disconnects the provided audio node from the source node and the destination node if outputs are present.
   * @param audioNode
   */
  disconnectNode(audioNode: AudioNode) {
    this.gainNode.disconnect(audioNode)
    if (audioNode.numberOfOutputs > 0) {
      audioNode.disconnect(this.getAudioContext().destination)
    }
  }

  /**
   * Get the shared AudioContext.
   */
  getAudioContext() {
    if (!AudioSource.audioContext) {
      throw new Error('Source class must be configured')
    }
    return AudioSource.audioContext
  }
}
