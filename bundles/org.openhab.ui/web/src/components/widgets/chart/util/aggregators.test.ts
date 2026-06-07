import { describe, it, expect } from 'vitest'
import dayjs from 'dayjs'
import aggregate from './aggregators'
import { AggregationFunction } from '@/types/components/widgets'

describe('aggregators', () => {
  const t0 = dayjs('2026-05-12T00:00:00Z')
  const t1 = dayjs('2026-05-12T01:00:00Z')
  const t2 = dayjs('2026-05-12T02:00:00Z')

  describe('diffLast', () => {
    it('should return NaN for the first group (idx < 1)', () => {
      const groups: [dayjs.Dayjs, string[]][] = [[t0, ['100']]]
      expect(aggregate(AggregationFunction.diffLast, groups[0], 0, groups)).toBeNaN()
    })

    it('should return the difference from the previous group for idx > 0', () => {
      const groups: [dayjs.Dayjs, string[]][] = [
        [t0, ['100']],
        [t1, ['100.7']]
      ]
      expect(aggregate(AggregationFunction.diffLast, groups[1], 1, groups)).toBeCloseTo(0.7)
    })

    it('should use the LAST value of each group for the difference', () => {
      const groups: [dayjs.Dayjs, string[]][] = [
        [t0, ['90', '100']],
        [t1, ['105', '110.5']]
      ]
      // diffLast = last(current) - last(previous) = 110.5 - 100 = 10.5
      expect(aggregate(AggregationFunction.diffLast, groups[1], 1, groups)).toBe(10.5)
    })
  })

  describe('diffFirst', () => {
    it('should return NaN for the first group (idx < 1)', () => {
      const groups: [dayjs.Dayjs, string[]][] = [[t0, ['100']]]
      expect(aggregate(AggregationFunction.diffFirst, groups[0], 0, groups)).toBeNaN()
    })

    it('should return the difference from the previous group for idx > 0', () => {
      const groups: [dayjs.Dayjs, string[]][] = [
        [t0, ['100', '105']],
        [t1, ['108', '110']]
      ]
      // diffFirst = first(current) - first(previous) = 108 - 100 = 8
      expect(aggregate(AggregationFunction.diffFirst, groups[1], 1, groups)).toBe(8)
    })
  })

  describe('Other aggregators', () => {
    const group: [dayjs.Dayjs, string[]] = [t0, ['10', '20', '30']]
    const groups: [dayjs.Dayjs, string[]][] = [group]

    it('should calculate sum', () => {
      expect(aggregate(AggregationFunction.sum, group, 0, groups)).toBe(60)
    })

    it('should calculate min', () => {
      expect(aggregate(AggregationFunction.min, group, 0, groups)).toBe(10)
    })

    it('should calculate max', () => {
      expect(aggregate(AggregationFunction.max, group, 0, groups)).toBe(30)
    })

    it('should calculate average', () => {
      expect(aggregate(AggregationFunction.average, group, 0, groups)).toBe(20)
    })

    it('should calculate first', () => {
      expect(aggregate(AggregationFunction.first, group, 0, groups)).toBe(10)
    })

    it('should calculate last', () => {
      expect(aggregate(AggregationFunction.last, group, 0, groups)).toBe(30)
    })
  })
})
