import InlineWorker from 'inline-worker';

/**
  * Recorder class.
  */
export class Recorder {
  /**
    * Constructor.
    * @param {SourceNode} source The source node to use.
    * @param {Object} cfg A configuration object.
    */
  constructor(source, cfg) {
    this.config = {
      bufferLen: 4096,
      numChannels: 2,
      mimeType: 'audio/wav',
    };

    this.recording = false;

    this.callbacks = {
      getBuffer: [],
      exportWAV: [],
    };

    Object.assign(this.config, cfg);

    this.context = source.context;
    const contextNode = (this.context.createScriptProcessor || this.context.createJavaScriptNode);
    const contextArgs = [
      this.context,
      this.config.bufferLen,
      this.config.numChannels,
      this.config.numChannels,
    ];
    this.node = contextNode.call(...contextArgs);

    this.node.onaudioprocess = (e) => {
      if (!this.recording) {
        return;
      }

      const buffer = [];
      for (let channel = 0; channel < this.config.numChannels; channel += 1) {
        buffer.push(e.inputBuffer.getChannelData(channel));
      }
      this.worker.postMessage({
        command: 'record',
        buffer,
      });
    };

    source.connect(this.node);
    this.node.connect(this.context.destination); // this should not be necessary

    const self = this;
    const recorderWorker = function recorderWorker() {
      let recLength = 0;
      let recBuffers = [];
      let sampleRate;
      let targetSampleRate;
      let numChannels;

      /**
        * Initialize buffers.
        */
      function initBuffers() {
        for (let channel = 0; channel < numChannels; channel += 1) {
          recBuffers[channel] = [];
        }
      }

      /**
        * Initialize.
        * @param {Object} config A configuration object.
        */
      function init(config) {
        sampleRate = config.actualSampleRate;
        targetSampleRate = config.desiredSampleRate;
        numChannels = config.numChannels;
        initBuffers();
      }

      /**
        * Record to input buffer.
        * @param {Buffer} inputBuffer The input buffer to record to.
        */
      function record(inputBuffer) {
        for (let channel = 0; channel < numChannels; channel += 1) {
          recBuffers[channel].push(inputBuffer[channel]);
        }
        recLength += inputBuffer[0].length;
      }

      /**
        * Merge recording buffers.
        * @param {Buffer} rBuffers Recording buffer.
        * @param {int} rLength Length of buffer.
        */
      function mergeBuffers(rBuffers, rLength) {
        const result = new Float32Array(rLength);
        let offset = 0;
        for (let i = 0; i < rBuffers.length; i += 1) {
          result.set(rBuffers[i], offset);
          offset += rBuffers[i].length;
        }
        return result;
      }

      /**
        * Write string.
        * @param {DataView} view The data view to use.
        * @param {int} offset The offset to start from.
        * @param {String} string The string to use.
        */
      function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i += 1) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      }

      /**
        * Interleaving helper.
        * @param {Buffer} inputL Left channel input buffer.
        * @param {Buffer} inputR Right channel input buffer.
        */
      function interleave(inputL, inputR) {
        const length = inputL.length + inputR.length;
        const result = new Float32Array(length);

        let index = 0;
        let inputIndex = 0;

        while (index < length) {
          result[index += 1] = inputL[inputIndex];
          result[index += 1] = inputR[inputIndex];
          inputIndex += 1;
        }
        return result;
      }

      /**
        * Convert float to 16bit PCM.
        * @param {Buffer} output Output buffer.
        * @param {int} offset The offset to start from.
        * @param {Buffer} input The input buffer.
        */
      function floatTo16BitPCM(output, offset, input) {
        for (let i = 0; i < input.length; i += 1, offset += 2) {
          const s = Math.max(-1, Math.min(1, input[i]));
          output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
      }

      /**
        * Encode samples buffer to WAV format.
        * @param {Buffer} samples The samples buffer to use.
        */
      function encodeWAV(samples) {
        const buffer = new ArrayBuffer(44 + (samples.length * 2));
        const view = new DataView(buffer);

        /* RIFF identifier */
        writeString(view, 0, 'RIFF');
        /* RIFF chunk length */
        view.setUint32(4, 36 + (samples.length * 2), true);
        /* RIFF type */
        writeString(view, 8, 'WAVE');
        /* format chunk identifier */
        writeString(view, 12, 'fmt ');
        /* format chunk length */
        view.setUint32(16, 16, true);
        /* sample format (raw) */
        view.setUint16(20, 1, true);
        /* channel count */
        view.setUint16(22, numChannels, true);
        /* sample rate */
        view.setUint32(24, targetSampleRate, true);
        /* byte rate (sample rate * block align) */
        view.setUint32(28, targetSampleRate * 2, true);
        /* block align (channel count * bytes per sample) */
        view.setUint16(32, numChannels * 2, true);
        /* bits per sample */
        view.setUint16(34, 16, true);
        /* data chunk identifier */
        writeString(view, 36, 'data');
        /* data chunk length */
        view.setUint32(40, samples.length * 2, true);

        floatTo16BitPCM(view, 44, samples);

        return view;
      }

      function downsampleBuffer(buffer, rate) {
        if (rate == sampleRate) {
            return buffer;
        }
        if (rate > sampleRate) {
            throw "downsampling rate show be smaller than original sample rate";
        }
        var sampleRateRatio = sampleRate / rate;
        var newLength = Math.round(buffer.length / sampleRateRatio);
        var result = new Float32Array(newLength);
        var offsetResult = 0;
        var offsetBuffer = 0;
        while (offsetResult < result.length) {
            var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
            var accum = 0, count = 0;
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
        * Export to WAV format.
        * @param {DataType} type The type of the blob.
        */
      function exportWAV(type) {
        const buffers = [];
        for (let channel = 0; channel < numChannels; channel += 1) {
          buffers.push(mergeBuffers(recBuffers[channel], recLength));
        }
        let interleaved;
        if (numChannels === 2) {
          interleaved = interleave(buffers[0], buffers[1]);
        } else {
          interleaved = buffers[0];
        }
        downsampled = downsampleBuffer(interleaved, targetSampleRate)
        // debugger
        const dataview = encodeWAV(downsampled);
        const audioBlob = new Blob([dataview], {type});

        self.postMessage({command: 'exportWAV', data: audioBlob});
      }

      /**
        * Get buffer.
        */
      function getBuffer() {
        const buffers = [];
        for (let channel = 0; channel < numChannels; channel += 1) {
          buffers.push(mergeBuffers(recBuffers[channel], recLength));
        }
        self.postMessage({command: 'getBuffer', data: buffers});
      }

      /**
        * Clear the record buffers.
        */
      function clear() {
        recLength = 0;
        recBuffers = [];
        initBuffers();
      }

      self.onmessage = (e) => {
        switch (e.data.command) {
          case 'init':
            init(e.data.config);
            break;
          case 'record':
            record(e.data.buffer);
            break;
          case 'exportWAV':
            exportWAV(e.data.type);
            break;
          case 'getBuffer':
            getBuffer();
            break;
          case 'clear':
            clear();
            break;
          default:
            break;
        }
      };
    };

    this.worker = new InlineWorker(recorderWorker, {});

    this.worker.postMessage({
      command: 'init',
      config: {
        actualSampleRate: this.context.sampleRate,
        desiredSampleRate: this.config.sampleRate,
        numChannels: this.config.numChannels,
      },
    });

    this.worker.onmessage = (e) => {
      const cb = this.callbacks[e.data.command].pop();
      if (typeof cb === 'function') {
        cb(e.data.data);
      }
    };
  }

  /**
    * Begin recording.
    */
  record() {
    this.recording = true;
  }

  /**
    * Stop recording.
    */
  stop() {
    this.recording = false;
  }

  /**
    * Clear recording.
    */
  clear() {
    this.worker.postMessage({command: 'clear'});
  }

  /**
    * Get buffer.
    * @param {Function} cb Callback to run once buffers are gotten.
    */
  getBuffer(cb) {
    cb = cb || this.config.callback;
    if (!cb) {
      throw new Error('Callback not set');
    }

    this.callbacks.getBuffer.push(cb);

    this.worker.postMessage({command: 'getBuffer'});
  }

  /**
    * Export WAV file.
    * @param {Function} cb Callback to run once WAV is ready for export.
    * @param {String} mimeType MIME type to use.
    */
  exportWAV(cb, mimeType) {
    mimeType = mimeType || this.config.mimeType;
    cb = cb || this.config.callback;
    if (!cb) {
      throw new Error('Callback not set');
    }

    this.callbacks.exportWAV.push(cb);

    this.worker.postMessage({
      command: 'exportWAV',
      type: mimeType,
    });
  }

  /**
    * Force download of audio file by creating link and using its href.
    * @param {Blob} blob Audio data blob.
    * @param {String} filename File name string to use.
    */
  static forceDownload(blob, filename) {
    const url = (window.URL || window.webkitURL).createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = filename || 'output.wav';
    const click = document.createEvent('Event');
    click.initEvent('click', true, true);
    link.dispatchEvent(click);
  }
}

export default Recorder;
