/**
 * Commands from worker to server (no command for sending audio as it is sent as binary message).
 */
export enum WebSocketInCmd {
  INITIALIZE = 'INITIALIZE',
  ON_SPOT = 'ON_SPOT'
}

/**
 * Commands from server to worker (no command for receiving audio as is sent as binary).
 */
export enum WebSocketOutCmd {
  INITIALIZED = 'INITIALIZED',
  START_LISTENING = 'START_LISTENING',
  STOP_LISTENING = 'STOP_LISTENING',
  SINK_VOLUME = 'SINK_VOLUME',
  SOURCE_VOLUME = 'SOURCE_VOLUME'
}

export interface WebSocketOutMessage {
  cmd: WebSocketOutCmd
  args?: Record<string, any>
}

/**
 * Commands from main thread to worker.
 */
export enum WorkerInCmd {
  INITIALIZE = 'INITIALIZE',
  RESUME = 'RESUME',
  SUSPEND = 'SUSPEND',
  SOURCE_PORT = 'SOURCE_PORT',
  SINK_PORT = 'SINK_PORT',
  ON_SPOT = 'ON_SPOT',
  RESET_CONNECTION = 'RESET_CONNECTION',
  TOKEN_RENEW = 'TOKEN_RENEW'
}

/**
 * Commands from worker to main thread.
 */
export enum WorkerOutCmd {
  INITIALIZED = 'INITIALIZED',
  SOURCE_READY = 'SOURCE_READY',
  OFFLINE = 'OFFLINE',
  START_SINK = 'START_SINK',
  STOP_SINK = 'STOP_SINK',
  START_LISTENING = 'START_LISTENING',
  STOP_LISTENING = 'STOP_LISTENING',
  SINK_VOLUME = 'SINK_VOLUME',
  SOURCE_VOLUME = 'SOURCE_VOLUME'
}

/**
 * Commands from main thread to the wake word worker.
 */
export enum WakeWordWorkerInCmd {
  INITIALIZE = 'INITIALIZE',
  PAUSE = 'PAUSE',
  RESUME = 'RESUME',
  STREAM = 'STREAM',
  STOP_STREAM = 'STOP_STREAM'
}

/**
 * Commands from the wake word worker to main thread.
 */
export enum WakeWordWorkerOutCmd {
  READY = 'READY',
  DETECTED = 'DETECTED',
  ERROR = 'ERROR'
}

/**
 * A message sent from main thread to the wake word worker.
 */
export type WakeWordWorkerInMessage =
  | {
      cmd: WakeWordWorkerInCmd.INITIALIZE
      manifestUrl: string
      probabilityCutoff?: number
      sampleRate: number
      /** The port through which the audio worklet sends the microphone audio. */
      port: MessagePort
    }
  | {
      cmd: WakeWordWorkerInCmd.STREAM
      /** The port to send the microphone audio to, the source port of the audio worker. */
      port: MessagePort
      /** Whether to send the audio since the end of the last detected wake word before the live audio. */
      fromWakeWord: boolean
    }
  | { cmd: WakeWordWorkerInCmd.PAUSE | WakeWordWorkerInCmd.RESUME | WakeWordWorkerInCmd.STOP_STREAM }

/**
 * A message sent from the wake word worker to main thread.
 */
export interface WakeWordWorkerOutMessage {
  cmd: WakeWordWorkerOutCmd
  wakeWord?: string
  message?: string
}

/**
 * The wake word model to listen for.
 */
export interface WakeWordConfig {
  /**
   * URL of the microWakeWord manifest; the .tflite file it names is loaded from the same folder.
   */
  manifestUrl: string
  /**
   * Average probability above which the wake word counts as detected, the cutoff of the manifest when not set.
   */
  probabilityCutoff?: number
}

/**
 * A message sent from worker to main thread.
 */
export interface WorkerOutMessage {
  cmd: WorkerOutCmd
  id?: string
  channels?: number
  value?: number
}

/**
 * What the voice dialog is doing, for showing it like the light of a smart speaker. Triggered is the time between a
 * click or wake word and the server listening, and thinking is the time between listening and the reply.
 */
export type VoiceState = 'offline' | 'idle' | 'triggered' | 'listening' | 'thinking' | 'speaking'
