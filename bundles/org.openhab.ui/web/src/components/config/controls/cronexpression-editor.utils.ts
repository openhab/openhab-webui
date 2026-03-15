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

function parseWeekdayToken(token: string): WeekdayToken | null {
  const normalized = token.trim().toUpperCase()
  if (WEEKDAY_TOKENS.includes(normalized as WeekdayToken)) {
    return normalized as WeekdayToken
  }

  const dayNumber = parseInt(normalized, 10)
  if (dayNumber >= 1 && dayNumber <= 7) {
    // Numeric weekdays are normalized so 1=SAT, 2=SUN, 3=MON, ..., 7=FRI.
    return WEEKDAY_TOKENS[(dayNumber + 5) % 7]!
  }

  return null
}

export function normalizeWeekdayToken(token: string): WeekdayToken {
  return parseWeekdayToken(token) || 'SUN'
}

export function toCronWeekdayNumber(token: WeekdayToken): number {
  // Emit numeric weekdays using 1=SAT, 2=SUN, 3=MON, ..., 7=FRI.
  return ((WEEKDAY_TOKENS.indexOf(token) + 1) % 7) + 1
}

export function formatCronWeekdayList(tokens: WeekdayToken[]): string {
  return tokens.map((token) => String(toCronWeekdayNumber(token))).join(',')
}

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
