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

/** Sample rate of the audio that detectors take, in Hz. */
export declare const SAMPLE_RATE: 16000

/** Number of samples per frame, 10 ms of audio. */
export declare const FRAME_SIZE: 160

/** Returned by infer() for frames that don't complete a model input. */
export declare const NO_OUTPUT: -2147483648

/** The JSON manifest of a version 2 microWakeWord model. */
export interface WakeWordManifest {
  type: 'micro'
  wake_word: string
  model: string
  version: 2
  trained_languages?: string[]
  micro: {
    probability_cutoff: number
    sliding_window_size: number
    feature_step_size?: number
    [key: string]: unknown
  }
  [key: string]: unknown
}

/**
 * Detects a wake word in one audio stream. It keeps state between frames, so feed it consecutive
 * frames of a single stream.
 */
export interface WakeWordDetector {
  /**
   * Processes the next frame. Returns true when the wake word is detected, and keeps returning
   * true while the average probability stays above the cutoff, so call reset() after a detection.
   *
   * @param frame FRAME_SIZE samples of 16 kHz mono audio
   * @throws Error when the frame is not an Int16Array of FRAME_SIZE samples
   */
  process(frame: Int16Array): boolean

  /**
   * Processes the next frame without detection, for tests. Returns the quantized model output, or
   * NO_OUTPUT when the frame didn't complete a model input.
   */
  infer(frame: Int16Array): number

  /** The average probability of the last model outputs, between 0 and 1. */
  getProbability(): number

  /**
   * Estimates how many frames were processed after the wake word ended, meant to be read right
   * after process() returned true.
   */
  getFramesAfterWakeWord(): number

  /**
   * The average probability above which this detector reports the wake word, as given. Detection
   * rounds it down to a multiple of 1/255, as ESPHome does.
   */
  getProbabilityCutoff(): number

  /** The phrase that the model detects, for example "Hey Jarvis". */
  getWakeWord(): string

  /** Clears the stream state, after a detection or before a new stream. */
  reset(): void
}

export interface MicroWakeWord {
  /**
   * Creates a detector for one audio stream.
   *
   * @param manifest the JSON manifest, as text or parsed
   * @param model the contents of the .tflite file that the manifest names
   * @param probabilityCutoff between 0 and 1; the cutoff of the manifest when omitted. Like
   *     ESPHome, a model output of 255 counts as a probability of 1.
   * @throws Error when the model is not supported
   */
  createDetector(
    manifest: string | WakeWordManifest,
    model: ArrayBuffer | ArrayBufferView,
    probabilityCutoff?: number
  ): WakeWordDetector
}

/**
 * Loads the WebAssembly module. Fetches micro-wakeword.wasm next to this file unless its location
 * or contents are given; Node.js has to pass the contents.
 */
export declare function loadMicroWakeWord(wasm?: string | URL | ArrayBuffer | ArrayBufferView): Promise<MicroWakeWord>
