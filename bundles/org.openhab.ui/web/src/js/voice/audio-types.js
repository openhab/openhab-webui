/**
 * Byte that indicates stream termination, (prefixed by "4 bytes id" + "stream type byte" )
 */
export const SINK_TERMINATION_BYTE = '254'
/**
 * Byte that indicates sink stream format, 4 position of each chunk
 */
export const StreamSampleSate = {
  S8000: '1',
  S16000: '2',
  S32000: '3',
  S44100: '4',
  S48000: '5'
}
/**
* Byte that indicates sink bit depth, 5 position of each chunk
*/
export let StreamBitDepth = {
  D16: '1',
  D32: '2'
}

/**
* Byte that indicates sink bit depth, 5 position of each chunk
*/
export let StreamChannels = {
  C1: '1',
  C2: '2'
}

// Commands from worker to server (no command for sending audio as it is sent as binary message).
export let WebSocketInCmd

;(function (WebSocketInCmd) {
  WebSocketInCmd['INITIALIZE'] = 'INITIALIZE'
  WebSocketInCmd['ON_SPOT'] = 'ON_SPOT'
})(WebSocketInCmd || (WebSocketInCmd = {}))

// Commands from server to worker (no command for receiving audio as is sent as binary).
export let WebSocketOutCmd

;(function (WebSocketOutCmd) {
  WebSocketOutCmd['INITIALIZED'] = 'INITIALIZED'
  WebSocketOutCmd['START_LISTENING'] = 'START_LISTENING'
  WebSocketOutCmd['STOP_LISTENING'] = 'STOP_LISTENING'
  WebSocketOutCmd['SINK_VOLUME'] = 'SINK_VOLUME'
  WebSocketOutCmd['SOURCE_VOLUME'] = 'SOURCE_VOLUME'
})(WebSocketOutCmd || (WebSocketOutCmd = {}))

// Commands from main thread to worker.
export let WorkerInCmd

;(function (WorkerInCmd) {
  WorkerInCmd['INITIALIZE'] = 'INITIALIZE'
  WorkerInCmd['RESUME'] = 'RESUME'
  WorkerInCmd['SUSPEND'] = 'SUSPEND'
  WorkerInCmd['SOURCE_PORT'] = 'SOURCE_PORT'
  WorkerInCmd['SINK_PORT'] = 'SINK_PORT'
  WorkerInCmd['ON_SPOT'] = 'ON_SPOT'
  WorkerInCmd['RESET_CONNECTION'] = 'RESET_CONNECTION'
  WorkerInCmd['TOKEN_RENEW'] = 'TOKEN_RENEW'
})(WorkerInCmd || (WorkerInCmd = {}))

// Commands from worker to main thread.
export let WorkerOutCmd

;(function (WorkerOutCmd) {
  WorkerOutCmd['INITIALIZED'] = 'INITIALIZED'
  WorkerOutCmd['SOURCE_READY'] = 'SOURCE_READY'
  WorkerOutCmd['OFFLINE'] = 'OFFLINE'
  WorkerOutCmd['START_SINK'] = 'START_SINK'
  WorkerOutCmd['STOP_SINK'] = 'STOP_SINK'
  WorkerOutCmd['START_LISTENING'] = 'START_LISTENING'
  WorkerOutCmd['STOP_LISTENING'] = 'STOP_LISTENING'
  WorkerOutCmd['SINK_VOLUME'] = 'SINK_VOLUME'
  WorkerOutCmd['SOURCE_VOLUME'] = 'SOURCE_VOLUME'
})(WorkerOutCmd || (WorkerOutCmd = {}))
