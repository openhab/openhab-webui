/*
 * Preloaded via NODE_OPTIONS for the quasar build to keep the legacy toolchain working on current Node.js.
 *
 * Vue 2.5 (loaded by quasar-cli) uses a native MessageChannel for nextTick if available (global since Node 15),
 * which leaves an open port behind and prevents the build process from exiting.
 */
delete globalThis.MessageChannel
