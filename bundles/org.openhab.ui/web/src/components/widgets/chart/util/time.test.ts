import { describe, it, expect } from 'vitest'
import { startOf, addOrSubtractPeriod } from './time'
import { ChartType, Period } from '@/types/components/widgets'
import dayjs from 'dayjs'

describe('Time Utility Tests', () => {
  describe('startOf', () => {
    it('should return Monday 00:00 for isoWeek (standard)', () => {
      // Saturday, Feb 14, 2026
      const date = dayjs('2026-02-14')
      const result = startOf(ChartType.isoWeek, date)

      expect(result.format('YYYY-MM-DD HH:mm')).toBe('2026-02-09 00:00')
    })

    it('should return Sunday 00:00 for ChartType.week', () => {
      // Saturday, Feb 14, 2026
      const date = dayjs('2026-02-14')
      const result = startOf(ChartType.week, date)

      expect(result.format('YYYY-MM-DD HH:mm')).toBe('2026-02-08 00:00')
    })

    it('should avoid shifting back if date is already Sunday for ChartType.week', () => {
      const sunday = dayjs('2024-10-20')
      const result = startOf(ChartType.week, sunday)

      expect(result.format('YYYY-MM-DD')).toBe('2024-10-20')
    })

    it('should default to dayjs startOf for standard types like month', () => {
      const date = dayjs('2024-10-23')
      const result = startOf(ChartType.month as any, date)

      expect(result.format('YYYY-MM-DD')).toBe('2024-10-01')
    })
  })

  describe('addOrSubtractPeriod', () => {
    const mockDate = dayjs('2024-10-23T12:00:00') // A Wednesday

    it('should return the same date if direction is 0', () => {
      const result = addOrSubtractPeriod(ChartType.month as any, '1m' as Period, mockDate, 0)
      expect(result.toISOString()).toBe(mockDate.toISOString())
    })

    it('should add 1 unit correctly for non-dynamic types', () => {
      const result = addOrSubtractPeriod(ChartType.month as any, '1m' as Period, mockDate, 1)
      expect(result.month()).toBe(10) // November (0-indexed, so 10 is Nov)
    })

    it('should subtract 2 units correctly', () => {
      const result = addOrSubtractPeriod(ChartType.month as any, '1m' as Period, mockDate, -2)
      expect(result.month()).toBe(7) // August
    })

    it('should handle dynamic periods correctly (e.g., "7d")', () => {
      const period = '7d' as Period
      const result = addOrSubtractPeriod(ChartType.dynamic, period, mockDate, 1)

      // Oct 23 + 7 days = Oct 30
      expect(result.format('YYYY-MM-DD')).toBe('2024-10-30')
    })

    it('should handle fractional directions (0.5)', () => {
      // Starting midday Wed, add 0.5 days (12 hours) -> should be Thursday midnight
      const start = dayjs('2024-10-23T12:00:00')
      const result = addOrSubtractPeriod(ChartType.day as any, '1d' as Period, start, 0.5)

      expect(result.format('YYYY-MM-DD HH:mm')).toBe('2024-10-24 00:00')
    })

    it('should handle isoWeek correctly (treats as week)', () => {
      const result = addOrSubtractPeriod(ChartType.isoWeek, '1w' as Period, mockDate, 1)
      // Oct 23 + 7 days
      expect(result.format('YYYY-MM-DD')).toBe('2024-10-30')
    })

    it('should parse complex dynamic periods like "2M"', () => {
      const result = addOrSubtractPeriod(ChartType.dynamic, '2M' as Period, mockDate, 1)
      // Oct 23 + 2 months = Dec 23
      expect(result.month()).toBe(11) // December
      expect(result.date()).toBe(23)
    })

    describe('February Edge Cases', () => {
      it('should correctly add 1 month starting from Jan 31st (Leap Year)', () => {
        // Jan 31, 2024 (2024 is a leap year)
        const start = dayjs('2024-01-31')
        const result = addOrSubtractPeriod(ChartType.month as any, '1M' as Period, start, 1)

        // Dayjs standard behavior for Jan 31 + 1 month is Feb 29
        expect(result.format('YYYY-MM-DD')).toBe('2024-02-29')
      })

      it('should correctly add 1 month starting from Jan 31st (Non-Leap Year)', () => {
        // Jan 31, 2023 (Not a leap year)
        const start = dayjs('2023-01-31')
        const result = addOrSubtractPeriod(ChartType.month as any, '1M' as Period, start, 1)

        expect(result.format('YYYY-MM-DD')).toBe('2023-02-28')
      })

      it('should handle fractional months (0.5) in February (Non-Leap Year)', () => {
        // Feb 1st, 2023 00:00. Feb has 28 days.
        // 0.5 months should be exactly 14 days later.
        const start = dayjs('2023-02-01T00:00:00')
        const result = addOrSubtractPeriod(ChartType.month as any, '1M' as Period, start, 0.5)

        expect(result.format('YYYY-MM-DD HH:mm')).toBe('2023-02-15 00:00')
      })

      it('should handle fractional months (0.5) in February (Leap Year)', () => {
        // Feb 1st, 2024 00:00. Feb has 29 days.
        // 0.5 months is 14.5 days (14 days + 12 hours).
        const start = dayjs('2024-02-01T00:00:00')
        const result = addOrSubtractPeriod(ChartType.month as any, '1M' as Period, start, 0.5)

        expect(result.format('YYYY-MM-DD HH:mm')).toBe('2024-02-15 12:00')
      })

      it('should correctly subtract 1 month into February from March 31st (Leap-Year)', () => {
        // Mar 31, 2024 (2024 is a leap year)
        const start = dayjs('2024-03-31')
        const result = addOrSubtractPeriod(ChartType.month as any, '1M' as Period, start, -1)

        // March 31 minus 1 month in a leap year should land on Feb 29
        expect(result.format('YYYY-MM-DD')).toBe('2024-02-29')
      })

      it('should correctly subtract 1 month into February from March 31st (Non-Leap Year)', () => {
        // Mar 31, 2023 (Not a leap year)
        const start = dayjs('2023-03-31')
        const result = addOrSubtractPeriod(ChartType.month as any, '1M' as Period, start, -1)

        expect(result.format('YYYY-MM-DD')).toBe('2023-02-28')
      })
    })
  })
})
