export default class WebSocketWorker {
  /**@type {WebSocket} */
  wsRef = null;
  /**@type {(data: any) => void} */
  postMessage = null;
  /**@type {string} */
  id = "";
  /**@type {string} */
  label = "";
  /**@type {string} */
  token = "";
  /**@type {number} */
  sampleRate = 0;
  constructor(postMessage) {
    this.postMessage = postMessage;
  }
  /**
   *
   * @param {string} command
   * @param {any} args
   */
  postToMainThread(cmd, args = {}) {
    this.postMessage({ cmd, ...args });
  }
  /**
   *
   * @param {string} command
   * @param {any} args
   */
  postToWebSocket(cmd, args = {}) {
    if (this.wsRef && this.wsRef.readyState == this.wsRef.OPEN) {
      this.wsRef.send(JSON.stringify({ cmd, ...args }));
    } else {
      console.error("WebSocket is not connected");
    }
  }
  /**
   *
   * @param {MessageEvent<{cmd: string, data: any}>} ev
   */
  onMainThreadCommand(ev) {
    try {
      console.debug("main => worker: ", ev.data);
      switch (ev.data.cmd) {
        case WorkerInCmd.INITIALIZE:
          this.id = ev.data.id;
          this.label = ev.data.label;
          this.sampleRate = ev.data.sampleRate;
          this.token = ev.data.token;
          this.connectWebSocket();
          break;
        case WorkerInCmd.LISTEN:
          this.onListen(ev.data.buffers);
          break;
        case WorkerInCmd.START_DIALOG:
          this.postToWebSocket(WebSocketInCmd.START_DIALOG);
          break;
        case WorkerInCmd.STOP_DIALOG:
          this.postToWebSocket(WebSocketInCmd.STOP_DIALOG);
          break;
        case WorkerInCmd.TOKEN_RENEW:
          this.token = ev.data.token;
          break;
        case WorkerInCmd.RESET_CONNECTION:
          this.id = ev.data.id;
          this.label = ev.data.label;
          if (this.wsRef !== null) {
            this.wsRef.close();
          } else {
            console.error("WebSocket is not connected");
          }
          break;
        default:
          throw new Error("Unknown command: " + ev.data.cmd);
      }
    } catch (error) {
      console.error("Error handling command in worker: ", error);
    }
  }
  onListen(buffers) {
    if (this.wsRef !== null) {
      // convert to websocket format and send as binary
      this.wsRef.send(encodeWAV16BitMonoPCM(buffers, this.sampleRate, 16000));
    } else {
      console.error("WebSocket is not connected");
    }
  }

  onWebSocketCommand(data) {
    try {
      console.debug("websocket => worker: ", data);
      switch (data.cmd) {
        case WebSocketOutCmd.INITIALIZED:
          this.postToMainThread(WorkerOutCmd.INITIALIZED);
          break;
        case WebSocketOutCmd.START_LISTENING:
          this.postToMainThread(WorkerOutCmd.START_LISTENING);
          break;
        case WebSocketOutCmd.STOP_LISTENING:
          this.postToMainThread(WorkerOutCmd.STOP_LISTENING);
          break;
        default:
          throw new Error("Unknown command: " + data.cmd);
      }
    } catch (error) {
      console.error("Error handling command in worker: ", error);
    }
  }
  /**
   *
   * @returns {WebSocket}
   */
  connectWebSocket() {
    const retry = () => {
      setTimeout(this.connectWebSocket.bind(this), 10000);
    };
    let wsRef = this.wsRef;
    try {
      wsRef = this.wsRef = new WebSocket(
        `${location.protocol === "http:" ? "ws" : "wss"}://${
          location.host
        }/habassistant/ws`
      );
    } catch (error) {
      console.error(error);
      return retry();
    }
    wsRef.addEventListener("open", () => {
      var initMessage = JSON.stringify({
        cmd: WebSocketInCmd.INITIALIZE,
        id: this.id,
        label: this.label,
        token: this.token,
        sampleRate: this.sampleRate,
      });
      console.debug("worker => websocket:", initMessage);
      wsRef.send(initMessage);
    });
    wsRef.addEventListener("message", (msg) => {
      const msgType = typeof msg.data;
      switch (msgType) {
        case "string":
          this.onWebSocketCommand(JSON.parse(msg.data));
          break;
        case "object":
          if (msg.data instanceof Blob) {
            var blob = msg.data;
            blob.arrayBuffer().then((buffer) => {
              // transform the incoming buffer to native format, no resampling, is done on the server.
              var floatBuffer = decodeWAV16BitPCM(buffer);
              this.postMessage({
                cmd: WorkerOutCmd.SPEAK,
                buffer: floatBuffer,
              });
            });
            console.trace("websocket => worker: Binary data");
          }
          break;
        default:
          console.error(
            "websocket => worker: unprocessed message typeof " + msgType
          );
      }
    });
    wsRef.addEventListener("close", () => {
      console.warn("websocket => worker: connection closed");
      this.wsRef = null;
      this.postToMainThread(WorkerOutCmd.OFFLINE);
      retry();
    });
    wsRef.addEventListener("error", (err) => console.error("ERROR:", err));
    return wsRef;
  }
}
// Commands from worker to server (no command for sending audio as is sent as binary).
const WebSocketInCmd = {
  INITIALIZE: "INITIALIZE",
  START_DIALOG: "START_DIALOG",
  STOP_DIALOG: "STOP_DIALOG",
};
// Commands from server to worker (no command for receiving audio as is sent as binary).
const WebSocketOutCmd = {
  INITIALIZED: "INITIALIZED",
  START_LISTENING: "START_LISTENING",
  STOP_LISTENING: "STOP_LISTENING",
};
// Commands from main thread to worker.
export const WorkerInCmd = {
  INITIALIZE: "INITIALIZE",
  LISTEN: "LISTEN",
  START_DIALOG: "START_DIALOG",
  STOP_DIALOG: "STOP_DIALOG",
  RESET_CONNECTION: "RESET_CONNECTION",
  TOKEN_RENEW: "TOKEN_RENEW",
};
// Commands from worker to main thread.
export const WorkerOutCmd = {
  INITIALIZED: "INITIALIZED",
  OFFLINE: "OFFLINE",
  SPEAK: "SPEAK",
  START_LISTENING: "START_LISTENING",
  STOP_LISTENING: "STOP_LISTENING",
};

// WAV conversion utils
/**
 * Convert float to 16bit PCM.
 * @param {Float32Array} input The input buffer.
 */
function floatTo16BitPCM(input) {
  const output = new DataView(new ArrayBuffer(input.length * 2));
  let offset = 0;
  for (let i = 0; i < input.length; i += 1, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return output.buffer;
}
/**
 *
 * @param {byte[]} buffer
 * @param {int} sampleRate
 * @param {int} targetSampleRate
 * @returns {Float32Array}
 */
function downSampleBuffer(buffer, sampleRate, targetSampleRate) {
  if (targetSampleRate == sampleRate) {
    return buffer;
  }
  if (targetSampleRate > sampleRate) {
    throw "downsampling rate show be smaller than original sample rate";
  }
  var sampleRateRatio = sampleRate / targetSampleRate;
  var newLength = Math.round(buffer.length / sampleRateRatio);
  var result = new Float32Array(newLength);
  var offsetResult = 0;
  var offsetBuffer = 0;
  while (offsetResult < result.length) {
    var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    var accum = 0,
      count = 0;
    for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    result[offsetResult] = accum / count;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}
/**
 *
 * @param {Float32Array]} buffer
 * @returns Float32Array
 */
function decodeWAV16BitPCM(buffer) {
  const view = new DataView(buffer);
  var result = new Float32Array(buffer.byteLength / 2);
  for (let i = 0, offset = 0; i < buffer.byteLength / 2; i += 1, offset += 2) {
    var intValue = view.getInt16(offset, true);
    var floatValue = intValue < 0 ? intValue / 0x8000 : intValue / 0x7fff;
    result[i] = floatValue;
  }
  return result;
}

/**
 *
 * @param {Float32Array[]} audioBuffers
 * @param {number} channels
 * @param {number} sampleRate
 * @param {number} targetSampleRate
 * @returns ArrayBuffer
 */
function encodeWAV16BitMonoPCM(audioBuffers, sampleRate, targetSampleRate) {
  /** @type {Float32Array[]}  */
  let channelBuffer = audioBuffers[0];
  const resampled = downSampleBuffer(
    channelBuffer,
    sampleRate,
    targetSampleRate
  );
  return floatTo16BitPCM(resampled);
}
// worker start up
if (typeof postMessage !== "undefined") {
  const webSocketWorker = new WebSocketWorker(postMessage.bind(this));
  onmessage = webSocketWorker.onMainThreadCommand.bind(webSocketWorker);
}
