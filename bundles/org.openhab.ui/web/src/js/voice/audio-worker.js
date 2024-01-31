/// <reference lib="webworker" />

import {
  SINK_TERMINATION_BYTE,
  WebSocketInCmd,
  WebSocketOutCmd,
  WorkerInCmd,
  WorkerOutCmd,
  StreamSampleSate,
  StreamBitDepth,
  StreamChannels
} from './audio-types'
import { createResampler } from './audio/resampler'
import { CircularBufferExecutor } from './audio/circular-buffer'
import { ReentrantLock } from 'reentrant-lock'

/** WebSocket reconnection timeout */
const RECONNECT_MS = 5000

/**
 * Handles the websocket connection and the required audio format conversions.
 */
export default class AudioWorker {
  constructor (postMessage) {
    this.postMessage = postMessage
    /** Speaker id */
    this.id = ''
    /** Listening Item */
    this.listeningItem = ''
    /** Location Item */
    this.locationItem = ''
    /** Speaker id */
    this.id = ''
    /** OpenHAB token */
    this.token = ''
    /** Sample rate of the audio context sample rate */
    this.sampleRate = 0
    /** Sample rate of the audio send between openHAB and the UI */
    this.streamSampleRate = 16000
    /** Stores each sink context by its id */
    this.sinkContextStorage = new Map()
    /** Lock used to ensure sink data chunks are processed in order */
    this.sinkLock = new ReentrantLock()
    /** Lock used to ensure source data chunks are processed in order */
    this.sourceLock = new ReentrantLock()
    /** Defines the resampler implementation to use */
    this.resamplerMode = 'linear'
    /** Holds the openHAB server url */
    this.ohUrl = ''
    /** Waiting for main configuration confirmation */
    this.configuring = false
    /** Enables auto reconnection */
    this.reconnect = false
  }

  /**
   * Sends a {@link WorkerOutCmd} to the main thread
   */
  postToMainThread (cmd, args) {
    this.postMessage({ cmd, ...(args ?? {}) })
  }

  /**
   *
   * Send a {@link WebSocketInCmd} to the openHAB server
   */
  postToWebSocket (cmd, args) {
    if (this.socket && this.socket.readyState === this.socket.OPEN) {
      this.socket.send(JSON.stringify({ cmd, args }))
    } else {
      console.error('post cmd ' + cmd + ': WebSocket is not connected')
    }
  }

  /**
   * Handles the {@link WorkerInCmd} received from the main thread
   */
  async onMainThreadCommand (ev) {
    try {
      if (ev.origin !== '' || typeof ev.data !== 'object') {
        return
      }
      const command = ev.data?.cmd
      switch (command) {
        case WorkerInCmd.INITIALIZE: {
          const initData = ev.data
          this.id = initData.id
          this.sampleRate = initData.sampleRate
          this.locationItem = initData.locationItem
          this.listeningItem = initData.listeningItem
          this.token = initData.token ?? ''
          this.ohUrl = initData.ohUrl
            .replace('https:', 'wss:')
            .replace('http:', 'ws:')
          this.reconnect = true
          this.connectWebSocket()
          break
        }
        case WorkerInCmd.RESUME:
          this.reconnect = true
          this.connectWebSocket()
          break
        case WorkerInCmd.SUSPEND:
          this.reconnect = false
          if (this.reconnectTimeoutRef) {
            clearTimeout(this.reconnectTimeoutRef)
            this.reconnectTimeoutRef = undefined
          }
          this.disconnectWebSocket()
          break
        case WorkerInCmd.SOURCE_PORT: {
          const listenData = ev.data
          this.sourcePort?.close()
          this.sourcePort = listenData.port
          this.sourcePort.onmessage = ev =>
            this.handleSourceAudioBuffer(ev.data)
          this.sourcePort.start()
          this.postToMainThread(WorkerOutCmd.SOURCE_READY)
          break
        }
        case WorkerInCmd.SINK_PORT: {
          const speakPortData = ev.data
          const sinkContext = this.sinkContextStorage.get(speakPortData.id)
          if (sinkContext) {
            const sinkPort = (sinkContext.port = speakPortData.port)
            sinkPort.onmessage = ev => {
              if (ev.data === false) {
                // clean up sink context
                console.debug('cleaning up sink ', speakPortData.id)
                this.sinkContextStorage.delete(speakPortData.id)
                sinkContext.resampler.close()
                sinkPort.close()
                this.postToMainThread(WorkerOutCmd.STOP_SINK, {
                  id: speakPortData.id
                })
              }
            }
            sinkPort.start()
            if (sinkContext.buffersCache.length) {
              sinkPort.postMessage(sinkContext.buffersCache)
            }
            if (sinkContext.streamEnded) {
              // notify streamCompletion
              sinkPort.postMessage(false)
            }
          } else {
            console.error('Unable to handle sink port, missing sink context')
          }
          break
        }
        case WorkerInCmd.ON_SPOT:
          this.postToWebSocket(WebSocketInCmd.ON_SPOT)
          break
        case WorkerInCmd.TOKEN_RENEW: {
          const { token } = ev.data
          this.token = token
          break
        }
        case WorkerInCmd.RESET_CONNECTION: {
          const { id } = ev.data
          this.id = id
          this.disconnectWebSocket()
          break
        }
        default:
          throw new Error('Unknown command: ' + command)
      }
    } catch (error) {
      console.error('Error handling command in worker: ', error)
    }
  }

  /**
   * Handles the {@link WebSocketOutCmd} received from OpenHAB
   */
  onWebSocketCommand (data) {
    try {
      const command = data.cmd
      switch (command) {
        case WebSocketOutCmd.INITIALIZED:
          this.postToMainThread(WorkerOutCmd.INITIALIZED)
          break
        case WebSocketOutCmd.START_LISTENING:
          this.postToMainThread(WorkerOutCmd.START_LISTENING)
          break
        case WebSocketOutCmd.STOP_LISTENING:
          this.postToMainThread(WorkerOutCmd.STOP_LISTENING)
          break
        case WebSocketOutCmd.SINK_VOLUME: {
          const sinkVolumeData = data
          this.postToMainThread(WorkerOutCmd.SINK_VOLUME, sinkVolumeData)
          break
        }
        case WebSocketOutCmd.SOURCE_VOLUME: {
          const sourceVolumeData = data
          this.postToMainThread(WorkerOutCmd.SOURCE_VOLUME, sourceVolumeData)
          break
        }
        default:
          throw new Error('Unknown command ' + command)
      }
    } catch (error) {
      console.error('Error handling command in audio-worker: ', error)
    }
  }

  /**
   *  Starts the websocket connection to the openHAB server, with retry on error/disconnection.
   */
  connectWebSocket () {
    const retry = () => {
      if (this.reconnectTimeoutRef) {
        clearTimeout(this.reconnectTimeoutRef)
        this.reconnectTimeoutRef = undefined
      }
      this.reconnectTimeoutRef = setTimeout(
        this.connectWebSocket.bind(this),
        RECONNECT_MS
      )
    }
    let wsRef = this.socket
    let query = ''
    if (this.token.length) {
      query = `?accessToken=${this.token}`
    }
    try {
      wsRef = this.socket = new WebSocket(`${this.ohUrl}/ws/pcm-audio${query}`)
    } catch (error) {
      console.error(error)
      return retry()
    }
    wsRef.addEventListener('open', async () => {
      const resampler = await createResampler(this.resamplerMode, this.sampleRate, this.streamSampleRate, 1)
      this.sourceProcessor = new CircularBufferExecutor(
        new Float32Array(this.sampleRate / 3),
        buffer => {
          const resampled = resampler.resample(buffer)
          this.socket.send(audioToInt16Buffer(resampled))
        }
      )
      const initMessage = JSON.stringify({
        cmd: WebSocketInCmd.INITIALIZE,
        args: {
          id: this.id,
          sourceSampleRate: this.streamSampleRate,
          prefSampleRate: this.sampleRate,
          runDialog: true,
          listeningItem: this.listeningItem,
          locationItem: this.locationItem
        }
      })
      if (!wsRef) {
        console.error('on open: Websocket is not connected!')
        return
      }
      wsRef.send(initMessage)
    })
    wsRef.addEventListener('message', msg => {
      const msgType = typeof msg.data
      switch (msgType) {
        case 'string':
          // incoming command
          this.onWebSocketCommand(JSON.parse(msg.data))
          break
        case 'object':
          if (msg.data instanceof Blob) {
            // incoming audio
            const blob = msg.data
            this.sinkLock
              .lock(() =>
                blob
                  .arrayBuffer()
                  .then(buffer => this.handleSinkAudioBuffer(buffer))
              )
              .catch(err => console.error('audio-worker: error on sink blob', err))
          }
          break
        default:
          console.error(
            'websocket => audio-worker: unprocessed message typeof ' + msgType
          )
      }
    })
    wsRef.addEventListener('close', () => {
      console.warn('websocket => audio-worker: connection closed')
      this.configuring = false
      this.sourcePort?.close()
      this.sourcePort = undefined
      this.sourceProcessor = undefined
      this.socket = undefined
      this.postToMainThread(WorkerOutCmd.OFFLINE)
      if (this.reconnect) {
        retry()
      }
    })
    wsRef.addEventListener('error', err => console.error('ERROR:', err))
    return wsRef
  }

  /**
   * Closes the active socket connection if any
   */
  disconnectWebSocket () {
    if (this.socket) {
      this.socket.close()
    } else {
      console.error('audio-worker: WebSocket is not connected')
    }
  }

  /**
   * Sends audio though a {@link WebSocket} after encode it as a int 16 buffer.
   * Resamples the audio when needed from audio context sample rate to the stream sample rate.
   */
  handleSourceAudioBuffer (buffer) {
    if (this.socket) {
      this.sourceLock
        .lock(() => this.sourceProcessor.process(buffer))
        .catch(err => console.error('Error sending audio to oh: ', err))
    } else {
      console.error('Error sending audio to oh: WebSocket is not connected')
    }
  }

  /**
   * Sends audio to the audio system, after encode it as a float 32 buffer.
   * When it gets a new sink id (extracted from the buffer), it creates a sink context, request the required setup to the main thread.
   *
   * If there is message port in the correspondent {@link SinkContext} sends audio though it,
   * else cache the audio into the sink context cache, so it can be send when the port is ready.
   *
   * Resamples the audio when needed from stream sample rate to the audio context sample rate.
   */
  async handleSinkAudioBuffer (buffer) {
    // First 3 bytes from each chunk contains the stream id
    const streamId = new Uint8Array(buffer.slice(0, 3)).join('-')
    // skip 6 byte header
    const dataBuffer = buffer.slice(6)
    let sinkContext = this.sinkContextStorage.get(streamId)
    if (!sinkContext) {
      // Second 3 bytes from each chunk contains the stream format
      const sampleRate = getSampleRateFromByte(new Uint8Array(buffer.slice(3, 4)).toString())
      const bitDepth = getBitDepthFromByte(new Uint8Array(buffer.slice(4, 5)).toString())
      const channels = getChannelsFromByte(new Uint8Array(buffer.slice(5, 6)).toString())
      const sendSinkData = buffer => {
        const resampledBuffer = sinkContext.resampler.resample(buffer)
        if (sinkContext.port) {
          sinkContext.port.postMessage(resampledBuffer)
        } else {
          sinkContext.buffersCache.push(resampledBuffer.slice())
        }
      }
      sinkContext = {
        bitDepth,
        resampler: await createResampler(
          this.resamplerMode,
          sampleRate,
          this.sampleRate,
          channels
        ),
        bufferedExecutor: new CircularBufferExecutor(
          new Float32Array((sampleRate * channels) / 3),
          sendSinkData
        ),
        buffersCache: [],
        streamEnded: false,
        port: undefined
      }
      this.sinkContextStorage.set(streamId, sinkContext)
      // request the setup of a sink to the main thead
      this.postToMainThread(WorkerOutCmd.START_SINK, {
        id: streamId,
        channels: channels
      })
    }
    if (dataBuffer.byteLength === 1) {
      if (SINK_TERMINATION_BYTE === new Uint8Array(dataBuffer).toString()) {
        sinkContext.streamEnded = true
        if (sinkContext.port) {
          sinkContext.port.postMessage(false)
        }
        return sinkContext.bufferedExecutor
          .flush()
          .catch(err => console.error('Error sending sink data:', err))
      }
    }
    // transform the incoming buffer to the browser format and send
    return sinkContext.bufferedExecutor
      .process(sinkContext.bitDepth === 16 ? audioFromInt16Buffer(dataBuffer) : audioFromInt32Buffer(dataBuffer))
      .catch(err => console.error('Error sending sink data:', err))
  }
}

// Protocol format utils

function getSampleRateFromByte (stringByte) {
  switch (stringByte) {
    case StreamSampleSate.S8000:
      return 8000
    case StreamSampleSate.S16000:
      return 16000
    case StreamSampleSate.S32000:
      return 32000
    case StreamSampleSate.S44100:
      return 44100
    case StreamSampleSate.S48000:
      return 48000
  }
}
function getBitDepthFromByte (stringByte) {
  switch (stringByte) {
    case StreamBitDepth.D16:
      return 16
    case StreamSampleSate.D32:
      return 32
  }
}
function getChannelsFromByte (stringByte) {
  switch (stringByte) {
    case StreamChannels.C1:
      return 1
    case StreamChannels.C2:
      return 2
  }
}

// WAV conversion utils
/**
 * Converts a Float32Array into a int16 ArrayBuffer, the required by the server.
 */
function audioToInt16Buffer (input) {
  const output = new DataView(new ArrayBuffer(input.length * 2))
  let offset = 0
  for (let i = 0; i < input.length; i += 1, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]))
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  }
  return output.buffer
}

/**
 * Converts a int16 ArrayBuffer into a Float32Array, the required by the browser.
 */
function audioFromInt16Buffer (buffer) {
  const view = new DataView(buffer)
  const result = new Float32Array(buffer.byteLength / 2)
  for (let i = 0, offset = 0; i < buffer.byteLength / 2; i += 1, offset += 2) {
    const intValue = view.getInt16(offset, true)
    const floatValue = intValue < 0 ? intValue / 0x8000 : intValue / 0x7fff
    result[i] = Math.max(-1, Math.min(1, floatValue))
  }
  return result
}
/**
 * Converts a int32 ArrayBuffer into a Float32Array, the required by the browser.
 */
function audioFromInt32Buffer (buffer) {
  const view = new DataView(buffer)
  const result = new Float32Array(buffer.byteLength / 2)
  for (let i = 0, offset = 0; i < buffer.byteLength / 2; i += 1, offset += 2) {
    const intValue = view.getInt16(offset, true)
    const floatValue = intValue < 0 ? intValue / 0x80000000 : intValue / 0x7fffffff
    result[i] = Math.max(-1, Math.min(1, floatValue))
  }
  return result
}
// bind the WebWorker context to an AudioWorker instance
if (typeof postMessage !== 'undefined') {
  const ioWorker = new AudioWorker(postMessage.bind(this))
  onmessage = ioWorker.onMainThreadCommand.bind(ioWorker)
}
