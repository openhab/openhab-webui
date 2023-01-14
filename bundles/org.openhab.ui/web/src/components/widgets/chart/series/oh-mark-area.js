import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import ComponentId from '../../component-id'
dayjs.extend(LocalizedFormat)

export default {
  get (component, points, startTime, endTime, chart) {
    let markArea = chart.evaluateExpression(ComponentId.get(component), component.config)
    const onStates = markArea.onStates || ["ON", "OPEN"]
    const itemPoints = points.find(p => p.name === markArea.item).data
    markArea.data = []
    let rollingState = null
    let currentArea = null
    itemPoints.forEach((p) => {
      if (onStates.includes(p.state) && !onStates.includes(rollingState)) {
        currentArea = [{ name: markArea.name, xAxis: new Date(p.time) }]
      } else if ((!onStates.includes(p.state) && onStates.includes(rollingState)) && currentArea) {
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
