import * as dayjs from 'dayjs'
import aggregate from './aggregators'
import ComponentId from '../../component-id'

export default {
  neededItems (component) {
    if (!component || !component.config || !component.config.item) return []
    return [component.config.item]
  },
  get (component, points, startTime, endTime, chart, chartWidget) {
    const itemPoints = points.find(p => p.name === component.config.item).data
    const groups = itemPoints.reduce((acc, p) => {
      let day = dayjs(p.time).startOf('day')
      if (acc.length && acc[acc.length - 1][0].isSame(day)) {
        acc[acc.length - 1][1].push(p.state)
      } else {
        acc.push([day, [p.state]])
      }
      return acc
    }, [])

    console.debug(groups)

    const formatter = new Intl.NumberFormat('en', { useGrouping: false, maximumFractionDigits: 3 })
    const data = groups.map((arr, idx, days) => {
      const aggregationFunction = component.config.aggregationFunction || 'average'
      let value = aggregate(aggregationFunction, arr, idx, days)
      return [arr[0].toDate(), parseFloat(formatter.format(value))]
    })

    let series = chartWidget.evaluateExpression(ComponentId.get(component), component.config)
    if (!series.type) series.type = 'heatmap'
    series.coordinateSystem = 'calendar'

    if (series.type === 'scatter') {
      const symbolSizeFactor = component.config.scatterSymbolSizeFactor || 1
      series.symbolSize = (v) => {
        return v.pop() * symbolSizeFactor
      }
    }

    series.data = data

    // other things
    return series
  }
}
