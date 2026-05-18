import dayjs, { Dayjs, type OpUnitType } from 'dayjs'
import IsoWeek from 'dayjs/plugin/isoWeek'
import DayDuration from 'dayjs/plugin/duration'
import { ChartType, type Period } from '@/types/components/widgets'

dayjs.extend(IsoWeek)
dayjs.extend(DayDuration)

/**
 * Maps a chart type to a dayjs unit.
 * @param chartType
 */
function mapChartTypeToDayJs(chartType: Exclude<ChartType, ''>): dayjs.ManipulateType {
  switch (chartType) {
    case ChartType.day:
      return 'day'
    case ChartType.isoWeek:
    case ChartType.week:
      return 'week'
    case ChartType.month:
      return 'month'
    case ChartType.year:
    case ChartType.twoYears:
    case ChartType.threeYears:
    case ChartType.fiveYears:
      return 'year'
    default:
      const exhaustiveCheck: never = chartType
      return chartType as unknown as dayjs.ManipulateType
  }
}

/**
 * Whether the chart type's fixed period is longer than a year.
 * @param chartType
 */
export function chartTypeLongerThanAYear(chartType: ChartType) {
  return chartType === ChartType.twoYears || chartType === ChartType.threeYears || chartType === ChartType.fiveYears
}

/**
 * Returns the number of years represented by the given fixed-period chart type.
 * @param chartType
 */
export function mapChartTypeToYears(chartType: ChartType): number {
  switch (chartType) {
    case ChartType.year:
      return 1
    case ChartType.twoYears:
      return 2
    case ChartType.threeYears:
      return 3
    case ChartType.fiveYears:
      return 5
    default:
      return 0
  }
}

/**
 * Returns the dayjs date/time at the start of the time range of the given chart type.
 * By default, the beginning is relative to now, i.e. if today is Wednesday and `chartType` is `isoWeek`, Monday 00:00 will be returned.
 * If an optional `date` is passed, the start depends on that data, i.e. if last week's Wednesday is passed and `chartType` is `isoWeek`, last week's Monday 00:00 will be returned
 *
 * @param chartType
 * @param date
 */
export function startOf(chartType: ChartType, date?: string | number | dayjs.Dayjs | Date): Dayjs {
  const d = dayjs(date)
  if (chartType === ChartType.week) {
    return d.startOf('week')
  } else if (chartTypeLongerThanAYear(chartType)) {
    return d.startOf('year').subtract(mapChartTypeToYears(chartType) - 1, 'year')
  }
  return d.startOf(chartType as OpUnitType)
}

/**
 * Adds (`direction > 0`) or subtracts (`direction < 0`) `Math.abs(direction)` units from the given date.
 * For {@link ChartType#dynamic}, the unit depends on the `period`, else the unit depends on the `chartType`.
 *
 * @param chartType
 * @param period
 * @param date
 * @param direction
 */
export function addOrSubtractPeriod(chartType: ChartType, period: Period | null, date: dayjs.Dayjs, direction: number) {
  if (direction === 0) return date
  const fn =
    direction < 0 ? (v: number, d: dayjs.ManipulateType) => date.subtract(v, d) : (v: number, d: dayjs.ManipulateType) => date.add(v, d)
  const absDirection = Math.abs(direction)
  // Handle full direction units
  for (let i = 0; i < Math.floor(absDirection); i++) {
    if (chartType !== ChartType.dynamic) {
      date = fn(chartTypeLongerThanAYear(chartType) ? mapChartTypeToYears(chartType) : 1, mapChartTypeToDayJs(chartType))
    } else {
      if (!period) throw new Error('Period is required for dynamic chart types')
      const span = period.match(/^([\d]*)([smhdDwWMQyY])$/)
      if (span && span[2]) {
        date = fn(parseInt(span[1]) || 1, span[2].replace(/[DWY]/, (x) => x.toLowerCase()) as unknown as dayjs.ManipulateType)
      }
    }
  }
  // Handle fractional direction
  const fraction = absDirection % 1
  if (fraction > 0) {
    let nextFullUnit = null
    if (chartType !== ChartType.dynamic) {
      nextFullUnit = fn(chartTypeLongerThanAYear(chartType) ? mapChartTypeToYears(chartType) : 1, mapChartTypeToDayJs(chartType))
    } else {
      if (!period) throw new Error('Period is required for dynamic chart types')
      const span = period.match(/^([\d]*)([smhdDwWMQyY])$/)
      if (span && span[2]) {
        nextFullUnit = fn(parseInt(span[1]) || 1, span[2].replace(/[DWY]/, (x) => x.toLowerCase()) as unknown as dayjs.ManipulateType)
      }
    }
    if (!nextFullUnit) return date
    const diff = nextFullUnit.diff(date)
    date = date.add(diff * fraction, 'ms')
  }

  return date
}
