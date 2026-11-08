/// <reference lib="webworker" />

import { loadMicroWakeWord } from './micro-wakeword/micro-wakeword.js'
import { AudioHistory } from './audio-history.ts'
import { OUTPUT_SAMPLE_RATE } from './resampler.ts'
import { WakeWordSpotter } from './wakeword-spotter.ts'
import { WakeWordWorkerInCmd, type WakeWordWorkerInMessage, WakeWordWorkerOutCmd, type WakeWordWorkerOutMessage } from '../types.ts'

/** Seconds of microphone audio kept for the command that follows the wake word. */
const HISTORY_SECONDS = 5

/** Samples per message when sending the kept audio, to keep WebSocket messages small. */
const HISTORY_CHUNK_SIZE = 4096

/**
 * Listens for the wake word in the microphone audio that an audio worklet sends through a {@link MessagePort}.
 *
 * After a detection it also streams the audio to the server, so that the command spoken right after the wake word
 * isn't lost while the server starts listening: it first sends the audio since the end of the wake word, then the live
 * audio.
 *
 * Runs in a Web Worker rather than in the audio worklet, as the WebAssembly loader needs fetch and TextDecoder.
 */
export default class WakeWordWorker {
  private readonly postMessage: (message: WakeWordWorkerOutMessage) => void
  private spotter?: WakeWordSpotter
  private port?: MessagePort
  private paused = false
  private sampleRate = 0
  private history?: AudioHistory
  /** Stream index of the end of the last detected wake word, until it is streamed. */
  private wakeWordEnd: number | null = null
  private streamPort?: MessagePort

  constructor(postMessage: (message: WakeWordWorkerOutMessage) => void) {
    this.postMessage = postMessage
  }

  async onMainThreadCommand(ev: MessageEvent<WakeWordWorkerInMessage>) {
    const message = ev.data
    switch (message.cmd) {
      case WakeWordWorkerInCmd.INITIALIZE: {
        const { manifestUrl, probabilityCutoff, sampleRate, port } = message
        this.sampleRate = sampleRate
        this.history = new AudioHistory(sampleRate * HISTORY_SECONDS)
        // audio that arrives before the model is loaded is not checked for the wake word
        this.port = port
        this.port.onmessage = (audio: MessageEvent<Float32Array>) => this.onAudio(audio.data)
        this.port.start()
        try {
          const [microWakeWord, manifest] = await Promise.all([loadMicroWakeWord(), fetchText(manifestUrl)])
          const modelName = (JSON.parse(manifest) as { model?: unknown }).model
          if (typeof modelName !== 'string') {
            throw new Error('The manifest does not name a model file')
          }
          const model = await fetchBytes(new URL(modelName, manifestUrl).href)
          const detector = microWakeWord.createDetector(manifest, model, probabilityCutoff)
          this.spotter = new WakeWordSpotter(detector, sampleRate)
          this.postMessage({ cmd: WakeWordWorkerOutCmd.READY, wakeWord: detector.getWakeWord() })
        } catch (error) {
          this.postMessage({ cmd: WakeWordWorkerOutCmd.ERROR, message: error instanceof Error ? error.message : String(error) })
        }
        break
      }
      case WakeWordWorkerInCmd.PAUSE:
        this.paused = true
        break
      case WakeWordWorkerInCmd.RESUME:
        if (this.paused) {
          this.paused = false
          // don't join the audio from before the pause to the audio after it
          this.spotter?.reset()
        }
        break
      case WakeWordWorkerInCmd.STREAM:
        this.stopStream()
        this.streamPort = message.port
        if (message.fromWakeWord && this.wakeWordEnd !== null && this.history) {
          const kept = this.history.readFrom(this.wakeWordEnd)
          for (let i = 0; i < kept.length; i += HISTORY_CHUNK_SIZE) {
            this.streamPort.postMessage(kept.slice(i, i + HISTORY_CHUNK_SIZE))
          }
        }
        this.wakeWordEnd = null
        break
      case WakeWordWorkerInCmd.STOP_STREAM:
        this.stopStream()
        break
      default:
        console.error('wakeword-worker: unknown command', message)
    }
  }

  private onAudio(samples: Float32Array) {
    this.history?.write(samples)
    if (!this.paused && this.spotter && this.history) {
      const samplesAfterWakeWord = this.spotter.push(samples)
      if (samplesAfterWakeWord !== null) {
        this.wakeWordEnd = this.history.length - Math.round((samplesAfterWakeWord * this.sampleRate) / OUTPUT_SAMPLE_RATE)
        this.postMessage({ cmd: WakeWordWorkerOutCmd.DETECTED })
      }
    }
    // the samples aren't used after this, so they can be transferred
    this.streamPort?.postMessage(samples, [samples.buffer])
  }

  private stopStream() {
    this.streamPort?.close()
    this.streamPort = undefined
  }
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`)
  }
  return response.text()
}

async function fetchBytes(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`)
  }
  return response.arrayBuffer()
}

// bind the WebWorker context to a WakeWordWorker instance
if (typeof postMessage !== 'undefined') {
  const wakeWordWorker = new WakeWordWorker(postMessage.bind(self))
  onmessage = (ev: MessageEvent<WakeWordWorkerInMessage>) => void wakeWordWorker.onMainThreadCommand(ev)
}
