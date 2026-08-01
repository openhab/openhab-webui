import { describe, expect, it } from 'vitest'
import dayjs from 'dayjs'
import { formatTimestamp } from './oh-chart-tooltip'

describe('formatTimestamp', () => {
  it('should format a valid dayjs object correctly', () => {
    const time = dayjs('2026-08-01T13:50:00.000Z')
    const result = formatTimestamp(time)
    expect(result).toBeTruthy()
    expect(result).not.toContain('Failed to format')
  })

  it('should return empty string for invalid dayjs date', () => {
    const invalidTime = dayjs('invalid-date')
    expect(formatTimestamp(invalidTime)).toBe('')
  })
})
