import ComponentId from '../../component-id'

const presetPalettes = {
  'greenred': ['#50a3ba', '#eac736', '#d94e5d'],
  'whiteblue': ['#ffffff', '#4c9ffb'],
  'bluered': ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
}

export default {
  get (component, startTime, endTime, chart, device) {
    let options = chart.evaluateExpression(ComponentId.get(component), component.config)
    if (options.presetPalette && (!options.inRange || !options.inRange.color)) {
      if (presetPalettes[options.presetPalette]) {
        if (!options.inRange) options.inRange = {}
        options.inRange.color = presetPalettes[options.presetPalette]
      }
    }
    if (options.min !== undefined) {
      options.min = parseFloat(options.min)
    } else if (chart.series && chart.series[0]) {
      options.min = Math.min(...chart.series[0].data.map((p) => p[p.length - 1]))
    }
    if (options.max !== undefined) {
      options.max = parseFloat(options.max)
    } else if (chart.series && chart.series[0]) {
      options.max = Math.max(...chart.series[0].data.map((p) => p[p.length - 1]))
    }
    return options
  }
}
