import MarkArea from './oh-mark-area'

export default {
  neededItems (component) {
    const seriesItem = (!component || !component.config || !component.config.item) ? [] : component.config.item
    let markAreaItems = []
    if (component.slots && component.slots.markArea) {
      markAreaItems = component.slots.markArea.map(a => a.config.item)
    }
    return [
      seriesItem,
      ...markAreaItems
    ]
  },
  get (component, points, startTime, endTime, chart) {
    const itemPoints = points.find(p => p.name === component.config.item).data

    const data = itemPoints.map((p) => {
      return [new Date(p.time), p.state]
    })

    let series = Object.assign({}, component.config)
    series.data = data

    // other things
    if (component.slots && component.slots.markArea) {
      series.markArea = MarkArea.get(component.slots.markArea[0], points)
    }

    return series
  }
}
