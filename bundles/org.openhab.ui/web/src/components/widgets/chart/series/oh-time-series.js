import MarkArea from './oh-mark-area'

export default {
  neededItems (component) {
    const seriesItem = (!component || !component.config || !component.config.item) ? undefined : component.config.item
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
    let series = Object.assign({}, component.config)
    series.data = []

    if (component.config.item) {
      const itemPoints = points.find(p => p.name === component.config.item).data

      const formatter = new Intl.NumberFormat('en', { maximumFractionDigits: 3 })
      const data = itemPoints.map((p) => {
        return [new Date(p.time), formatter.format(p.state)]
      })

      series.data = data
    }

    // other things
    if (component.slots && component.slots.markArea) {
      series.markArea = MarkArea.get(component.slots.markArea[0], points)
    }

    if (!component.config.showSymbol) series.showSymbol = false
    if (!component.config.tooltip) {
      series.tooltip = { show: true }
    }

    return series
  }
}
