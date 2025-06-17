// Avoid excessive console logging, make it configurable from the UI, default to INFO level
const LOG_LEVELS = ['OFF', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE']
if (!window._originalConsole) {
  window._originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
    trace: console.trace,
    time: console.time,
    timeEnd: console.timeEnd,
    timeLog: console.timeLog
  }
}
window.setLogLevel = function (level) {
  window.LOG_LEVEL = level
  localStorage.setItem('logLevel', level)

  const c = window._originalConsole
  const enabled = LOG_LEVELS.indexOf(level.toUpperCase())

  console.error = enabled >= 1 ? c.error : () => {}
  console.warn = enabled >= 2 ? c.warn : () => {}
  console.info = enabled >= 3 ? c.info : () => {}
  console.log = enabled >= 3 ? c.log : () => {} // console.log is at INFO level
  console.debug = enabled >= 4 ? c.debug : () => {}
  console.trace = enabled >= 5 ? c.trace : () => {}
  console.time = enabled >= 4 ? c.time : () => {}
  console.timeEnd = enabled >= 4 ? c.timeEnd : () => {}
  console.timeLog = enabled >= 4 ? c.timeLog : () => {}
}
// Initialize logging from localStorage
window.setLogLevel(localStorage.getItem('logLevel') || 'INFO')
