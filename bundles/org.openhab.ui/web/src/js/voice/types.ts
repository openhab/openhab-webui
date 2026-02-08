/**
 * Byte that indicates stream termination, (prefixed by "4 bytes id" + "stream type byte" )
 */
export const SINK_TERMINATION_BYTE = '254'

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
 * A message sent from worker to main thread.
 */
export interface WorkerOutMessage {
  cmd: WorkerOutCmd
  id?: string
  channels?: number
  value?: number
}
