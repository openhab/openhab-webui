/*
 * Copyright (C) 2026 Contributors to micro-wakeword4j-wasm
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { load } from './teavm-runtime.js'

export const SAMPLE_RATE = 16000

export const FRAME_SIZE = 160

export const NO_OUTPUT = -2147483648

/**
 * Loads the WebAssembly module. Fetches micro-wakeword.wasm next to this file unless its location
 * or contents are given; Node.js has to pass the contents.
 *
 * @param {string | URL | ArrayBuffer | ArrayBufferView} [wasm]
 */
export async function loadMicroWakeWord(wasm = new URL('./micro-wakeword.wasm', import.meta.url)) {
  // passing bytes keeps the TeaVM loader away from its Node.js file reading
  const bytes = typeof wasm === 'string' || wasm instanceof URL ? await fetchBytes(wasm) : wasm
  const { WakeWordDetector } = (await load(bytes)).exports
  return {
    createDetector(manifest, model, probabilityCutoff) {
      return WakeWordDetector.create(
        typeof manifest === 'string' ? manifest : JSON.stringify(manifest),
        toInt8Array(model),
        probabilityCutoff ?? Number.NaN
      )
    }
  }
}

async function fetchBytes(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }
  return response.arrayBuffer()
}

function toInt8Array(model) {
  if (model instanceof Int8Array) {
    return model
  }
  if (ArrayBuffer.isView(model)) {
    return new Int8Array(model.buffer, model.byteOffset, model.byteLength)
  }
  return new Int8Array(model)
}
