import sinkWorkletURL from './audio-sink-worklet.ts?worker&url'

/**
 * The {@link AudioSink} class plays the audio transmitted by an AudioNode using the audioContext destination or a MediaStreamDestination + a web AudioElement.
 */
export class AudioSink {
  /**
   * The shared AudioContext used by all source components.
   */
  private static audioContext: AudioContext
  /**
   * The destination node when rendering audio through a MediaStream.
   */
  private static destination?: MediaStreamAudioDestinationNode
  /**
   * The HTMLAudioElement used to render audio when `useAudioElement` is true.
   * @private
   */
  private static audioElement?: HTMLAudioElement
  /**
   * Counter tracking active sink instances to manage global playback state.
   */
  private static connectedNodes: number = 0

  private readonly id: string
  /**
   * The internal gain node for volume control.
   * @private
   */
  private readonly gainNode: GainNode
  /**
   * The source node for the audio data.
   * @private
   */
  private processorNode: AudioWorkletNode

  /**
   * Creates a new AudioSink instance.
   * @param id unique identifier for the sink
   * @param channels number of output channels (e.g., 1 for mono, 2 for stereo)
   * @param volume volume percentage (in [0, 100])
   */
  constructor(id: string, channels: number, volume: number) {
    this.id = id
    this.processorNode = new AudioWorkletNode(this.getAudioContext(), 'audio-sink-worklet', {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [channels],
      channelCountMode: 'explicit'
    })
    this.gainNode = this.getAudioContext().createGain()
    this.gainNode.gain.value = volume / 100
  }

  /**
   * Configures the static AudioContext and loads the required AudioWorklet module.
   * This method must be called before creating any instance of the AudioSink class.
   * @param audioContext
   * @param useAudioElement
   */
  static async configure(audioContext: AudioContext, useAudioElement: boolean) {
    await audioContext.audioWorklet.addModule(sinkWorkletURL)
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
      console.debug('Voice: Using audio context destination to render sound')
      AudioSink.destination?.stream.getTracks().forEach((t) => t.stop())
      AudioSink.destination = undefined
      AudioSink.audioElement?.remove()
      AudioSink.audioElement = undefined
    }
  }

  /**
   * Starts the playback for this sink.
   * Connects the internal nodes and triggers the {@link HTMLAudioElement} playback if this is the first active sink.
   */
  async start() {
    this.processorNode.connect(this.gainNode)
    AudioSink.connectedNodes++
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

  /**
   * Get the unique identifier of this sink.
   */
  getId() {
    return this.id
  }

  /**
   * Sets the volume of the internal gain node.
   * @param value volume percentage (in [0, 100])
   */
  setVolume(value: number) {
    this.gainNode.gain.setValueAtTime(value / 100, this.getAudioContext().currentTime)
  }

  /**
   * Closes the sink and disconnects all connected nodes.
   * If this was the last active sink, the {@link HTMLAudioElement} playback is paused.
   */
  close() {
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

  /**
   * Provides access to the MessagePort of the internal AudioWorkletNode.
   * This port can be used to send messages to the worklet processor.
   */
  getMessagePort() {
    return this.processorNode.port
  }

  /**
   * Get the shared AudioContext.
   */
  getAudioContext() {
    if (!AudioSink.audioContext) {
      throw new Error('Sink class must be configured')
    }
    return AudioSink.audioContext
  }
}
