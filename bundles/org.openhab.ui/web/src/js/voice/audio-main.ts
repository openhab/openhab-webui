import audioWorkerURL from './audio-worker?worker&url'
import { AudioSink } from './audio/audio-sink.ts'
import { AudioSource } from './audio/audio-source.ts'
import { WorkerInCmd, WorkerOutCmd, type WorkerOutMessage } from './types.ts'

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

export interface AudioMainEvents {
  onMessage?: (message: string, level?: 'info' | 'error', duration?: number) => (() => void) | void
  onRunningChange: (instance: AudioMain) => void
  onSpeakingChange: (instance: AudioMain) => void
  onListeningChange: (instance: AudioMain) => void
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
  private online: boolean = false
  // voice audio context
  private audioContext: AudioContext | null = null
  // audio source
  private audioSource: AudioSource | null = null
  private sourceVolume: number = 50
  private micStreaming: boolean = false
  private listening: boolean = false
  // audio sink
  private readonly activeSinks: Map<string, AudioSink> = new Map()
  private sinkVolume: number = 50

  private readonly handleSuspendOnHidden: () => void
  private resolveSourcePort?: () => void
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
    const portPromise = new Promise<void>((resolve) => (this.resolveSourcePort = resolve))
    const command = {
      cmd: WorkerInCmd.SOURCE_PORT,
      port: _webSocketWorkletNode.port
    }
    this.worker!.postMessage(command, [command.port])
    await portPromise
    return _webSocketWorkletNode
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
      const processors = [await this.getWorkerAudioProcessor()]
      if (!this.micStreaming) {
        this.events.onMessage?.('Start microphone audio aborted', 'error')
        return
      }
      this.getAudioSource()
        .start(...processors)
        .catch((err) => this.events.onMessage?.(`Failed to start microphone streaming: ${err}`, 'error'))
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
      // stop audio node
      this.audioSource?.stop()
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
        this.audioSource?.stop()
        if (this.listening) {
          this.listening = false
          this.events.onListeningChange?.(this)
        }
        if (this.online) {
          this.online = false
          this.events.onRunningChange?.(this)
        }
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
          this.startMicStreaming()
          this.events.onListeningChange?.(this)
        }
        break
      case WorkerOutCmd.STOP_LISTENING:
        if (!this.online) {
          return
        }
        if (this.listening) {
          this.listening = false
          this.stopMicStreaming()
          this.events.onListeningChange?.(this)
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
    const resumeAudioContext = () => audioContext.resume()
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
      () =>
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
   * Initializes the workers instance.
   *
   * @param speakerId the speaker identifier used by the server.
   * @param listeningItem
   * @param locationItem
   */
  async initialize(speakerId: string, listeningItem?: string, locationItem?: string) {
    this.events.onMessage?.('Starting ws connection...', 'info', 500)
    this.startVoiceAudioContext()
    const audioContext = this.getVoiceAudioContext()
    audioContext.onstatechange = () => {
      this.events.onMessage?.(`Audio context state '${audioContext.state}'`)
      this.events.onRunningChange?.(this)
    }
    await audioContext.resume()
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
  }

  close() {
    this.stopSourceCheckInterval()
    this.stopMicStreaming()
    this.worker!.terminate()
    this.worker = null
  }
}
