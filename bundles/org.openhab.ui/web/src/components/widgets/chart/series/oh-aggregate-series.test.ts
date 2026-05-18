import { describe, it, expect } from 'vitest'
import dayjs from 'dayjs'
import IsoWeek from 'dayjs/plugin/isoWeek'
import Weekday from 'dayjs/plugin/weekday'
import { dimensionFromDate } from './oh-aggregate-series'
import { ChartType, OhAggregateSeries } from '@/types/components/widgets'

dayjs.extend(IsoWeek)
dayjs.extend(Weekday)

describe('dimensionFromDate', () => {
  const startTime = dayjs('2023-01-01')
  const endTime = dayjs('2025-12-31')
  const chartType = ChartType.month

  describe('Basic Time Dimensions', () => {
    it.each([
      { dim: OhAggregateSeries.Dimension.minute, time: '2025-10-23 10:15:00', invert: false, expected: 15 },
      { dim: OhAggregateSeries.Dimension.minute, time: '2025-10-23 10:15:00', invert: true, expected: 44 }, // 59 - 15
      { dim: OhAggregateSeries.Dimension.hour, time: '2025-10-23 10:15:00', invert: false, expected: 10 },
      { dim: OhAggregateSeries.Dimension.hour, time: '2025-10-23 10:15:00', invert: true, expected: 13 } // 23 - 10
    ])('should handle $dim (invert: $invert)', ({ dim, time, invert, expected }) => {
      const d = dayjs(time)
      expect(dimensionFromDate(chartType, startTime, endTime, d, dim, invert)).toBe(expected)
    })
  })

  describe('Weekday Dimensions', () => {
    const startTime = dayjs('2025-10-19') // Sunday
    const endTime = dayjs('2025-10-26') // Sunday
    const chartType = ChartType.month

    describe('Dimension.weekday (locale-aware)', () => {
      it('should return 0 for Sunday in default (en) locale', () => {
        const d = dayjs('2025-10-19')
        expect(dimensionFromDate(chartType, startTime, endTime, d, OhAggregateSeries.Dimension.weekday)).toBe(0)
      })

      it('should return 6 for Sunday in German (de) locale', async () => {
        const originalLocale = dayjs.locale()
        try {
          await import('dayjs/locale/de')
          dayjs.locale('de')
          const d = dayjs('2025-10-19') // Sunday
          expect(dimensionFromDate(chartType, startTime, endTime, d, OhAggregateSeries.Dimension.weekday)).toBe(6)
        } finally {
          dayjs.locale(originalLocale)
        }
      })
    })

    describe('Dimension.isoWeekday (always 0=Mon, 6=Sun)', () => {
      it.each([
        { day: 'Monday', date: '2025-10-20', invert: false, expected: 0 }, // iso (1) - 1
        { day: 'Monday', date: '2025-10-20', invert: true, expected: 6 }, // 7 - iso (1)
        { day: 'Sunday', date: '2025-10-26', invert: false, expected: 6 }, // iso (7) - 1
        { day: 'Sunday', date: '2025-10-26', invert: true, expected: 0 } // 7 - iso (7)
      ])('should handle $day (invert: $invert)', ({ date, invert, expected }) => {
        const d = dayjs(date)
        expect(dimensionFromDate(chartType, startTime, endTime, d, OhAggregateSeries.Dimension.isoWeekday, invert)).toBe(expected)
      })
    })
  })

  describe('Date Dimension (Day of Month)', () => {
    it('should handle date index (0-based)', () => {
      const d = dayjs('2025-10-23')
      expect(dimensionFromDate(chartType, startTime, endTime, d, OhAggregateSeries.Dimension.date)).toBe(22)
    })

    it('should handle inverted date based on days in specific month', () => {
      const febNonLeap = dayjs('2023-02-01') // 28 days
      // invert ? 28 - 1 : 1 - 1
      expect(dimensionFromDate(chartType, startTime, endTime, febNonLeap, OhAggregateSeries.Dimension.date, true)).toBe(27)
    })
  })

  describe('Month Dimension (Standard vs Multi-year)', () => {
    const start = dayjs('2024-01-01')
    const end = dayjs('2025-12-31')
    const target = dayjs('2025-04-01') // 15 months after start / 8 months before end

    it('should handle simple month (0-11) when chart is short', () => {
      const d = dayjs('2025-10-23')
      expect(dimensionFromDate(ChartType.month, startTime, endTime, d, OhAggregateSeries.Dimension.month)).toBe(9)
    })

    it('should calculate continuous month index for multi-year charts', () => {
      const result = dimensionFromDate(ChartType.twoYears, start, endTime, target, OhAggregateSeries.Dimension.month)
      expect(result).toBe(15)
    })

    it('should calculate continuous month index for multi-year charts (inverted)', () => {
      const start = dayjs('2024-01-01')
      const target = dayjs('2025-04-01') // 15 months after start (index 15)

      const result = dimensionFromDate(ChartType.twoYears, start, endTime, target, OhAggregateSeries.Dimension.month, true)
      expect(result).toBe(8)
    })
  })

  describe('Year Dimension', () => {
    it('should calculate year index relative to startTime', () => {
      const start = dayjs('2020-01-01')
      const target = dayjs('2023-01-01')

      const result = dimensionFromDate(chartType, start, endTime, target, OhAggregateSeries.Dimension.year)
      expect(result).toBe(3)
    })
  })
})
