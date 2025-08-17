import Framework7 from 'framework7'
import dayjs from 'dayjs'

import ComponentId from '@/components/widgets/component-id'
import MarkArea from './oh-mark-area'
import applyMarkers from '@/components/widgets/chart/series/markers'

export default {
  neededItems (component, chart) {
    let markAreaItems = []
    if (component.slots && component.slots.markArea) {
      markAreaItems = component.slots.markArea.map((a, i) =>
        chart.evaluateExpression(ComponentId.get(component) + '.mitem' + i, a.config.item)
      )
    }
    let series = chart.evaluateExpression(ComponentId.get(component), component.config)
    return [
      series.item,
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

    applyMarkers(series)

    if (!series.showSymbol) series.showSymbol = false
    if (!series.tooltip) {
      series.tooltip = { show: true }
    }

    return series
  }
}
