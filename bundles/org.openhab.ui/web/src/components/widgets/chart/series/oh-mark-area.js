import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import ComponentId from '../../component-id'
dayjs.extend(LocalizedFormat)

export default {
  get (component, points, startTime, endTime, chart) {
    let markArea = chart.evaluateExpression(ComponentId.get(component), component.config)
    const itemPoints = points.find(p => p.name === markArea.item).data
    markArea.data = []
    let rollingState = null
    let currentArea = null
    itemPoints.forEach((p) => {
      if ((p.state === 'ON' && rollingState !== 'ON') || (p.state === 'OPEN' && rollingState !== 'OPEN')) {
        currentArea = [{ name: markArea.name, xAxis: new Date(p.time) }]
      } else if (((p.state !== 'ON' && rollingState === 'ON') || (p.state !== 'OPEN' && rollingState === 'OPEN')) && currentArea) {
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
