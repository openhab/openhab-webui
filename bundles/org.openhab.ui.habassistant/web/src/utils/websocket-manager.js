import { WorkerInCmd, WorkerOutCmd } from "./websocket-worker";
/**@type {AudioContext} */
let audioContext = null;

// Audio Record

/**@type {ScriptProcessorNode} */
let processorNode = null;
/**@type {MediaStream} */
let stream = null;
/**@type {MediaStreamAudioSourceNode} */
let sourceNode = null;
async function setupAudio() {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (!stream) {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
  }
  if (!sourceNode) {
    sourceNode = audioContext.createMediaStreamSource(stream);
  }
}

// Audio play
class AudioCache {
  silence = new Float32Array(4096);
  buffer = new Float32Array(0);
  readAudioData(n) {
    var segment = this.buffer.subarray(0, n);
    this.buffer = this.buffer.subarray(n, this.buffer.length);
    return segment;
  }
  writeAudioData(buffer) {
    var currentCacheLength = this.buffer.length;
    var newBuffer = new Float32Array(currentCacheLength + buffer.length);
    newBuffer.set(this.buffer, 0);
    newBuffer.set(buffer, currentCacheLength);
    this.buffer = newBuffer;
  }
  available() {
    return !!this.buffer.length;
  }
  reset() {
    this.buffer = new Float32Array(0);
  }
}
const audioCache = new AudioCache();
let speakerUp = false;
/**@type {ScriptProcessorNode} */
let sinkProcessorNode = null;
/**@type {MediaStreamAudioSourceNode} */
let gainNode = null;
// Speaker auto off timeout id, to preserve cpu
let speakerOffTimeout = null;
async function setupSpeaker(setSpeaking) {
  if (!speakerUp) {
    console.debug("main thread: Starting speaker");
    await audioContext.resume();
    if (!sinkProcessorNode) {
      sinkProcessorNode = audioContext.createScriptProcessor(4096, 0, 1);
      sinkProcessorNode.onaudioprocess = function (e) {
        if (audioCache.available()) {
          setSpeaking(true);
          e.outputBuffer
            .getChannelData(0)
            .set(audioCache.readAudioData(e.outputBuffer.length));
        } else {
          setSpeaking(false);
          e.outputBuffer.getChannelData(0).set(audioCache.silence);
        }
      };
    }
    if (!gainNode) {
      gainNode = audioContext.createGain();
      sinkProcessorNode.connect(gainNode);
    }
    audioCache.reset();
    gainNode.connect(audioContext.destination);
    speakerUp = true;
  }
  delayedStopSpeaker();
}
function delayedStopSpeaker() {
  clearTimeout(speakerOffTimeout);
  speakerOffTimeout = setTimeout(() => stopSpeaker(), 10000);
}

function stopSpeaker() {
  if (speakerUp) {
    if (gainNode) {
      console.debug("Main Thread: Stopping speaker");
      gainNode.disconnect(audioContext.destination);
    }
  }
  speakerUp = false;
}
/**@type {Worker} */
let worker = null;
/**
 *
 * @param {string} id
 * @param {string} label
 * @param {string|null} token
 * @param {{setListening:(value:boolean)=> void, setSpeaking:(value:boolean)=> void, setOnline:(value:boolean)=>void }} actions
 * @returns {Promise<Worker>}
 */
export async function startWebsocketWorker(id, label, token, actions) {
  await setupAudio();
  return new Promise((resolve, reject) => {
    try {
      processorNode = audioContext.createScriptProcessor(4096, 1, 1);
      processorNode.onaudioprocess = ({ inputBuffer }) => {
        const buffers = [];
        for (let i = 0; i < inputBuffer.numberOfChannels; i++) {
          buffers[i] = inputBuffer.getChannelData(i);
        }
        worker.postMessage({ cmd: WorkerInCmd.LISTEN, buffers });
      };
      sourceNode.connect(processorNode);
      worker = new Worker(new URL("./websocket-worker.js", import.meta.url), {
        name: "habassistant-worker",
        type: "module",
      });
      worker.onmessage = (ev) => {
        console.debug("worker => main thread:", ev.data);
        switch (ev.data.cmd) {
          case WorkerOutCmd.INITIALIZED:
            actions.setOnline(true);
            break;
          case WorkerOutCmd.OFFLINE:
            actions.setOnline(false);
            actions.setListening(false);
            try {
              processorNode.disconnect(audioContext.destination);
            } catch (error) {
              // ignore this error
            }
            break;
          case WorkerOutCmd.SPEAK:
            setupSpeaker(actions.setSpeaking);
            audioCache.writeAudioData(ev.data.buffer);
            break;
          case WorkerOutCmd.START_LISTENING:
            actions.setListening(true);
            audioContext
              .resume()
              .then(() => setupAudio())
              .then(() => {
                processorNode.connect(audioContext.destination);
              })
              .catch((err) => console.error(err));
            break;
          case WorkerOutCmd.STOP_LISTENING:
            actions.setListening(false);
            // disconnect source with processor node
            try {
              processorNode.disconnect(audioContext.destination);
            } catch (ignored) {
              // ignore the error
            }
            break;
        }
      };
      worker.onerror = (err) => {
        console.error(err);
        reject(err);
      };
      worker.postMessage({
        cmd: WorkerInCmd.INITIALIZE,
        id,
        label,
        token,
        sampleRate: audioContext.sampleRate,
      });
      resolve(worker);
    } catch (error) {
      reject(error);
    }
  });
}
