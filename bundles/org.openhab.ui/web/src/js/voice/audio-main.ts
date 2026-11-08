import audioWorkerURL from './audio-worker?worker&url'
import wakeWordWorkerURL from './wakeword/wakeword-worker?worker&url'
import { AudioSink } from './audio/audio-sink.ts'
import { AudioSource } from './audio/audio-source.ts'
import {
  type WakeWordConfig,
  WakeWordWorkerInCmd,
  type WakeWordWorkerInMessage,
  WakeWordWorkerOutCmd,
  type WakeWordWorkerOutMessage,
  type VoiceState,
  WorkerInCmd,
  WorkerOutCmd,
  type WorkerOutMessage
} from './types.ts'

/** Detections within this time after a spot are ignored, for when the server doesn't start listening. */
const WAKE_WORD_COOLDOWN_MS = 3000

/**
 * When the server starts listening within this time after a wake word spot, the audio since the end of the wake word
 * is sent first. A little below the 5 seconds that the wake word worker keeps.
 */
const WAKE_WORD_AUDIO_MS = 4500

/** How long the dialog shows as triggered when the server doesn't start listening. */
const TRIGGERED_MS = 3000

/** How long the dialog shows as thinking after listening when no reply plays. */
const THINKING_MS = 8000

/* oxlint-disable typescript/no-unsafe-member-access */
/* oxlint-disable typescript/no-unsafe-argument */
/* oxlint-disable typescript/no-floating-promises */
/* oxlint-disable typescript/no-misused-promises */
/* oxlint-disable typescript/restrict-template-expressions */

export interface AudioMainEvents {
  onMessage?: (message: string, level?: 'info' | 'error', duration?: number) => (() => void) | void
  onRunningChange: (instance: AudioMain) => void
  onSpeakingChange?: (instance: AudioMain) => void
  onListeningChange?: (instance: AudioMain) => void
  /** Called when getState() or isListeningForWakeWord() change. */
  onStateChange?: (instance: AudioMain) => void
}

export interface SpeakerConfiguration {
  suspendOnHide: boolean
  useAudioElement: boolean
  sourceVolume?: number
  sinkVolume?: number
}

export class AudioMain {
  private readonly ohUrl: string
  private readonly accessTokenGetter: () => string | null
  private readonly events: AudioMainEvents

  // worker & state
  private worker: Worker | null
  private initialized: boolean = false
  private initializing: Promise<void> | null = null
  private online: boolean = false
  // voice audio context
  private audioContext: AudioContext | null = null
  // audio source
  private audioSource: AudioSource | null = null
  private sourceVolume: number = 50
  private micStreaming: boolean = false
  private listening: boolean = false
  // the processor that streams the microphone to the server while listening
  private streamingNode: AudioWorkletNode | null = null
  // wake word detection
  private wakeWordWorker: Worker | null = null
  private wakeWordNode: AudioWorkletNode | null = null
  private wakeWordPaused: boolean = false
  private lastWakeWordSpot: number = 0
  // whether the wake word worker streams the microphone to the server, instead of a worklet
  private streamingViaWakeWord: boolean = false
  // audio sink
  private readonly activeSinks: Map<string, AudioSink> = new Map()
  private sinkVolume: number = 50
  // what the dialog shows, see updateState
  private state: VoiceState = 'offline'
  private spotTime: number = 0
  private listeningEndTime: number = 0
  private stateTimer?: ReturnType<typeof setTimeout>

  private readonly handleSuspendOnHidden: () => void
  private resolveSourcePort?: () => void
  private releaseSpeaker?: () => void
  private sourceCheckIntervalRef?: ReturnType<typeof setInterval>

  constructor(ohUrl: string, accessTokenGetter: () => string | null, events: AudioMainEvents) {
    this.ohUrl = ohUrl
    this.events = events
    this.accessTokenGetter = accessTokenGetter

    this.handleSuspendOnHidden = () => {
      if (!document.hidden) {
        this.getVoiceAudioContext()
          .resume()
          .catch((err) => this.events.onMessage?.(`Error resuming audio context: ${err}`, 'error'))
        this.startSourceCheckInterval()
        this.postToWorker(WorkerInCmd.RESUME)
      } else {
        this.stopSourceCheckInterval()
        this.getVoiceAudioContext()
          .suspend()
          .catch((err) => this.events.onMessage?.(`Error suspending audio context: ${err}`, 'error'))
        this.postToWorker(WorkerInCmd.SUSPEND)
      }
    }
    this.worker = new Worker(audioWorkerURL, {
      name: 'audio-worker',
      type: 'module'
    })
  }

  isInitialized() {
    return this.initialized
  }

  isRunning() {
    return this.online && this.audioContext?.state === 'running'
  }

  isListening() {
    return this.listening
  }

  isSpeaking() {
    return this.activeSinks.size > 0
  }

  getState() {
    return this.state
  }

  isListeningForWakeWord() {
    return this.wakeWordNode !== null
  }

  /**
   * The loudness of the microphone while listening, or of the reply while speaking, from 0 to 1.
   */
  getLevel() {
    switch (this.state) {
      case 'listening':
        return this.audioSource?.getLevel() ?? 0
      case 'speaking':
        return AudioSink.getLevel()
      default:
        return 0
    }
  }

  /**
   * Works out what the dialog is doing and reports a change. The triggered and thinking states end after a while, for
   * when the server doesn't go on to the next step.
   */
  private updateState() {
    clearTimeout(this.stateTimer)
    const now = Date.now()
    let state: VoiceState = 'idle'
    let endTime = 0
    if (!this.isRunning()) {
      state = 'offline'
    } else if (this.listening) {
      state = 'listening'
    } else if (this.isSpeaking()) {
      state = 'speaking'
    } else if (now < this.listeningEndTime + THINKING_MS) {
      state = 'thinking'
      endTime = this.listeningEndTime + THINKING_MS
    } else if (now < this.spotTime + TRIGGERED_MS) {
      state = 'triggered'
      endTime = this.spotTime + TRIGGERED_MS
    }
    if (endTime) {
      this.stateTimer = setTimeout(() => this.updateState(), endTime - now)
    }
    if (state !== this.state) {
      this.state = state
      this.events.onStateChange?.(this)
    }
  }

  /**
   * Initializes the audio context used for the sink and source.
   */
  private startVoiceAudioContext() {
    if (!this.audioContext) {
      const options: AudioContextOptions = {}
      // setting a custom sample rate only seems to work correctly in Chrome
      // if (customSampleRate) {
      //   options.sampleRate = customSampleRate
      // }
      this.audioContext = new AudioContext(options)

      this.events.onMessage?.(`Created audio context with sample rate ${this.audioContext.sampleRate}`, 'info')
    }
  }

  /**
   * Returns the audio context asserting it's defined.
   *
   * @returns the shared audio context.
   */
  private getVoiceAudioContext() {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized')
    }
    return this.audioContext
  }

  /**
   * Returns the audio context asserting it's initialized.
   *
   * @returns the audio source implementation.
   */
  private getAudioSource() {
    if (!this.audioSource) {
      throw new Error('AudioSource not initialized')
    }
    return this.audioSource
  }

  /**
   * Returns an audio processor node connected to the audio worker, so the audio gets converted and streamed to the server.
   */
  private async getWorkerAudioProcessor() {
    const _webSocketWorkletNode = this.getAudioSource().createWorkletNode()
    await this.sendSourcePort(_webSocketWorkletNode.port)
    return _webSocketWorkletNode
  }

  /**
   * Hands the audio worker the port through which it receives the audio to stream to the server.
   */
  private async sendSourcePort(port: MessagePort) {
    const portPromise = new Promise<void>((resolve) => (this.resolveSourcePort = resolve))
    const command = {
      cmd: WorkerInCmd.SOURCE_PORT,
      port
    }
    this.worker!.postMessage(command, [command.port])
    await portPromise
  }

  private postToWorker(cmd: WorkerInCmd, args: Record<string, any> = {}) {
    try {
      if (this.worker) {
        this.worker.postMessage({ cmd, ...args })
      } else {
        this.events.onMessage?.('Worker not running', 'error')
      }
    } catch (error) {
      this.events.onMessage?.('Unable to post to worker', 'error')
    }
  }

  sendSpot() {
    if (this.online && this.audioSource && !this.audioSource.isSuspended()) {
      this.postToWorker(WorkerInCmd.ON_SPOT)
      this.spotTime = Date.now()
      this.updateState()
    }
  }

  private resetConnection(id: string) {
    this.postToWorker(WorkerInCmd.RESET_CONNECTION, { id })
  }

  private setAuthToken(token: string | null) {
    if (token && this.worker) {
      this.postToWorker(WorkerInCmd.TOKEN_RENEW, { token })
    }
  }

  /**
   * Connect the worker input audio node to the audio context media stream output.
   */
  private async startMicStreaming() {
    if (!this.micStreaming) {
      this.micStreaming = true
      this.events.onMessage?.('Starting microphone audio streaming')
      if (this.wakeWordNode) {
        await this.startWakeWordStream()
        return
      }
      const streamingNode = await this.getWorkerAudioProcessor()
      if (!this.micStreaming) {
        this.events.onMessage?.('Start microphone audio aborted', 'error')
        return
      }
      this.streamingNode = streamingNode
      this.connectSourceNodes().catch((err) => this.events.onMessage?.(`Failed to start microphone streaming: ${err}`, 'error'))
    } else {
      this.events.onMessage?.("trying to start microphone streaming but it's already started!", 'error')
    }
  }

  /**
   * Disconnect the worker input audio node from the audio context media stream output.
   */
  private stopMicStreaming() {
    if (this.micStreaming) {
      this.micStreaming = false
      this.stopWakeWordStream()
      // stop audio node
      this.streamingNode = null
      this.connectSourceNodes().catch((err) => this.events.onMessage?.(`Failed to stop microphone streaming: ${err}`, 'error'))
    } else {
      this.events.onMessage?.("trying to stop microphone streaming but it's already stopped!", 'error')
    }
  }

  /**
   * Handle messages from the websocket.
   *
   * @param command the command name.
   * @param data the command data.
   */
  private handleWorkerMessage(command: WorkerOutCmd, data: WorkerOutMessage) {
    switch (command) {
      case WorkerOutCmd.SOURCE_READY:
        this.resolveSourcePort?.()
        this.resolveSourcePort = undefined
        break
      case WorkerOutCmd.INITIALIZED:
        this.online = true
        this.events.onRunningChange?.(this)
        this.events.onMessage?.('Connected', 'info', 2000)
        break
      case WorkerOutCmd.OFFLINE:
        const accessToken = this.accessTokenGetter()
        if (accessToken) {
          this.setAuthToken(accessToken)
        }
        this.events.onMessage?.('Disconnected, trying to reconnect', 'error', 2000)
        this.resolveSourcePort?.()
        this.resolveSourcePort = undefined
        // stop streaming to the server, the wake word detection stays connected
        this.stopWakeWordStream()
        this.streamingNode = null
        this.connectSourceNodes().catch((err) => this.events.onMessage?.(`Failed to stop microphone streaming: ${err}`, 'error'))
        if (this.listening) {
          this.listening = false
          this.events.onListeningChange?.(this)
          this.updateWakeWordPaused()
        }
        if (this.online) {
          this.online = false
          this.events.onRunningChange?.(this)
        }
        this.spotTime = 0
        this.listeningEndTime = 0
        break
      case WorkerOutCmd.START_SINK: {
        if (!data.id || data.channels === undefined) {
          console.error('Invalid START_SINK message', data)
          break
        }
        const sink = new AudioSink(data.id, data.channels, this.sinkVolume)
        const sinkPortCmd = {
          cmd: WorkerInCmd.SINK_PORT,
          id: sink.getId(),
          port: sink.getMessagePort()
        }
        this.worker!.postMessage(sinkPortCmd, [sinkPortCmd.port])
        this.activeSinks.set(sink.getId(), sink)
        this.listeningEndTime = 0
        this.updateWakeWordPaused()
        const startSpeaking = this.activeSinks.size === 1
        this.events.onMessage?.(`Starting sink stream ${sink.getId()}`)
        sink
          .start()
          .then(() => {
            if (startSpeaking) {
              this.events.onSpeakingChange?.(this)
            }
          })
          .catch((err) => console.error(err))
        break
      }
      case WorkerOutCmd.STOP_SINK: {
        if (!data.id) {
          console.error('Invalid STOP_SINK message', data)
          break
        }
        const activeSink = this.activeSinks.get(data.id)
        if (activeSink) {
          this.events.onMessage?.(`Stopping sink stream ${data.id}`)
          this.activeSinks.delete(data.id)
          activeSink.close()
          if (this.activeSinks.size === 0) {
            this.events.onSpeakingChange?.(this)
            this.updateWakeWordPaused()
          }
        } else {
          this.events.onMessage?.('Unable to stop sink, not found ' + data.id)
        }
        break
      }
      case WorkerOutCmd.START_LISTENING:
        if (!this.online) {
          return
        }
        if (!this.listening) {
          this.listening = true
          this.spotTime = 0
          this.startMicStreaming()
          this.events.onListeningChange?.(this)
          this.updateWakeWordPaused()
        }
        break
      case WorkerOutCmd.STOP_LISTENING:
        if (!this.online) {
          return
        }
        if (this.listening) {
          this.listening = false
          this.listeningEndTime = Date.now()
          this.stopMicStreaming()
          this.events.onListeningChange?.(this)
          this.updateWakeWordPaused()
        }
        break
      case WorkerOutCmd.SINK_VOLUME: {
        const sinkVolume = data.value
        if (sinkVolume === undefined) {
          console.error('Invalid SINK_VOLUME message', data)
          break
        }
        this.events.onMessage?.(`Sink volume: ${sinkVolume}`, 'info', 1000)
        this.sinkVolume = sinkVolume
        this.activeSinks.forEach((sink) => sink.setVolume(this.sinkVolume))
        break
      }
      case WorkerOutCmd.SOURCE_VOLUME: {
        const sourceVolume = data.value
        if (sourceVolume === undefined) {
          console.error('Invalid SOURCE_VOLUME message', data)
          break
        }
        this.events.onMessage?.(`Source volume: ${sourceVolume}`, 'info', 1000)
        this.sourceVolume = sourceVolume
        this.getAudioSource().setVolume(sourceVolume)
        break
      }
      default:
        this.events.onMessage?.(`Unknown worker command ${command}`, 'error')
    }
  }

  /**
   * Handles the speaker configuration message.
   *
   * @param speakerConfig The speaker configuration instructed by the server.
   */
  async updateConfiguration(speakerConfig: SpeakerConfiguration) {
    const audioContext = this.getVoiceAudioContext()
    const resumeAudioContext = async () => audioContext.resume()
    const closeMsg = this.events.onMessage?.('Resuming audio context, click to continue', 'info')
    document.addEventListener('click', resumeAudioContext)
    try {
      await this.getAudioSource().resume()
    } finally {
      document.removeEventListener('click', resumeAudioContext)
    }
    closeMsg?.()
    document.removeEventListener('visibilitychange', this.handleSuspendOnHidden)
    if (speakerConfig.suspendOnHide) {
      document.addEventListener('visibilitychange', this.handleSuspendOnHidden)
    }
    await AudioSink.configure(audioContext, speakerConfig.useAudioElement)
    this.sinkVolume = speakerConfig.sinkVolume ?? this.sinkVolume
    if (speakerConfig.sourceVolume != null) {
      this.sourceVolume = speakerConfig.sourceVolume
      this.audioSource?.setVolume(this.sourceVolume)
    }
    this.events.onMessage?.('Click the widget to trigger the dialog', 'info', 5000)
  }

  private startSourceCheckInterval() {
    this.stopSourceCheckInterval()
    this.sourceCheckIntervalRef = setInterval(
      async () =>
        this.getAudioSource()
          .resume()
          .catch((err) => this.events.onMessage?.(`Unable to resume audio source: ${err}`, 'error')),
      5000
    )
  }

  private stopSourceCheckInterval() {
    if (this.sourceCheckIntervalRef) {
      clearInterval(this.sourceCheckIntervalRef)
      this.sourceCheckIntervalRef = undefined
    }
  }

  /**
   * Initializes the workers instance. Calls while an initialization is in progress return that initialization, as
   * one click can both launch the dialog on the first window event and trigger it. While another window of this
   * browser runs the dialog with the same speaker id, it waits for that window to close.
   *
   * @param speakerId the speaker identifier used by the server.
   * @param listeningItem
   * @param locationItem
   * @param wakeWord the wake word that triggers the dialog, in addition to clicks
   */
  async initialize(speakerId: string, listeningItem?: string, locationItem?: string, wakeWord?: WakeWordConfig) {
    if (!this.initializing) {
      this.initializing = this.start(speakerId, listeningItem, locationItem, wakeWord).catch((error: unknown) => {
        this.releaseSpeaker?.()
        this.initializing = null
        throw error
      })
    }
    return this.initializing
  }

  /**
   * Waits until no other window of this browser uses the speaker id, then keeps it until this window closes. The
   * windows of a browser share the id, and the server takes only one connection per id.
   */
  private async lockSpeaker(speakerId: string) {
    // only on secure origins, which the microphone needs too
    if (!('locks' in navigator)) {
      return
    }
    const name = `openhab.ui:dialog.${speakerId}`
    const { held } = await navigator.locks.query()
    if (held?.some((lock) => lock.name === name)) {
      this.events.onMessage?.('The dialog runs in another window, waiting for it to close', 'info')
    }
    await new Promise<void>((resolve) => {
      void navigator.locks.request(name, async () => {
        resolve()
        await new Promise<void>((release) => (this.releaseSpeaker = release))
      })
    })
  }

  private async start(speakerId: string, listeningItem?: string, locationItem?: string, wakeWord?: WakeWordConfig) {
    this.events.onMessage?.('Starting ws connection...', 'info', 500)
    this.startVoiceAudioContext()
    const audioContext = this.getVoiceAudioContext()
    audioContext.onstatechange = () => {
      this.events.onMessage?.(`Audio context state '${audioContext.state}'`)
      this.events.onRunningChange?.(this)
      this.updateState()
    }
    await audioContext.resume()
    // after the audio context, so it still starts within the click
    await this.lockSpeaker(speakerId)
    await AudioSource.configure(audioContext)
    this.audioSource = new AudioSource(50)
    await this.audioSource.resume()
    this.startSourceCheckInterval()
    // TODO: Allow to configure options
    await this.updateConfiguration({
      suspendOnHide: false,
      useAudioElement: true,
      sourceVolume: 100,
      sinkVolume: 100
    })
    try {
      this.worker!.onmessage = (ev: MessageEvent) => {
        this.handleWorkerMessage(ev.data.cmd, ev.data)
        this.updateState()
      }
      this.worker!.onerror = (err: ErrorEvent) => {
        this.events.onMessage?.('Worker error.' + err.message)
      }
      this.worker!.postMessage({
        cmd: WorkerInCmd.INITIALIZE,
        id: speakerId,
        token: this.accessTokenGetter?.() ?? null,
        sampleRate: this.getVoiceAudioContext().sampleRate,
        listeningItem,
        locationItem,
        ohUrl: this.ohUrl
      })
    } catch (error) {
      this.events.onMessage?.('Unable to start WebWorker, try reloading the page', 'error', 2000)
      throw error
    }
    this.initialized = true
    if (wakeWord) {
      this.startWakeWord(wakeWord)
    }
  }

  /**
   * Connects the processors that need the microphone: the stream to the server while listening, and the wake word
   * detection.
   */
  private async connectSourceNodes() {
    const nodes = [this.streamingNode, this.wakeWordNode].filter((node): node is AudioWorkletNode => node !== null)
    if (nodes.length) {
      await this.getAudioSource().start(...nodes)
    } else {
      this.audioSource?.stop()
    }
  }

  /**
   * Starts a worker that listens for the wake word in the microphone audio and triggers the dialog when it hears it.
   */
  private startWakeWord(config: WakeWordConfig) {
    const worker = new Worker(wakeWordWorkerURL, {
      name: 'wakeword-worker',
      type: 'module'
    })
    // the worklet is connected once the worker has loaded the model
    const node = this.getAudioSource().createWorkletNode()
    worker.onmessage = (ev: MessageEvent<WakeWordWorkerOutMessage>) => this.handleWakeWordMessage(ev.data, node)
    worker.onerror = (err: ErrorEvent) => this.events.onMessage?.(`Wake word worker error: ${err.message}`, 'error')
    const command: WakeWordWorkerInMessage = {
      cmd: WakeWordWorkerInCmd.INITIALIZE,
      // the worker resolves URLs against its own location, so make the URL absolute
      manifestUrl: new URL(config.manifestUrl, document.baseURI).href,
      probabilityCutoff: config.probabilityCutoff,
      sampleRate: this.getVoiceAudioContext().sampleRate,
      port: node.port
    }
    worker.postMessage(command, [command.port])
    this.wakeWordWorker = worker
  }

  private handleWakeWordMessage(data: WakeWordWorkerOutMessage, node: AudioWorkletNode) {
    switch (data.cmd) {
      case WakeWordWorkerOutCmd.READY:
        this.wakeWordNode = node
        this.connectSourceNodes().catch((err) => this.events.onMessage?.(`Failed to start wake word detection: ${err}`, 'error'))
        this.updateWakeWordPaused(true)
        this.events.onMessage?.(`Listening for the wake word "${data.wakeWord}"`, 'info', 2000)
        this.events.onStateChange?.(this)
        break
      case WakeWordWorkerOutCmd.DETECTED: {
        const now = Date.now()
        if (this.online && !this.listening && !this.isSpeaking() && now - this.lastWakeWordSpot > WAKE_WORD_COOLDOWN_MS) {
          this.lastWakeWordSpot = now
          this.events.onMessage?.('Wake word detected', 'info', 1000)
          this.sendSpot()
        }
        break
      }
      case WakeWordWorkerOutCmd.ERROR:
        this.events.onMessage?.(`Wake word detection unavailable: ${data.message}`, 'error')
        this.stopWakeWord()
        break
    }
  }

  /**
   * Pauses the wake word detection while the dialog listens or speaks, so the reply doesn't trigger it.
   *
   * @param force send the state to the worker even when it didn't change
   */
  private updateWakeWordPaused(force: boolean = false) {
    const paused = this.listening || this.isSpeaking()
    if (this.wakeWordWorker && (force || paused !== this.wakeWordPaused)) {
      this.wakeWordWorker.postMessage({ cmd: paused ? WakeWordWorkerInCmd.PAUSE : WakeWordWorkerInCmd.RESUME })
    }
    this.wakeWordPaused = paused
  }

  /**
   * Streams the microphone to the server through the wake word worker. After a wake word spot it first sends the audio
   * since the end of the wake word, so a command spoken without a pause isn't lost while the server starts listening.
   */
  private async startWakeWordStream() {
    const channel = new MessageChannel()
    await this.sendSourcePort(channel.port1)
    if (!this.micStreaming || !this.wakeWordWorker) {
      this.events.onMessage?.('Start microphone audio aborted', 'error')
      channel.port2.close()
      return
    }
    const command: WakeWordWorkerInMessage = {
      cmd: WakeWordWorkerInCmd.STREAM,
      port: channel.port2,
      fromWakeWord: Date.now() - this.lastWakeWordSpot < WAKE_WORD_AUDIO_MS
    }
    this.wakeWordWorker.postMessage(command, [command.port])
    this.streamingViaWakeWord = true
  }

  private stopWakeWordStream() {
    if (this.streamingViaWakeWord) {
      this.streamingViaWakeWord = false
      this.wakeWordWorker?.postMessage({ cmd: WakeWordWorkerInCmd.STOP_STREAM })
    }
  }

  private stopWakeWord() {
    this.streamingViaWakeWord = false
    this.wakeWordWorker?.terminate()
    this.wakeWordWorker = null
    if (this.wakeWordNode) {
      this.wakeWordNode = null
      this.connectSourceNodes().catch((err) => this.events.onMessage?.(`Failed to stop wake word detection: ${err}`, 'error'))
      this.events.onStateChange?.(this)
    }
  }

  close() {
    clearTimeout(this.stateTimer)
    this.stopSourceCheckInterval()
    this.stopWakeWord()
    this.stopMicStreaming()
    this.worker!.terminate()
    this.worker = null
    this.releaseSpeaker?.()
  }
}
