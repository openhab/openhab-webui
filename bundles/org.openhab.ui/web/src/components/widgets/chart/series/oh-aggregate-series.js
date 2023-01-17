import * as dayjs from 'dayjs'
import IsoWeek from 'dayjs/plugin/isoWeek'
dayjs.extend(IsoWeek)
import aggregate from './aggregators'

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
  neededItems (component) {
    if (!component || !component.config || !component.config.item) return []
    return [component.config.item]
  },
  includeBoundary (component) {
    return includeBoundaryFor(component)
  },
  get (component, points, startTime, endTime, chart) {
    let dimension1 = component.config.dimension1
    let dimension2 = component.config.dimension2
    let boundary = includeBoundaryFor(component)

    // we'll suppose dimension2 always more granular than dimension1
    // e.g. if dimension1=day, dimension2 can be hour but not month
    let groupStart = dimension2 || dimension1
    if (groupStart === 'weekday' || groupStart === 'isoWeekday') groupStart = 'day'

    let itemPoints = points.find(p => p.name === component.config.item).data

    if (boundary && itemPoints.length) {
      let stime = dayjs(itemPoints[0].time)
      let start = stime.startOf(groupStart)
      if (!stime.isSame(start)) {
        itemPoints.unshift({ time: start.valueOf(), state: NaN })
      }
      let etime = dayjs(itemPoints[itemPoints.length - 1].time)
      if (etime.isSame(etime.endOf(groupStart))) {
        itemPoints.splice(-1, 1)
      }
    }

    const groups = itemPoints.reduce((acc, p) => {
      let start = dayjs(p.time).startOf(groupStart)
      if (acc.length && acc[acc.length - 1][0].isSame(start)) {
        acc[acc.length - 1][1].push(p.state)
      } else {
        acc.push([start, [p.state]])
      }
      return acc
    }, [])

    console.debug(groups)

    const formatter = new Intl.NumberFormat('en', { useGrouping: false, maximumFractionDigits: 3 })
    const data = groups.map((arr, idx, groups) => {
      const aggregationFunction = component.config.aggregationFunction || 'average'
      let value = aggregate(aggregationFunction, arr, idx, groups)
      if (value.toFixed) value = value.toFixed(3)
      if (dimension2) {
        const axisX = (component.config.transpose) ? dimension2 : dimension1
        const axisY = (component.config.transpose) ? dimension1 : dimension2
        return [dimensionFromDate(arr[0], axisX), dimensionFromDate(arr[0], axisY, true), formatter.format(value)]
      } else {
        if (component.config.transpose) {
          return [formatter.format(value), dimensionFromDate(arr[0], dimension1, true)]
        } else {
          return [dimensionFromDate(arr[0], dimension1), formatter.format(value)]
        }
      }
    })

    let series = Object.assign({}, component.config)
    if (!series.type) series.type = 'heatmap'

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
