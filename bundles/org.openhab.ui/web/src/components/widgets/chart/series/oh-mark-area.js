import ComponentId from '../../component-id'

export default {
  get (component, points, startTime, endTime, chart) {
    let markArea = chart.evaluateExpression(ComponentId.get(component), component.config)
    const states = (markArea.states && !Array.isArray(markArea.states) ? [markArea.states] : markArea.states) || ['ON', 'OPEN']
    const itemPoints = points.find((p) => p.name === markArea.item).data
    markArea.data = []
    let rollingState = null
    let currentArea = null
    itemPoints.forEach((p) => {
      if (states.findIndex((s) => s == p.state) >= 0 && states.findIndex((s) => s == rollingState) < 0) {
        currentArea = [{ name: markArea.name, xAxis: new Date(p.time) }]
      } else if ((states.findIndex((s) => s == p.state) < 0 && states.findIndex((s) => s == rollingState) >= 0) && currentArea) {
        currentArea.push({ xAxis: new Date(p.time) })
        currentArea[0].name = markArea.name || markArea.item
        currentArea[0].value = rollingState
        markArea.data.push(currentArea)
        currentArea = null
      }
      rollingState = p.state
    })
    if (currentArea) {
      currentArea.push({ xAxis: endTime.toDate() })
      currentArea[0].name = markArea.name || markArea.item
      markArea.data.push(currentArea)
      currentArea = null
    }

    if (!markArea.label) markArea.label = { show: false }

    return markArea
  }
}
