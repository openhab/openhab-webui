import { computed, getCurrentInstance } from 'vue'
import { BREAKPOINTS, type BreakpointKey } from '@/js/constants/breakpoints'

/**
 * Composable for using Main UI's standardized breakpoints in Vue components.
 */
export function useBreakpoints() {
  const instance = getCurrentInstance()
  const $f7dim = instance?.proxy?.$f7dim

  const width = computed(() => $f7dim?.width ?? 0)
  const height = computed(() => $f7dim?.height ?? 0)

  const resolveBreakpoint = (key: Lowercase<BreakpointKey>): number => {
    const normalizedKey = key.toUpperCase() as keyof typeof BREAKPOINTS
    return BREAKPOINTS[normalizedKey]
  }

  const greaterThanOrEqual = (key: Lowercase<BreakpointKey>) => {
    return computed(() => width.value >= resolveBreakpoint(key))
  }

  const lessThan = (key: Lowercase<BreakpointKey>) => {
    return computed(() => width.value < resolveBreakpoint(key))
  }

  return {
    BREAKPOINTS,
    width,
    height,
    greaterThanOrEqual,
    lessThan
  }
}
