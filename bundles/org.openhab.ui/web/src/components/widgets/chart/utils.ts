import dayjs, { type ConfigType, Dayjs, type OpUnitType } from 'dayjs'
import IsoWeek from 'dayjs/plugin/isoWeek'
import DayDuration from 'dayjs/plugin/duration'
import { ChartType } from '@/types/components/widgets'

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
