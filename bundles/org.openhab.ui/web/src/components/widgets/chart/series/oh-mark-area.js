export default {
  get (component, points) {
    const itemPoints = points.find(p => p.name === component.config.item).data
    let markArea = Object.assign({}, component.config)
    markArea.data = []
    let rollingState = null
    let currentArea = null
    itemPoints.forEach((p) => {
      if (p.state === 'ON' && rollingState !== 'ON') {
        currentArea = [ { xAxis: new Date(p.time) } ]
      } else if (p.state !== 'ON' && rollingState === 'ON' && currentArea) {
        currentArea.push({ xAxis: new Date(p.time) })
        markArea.data.push(currentArea)
        currentArea = null
      }
      rollingState = p.state
    })

    return markArea
  }
}
