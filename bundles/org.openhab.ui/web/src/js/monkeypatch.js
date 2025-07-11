// Monkey patching parseFloat to add decimal comma, parseFloat normally only supports decimal point
const originalParseFloat = parseFloat
globalThis.parseFloat = function (value) {
  if (typeof value === 'string') {
    // Replace comma with dot for decimal values
    value = value.replace(',', '.')
  }
  return originalParseFloat(value)
}
