export default {
  get (component, points) {
    const itemPoints = points.find(p => p.name === component.config.item).data
    let markArea = Object.assign({}, component.config)
    markArea.data = []
    let rollingState = null
    let currentArea = null
    itemPoints.forEach((p) => {
      if (p.state === 'ON' && rollingState !== 'ON') {
        currentArea = [ { name: component.config.name, xAxis: new Date(p.time) } ]
      } else if (p.state !== 'ON' && rollingState === 'ON' && currentArea) {
        currentArea.push({ xAxis: new Date(p.time) })
        markArea.data.push(currentArea)
        currentArea = null
      }
      rollingState = p.state
    })

    if (!component.config.label) markArea.label = { show: false }

    return markArea
  }
}
