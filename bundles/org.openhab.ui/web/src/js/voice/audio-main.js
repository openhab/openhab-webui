import { ReentrantLock } from 'reentrant-lock'
import { AudioSink } from './audio/audio-sink'
import { AudioSource } from './audio/audio-source'
import { WorkerInCmd, WorkerOutCmd } from './audio-types'
import { RustpotterService, ScoreMode, VADMode } from 'rustpotter-worklet'
import { wakewordStorage } from './wakeword-storage'

export class AudioMain {
  constructor (ohUrl, events = {}) {
    this.ohUrl = ohUrl
    this.events = events
    this.online = false
    this.accessToken = null
    // voice audio context
    this.audioContext = null
    /// audio source
    this.audioSource = null
    this.speakerStateLock = new ReentrantLock()
    this.sourceVolume = 50
    this.micStreaming = false
    this.listening = false
    ///
    /// audio sink
    this.activeSinks = new Map()
    this.sinkVolume = 50
    ///
    /// keyword spotting
    this.serverSpotting = false
    this.rustpotter = null
    this.currentWakeword = null
    this.rustpotterAudioNode = null
    ///
    this.handleSuspendOnHidden = () => {
      if (!document.hidden) {
        this.speakerStateLock.lock(async () => {
          await this.getVoiceAudioContext()
            .resume()
            .catch(err => console.error('Error resuming audio context', err))
          this.startSourceCheckInterval()
          this.postToWorker(WorkerInCmd.RESUME)
        })
      } else {
        this.speakerStateLock.lock(async () => {
          this.stopSourceCheckInterval()
          await this.getVoiceAudioContext()
            .suspend()
            .catch(err => console.error('Error suspending audio context', err))
          this.postToWorker(WorkerInCmd.SUSPEND)
        })
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
      console.debug(
        `main: Created audio context with sample rate ${this.audioContext.sampleRate}`
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
      resolve => (this.resolveSourcePort = resolve)
    )
    const command = {
      cmd: WorkerInCmd.SOURCE_PORT,
      port: _webSocketWorkletNode.port
    }
    this.worker.postMessage(command, [command.port])
    await portPromise
    return _webSocketWorkletNode
  }

  async setupRustpotter (wakeword, options) {
    if (!this.rustpotter) {
      console.debug('main: starting rustpotter')
      const sampleRate = this.getVoiceAudioContext().sampleRate

      const wasmModuleUrl = new URL('../../../node_modules/rustpotter-worklet/dist/rustpotter_wasm_bg.wasm', import.meta.url)
      const workletModuleUrl = new URL('../../../node_modules/rustpotter-worklet/dist/rustpotter-worklet.js', import.meta.url)
      const workerModuleUrl = new URL('../../../node_modules/rustpotter-worklet/dist/rustpotter-worker.js', import.meta.url)
      const rustpotterOptions = this.getRustpotterConfig(options)
      console.log(rustpotterOptions)
      this.rustpotter = await RustpotterService.new(
        sampleRate,
        {
          workletPath: workletModuleUrl.href,
          workerPath: workerModuleUrl.href,
          wasmPath: wasmModuleUrl.href
        },
        rustpotterOptions
      )
      this.rustpotter.onDetection(detection => {
        console.debug('main: wakeword detected', detection)
        this.sendSpot()
      })
    } else {
      console.debug('main: rustpotter already started, updating config')
      await this.rustpotter.updateConfig(this.getRustpotterConfig(options))
    }
    if (wakeword !== this.currentWakeword) {
      console.debug(
        `main: adding rustpotter wakeword '${wakeword.name}'`
      )
      const headers = {}
      if (this.accessToken?.length) {
        headers['Authorization'] = `Bearer ${this.accessToken}`
      }
      await this.rustpotter.removeWakeword('w')
      await this.rustpotter.addWakeword(
        'w',
        await wakeword.arrayBuffer()
      )
      this.currentWakeword = wakeword
    } else {
      console.debug('main: rustpotter wakeword already loaded')
    }
    return this.rustpotter
  }

  async teardownRustpotter () {
    if (this.rustpotter) {
      console.debug('main: teardown rustpotter service')
      await this.rustpotter.close()
      this.rustpotter = null
      this.currentWakeword = null
    }
  }

  postToWorker (cmd, args = {}) {
    try {
      if (this.worker) {
        this.worker.postMessage({ cmd, ...args })
      } else {
        console.warn('main: Worker not running')
      }
    } catch (error) {
      console.error('main: Unable to post to worker', error)
    }
  }

  sendSpot () {
    if (this.online && this.audioSource && !this.audioSource.isSuspended()) {
      console.info('main: sending spot event')
      this.postToWorker(WorkerInCmd.ON_SPOT)
    }
  }

  resetConnection (id) {
    this.postToWorker(WorkerInCmd.RESET_CONNECTION, { id })
  }

  setAuthToken (token) {
    this.accessToken = token
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
      console.debug('starting microphone audio streaming')
      const processors = [await this.getWorkerAudioProcessor()]
      if (!this.micStreaming) {
        console.warn('main: start microphone audio aborted')
        return
      }
      if (this.rustpotterAudioNode) {
        processors.unshift(this.rustpotterAudioNode)
      }
      this.getAudioSource()
        .start(...processors)
        .catch(err => console.error(err))
    } else {
      console.warn(
        'main: trying to start microphone streaming but it\'s already started!'
      )
    }
  }

  /**
   * Disconnect the worker input audio node from the audio context media stream output,
   * it keeps the keyword spotter input audio node connected if exists.
   */
  stopMicStreaming () {
    if (this.micStreaming) {
      console.debug('stopping microphone audio streaming')
      this.micStreaming = false
      if (this.rustpotterAudioNode) {
        // keep keyword spotting node connected
        this.audioSource
          ?.start(this.rustpotterAudioNode)
          .catch(err => console.error(err))
      } else {
        // stop audio node
        this.audioSource?.stop()
      }
    } else {
      console.warn(
        'main: trying to stop microphone streaming but it\'s already stopped!'
      )
    }
  }

  /**
   * Clean up function, tries to dispose worker and keyword spotter input audio nodes.
   */
  async killMicProcessors () {
    this.audioSource?.stop()
    if (this.rustpotterAudioNode) {
      this.rustpotterAudioNode = null
      await this.rustpotter?.disposeProcessorNode()
    }
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
        this.events.onMessage?.('Speaker connected', 'info', 2000)
        if (this.serverSpotting) {
          console.debug('remote spot enabled, starting mic streaming')
          this.startMicStreaming()
        }
        break
      case WorkerOutCmd.OFFLINE:
        this.events.onMessage?.(
          'Speaker disconnected, trying to reconnect',
          'error',
          2000
        )
        this.serverSpotting = false
        this.resolveSourcePort?.()
        this.resolveSourcePort = undefined
        this.killMicProcessors()
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
        console.debug(`main: starting sink ${sink.getId()}`)
        sink
          .start()
          .then(() => {
            if (startSpeaking) {
              this.events.onSpeakingChange?.(this)
            }
          })
          .catch(err => console.error(err))
        break
      }
      case WorkerOutCmd.STOP_SINK: {
        const stopSinkCmd = data
        const activeSink = this.activeSinks.get(stopSinkCmd.id)
        if (activeSink) {
          console.debug(`main: stopping sink ${stopSinkCmd.id}`)
          this.activeSinks.delete(stopSinkCmd.id)
          activeSink.close()
          if (this.activeSinks.size === 0) {
            this.events.onSpeakingChange?.(this)
          }
        } else {
          console.error('main: unable to stop sink, not found ', stopSinkCmd.id)
        }
        break
      }
      case WorkerOutCmd.START_LISTENING:
        if (!this.online) {
          console.debug('main: ignoring start listening message before init')
          return
        }
        if (!this.listening) {
          this.listening = true
          this.events.onListeningChange?.(this)
        }
        if (!this.serverSpotting) {
          this.startMicStreaming()
        }
        break
      case WorkerOutCmd.STOP_LISTENING:
        if (!this.online) {
          console.debug('main: ignoring stop listening message before init')
          return
        }
        if (this.listening) {
          this.listening = false
          this.events.onListeningChange?.(this)
        }
        if (!this.serverSpotting) {
          this.stopMicStreaming()
        }
        break
      case WorkerOutCmd.SINK_VOLUME: {
        const { value: sinkVolume } = data
        this.events.onMessage?.(`Sink volume: ${sinkVolume}`, 'info', 1000)
        this.sinkVolume = sinkVolume
        this.activeSinks.forEach(sink => sink.setVolume(this.sinkVolume))
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
        console.error(`main: Unknown worker command ${command}`)
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
    // this.getAudioSource().setVolume(
    //   speakerConfig.sourceVolume ?? this.sourceVolume
    // )
    this.sinkVolume = speakerConfig.sinkVolume ?? this.sinkVolume
    this.serverSpotting = false
    console.debug(`main: configured spot mode ${speakerConfig.spotMode}`)
    switch (speakerConfig.spotMode?.toLocaleLowerCase()) {
      case 'rustpotter_web':
        if (speakerConfig.spotConfig?.wakeword) {
          this.events.onMessage?.(
            'Running keyword spotting locally',
            'info',
            5000
          )
          try {
            const rustpotter = await this.setupRustpotter(
              speakerConfig.spotConfig.wakeword,
              speakerConfig.spotConfig
            )
            console.debug('main: creating rustpotter audio worklet')
            this.rustpotterAudioNode = await rustpotter.getProcessorNode(
              this.getVoiceAudioContext()
            )
            console.debug('main: connecting rustpotter audio worklet')
            await this.getAudioSource().start(this.rustpotterAudioNode)
          } catch (error) {
            console.error('Unable to start local ks processor', error)
            this.events.onMessage?.(
              'Error starting local keyword spotter',
              'info',
              5000
            )
          }
        } else {
          console.warn('main: Missed spotConfig configuration')
          this.events.onMessage?.(
            'Error starting local keyword spotter',
            'error',
            5000
          )
        }
        break
      case 'none':
      default:
        this.events.onMessage?.(
          'No keyword spotter, click the widget to trigger the dialog',
          'info',
          5000
        )
        await this.teardownRustpotter()
        break
    }
  }

  /**
   * Parse the speaker rustpotter options into a valid rustpotter config.
   *
   * @param options speaker options for rustpotter local execution.
   * @returns a correct rustpotter config.
   */
  getRustpotterConfig (options) {
    const scoreMode = ScoreMode[options.scoreMode] ?? ScoreMode.max
    const vadMode = options.vadMode?.length
      ? VADMode[options.vadMode]
      : undefined
    return {
      averagedThreshold: options.avgThreshold ?? 0,
      threshold: options.threshold ?? 0.5,
      minScores: options.minScores ?? 5,
      eager: options.eager ?? true,
      minGain: options.minGain,
      maxGain: options.maxGain,
      bandPassEnabled: options.bandPass ?? false,
      bandPassLowCutoff: options.lowCutoff,
      bandPassHighCutoff: options.highCutoff,
      bandSize: options.bandSize ?? 10,
      scoreRef: options.scoreRef ?? 0.22,
      gainNormalizerEnabled: options.gainNormalizer ?? false,
      gainRef: options.gainRef,
      scoreMode,
      vadMode
    }
  }

  startSourceCheckInterval () {
    this.stopSourceCheckInterval()
    this.sourceCheckIntervalRef = setInterval(
      () =>
        this.getAudioSource()
          .resume()
          .catch(err => console.error('Unable to resume audio source', err)),
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
  async initialize (speakerId, listeningItem, locationItem, ksOptions) {
    this.events.onMessage?.('Connecting speaker...', 'info', 500)
    this.startVoiceAudioContext()
    const audioContext = this.getVoiceAudioContext()
    audioContext.onstatechange = () => {
      console.debug(`main: Audio context state '${audioContext.state}'`)
      this.events.onRunningChange?.(this)
    }
    await audioContext.resume()
    await AudioSource.configure(audioContext)
    this.audioSource = new AudioSource(50)
    await this.audioSource.resume()
    this.startSourceCheckInterval()
    // TODO: allow configure options
    await this.updateConfiguration({
      spotMode: 'rustpotter_web',
      spotConfig: {
        wakeword: await wakewordStorage.getFile(),
        threshold: ksOptions.threshold,
        minScores: ksOptions.minScores
      },
      suspendOnHide: false,
      useAudioElement: true,
      sourceVolume: 100,
      sinkVolume: 100
    })
    try {
      this.worker.onmessage = ev => {
        this.handleWorkerMessage(ev.data.cmd, ev.data)
      }
      this.worker.onerror = err => {
        console.error('audio-main: Worker error.', err)
      }
      this.worker.postMessage({
        cmd: WorkerInCmd.INITIALIZE,
        id: speakerId,
        token: this.accessToken,
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
