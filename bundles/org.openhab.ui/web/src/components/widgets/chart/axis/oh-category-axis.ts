import dayjs, { type Dayjs } from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import LocaleData from 'dayjs/plugin/localeData'
import ComponentId from '../../component-id'
import type { AxisComponent, OhCategoryAxisOption } from '../types'
import { ChartType, OhCategoryAxis } from '@/types/components/widgets'
import { OhCategoryAxisDefinition } from '@/assets/definitions/widgets/chart'
import { chartTypeLongerThanAYear, mapChartTypeToYears } from '@/components/widgets/chart/util/time.ts'

dayjs.extend(LocalizedFormat)
dayjs.extend(LocaleData)

const months = {
  short: [...dayjs.localeData().monthsShort()],
  default: [...dayjs.localeData().months()]
}

const weekdays = {
  min: [...dayjs.localeData().weekdaysMin()],
  short: [...dayjs.localeData().weekdaysShort()],
  default: [...dayjs.localeData().weekdays()]
}

/**
 * Returns the axis data and optionally a default name for the axis based on the category type.
 *
 * @param config the component configuration
 * @param startTime the start time of the chart
 * @param endTime the end time of the chart
 * @param chartType the chart type
 * @returns axis name and axis data
 */
export function getCategoryAxisData(config: OhCategoryAxis.Config, startTime: Dayjs, endTime: Dayjs, chartType?: ChartType) {
  const data: string[] = []
  let name: string | undefined = undefined

  switch (config.categoryType) {
    case OhCategoryAxis.CategoryType.hour:
      if (!config.name) name = 'min'
      for (let i = 0; i < 60; i++) {
        data.push(i.toString())
      }
      break
    case OhCategoryAxis.CategoryType.day:
      if (!config.name) name = 'h'
      for (let i = 0; i < 24; i++) {
        data.push(i.toString())
      }
      break
    case OhCategoryAxis.CategoryType.week:
      if (!config.name) name = 'day'
      const axisWeekdays = weekdays[config.weekdayFormat] || weekdays.default
      data.push(...axisWeekdays)
      // Determine first day-of-week: Monday if chartType is isoWeek, locale dependent otherwise
      let firstDay = dayjs.localeData().firstDayOfWeek()
      if (chartType === ChartType.isoWeek) firstDay = 1
      if (firstDay !== 0) {
        for (let i = 0; i < firstDay; i++) data.push(data.shift()!)
      }
      break
    case OhCategoryAxis.CategoryType.month:
      if (!config.name) name = 'day'
      const daysInMonth = dayjs(startTime).daysInMonth()
      for (let i = 1; i <= daysInMonth; i++) {
        data.push(i.toString())
      }
      break
    case OhCategoryAxis.CategoryType.year:
      if (!config.name) name = 'month'
      const axisMonths = months[config.monthFormat] || months.default
      if (chartType && chartTypeLongerThanAYear(chartType)) {
        let year = startTime.year()
        for (let i = 0; i < mapChartTypeToYears(chartType); i++) {
          data.push(...axisMonths.map((m) => `${m} ${year}`))
          year++
        }
      } else {
        data.push(...axisMonths)
      }
      break
    case OhCategoryAxis.CategoryType.years:
      if (!config.name) name = 'year'
      for (let year = startTime.year(); year < endTime.year(); year++) {
        data.push(year.toString())
      }
      break
    case OhCategoryAxis.CategoryType.values:
      break
    default:
      const exhaustiveCheck: never = config.categoryType
      console.warn('oh-category-axis: Unknown categoryType', exhaustiveCheck)
  }

  return { data, name }
}

const categoryAxis: AxisComponent = {
  get(context, component, startTime, endTime, inverse) {
    const config = component.config as any as OhCategoryAxis.Config
    // @ts-expect-error component config's type doesn't include the required properties
    const axis = context.evaluateExpression<OhCategoryAxisOption>(ComponentId.get(component)!, component.config, OhCategoryAxisDefinition)
    axis.type = 'category'
    const chartType = context.chart.config.chartType

    const { name, data } = getCategoryAxisData(config, startTime, endTime, chartType)
    axis.name = name
    axis.data = data

    if (inverse) axis.data = axis.data.reverse()

    return axis
  }
}

export default categoryAxis
