/// <reference lib="webworker" />

import { WebSocketInCmd, WebSocketOutCmd, type WebSocketOutMessage, WorkerInCmd, WorkerOutCmd, type WorkerOutMessage } from './types.ts'

/** WebSocket reconnection timeout */
const RECONNECT_MS = 5000

interface SinkContext {
  bitDepth: number
  buffersCache: Float32Array[]
  streamEnded: boolean
  port?: MessagePort
}

type MessageCallback = (message: any, transfer?: Transferable[]) => void

/**
 * Handles the websocket connection and the required audio format conversions.
 */
export default class AudioWorker {
  private readonly postMessage: MessageCallback
  /**
   * openHAB server URL
   */
  private ohUrl: string = ''
  /**
   * openHAB access token
   */
  private token: string = ''
  /**
   * Speaker ID
   */
  private id: string = ''
  private listeningItem: string = ''
  private locationItem: string = ''
  private sampleRate: number = 0
  private readonly sinkContextStorage: Map<string, SinkContext> = new Map()
  /**
   * Enables automatic reconnection.
   */
  private reconnect: boolean = false

  private socket?: WebSocket
  private reconnectTimeoutRef?: ReturnType<typeof setTimeout>
  private sourcePort?: MessagePort
  private sourcePacketHeader?: ArrayBuffer

  constructor(postMessage: MessageCallback) {
    this.postMessage = postMessage
  }

  /**
   * Sends a {@link WorkerOutCmd} to the main thread
   */
  postToMainThread(cmd: WorkerOutCmd, args?: Partial<WorkerOutMessage>): void {
    this.postMessage({ cmd, ...(args ?? {}) })
  }

  /**
   *
   * Send a {@link WebSocketInCmd} to the openHAB server
   */
  postToWebSocket(cmd: WebSocketInCmd, args?: Record<string, any>): void {
    if (this.socket && this.socket.readyState === this.socket.OPEN) {
      this.socket.send(JSON.stringify({ cmd, args }))
    } else {
      console.error('post cmd ' + cmd + ': WebSocket is not connected')
    }
  }

  /**
   * Handles the {@link WorkerInCmd} received from the main thread
   */
  async onMainThreadCommand(ev: MessageEvent): Promise<void> {
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
          this.ohUrl = initData.ohUrl.replace('https:', 'wss:').replace('http:', 'ws:')
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
          if (this.sourcePort) {
            this.sourcePort.onmessage = (ev) => this.handleSourceAudioBuffer(ev.data)
            this.sourcePort.start()
          }
          this.postToMainThread(WorkerOutCmd.SOURCE_READY)
          break
        }
        case WorkerInCmd.SINK_PORT: {
          const speakPortData = ev.data
          const sinkContext = this.sinkContextStorage.get(speakPortData.id)
          if (sinkContext) {
            const sinkPort = (sinkContext.port = speakPortData.port)
            if (sinkPort) {
              sinkPort.onmessage = (ev: MessageEvent) => {
                if (ev.data === false) {
                  // clean up sink context
                  this.sinkContextStorage.delete(speakPortData.id)
                  sinkPort.close()
                  this.postToMainThread(WorkerOutCmd.STOP_SINK, {
                    id: speakPortData.id
                  })
                }
              }
              sinkPort.start()
              if (sinkContext.buffersCache.length) {
                sinkPort.postMessage(sinkContext.buffersCache)
                sinkContext.buffersCache = []
              }
              if (sinkContext.streamEnded) {
                // notify streamCompletion
                sinkPort.postMessage(false)
              }
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
   * Handles the {@link WebSocketOutCmd} received from openHAB
   */
  onWebSocketCommand(data: WebSocketOutMessage): void {
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
          const sinkVolumeData = data.args
          this.postToMainThread(WorkerOutCmd.SINK_VOLUME, sinkVolumeData)
          break
        }
        case WebSocketOutCmd.SOURCE_VOLUME: {
          const sourceVolumeData = data.args
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
  connectWebSocket() {
    const retry = () => {
      if (this.reconnectTimeoutRef) {
        clearTimeout(this.reconnectTimeoutRef)
        this.reconnectTimeoutRef = undefined
      }
      this.reconnectTimeoutRef = setTimeout(this.connectWebSocket.bind(this), RECONNECT_MS)
    }
    let wsRef = this.socket
    let secHeader: string[] = []
    if (this.token.length) {
      const encodedToken = btoa(this.token).replace(/=*$/, '')
      secHeader = [`org.openhab.ws.accessToken.base64.${encodedToken}`, 'org.openhab.ws.protocol.default']
    }
    try {
      wsRef = this.socket = new WebSocket(`${this.ohUrl}/ws/audio-pcm`, secHeader)
    } catch (error) {
      console.error(error)
      retry()
      return wsRef as WebSocket
    }
    wsRef.addEventListener('open', async () => {
      this.sourcePacketHeader = undefined
      const initMessage = JSON.stringify({
        cmd: WebSocketInCmd.INITIALIZE,
        args: {
          id: this.id,
          forceSampleRate: this.sampleRate,
          startDialog: true,
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
    wsRef.addEventListener('message', (msg) => {
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
            blob
              .arrayBuffer()
              .then((buffer) => this.handleSinkAudioBuffer(buffer))
              .catch((err) => console.error('audio-worker: error on sink blob', err))
          }
          break
        default:
          console.error('websocket => audio-worker: unprocessed message typeof ' + msgType)
      }
    })
    wsRef.addEventListener('close', () => {
      console.warn('websocket => audio-worker: connection closed')
      this.sourcePort?.close()
      this.sourcePacketHeader = undefined
      this.sourcePort = undefined
      this.socket = undefined
      this.postToMainThread(WorkerOutCmd.OFFLINE)
      if (this.reconnect) {
        retry()
      }
    })
    wsRef.addEventListener('error', (err) => console.error('ERROR:', err))
    return wsRef
  }

  /**
   * Closes the active socket connection if any
   */
  disconnectWebSocket() {
    if (this.socket) {
      this.socket.close()
    } else {
      console.error('audio-worker: WebSocket is not connected')
    }
  }

  /**
   * Sends audio though a {@link WebSocket} after encode it as a int 16 lower-endian buffer.
   * Prepends the audio data with a header that contains the identity and format.
   */
  handleSourceAudioBuffer(buffer: Float32Array) {
    if (this.socket && this.socket.readyState === this.socket.OPEN) {
      if (!this.sourcePacketHeader) {
        this.sourcePacketHeader = generateAudioPacketHeader(this.sampleRate, 16, 1)
      }
      const audioChunk = audioToInt16Buffer(buffer)
      let audioPacketByteArray = new Uint8Array(this.sourcePacketHeader.byteLength + audioChunk.byteLength)
      audioPacketByteArray.set(new Uint8Array(this.sourcePacketHeader), 0)
      audioPacketByteArray.set(new Uint8Array(audioChunk), this.sourcePacketHeader.byteLength)
      this.socket.send(audioPacketByteArray.buffer)
    } else {
      console.error('Error sending audio to openHAB: WebSocket is not connected')
    }
  }

  /**
   * Sends audio to the audio system after encoding it as a float32 buffer.
   * When it gets a new sink id (extracted from the buffer), it creates a sink context and requests the required setup from the main thread.
   *
   * If there is a message port in the corresponding {@link SinkContext}, it sends audio through it;
   * otherwise it caches the audio in the sink context cache so it can be sent when the port is ready.
   *
   * Validates that the stream sample rate matches the audio context sample rate.
   */
  async handleSinkAudioBuffer(buffer: ArrayBuffer) {
    // First 2 bytes from each chunk contains the stream id
    const streamId = new Uint8Array(buffer.slice(0, 2)).join('-')
    // skip packet header
    const dataBuffer = buffer.slice(AUDIO_PACKET_HEADER_LENGTH)
    let sinkContext = this.sinkContextStorage.get(streamId)
    if (!sinkContext) {
      // Second 3 bytes from each chunk contains the stream format
      const { sampleRate, bitDepth, channels } = parseAudioFormat(buffer)
      if (sampleRate !== this.sampleRate) {
        console.error(`Unexpected sample rate on sink ${streamId} data`)
      }
      sinkContext = {
        bitDepth,
        buffersCache: [],
        streamEnded: false,
        port: undefined
      }
      this.sinkContextStorage.set(streamId, sinkContext)
      // request the setup of a sink to the main thread
      this.postToMainThread(WorkerOutCmd.START_SINK, {
        id: streamId,
        channels
      })
    }
    if (dataBuffer.byteLength === 1) {
      if (SINK_TERMINATION_BYTE === new Uint8Array(dataBuffer).toString()) {
        sinkContext.streamEnded = true
        if (sinkContext.port) {
          sinkContext.port.postMessage(false)
        }
        return
      }
    }
    let decodeFn: (buffer: ArrayBuffer) => Float32Array
    switch (sinkContext.bitDepth) {
      case 8:
        decodeFn = audioFromInt8Buffer
        break
      case 16:
        decodeFn = audioFromInt16Buffer
        break
      case 24:
        decodeFn = audioFromInt24Buffer
        break
      case 32:
        decodeFn = audioFromInt32Buffer
        break
      default:
        console.error(`Unsupported bitDepth ${sinkContext.bitDepth} on audio sink ${streamId} ignoring`)
        return
    }
    const audioSamples = decodeFn(dataBuffer)
    // transform the incoming buffer to the browser format and send
    if (sinkContext.port) {
      sinkContext.port.postMessage(audioSamples)
    } else {
      sinkContext.buffersCache.push(audioSamples)
    }
  }
}

// Audio packet header parser/generator

/**
 * Audio packet header length in bytes:
 * - 2 bytes stream ID
 * - 4 bytes sample rate
 * - 1 byte bit depth
 * - 1 byte number of channels
 */
const AUDIO_PACKET_HEADER_LENGTH = 2 + 4 + 1 + 1
/**
 * Byte that indicates stream termination (prefixed by the header bytes).
 */
const SINK_TERMINATION_BYTE = '254'

function generateAudioPacketHeader(sampleRate: number, bitDepth: number, channels: number): ArrayBuffer {
  const view = new DataView(new ArrayBuffer(AUDIO_PACKET_HEADER_LENGTH))
  let id = new Uint8Array(2)
  crypto.getRandomValues(id)
  view.setUint8(0, id[0]!)
  view.setUint8(1, id[1]!)
  view.setInt32(2, sampleRate, true)
  view.setUint8(6, bitDepth)
  view.setUint8(7, channels)
  return view.buffer
}

function parseAudioFormat(buffer: ArrayBuffer): { sampleRate: number; bitDepth: number; channels: number } {
  const view = new DataView(buffer)
  const sampleRate = view.getInt32(2, true)
  const bitDepth = view.getUint8(6)
  const channels = view.getUint8(7)
  return { sampleRate, bitDepth, channels }
}

// WAV conversion utils
/**
 * Converts a Float32Array into a int16 ArrayBuffer, the required by the server.
 */
function audioToInt16Buffer(audioSamples: Float32Array): ArrayBuffer {
  const bytesPerSample = 2
  const output = new DataView(new ArrayBuffer(audioSamples.length * bytesPerSample))
  let offset = 0
  for (let i = 0; i < audioSamples.length; i += 1, offset += bytesPerSample) {
    const floatValue = Math.max(-1, Math.min(1, audioSamples[i]!))
    output.setInt16(offset, floatValue < 0 ? floatValue * 0x8000 : floatValue * 0x7fff, true)
  }
  return output.buffer
}

/**
 * Converts a int8 ArrayBuffer into a Float32Array of samples, the required by the browser.
 */
function audioFromInt8Buffer(buffer: ArrayBuffer): Float32Array {
  const view = new DataView(buffer)
  const bytesPerSample = 1
  const nSamples = buffer.byteLength / bytesPerSample
  const audioSamples = new Float32Array(nSamples)
  for (let i = 0, offset = 0; i < nSamples; i += 1, offset += bytesPerSample) {
    const intValue = view.getInt8(offset)
    const floatValue = intValue < 0 ? intValue / 0x80 : intValue / 0x7f
    audioSamples[i] = Math.max(-1, Math.min(1, floatValue))
  }
  return audioSamples
}

/**
 * Converts a int16 ArrayBuffer into a Float32Array of samples, the required by the browser.
 */
function audioFromInt16Buffer(buffer: ArrayBuffer): Float32Array {
  const view = new DataView(buffer)
  const bytesPerSample = 2
  const nSamples = buffer.byteLength / bytesPerSample
  if (buffer.byteLength % bytesPerSample) {
    console.warn('Voice: Missing bytes on audio data ' + (buffer.byteLength % bytesPerSample))
  }
  const audioSamples = new Float32Array(nSamples)
  for (let i = 0, offset = 0; i < nSamples; i += 1, offset += bytesPerSample) {
    const intValue = view.getInt16(offset, true)
    const floatValue = intValue < 0 ? intValue / 0x8000 : intValue / 0x7fff
    audioSamples[i] = Math.max(-1, Math.min(1, floatValue))
  }
  return audioSamples
}

/**
 * Converts a int32 ArrayBuffer into a Float32Array of samples, the required by the browser.
 */
function audioFromInt32Buffer(buffer: ArrayBuffer): Float32Array {
  const view = new DataView(buffer)
  const bytesPerSample = 4
  const nSamples = buffer.byteLength / bytesPerSample
  if (buffer.byteLength % bytesPerSample) {
    console.warn('Voice: Missing bytes on audio data ' + (buffer.byteLength % bytesPerSample))
  }
  const audioSamples = new Float32Array(nSamples)
  for (let i = 0, offset = 0; i < nSamples; i += 1, offset += bytesPerSample) {
    const intValue = view.getInt32(offset, true)
    const floatValue = intValue < 0 ? intValue / 0x80000000 : intValue / 0x7fffffff
    audioSamples[i] = Math.max(-1, Math.min(1, floatValue))
  }
  return audioSamples
}

function getUint24(view: DataView, byteOffset = 0, littleEndian = false): number {
  return littleEndian
    ? view.getUint8(byteOffset) + (view.getUint16(byteOffset + 1, littleEndian) << 8)
    : (view.getUint16(byteOffset, littleEndian) << 8) + view.getUint8(byteOffset + 2)
}

function getInt24(view: DataView, byteOffset = 0, littleEndian = false): number {
  const valU24 = getUint24(view, byteOffset, littleEndian)
  const isNeg = valU24 & 0x800000
  return !isNeg ? valU24 : (0xffffff - valU24 + 1) * -1
}

/**
 * Converts an int24 ArrayBuffer into a Float32Array of samples as required by the browser.
 */
function audioFromInt24Buffer(buffer: ArrayBuffer): Float32Array {
  const view = new DataView(buffer)
  const bytesPerSample = 3
  const nSamples = buffer.byteLength / bytesPerSample
  if (buffer.byteLength % bytesPerSample) {
    console.warn('Voice: Missing bytes on audio data ' + (buffer.byteLength % bytesPerSample))
  }
  const audioSamples = new Float32Array(nSamples)
  for (let i = 0, offset = 0; i < nSamples; i += 1, offset += bytesPerSample) {
    const intValue = getInt24(view, offset, true)
    const floatValue = intValue < 0 ? intValue / 0x800000 : intValue / 0x7fffff
    audioSamples[i] = Math.max(-1, Math.min(1, floatValue))
  }
  return audioSamples
}

// bind the WebWorker context to an AudioWorker instance
if (typeof postMessage !== 'undefined') {
  const ioWorker = new AudioWorker(postMessage.bind(self) as MessageCallback)
  onmessage = ioWorker.onMainThreadCommand.bind(ioWorker)
}
