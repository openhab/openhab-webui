import ComponentId from '../../component-id'
import MarkArea from './oh-mark-area'
import Framework7 from 'framework7'

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
    let serieses = []
    let series = chart.evaluateExpression(ComponentId.get(component), component.config)

    if(series.item) {
      points.map(item => {
        let series = chart.evaluateExpression(ComponentId.get(component), component.config)
        series.name = item.name
        series.item = item.name
        series.data = []

        const itemPoints = item.data

        const formatter = new Intl.NumberFormat('en', { useGrouping: false, maximumFractionDigits: 3 })
        const data = itemPoints.map((p) => {
          return [new Date(p.time), formatter.format(p.state)]
        })

        series.data = data
        series.id = `oh-time-series#${series.item}#${Framework7.utils.id()}`

        serieses.push(series)
      })
    }

    if (component.slots && component.slots.markArea) {
      series.markArea = MarkArea.get(component.slots.markArea[0], points, startTime, endTime, chart)
    }

    if (!series.showSymbol) series.showSymbol = false
    if (!series.tooltip) {
      series.tooltip = { show: true }
    }

    return serieses;
  }
}
