/**
 * Byte that indicates stream termination, (prefixed by "4 bytes id" + "stream type byte" )
 */
export const SINK_TERMINATION_BYTE = '254'

// Commands from worker to server (no command for sending audio as it is sent as binary message).
export const WebSocketInCmd = {
  INITIALIZE: 'INITIALIZE',
  ON_SPOT: 'ON_SPOT'
}

// Commands from server to worker (no command for receiving audio as is sent as binary).
export const WebSocketOutCmd = {
  INITIALIZED: 'INITIALIZED',
  START_LISTENING: 'START_LISTENING',
  STOP_LISTENING: 'STOP_LISTENING',
  SINK_VOLUME: 'SINK_VOLUME',
  SOURCE_VOLUME: 'SOURCE_VOLUME'
}

// Commands from main thread to worker.
export const WorkerInCmd = {
  INITIALIZE: 'INITIALIZE',
  RESUME: 'RESUME',
  SUSPEND: 'SUSPEND',
  SOURCE_PORT: 'SOURCE_PORT',
  SINK_PORT: 'SINK_PORT',
  ON_SPOT: 'ON_SPOT',
  RESET_CONNECTION: 'RESET_CONNECTION',
  TOKEN_RENEW: 'TOKEN_RENEW'
}

// Commands from worker to main thread.
export const WorkerOutCmd = {
  INITIALIZED: 'INITIALIZED',
  SOURCE_READY: 'SOURCE_READY',
  OFFLINE: 'OFFLINE',
  START_SINK: 'START_SINK',
  STOP_SINK: 'STOP_SINK',
  START_LISTENING: 'START_LISTENING',
  STOP_LISTENING: 'STOP_LISTENING',
  SINK_VOLUME: 'SINK_VOLUME',
  SOURCE_VOLUME: 'SOURCE_VOLUME'
}
