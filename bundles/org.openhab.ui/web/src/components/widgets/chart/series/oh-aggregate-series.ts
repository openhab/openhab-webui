import dayjs, { type Dayjs } from 'dayjs'
import IsoWeek from 'dayjs/plugin/isoWeek'
import Weekday from 'dayjs/plugin/weekday'
import ComponentId from '../../component-id'
import aggregate from '../util/aggregators'
import type { OhAggregateSeriesOption, SeriesComponent } from '../types.ts'
import { AggregationFunction, ChartType, OhAggregateSeries } from '@/types/components/widgets'
import { type ScatterSeriesOption } from 'echarts'
import { f7 } from 'framework7-vue'
import { OhAggregateSeriesDefinition } from '@/assets/definitions/widgets/chart'
import { chartTypeLongerThanAYear, mapChartTypeToYears } from '@/components/widgets/chart/util/time.ts'

dayjs.extend(IsoWeek)
dayjs.extend(Weekday)

export function dimensionFromDate(
  chartType: ChartType,
  startTime: Dayjs,
  endTime: Dayjs,
  d: Dayjs,
  dimension?: OhAggregateSeries.Dimension,
  invert?: boolean
): number | Date {
  if (!dimension) return d.toDate()
  const dWithWeekday = d as Dayjs & { weekday(): number }
  switch (dimension) {
    case OhAggregateSeries.Dimension.minute:
      return invert ? 59 - d.minute() : d.minute()
    case OhAggregateSeries.Dimension.hour:
      return invert ? 23 - d.hour() : d.hour()
    case OhAggregateSeries.Dimension.weekday:
      return invert ? 6 - dWithWeekday.weekday() : dWithWeekday.weekday()
    case OhAggregateSeries.Dimension.isoWeekday:
      return invert ? 7 - d.isoWeekday() : d.isoWeekday() - 1
    case OhAggregateSeries.Dimension.date:
      const daysInMonth = d.daysInMonth()
      return invert ? daysInMonth - d.date() : d.date() - 1
    case OhAggregateSeries.Dimension.month:
      if (chartTypeLongerThanAYear(chartType)) {
        const startYear = startTime.year()
        const index = (d.year() - startYear) * 12 + d.month()
        const length = mapChartTypeToYears(chartType) * 12
        return invert ? length - index - 1 : index
      }
      return invert ? 11 - d.month() : d.month()
    case OhAggregateSeries.Dimension.year:
      const length = endTime.year() - startTime.year() - 1
      const index = d.year() - startTime.year()
      return invert ? length - index : index
    default:
      const exhaustiveCheck: never = dimension
      return d.toDate()
  }
}

function includeBoundaryAndItemStateFor(config: OhAggregateSeries.Config) {
  return config.aggregationFunction === OhAggregateSeries.AggregationFunction.diffLast ? true : null
}

/**
 * Returns a reasonable default dimension for the given chart type.
 * @param chartType
 */
function defaultDimension(chartType: ChartType) {
  switch (chartType) {
    case ChartType.dynamic:
      return undefined
    case ChartType.day:
      return OhAggregateSeries.Dimension.hour
    case ChartType.week:
      return OhAggregateSeries.Dimension.weekday
    case ChartType.isoWeek:
      return OhAggregateSeries.Dimension.isoWeekday
    case ChartType.month:
      return OhAggregateSeries.Dimension.date
    case ChartType.year:
      return OhAggregateSeries.Dimension.month
    case ChartType.twoYears:
    case ChartType.threeYears:
    case ChartType.fiveYears:
      return OhAggregateSeries.Dimension.year
    default:
      const exhaustiveCheck: never = chartType
  }
}

const aggregateSeries: SeriesComponent = {
  neededItems(context, component) {
    if (!component || !component.config || !component.config.item) return []
    const series = context.evaluateExpression<OhAggregateSeriesOption>(
      ComponentId.get(component)!,
      component.config,
      OhAggregateSeriesDefinition
    )
    return series.item ? [series.item] : []
  },
  includeBoundary(_context, component) {
    return includeBoundaryAndItemStateFor(component.config)
  },
  includeItemState(_context, component) {
    return includeBoundaryAndItemStateFor(component.config)
  },
  adjustedStartTime(context, component, startTime) {
    if (
      component.config.aggregationFunction !== AggregationFunction.diffLast &&
      component.config.aggregationFunction !== AggregationFunction.diffFirst
    ) {
      return startTime
    }

    const chartType = context.chart.config.chartType
    let dimension1 = component.config.dimension1 as OhAggregateSeries.Dimension | undefined
    if (!dimension1 && chartType) {
      dimension1 = defaultDimension(chartType)
    }
    if (!dimension1) {
      dimension1 = chartType as unknown as OhAggregateSeries.Dimension
    }
    const dimension2 = component.config.dimension2 as OhAggregateSeries.Dimension | undefined
    let groupStart: OhAggregateSeries.Dimension | 'day' = dimension2 || dimension1
    if (groupStart === OhAggregateSeries.Dimension.weekday || groupStart === OhAggregateSeries.Dimension.isoWeekday || !groupStart) {
      groupStart = 'day'
    }

    return dayjs(startTime).subtract(1, groupStart as dayjs.ManipulateType)
  },
  get(context, component, points, startTime, endTime) {
    const series = context.evaluateExpression<OhAggregateSeriesOption>(
      ComponentId.get(component)!,
      component.config,
      OhAggregateSeriesDefinition
    )

    const chartType = context.chart.config.chartType
    let dimension1 = series.dimension1
    if (!dimension1 && chartType) {
      dimension1 = defaultDimension(chartType)
    }
    if (!dimension1) {
      console.warn('oh-aggregate-series: no dimension1 set, falling back to chartType', chartType)
      dimension1 = chartType as unknown as OhAggregateSeries.Dimension
    }

    const dimension2 = series.dimension2
    const boundary = includeBoundaryAndItemStateFor(component.config)

    const itemSeries = points.find((p) => p.name === series.item)
    const itemPoints = itemSeries?.data ?? []

    // we'll suppose dimension2 always more granular than dimension1
    // e.g. if dimension1=day, dimension2 can be hour but not month
    let groupStart: OhAggregateSeries.Dimension | 'day' = dimension2 || dimension1
    if (groupStart === OhAggregateSeries.Dimension.weekday || groupStart === OhAggregateSeries.Dimension.isoWeekday) groupStart = 'day'

    if (boundary && itemPoints.length) {
      const stime = dayjs(itemPoints[0].time)
      const start = stime.startOf(groupStart)
      if (!stime.isSame(start)) {
        itemPoints.unshift({ time: start.valueOf(), state: NaN.toString() })
      }
      const etime = dayjs(itemPoints[itemPoints.length - 1].time)
      if (etime.isSame(etime.endOf(groupStart))) {
        itemPoints.splice(-1, 1)
      }
    }

    type Group = [Dayjs, string[]]
    const groups: Group[] = itemPoints.reduce((acc: Group[], p) => {
      const start = dayjs(p.time).startOf(groupStart)
      if (acc.length && acc[acc.length - 1][0].isSame(start)) {
        acc[acc.length - 1][1].push(p.state)
      } else {
        acc.push([start, [p.state]])
      }
      return acc
    }, [])

    console.debug('oh-aggregate-series: groups', groups)

    const formatter = new Intl.NumberFormat('en', { useGrouping: false, maximumFractionDigits: 3 })
    const data = groups
      .map((arr, idx, groups) => {
        const aggregationFunction = series.aggregationFunction || AggregationFunction.average
        let value: number = aggregate(aggregationFunction, arr, idx, groups)
        if (value.toFixed) value = parseFloat(value.toFixed(3))
        if (dimension2) {
          const axisX = series.transpose ? dimension2 : dimension1
          const axisY = series.transpose ? dimension1 : dimension2
          return [
            dimensionFromDate(chartType, startTime, endTime, arr[0], axisX),
            dimensionFromDate(chartType, startTime, endTime, arr[0], axisY, true),
            formatter.format(value)
          ]
        } else {
          if (series.transpose) {
            return [formatter.format(value), dimensionFromDate(chartType, startTime, endTime, arr[0], dimension1, true)]
          } else {
            return [dimensionFromDate(chartType, startTime, endTime, arr[0], dimension1), formatter.format(value)]
          }
        }
      })
      .filter((_d, idx) => !groups[idx][0].isBefore(startTime))

    if (!series.type) (series.type as unknown as string) = OhAggregateSeries.Type.heatmap

    if (series.type === OhAggregateSeries.Type.scatter) {
      const scatterSeries = series as ScatterSeriesOption & { scatterSymbolSizeFactor?: number }
      scatterSeries.symbolSize = (v: number[]) => {
        return v.pop()! * (scatterSeries.scatterSymbolSizeFactor ?? 1)
      }
    }

    if (series.item) {
      series.id = `oh-aggregate-series#${series.item}#${itemSeries?.unit ?? ''}#${f7.utils.id()}`
    }

    series.data = data

    return series
  }
}

export default aggregateSeries
