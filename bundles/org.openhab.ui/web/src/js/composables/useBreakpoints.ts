import { computed, getCurrentInstance } from 'vue'
import { BREAKPOINTS } from '@/js/constants/breakpoints'

export function useBreakpoints() {
  const instance = getCurrentInstance()
  const $f7dim = instance?.proxy?.$f7dim

  const width = computed(() => $f7dim?.width ?? 0)
  const height = computed(() => $f7dim?.height ?? 0)

  const isXs = computed(() => width.value < BREAKPOINTS.XS)
  const isSm = computed(() => width.value >= BREAKPOINTS.SM)
  const isMd = computed(() => width.value >= BREAKPOINTS.MD)
  const isLg = computed(() => width.value >= BREAKPOINTS.LG)
  const isXl = computed(() => width.value >= BREAKPOINTS.XL)

  return {
    BREAKPOINTS,
    width,
    height,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl
  }
}
