import * as dayjs from 'dayjs'
import IsoWeek from 'dayjs/plugin/isoWeek'
dayjs.extend(IsoWeek)
import aggregate from './aggregators'
import ComponentId from '../../component-id'

function dimensionFromDate (d, dimension, invert) {
  switch (dimension) {
    case 'minute': return (invert) ? 59 - d.minute() : d.minute()
    case 'hour': return (invert) ? 23 - d.hour() : d.hour()
    case 'weekday': return (invert) ? 6 - d.day() : d.day()
    case 'isoWeekday': return (invert) ? 7 - d.isoWeekday() : d.isoWeekday() - 1
    case 'date': return (invert) ? 31 - d.date() : d.date() - 1
    case 'month': return (invert) ? 11 - d.month() : d.month()
    default: return d
  }
}

function includeBoundaryFor (component) {
  return (!component || !component.config || component.config.aggregationFunction !== 'diff_last') ? undefined : true
}

export default {
  neededItems (component, chart) {
    if (!component || !component.config || !component.config.item) return []
    let series = chart.evaluateExpression(ComponentId.get(component), component.config)
    return [series.item]
  },
  includeBoundary (component) {
    return includeBoundaryFor(component)
  },
  get (component, points, startTime, endTime, chart) {
    let series = chart.evaluateExpression(ComponentId.get(component), component.config)
    let dimension1 = series.dimension1
    let dimension2 = series.dimension2
    let boundary = includeBoundaryFor(component)

    const itemPoints = points.find(p => p.name === series.item).data
    const groups = itemPoints.reduce((acc, p) => {
      // we'll suppose dimension2 always more granular than dimension1
      // e.g. if dimension1=day, dimension2 can be hour but not month
      let groupStart = dimension2 || dimension1
      if (groupStart === 'weekday' || groupStart === 'isoWeekday') groupStart = 'day'
      let pTime = dayjs(p.time)
      let start = pTime.startOf(groupStart)
      if (acc.length && acc[acc.length - 1][0].isSame(start)) {
        acc[acc.length - 1][1].push(p.state)
      } else {
        acc.push([start, [p.state]])
        if (acc.length === 1 && boundary && !pTime.isSame(start)) {
          acc[0][1].unshift(NaN)
        }
      }
      return acc
    }, [])

    console.debug(groups)

    const formatter = new Intl.NumberFormat('en', { useGrouping: false, maximumFractionDigits: 3 })
    const data = groups.map((arr, idx, groups) => {
      const aggregationFunction = series.aggregationFunction || 'average'
      let value = aggregate(aggregationFunction, arr, idx, groups)
      if (value.toFixed) value = value.toFixed(3)
      if (dimension2) {
        const axisX = (series.transpose) ? dimension2 : dimension1
        const axisY = (series.transpose) ? dimension1 : dimension2
        return [dimensionFromDate(arr[0], axisX), dimensionFromDate(arr[0], axisY, true), formatter.format(value)]
      } else {
        if (series.transpose) {
          return [formatter.format(value), dimensionFromDate(arr[0], dimension1, true)]
        } else {
          return [dimensionFromDate(arr[0], dimension1), formatter.format(value)]
        }
      }
    })

    if (!series.type) series.type = 'heatmap'

    if (series.type === 'scatter') {
      const symbolSizeFactor = series.scatterSymbolSizeFactor || 1
      series.symbolSize = (v) => {
        return v.pop() * symbolSizeFactor
      }
    }

    series.data = data

    // other things
    return series
  }
}
