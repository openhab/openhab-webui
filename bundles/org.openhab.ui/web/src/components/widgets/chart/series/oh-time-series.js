import ComponentId from '../../component-id'
import MarkArea from './oh-mark-area'
import Framework7 from 'framework7'

export default {
  neededItems (component, chart) {
    const seriesItem = (!component || !component.config || !component.config.item) ? undefined : component.config.item
    let markAreaItems = []
    if (component.slots && component.slots.markArea) {
      markAreaItems = component.slots.markArea.map(a => a.config.item)
    }
    return [
      chart.evaluateExpression(ComponentId.get(component) + '.item', seriesItem),
      ...markAreaItems
    ]
  },
  get (component, points, startTime, endTime, chart) {
    let series = chart.evaluateExpression(ComponentId.get(component), component.config)
    series.data = []

    if (series.item) {
      const itemPoints = points.find(p => p.name === series.item).data

      const formatter = new Intl.NumberFormat('en', { useGrouping: false, maximumFractionDigits: 3 })
      const data = itemPoints.map((p) => {
        return [new Date(p.time), formatter.format(p.state)]
      })

      series.data = data
      series.id = `oh-time-series#${series.item}#${Framework7.utils.id()}`
    }

    // other things
    if (component.slots && component.slots.markArea) {
      series.markArea = MarkArea.get(component.slots.markArea[0], points, startTime, endTime, chart)
    }

    if (!series.showSymbol) series.showSymbol = false
    if (!series.tooltip) {
      series.tooltip = { show: true }
    }

    return series
  }
}
