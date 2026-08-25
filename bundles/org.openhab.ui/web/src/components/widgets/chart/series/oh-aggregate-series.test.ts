import { describe, it, expect, vi } from 'vitest'
import dayjs from 'dayjs'
import IsoWeek from 'dayjs/plugin/isoWeek'
import Weekday from 'dayjs/plugin/weekday'
import aggregateSeries, { dimensionFromDate } from './oh-aggregate-series'
import { AggregationFunction, ChartType, OhAggregateSeries } from '@/types/components/widgets'
import type { ChartContext } from '../types'

vi.mock('framework7-vue', () => ({
  f7: {
    utils: {
      id: () => 'mock-id'
    }
  }
}))

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

describe('aggregateSeries', () => {
  const startTime = dayjs('2026-05-12T00:00:00')
  const endTime = dayjs('2026-05-12T23:59:59')
  const context = {
    chart: {
      config: {
        chartType: ChartType.day
      }
    },
    evaluateExpression: (_key, value) => value,
    chartContext: {}
  } as unknown as ChartContext

  describe('adjustedStartTime', () => {
    it('should return same startTime for average aggregation', () => {
      const component = {
        config: {
          aggregationFunction: AggregationFunction.average
        }
      } as any
      expect(aggregateSeries.adjustedStartTime!(context, component, startTime).toISOString()).toBe(startTime.toISOString())
    })

    describe('Difference aggregations (diffLast, diffFirst)', () => {
      it.each([
        { func: AggregationFunction.diffLast, label: 'diffLast' },
        { func: AggregationFunction.diffFirst, label: 'diffFirst' }
      ])('should return subtracted startTime for $label', ({ func }) => {
        const component = {
          config: {
            aggregationFunction: func
          }
        } as any
        const expected = startTime.subtract(1, 'hour')
        expect(aggregateSeries.adjustedStartTime!(context, component, startTime).toISOString()).toBe(expected.toISOString())
      })

      it('should subtract 1 day if groupStart resolves to day (e.g. for week chart)', () => {
        const contextWeek = {
          chart: {
            config: {
              chartType: ChartType.week
            }
          },
          evaluateExpression: (_key, value) => value
        } as any
        const component = {
          config: {
            aggregationFunction: AggregationFunction.diffLast
          }
        } as any
        // ChartType.week => default dimension = weekday => groupStart = 'day'
        const expected = startTime.subtract(1, 'day')
        expect(aggregateSeries.adjustedStartTime!(contextWeek, component, startTime).toISOString()).toBe(expected.toISOString())
      })
    })
  })

  describe('get', () => {
    it('should group data correctly and calculate diffLast', () => {
      const component = {
        config: {
          item: 'TestItem',
          aggregationFunction: AggregationFunction.diffLast
        }
      } as any
      const points = [
        {
          name: 'TestItem',
          data: [
            { time: startTime.subtract(1, 'hour').valueOf(), state: '100' }, // Look-back point
            { time: startTime.valueOf(), state: '100.7' }, // Hour 0
            { time: startTime.add(1, 'hour').valueOf(), state: '102' } // Hour 1
          ]
        }
      ] as any

      const result = aggregateSeries.get(context, component, points, startTime, endTime)

      // result.data should have 2 entries (look-back point should be filtered out)
      expect(result.data).toHaveLength(2)
      // First group (Hour 0) should be 100.7 - 100 = 0.7
      expect(result.data[0][1]).toBe('0.7')
      // Second group (Hour 1) should be 102 - 100.7 = 1.3
      expect(result.data[1][1]).toBe('1.3')

      // Axis positioning (X-axis)
      // dimensionFromDate for Hour 0 should return 0
      expect(result.data[0][0]).toBe(0)
      expect(result.data[1][0]).toBe(1)
    })
  })
})
