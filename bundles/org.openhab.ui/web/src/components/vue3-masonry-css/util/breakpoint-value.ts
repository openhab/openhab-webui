import { type Breakpoint } from '../types/breakpoint'

export const breakpointValue = <T>(breakpoint: Breakpoint<T>, windowWidth: number): T => {
  if (typeof breakpoint === 'number' || typeof breakpoint === 'string') {
    return Number(breakpoint) as T
  } else if (typeof breakpoint !== 'object') {
    return 0 as T
  }

  let matchedBreakpoint = Infinity
  let matchedValue = breakpoint.default ?? (0 as T)

  for (let k in breakpoint) {
    const bp = parseInt(k)
    const bpValRaw = breakpoint[k]
    const bpVal = parseInt(String(bpValRaw))

    if (isNaN(bp) || isNaN(bpVal)) continue

    const isNewBreakpoint = windowWidth <= bp && bp <= matchedBreakpoint
    if (isNewBreakpoint) {
      matchedBreakpoint = bp
      matchedValue = bpValRaw
    }
  }

  return matchedValue as T
}
