import { AudioSink } from './audio/audio-sink'
import { AudioSource } from './audio/audio-source'
import { WorkerInCmd, WorkerOutCmd } from './audio-types'

export class AudioMain {
  constructor (ohUrl, accessTokenGetter = null, events = {}) {
    this.ohUrl = ohUrl
    this.events = events
    this.online = false
    this.accessTokenGetter = accessTokenGetter
    // voice audio context
    this.audioContext = null
    /// audio source
    this.audioSource = null
    this.sourceVolume = 50
    this.micStreaming = false
    this.listening = false
    ///
    /// audio sink
    this.activeSinks = new Map()
    this.sinkVolume = 50
    ///
    this.handleSuspendOnHidden = () => {
      if (!document.hidden) {
        this.getVoiceAudioContext()
          .resume()
          .catch((err) => this.events.onMessage?.('Error resuming audio context', err))
        this.startSourceCheckInterval()
        this.postToWorker(WorkerInCmd.RESUME)
      } else {
        this.stopSourceCheckInterval()
        this.getVoiceAudioContext()
          .suspend()
          .catch((err) => this.events.onMessage?.('Error suspending audio context', err))
        this.postToWorker(WorkerInCmd.SUSPEND)
      }
    }
    this.worker = new Worker(new URL('./audio-worker.js', import.meta.url), {
      name: 'websocket-audio-worker',
      type: 'module'
    })
  }

  isRunning () {
    return this.online && this.audioContext?.state === 'running'
  }

  isListening () {
    return this.listening
  }

  isSpeaking () {
    return this.activeSinks.size > 0
  }

  /**
   * Initializes the audio context used for the sink and source.
   */
  startVoiceAudioContext () {
    if (!this.audioContext) {
      const options = {}
      // setting a custom sample rate only seems to work correctly in Chrome
      // if (customSampleRate) {
      //   options.sampleRate = customSampleRate
      // }
      this.audioContext = new AudioContext(options)

      this.events.onMessage?.(
        `Created audio context with sample rate ${this.audioContext.sampleRate}`,
        'error'
      )
    }
  }

  /**
   * Returns the audio context asserting it's defined.
   *
   * @returns the shared audio context.
   */
  getVoiceAudioContext () {
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
  getAudioSource () {
    if (!this.audioSource) {
      throw new Error('AudioSource not initialized')
    }
    return this.audioSource
  }

  /**
   * Returns an audio processor node connected to the audio worker, so the audio gets converted and streamed to the server.
   */
  async getWorkerAudioProcessor () {
    const audioContext = this.getVoiceAudioContext()
    const _webSocketWorkletNode = new AudioWorkletNode(
      audioContext,
      'websocket-source-worklet',
      {
        numberOfInputs: 1,
        numberOfOutputs: 0,
        channelCount: 1,
        channelCountMode: 'explicit'
      }
    )
    const portPromise = new Promise(
      (resolve) => (this.resolveSourcePort = resolve)
    )
    const command = {
      cmd: WorkerInCmd.SOURCE_PORT,
      port: _webSocketWorkletNode.port
    }
    this.worker.postMessage(command, [command.port])
    await portPromise
    return _webSocketWorkletNode
  }

  postToWorker (cmd, args = {}) {
    try {
      if (this.worker) {
        this.worker.postMessage({ cmd, ...args })
      } else {
        this.events.onMessage?.(
          'Worker not running',
          'error'
        )
      }
    } catch (error) {
      this.events.onMessage?.(
        'Unable to post to worker',
        'error'
      )
    }
  }

  sendSpot () {
    if (this.online && this.audioSource && !this.audioSource.isSuspended()) {
      this.postToWorker(WorkerInCmd.ON_SPOT)
    }
  }

  resetConnection (id) {
    this.postToWorker(WorkerInCmd.RESET_CONNECTION, { id })
  }

  setAuthToken (token) {
    if (token && this.worker) {
      this.postToWorker(WorkerInCmd.TOKEN_RENEW, { token })
    }
  }

  /**
   * Connect the worker input audio node to the audio context media stream output,
   * it keeps the keyword spotter input audio node connected if exists.
   */
  async startMicStreaming () {
    if (!this.micStreaming) {
      this.micStreaming = true
      this.events.onMessage?.(
        'Starting microphone audio streaming'
      )
      const processors = [await this.getWorkerAudioProcessor()]
      if (!this.micStreaming) {
        this.events.onMessage?.(
          'Start microphone audio aborted',
          'error'
        )
        return
      }
      this.getAudioSource()
        .start(...processors)
        .catch((err) => this.events.onMessage?.(err))
    } else {
      this.events.onMessage?.(
        'trying to start microphone streaming but it\'s already started!',
        'error'
      )
    }
  }

  /**
   * Disconnect the worker input audio node from the audio context media stream output,
   * it keeps the keyword spotter input audio node connected if exists.
   */
  stopMicStreaming () {
    if (this.micStreaming) {
      this.micStreaming = false
      // stop audio node
      this.audioSource?.stop()
    } else {
      this.events.onMessage?.(
        'trying to stop microphone streaming but it\'s already stopped!',
        'error'
      )
    }
  }

  /**
   * Clean up function, tries to dispose worker and keyword spotter input audio nodes.
   */
  async killMicProcessors () {
    this.audioSource?.stop()
  }

  /**
   * Handle messages from the websocket.
   *
   * @param command the command name.
   * @param data the command data.
   */
  handleWorkerMessage (command, data) {
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
        this.events.onMessage?.(
          'Disconnected, trying to reconnect',
          'error',
          2000
        )
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
        const startSinkCmd = data
        const sink = new AudioSink(
          startSinkCmd.id,
          startSinkCmd.channels,
          this.sinkVolume
        )
        const sinkPortCmd = {
          cmd: WorkerInCmd.SINK_PORT,
          id: sink.getId(),
          port: sink.getMessagePort()
        }
        this.worker.postMessage(sinkPortCmd, [sinkPortCmd.port])
        this.activeSinks.set(sink.getId(), sink)
        const startSpeaking = this.activeSinks.size === 1
        this.events.onMessage?.(
          `Starting sink stream ${sink.getId()}`
        )
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
        const stopSinkCmd = data
        const activeSink = this.activeSinks.get(stopSinkCmd.id)
        if (activeSink) {
          this.events.onMessage?.(`Stoping sink stream ${stopSinkCmd.id}`)
          this.activeSinks.delete(stopSinkCmd.id)
          activeSink.close()
          if (this.activeSinks.size === 0) {
            this.events.onSpeakingChange?.(this)
          }
        } else {
          this.events.onMessage?.('Unable to stop sink, not found ' + stopSinkCmd.id)
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
        const { value: sinkVolume } = data
        this.events.onMessage?.(`Sink volume: ${sinkVolume}`, 'info', 1000)
        this.sinkVolume = sinkVolume
        this.activeSinks.forEach((sink) => sink.setVolume(this.sinkVolume))
        break
      }
      case WorkerOutCmd.SOURCE_VOLUME: {
        const { value: sourceVolume } = data
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
  async updateConfiguration (speakerConfig) {
    const audioContext = this.getVoiceAudioContext()
    const resumeAudioContext = () => audioContext.resume()
    const closeMsg = this.events.onMessage?.(
      'Resuming audio context, click to continue',
      'info'
    )
    document.addEventListener('click', resumeAudioContext)
    await this.getAudioSource().resume()
    document.removeEventListener('click', resumeAudioContext)
    closeMsg?.()
    document.removeEventListener('visibilitychange', this.handleSuspendOnHidden)
    if (speakerConfig.suspendOnHide) {
      document.addEventListener('visibilitychange', this.handleSuspendOnHidden)
    }
    await AudioSink.configure(audioContext, speakerConfig.useAudioElement)
    this.sinkVolume = speakerConfig.sinkVolume ?? this.sinkVolume
    this.events.onMessage?.(
      'No keyword spotter, click the widget to trigger the dialog',
      'info',
      5000
    )
  }

  startSourceCheckInterval () {
    this.stopSourceCheckInterval()
    this.sourceCheckIntervalRef = setInterval(
      () =>

        this.getAudioSource()
          .resume()
          .catch((err) => this.events.onMessage?.('Unable to resume audio source', err)),
      5000
    )
  }

  stopSourceCheckInterval () {
    if (this.sourceCheckIntervalRef) {
      clearInterval(this.sourceCheckIntervalRef)
      this.sourceCheckIntervalRef = undefined
    }
  }

  /**
   * Initializes the workers instance.
   *
   * @param speakerId the speaker identifier used by the server.
   * @param customSampleRate Custom sample rate for the audio context, non functional in some browsers.
   */
  async initialize (speakerId, listeningItem, locationItem) {
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
    // TODO: allow configure options
    await this.updateConfiguration({
      suspendOnHide: false,
      useAudioElement: true,
      sourceVolume: 100,
      sinkVolume: 100
    })
    try {
      this.worker.onmessage = (ev) => {
        this.handleWorkerMessage(ev.data.cmd, ev.data)
      }
      this.worker.onerror = (err) => {
        this.events.onMessage?.('Worker error.' + err.message)
      }
      this.worker.postMessage({
        cmd: WorkerInCmd.INITIALIZE,
        id: speakerId,
        token: this.accessTokenGetter?.() ?? null,
        sampleRate: this.getVoiceAudioContext().sampleRate,
        listeningItem,
        locationItem,
        ohUrl: this.ohUrl
      })
    } catch (error) {
      this.events.onMessage?.(
        'Unable to start WebWorker, try reloading the page',
        'error',
        2000
      )
      throw error
    }
  }

  close () {
    this.worker.terminate()
    this.worker = null
  }
}
