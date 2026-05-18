import { describe, expect, it } from 'vitest'
import dayjs from 'dayjs'
import { ChartType, OhCategoryAxis } from '@/types/components/widgets'
import { getCategoryAxisData } from './oh-category-axis'

describe('oh-category-axis', () => {
  describe('getCategoryAxisData', () => {
    const startTime = dayjs('2026-01-01T00:00:00')
    const endTime = dayjs('2026-01-02T00:00:00')

    it('should return minutes 0-59 for CategoryType.hour', () => {
      const config = {
        categoryType: OhCategoryAxis.CategoryType.hour
      } as any
      const result = getCategoryAxisData(config, startTime, endTime)
      expect(result.data).toHaveLength(60)
      expect(result.data[0]).toEqual('0')
      expect(result.data[59]).toEqual('59')
      expect(result.name).toEqual('min')
    })

    it('should return hours 0-24 for CategoryType.day', () => {
      const config = {
        categoryType: OhCategoryAxis.CategoryType.day
      } as any
      const result = getCategoryAxisData(config, startTime, endTime)
      expect(result.data).toHaveLength(24)
      expect(result.data[0]).toEqual('0')
      expect(result.data[23]).toEqual('23')
      expect(result.name).toEqual('h')
    })

    describe('should return days of week for CategoryType.week', () => {
      const config = {
        categoryType: OhCategoryAxis.CategoryType.week,
        weekdayFormat: OhCategoryAxis.WeekdayFormat.default
      } as any

      it('should return days as [Sunday, ..., Saturday] in default (en) locale', () => {
        const result = getCategoryAxisData(config, startTime, endTime)
        expect(result.data).toHaveLength(7)
        expect(result.data).toEqual(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])
        expect(result.name).toEqual('day')
      })

      it('should return days as [Monday, ..., Sunday] in German (de) locale', async () => {
        const originalLocale = dayjs.locale()
        try {
          await import('dayjs/locale/de')
          dayjs.locale('de')
          const result = getCategoryAxisData(config, startTime, endTime)
          expect(result.data).toHaveLength(7)
          expect(result.data).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
          expect(result.name).toEqual('day')
        } finally {
          dayjs.locale(originalLocale)
        }
      })

      it('should return days of week as [Monday, ..., Sunday] if chartType is ChartType.isoWeek', () => {
        const result = getCategoryAxisData(config, startTime, endTime, ChartType.isoWeek)
        expect(result.data).toHaveLength(7)
        expect(result.data).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
        expect(result.name).toEqual('day')
      })
    })

    it('should return days of month for CategoryType.month', () => {
      const config = {
        categoryType: OhCategoryAxis.CategoryType.month
      } as any
      // January 2026 has 31 days
      const janStartTime = dayjs('2026-01-01T00:00:00')
      const result = getCategoryAxisData(config, janStartTime, endTime)
      expect(result.data).toHaveLength(31)
      expect(result.data[0]).toEqual('1')
      expect(result.data[30]).toEqual('31')
      expect(result.name).toEqual('day')
    })

    it('should return months for CategoryType.year', () => {
      const config = {
        categoryType: OhCategoryAxis.CategoryType.year,
        monthFormat: OhCategoryAxis.MonthFormat.default
      } as any
      const result = getCategoryAxisData(config, startTime, endTime, ChartType.year)
      expect(result.data).toHaveLength(12)
      expect(result.name).toEqual('month')
    })

    it('should return multi-year months for CategoryType.year when chart period is longer than a year', () => {
      const config = {
        categoryType: OhCategoryAxis.CategoryType.year,
        monthFormat: OhCategoryAxis.MonthFormat.short
      } as any
      // Start of 2026
      const startOf2026 = dayjs('2026-01-01T00:00:00')
      const result = getCategoryAxisData(config, startOf2026, endTime, ChartType.twoYears)
      // 12 months * 2 years = 24 entries
      expect(result.data).toHaveLength(24)
      // Check some entries (format depends on locale, but should contain the year)
      expect(result.data[0]).toContain('2026')
      expect(result.data[12]).toContain('2027')
    })

    it('should return years for CategoryType.years', () => {
      const config = {
        categoryType: OhCategoryAxis.CategoryType.years
      } as any
      const start = dayjs('2020-01-01')
      const end = dayjs('2025-01-01')
      const result = getCategoryAxisData(config, start, end)
      expect(result.data).toEqual(['2020', '2021', '2022', '2023', '2024'])
      expect(result.name).toBe('year')
    })

    it('should return empty data for CategoryType.values', () => {
      const config = {
        categoryType: OhCategoryAxis.CategoryType.values
      } as any
      const result = getCategoryAxisData(config, startTime, endTime)
      expect(result.data).toEqual([])
      expect(result.name).toBeUndefined()
    })

    it('should not override name if already provided in config', () => {
      const config = {
        categoryType: OhCategoryAxis.CategoryType.hour,
        name: 'My Custom Axis'
      } as any
      const result = getCategoryAxisData(config, startTime, endTime)
      expect(result.name).toBeUndefined()
    })
  })
})
