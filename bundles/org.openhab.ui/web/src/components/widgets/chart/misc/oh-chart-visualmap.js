const presetPalettes = {
  'greenred': ['#50a3ba', '#eac736', '#d94e5d'],
  'whiteblue': ['#ffffff', '#4c9ffb'],
  'bluered': ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
}

export default {
  get (component, startTime, endTime, chart, device) {
    let options = Object.assign({}, component.config)
    if (component.config.presetPalette && (!component.config.inRange || !component.config.inRange.color)) {
      if (presetPalettes[component.config.presetPalette]) {
        if (!options.inRange) options.inRange = {}
        options.inRange.color = presetPalettes[component.config.presetPalette]
      }
    }
    options.min = parseFloat(options.min)
    options.max = parseFloat(options.max)
    return options
  }
}
