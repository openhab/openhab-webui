import dayjs, { type Dayjs } from 'dayjs'
import aggregate from '@/components/widgets/chart/util/aggregators'
import ComponentId from '../../component-id'
import type { OhCalendarSeriesOption, SeriesComponent } from '../types.ts'
import { OhCalendarSeries } from '@/types/components/widgets'
import { type ScatterSeriesOption } from 'echarts'
import { f7 } from 'framework7-vue'
import { OhCalendarSeriesDefinition } from '@/assets/definitions/widgets/chart'

const calendarSeries: SeriesComponent = {
  neededItems(context, component) {
    if (!component || !component.config || !component.config.item) return []
    const series = context.evaluateExpression<OhCalendarSeriesOption>(
      ComponentId.get(component)!,
      component.config,
      OhCalendarSeriesDefinition
    )
    return series.item ? [series.item] : []
  },
  get(context, component, points) {
    let series = context.evaluateExpression<OhCalendarSeriesOption>(
      ComponentId.get(component)!,
      component.config,
      OhCalendarSeriesDefinition
    )
    const itemSeries = points.find((p) => p.name === series.item)
    const itemPoints = itemSeries?.data ?? []

    type Group = [Dayjs, string[]]
    const groups: Group[] = itemPoints.reduce((acc: Group[], p) => {
      let day = dayjs(p.time).startOf('day')
      if (acc.length && acc[acc.length - 1][0].isSame(day)) {
        acc[acc.length - 1][1].push(p.state)
      } else {
        acc.push([day, [p.state]])
      }
      return acc
    }, [])

    console.debug('oh-calendar-series: groups', groups)

    const formatter = new Intl.NumberFormat('en', { useGrouping: false, maximumFractionDigits: 3 })
    const data = groups.map((arr, idx, days) => {
      const aggregationFunction = series.aggregationFunction || OhCalendarSeries.AggregationFunction.average
      let value = aggregate(aggregationFunction, arr, idx, days)
      return [arr[0].toDate(), parseFloat(formatter.format(value)), itemSeries?.unit]
    })

    if (!series.type) (series.type as unknown as string) = OhCalendarSeries.Type.heatmap
    series.coordinateSystem = 'calendar'

    if (series.type === OhCalendarSeries.Type.scatter) {
      const scatterSeries = series as ScatterSeriesOption & { scatterSymbolSizeFactor?: number }
      scatterSeries.symbolSize = (v: number[]) => {
        return v.pop()! * (scatterSeries.scatterSymbolSizeFactor ?? 1)
      }
    }

    if (series.item) {
      series.id = `oh-calendar-series#${series.item}#${f7.utils.id()}`
    }

    series.data = data

    return series
  }
}

export default calendarSeries
