# microWakeWord for browsers

[![CI](https://github.com/jvoice-project/micro-wakeword4j-wasm/actions/workflows/build.yml/badge.svg)](https://github.com/jvoice-project/micro-wakeword4j-wasm/actions/workflows/build.yml)

[micro-wakeword4j](https://github.com/jvoice-project/micro-wakeword4j) compiled to WebAssembly with [TeaVM](https://teavm.org), for wake word detection in web pages.
It runs the same code as the Java library, and its model outputs are bit-exact with the TensorFlow Lite reference kernels.

The build produces these files in `target/dist`:

| File                  | Contents                                          |
|-----------------------|---------------------------------------------------|
| `micro-wakeword.js`   | The module to import                              |
| `micro-wakeword.d.ts` | TypeScript types                                  |
| `micro-wakeword.wasm` | The library, about 75 KB compressed               |
| `teavm-runtime.js`    | The TeaVM loader that `micro-wakeword.js` imports |
| `package.json`        | npm package metadata                              |

Models are not included, load them from the [ESPHome model collection](https://github.com/esphome/micro-wake-word-models), the [models bundled with micro-wakeword4j](https://github.com/jvoice-project/micro-wakeword4j/tree/main/src/main/resources/io/github/jvoiceproject/microwakeword), or your own files.

## Usage

```js
import { loadMicroWakeWord, FRAME_SIZE } from '@jvoice-project/micro-wakeword4j'

const microWakeWord = await loadMicroWakeWord()
const [manifest, model] = await Promise.all([
  fetch('/models/hey_jarvis.json').then((response) => response.text()),
  fetch('/models/hey_jarvis.tflite').then((response) => response.arrayBuffer())
])
const detector = microWakeWord.createDetector(manifest, model)

// an Int16Array of 16 kHz mono PCM, FRAME_SIZE (160) samples per call
if (detector.process(frame)) {
  console.log(`${detector.getWakeWord()} detected`)
  detector.reset()
}
```

The detector behaves like `MicroWakeWord` in the Java library.
`createDetector` takes an optional probability cutoff as a third argument, and throws an `Error` when the model is not supported.

## Requirements

The module uses WebAssembly garbage collection and the exception handling instructions with `exnref`, which TeaVM emits:

* Chrome and Edge 137 or later
* Firefox 131 or later
* Safari 18.4 or later, on iOS and iPadOS too
* Node.js 22 or 24 with `--experimental-wasm-exnref`

Run it in a Web Worker, not in an `AudioWorkletGlobalScope`: the TeaVM loader needs `TextDecoder` and `fetch`.
The loader creates functions with `new Function`, so a Content Security Policy must allow `'unsafe-eval'`.

## Development

You need Java >= 21 and Node.js 22 or later.
The micro-wakeword4j version to compile is set by the `micro-wakeword4j.version` property in `pom.xml`.
Until it is on Maven Central, install it first with `./mvnw install` in a checkout of micro-wakeword4j.

`./mvnw verify` builds the module and runs `src/test/js/check.mjs` in Node.js.
It checks the WebAssembly build against the models, audio and reference data of the library's `tests` JAR.
Node.js has to be on the `PATH`; `-DskipTests` or `-Dmaven.test.skip` skips the check.
