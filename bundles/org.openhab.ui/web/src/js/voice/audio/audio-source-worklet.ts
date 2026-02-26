/**
 * Merges multiple audio channels into a single channel using Quadratic Mean/Equal Power Scaling.
 * @param input
 */
function mergeChannels(input: Float32Array[]): Float32Array {
  const channels = input.length
  const c0 = input[0]
  if (!c0) return new Float32Array(0)
  if (channels === 1) return c0
  const samples = c0.length
  const mixRatio = Math.sqrt(channels) / channels

  const output = new Float32Array(samples)

  for (let s = 0; s < samples; s++) {
    let sum = 0
    for (let c = 0; c < channels; c++) {
      sum += input[c]![s]!
    }
    output[s] = sum * mixRatio
  }
  return output
}

/**
 * The class {@link AudioSourceWorklet}, is an {@link AudioWorkletProcessor} implementation that sends the incoming audio data through a {@link MessagePort}.
 */
class AudioSourceWorklet extends AudioWorkletProcessor {
  process(inputs: Float32Array[][]) {
    const merged = mergeChannels(inputs[0]!)
    this.port.postMessage(merged, [merged.buffer])
    return true
  }
}

registerProcessor('audio-source-worklet', AudioSourceWorklet)
