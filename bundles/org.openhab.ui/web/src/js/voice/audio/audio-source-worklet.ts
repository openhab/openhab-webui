/**
 * The class {@link AudioSourceWorklet}, is an {@link AudioWorkletProcessor} implementation that sends the incoming audio data through a {@link MessagePort}.
 */
class AudioSourceWorklet extends AudioWorkletProcessor {
  process(inputs: Float32Array[][]) {
    if (inputs[0]!.length) {
      // only supports one channel
      // TODO: Merge channels instead of stripping
      this.port.postMessage(new Float32Array(inputs[0]![0]!))
    }
    return true
  }
}

registerProcessor('audio-source-worklet', AudioSourceWorklet)
