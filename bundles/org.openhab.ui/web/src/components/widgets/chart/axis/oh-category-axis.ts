import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import LocaleData from 'dayjs/plugin/localeData'
import ComponentId from '../../component-id'
import type { AxisComponent, OhCategoryAxisOption } from '../types'
import { OhCategoryAxis } from '@/types/components/widgets'
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

const categoryAxis: AxisComponent = {
  get(context, component, startTime, endTime, inverse) {
    const config = component.config as any as OhCategoryAxis.Config
    // @ts-expect-error component config's type doesn't include the required properties
    const axis = context.evaluateExpression<OhCategoryAxisOption>(ComponentId.get(component)!, component.config)
    axis.type = 'category'
    const chartType = context.chart.config.chartType

    axis.data = axis.data || []
    switch (config.categoryType) {
      case OhCategoryAxis.CategoryType.hour:
        if (!config.name) axis.name = 'min'
        for (let i = 0; i < 60; i++) {
          axis.data.push(i)
        }
        break
      case OhCategoryAxis.CategoryType.day:
        if (!config.name) axis.name = 'h'
        for (let i = 0; i < 24; i++) {
          axis.data.push(i)
        }
        break
      case OhCategoryAxis.CategoryType.week:
        if (!config.name) axis.name = 'day'
        const axisWeekdays = weekdays[config.weekdayFormat] || weekdays.default
        axis.data = [...axisWeekdays]
        if (!config.startOnSunday) {
          axis.data.push(axis.data.shift()!)
        }
        break
      case OhCategoryAxis.CategoryType.month:
        if (!config.name) axis.name = 'day'
        const daysInMonth = dayjs(startTime).daysInMonth()
        for (let i = 1; i <= daysInMonth; i++) {
          axis.data.push(i)
        }
        break
      case OhCategoryAxis.CategoryType.year:
        if (!config.name) axis.name = 'month'
        const axisMonths = months[config.monthFormat] || months.default
        if (chartTypeLongerThanAYear(chartType)) {
          let year = startTime.year()
          for (let i = 0; i < mapChartTypeToYears(chartType); i++) {
            axis.data.push(...axisMonths.map((m) => `${m} ${year}`))
            year++
          }
        } else {
          axis.data = [...axisMonths]
        }
        break
      case OhCategoryAxis.CategoryType.years:
        if (!config.name) axis.name = 'year'
        for (let year = startTime.year(); year < endTime.year(); year++) {
          axis.data.push(year)
        }
        break
      case OhCategoryAxis.CategoryType.values:
        break
      default:
        const exhaustiveCheck: never = config.categoryType
        console.warn('oh-category-axis: Unknown categoryType', exhaustiveCheck, context.chart)
    }

    if (inverse) axis.data = axis.data.reverse()

    console.log(axis)
    return axis
  }
}

export default categoryAxis
