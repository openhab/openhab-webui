import dayjs, { Dayjs, type OpUnitType } from 'dayjs'
import IsoWeek from 'dayjs/plugin/isoWeek'
import DayDuration from 'dayjs/plugin/duration'
import { ChartType, Period } from '@/types/components/widgets'

dayjs.extend(IsoWeek)
dayjs.extend(DayDuration)

/**
 * Returns the dayjs date/time at the start of the time range of the given chart type.
 * By default, the beginning is relative to now, i.e. if today is Wednesday and `chartType` is `isoWeek`, Monday 00:00 will be returned.
 * If an optional `date` is passed, the start depends on that data, i.e. if last week's Wednesday is passed and `chartType` is `isoWeek`, last week's Monday 00:00 will be returned
 *
 * @param chartType
 * @param date
 */
export function startOf(chartType: ChartType, date?: string | number | dayjs.Dayjs | Date): Dayjs {
  if (chartType === ChartType.week) {
    // Week starting on Sunday & passed-in date is on Sunday: pass through to avoid shifting back by one week
    if (date && dayjs(date).day() === 0) return dayjs(date)
    // Week starting on Sunday
    return dayjs(date).startOf(chartType).subtract(1, 'day')
  }
  if (chartType === ChartType.isoWeek) {
    // Week starting on Monday
    return dayjs(date).startOf('week')
  }
  return dayjs(date).startOf(chartType as OpUnitType)
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
export function addOrSubtractPeriod(chartType: ChartType, period: Period, date: dayjs.Dayjs, direction: number) {
  if (direction === 0) return date
  const fn =
    direction < 0 ? (v: number, d: dayjs.ManipulateType) => date.subtract(v, d) : (v: number, d: dayjs.ManipulateType) => date.add(v, d)
  const absDirection = Math.abs(direction)
  // Handle full direction units
  for (let i = 0; i < Math.floor(absDirection); i++) {
    if (chartType !== ChartType.dynamic) {
      date = fn(1, chartType === ChartType.isoWeek ? ChartType.week : chartType)
    } else {
      const span = period.match(/^([\d]*)([smhdDwWMQyY])$/)!
      if (span) {
        date = fn(parseInt(span[1]!) || 1, span[2]!.replace(/[DWY]/, (x) => x.toLowerCase()) as unknown as dayjs.ManipulateType)
      }
    }
  }
  // Handle fractional direction
  const fraction = absDirection % 1
  if (fraction > 0) {
    const unit =
      chartType !== ChartType.dynamic
        ? chartType === ChartType.isoWeek
          ? ChartType.week
          : chartType
        : (period.match(/[smhdDwWMQyY]$/)![0].toLowerCase() as unknown as dayjs.ManipulateType)
    const nextFullUnit = fn(1, unit)
    const diff = nextFullUnit.diff(date)
    date = date.add(diff * fraction, 'ms')
  }

  return date
}
