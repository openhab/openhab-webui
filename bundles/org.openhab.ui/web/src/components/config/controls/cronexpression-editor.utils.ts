export const WEEKDAY_TOKENS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const

export const CRON_LIMITS = {
  second: { min: 0, max: 59, incrementMax: 59 },
  minute: { min: 0, max: 59, incrementMax: 59 },
  hour: { min: 0, max: 23, incrementMax: 23 },
  dayOfMonth: { min: 1, max: 31, incrementMax: 31 },
  week: { incrementMin: 1, incrementMax: 7, nthMin: 1, nthMax: 5 },
  month: { min: 1, max: 12, incrementMax: 12 },
  year: { incrementMin: 1, incrementMax: 99, maxOffset: 100 }
} as const

export type WeekdayToken = (typeof WEEKDAY_TOKENS)[number]

/**
 * Parses a stringified token (either `SUN`, `MON`, ... or `1`, `2`, ...) to a {@link WeekdayToken}.
 * @param token
 */
function parseWeekdayToken(token: string): WeekdayToken | null {
  const normalized = token.trim().toUpperCase()
  if (WEEKDAY_TOKENS.includes(normalized as WeekdayToken)) {
    return normalized as WeekdayToken
  }

  const dayNumber = parseInt(normalized, 10)
  if (dayNumber >= 1 && dayNumber <= 7) {
    // Numeric weekdays follow Quartz cron numbering: 1=SUN, 2=MON, ..., 7=SAT.
    return WEEKDAY_TOKENS[dayNumber - 1]!
  }

  return null
}

export function normalizeWeekdayToken(token: string): WeekdayToken {
  return parseWeekdayToken(token) || 'SUN'
}

export function toCronWeekdayNumber(token: WeekdayToken): number {
  // Emit numeric weekdays using 1=SUN, 2=MON, ..., 7=SAT.
  return WEEKDAY_TOKENS.indexOf(token) + 1
}

export function formatCronWeekdayList(tokens: WeekdayToken[]): string {
  return tokens.map((token) => String(toCronWeekdayNumber(token))).join(',')
}

/**
 * Expands a weekday segment of a cron expression, which can be either a single token (e.g. `MON`) or a range (e.g. `MON-WED`), into an array of {@link WeekdayToken}s.
 * @param segment
 */
export function expandWeekdaySegment(segment: string): WeekdayToken[] {
  const normalized = segment.trim().toUpperCase()
  if (!normalized.length) return []

  if (!normalized.includes('-')) {
    const token = parseWeekdayToken(normalized)
    return token ? [token] : []
  }

  const [startRaw, endRaw] = normalized.split('-')
  const start = parseWeekdayToken(startRaw || '')
  const end = parseWeekdayToken(endRaw || '')
  if (!start || !end) return []

  const startIdx = WEEKDAY_TOKENS.indexOf(start)
  const endIdx = WEEKDAY_TOKENS.indexOf(end)
  if (startIdx < 0 || endIdx < 0) return []

  if (startIdx <= endIdx) {
    return WEEKDAY_TOKENS.slice(startIdx, endIdx + 1)
  }

  return [...WEEKDAY_TOKENS.slice(startIdx), ...WEEKDAY_TOKENS.slice(0, endIdx + 1)]
}

function parseOrDefault(token: string, fallback: number): number {
  const parsed = parseInt(token, 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

function clampToRange(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function parseAndClamp(token: string, fallback: number, min: number, max: number): number {
  return clampToRange(parseOrDefault(token, fallback), min, max)
}

export function normalizeSpecificNumericList(expr: string, min: number, max: number): number[] {
  const values = expr
    .split(',')
    .map((token) => parseInt(token, 10))
    .filter((value) => !Number.isNaN(value))
    .map((value) => clampToRange(value, min, max))

  return [...new Set(values)].sort((a, b) => a - b)
}

export function validate(value: string) {
  const trimmed = value.trim()
  const specialCases = ['@annually', '@yearly', '@monthly', '@weekly', '@daily', '@hourly', '@reboot']
  if (trimmed.startsWith('@')) {
    if (specialCases.includes(trimmed.toLowerCase())) {
      return ''
    } else {
      return 'Invalid special cron expression'
    }
  } else {
    const fields = trimmed.split(/\s+/)
    if (fields.length != 6 && fields.length != 7) {
      return 'Cron expression must have 6 or 7 fields'
    } else {
      const regex =
        /^((((\d+,)+\d+|(\d+(\/|-|#)\d+)|\d+L?|\*(\/\d+)?|L(-\d+)?|\?|[A-Z]{3}(-[A-Z]{3})?|(\(\d+-\d+\)(\/\d+)?|\(\d+\/\d+\)?|\(\d+-\d+\/\d+\)?|\/\d+)?|W?) ?){6,7})/
      if (!regex.test(trimmed)) {
        return 'Invalid cron expression format'
      } else {
        return ''
      }
    }
  }
}
