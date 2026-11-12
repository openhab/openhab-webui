import { ref } from 'vue'

const SCROLL_INPUT_TIMEOUT = 500
const SCROLL_GUARD = 100

/**
 * Scroll events also fire for programmatic scrolling and layout changes, so they
 * cannot alone indicate that the user wants to stop following the log. Track
 * recent input and touch momentum separately, and pause only after the viewport
 * moves beyond the guard band. Programmatic scrolls reset the position baseline.
 */
export function useLogScroll() {
  const autoScroll = ref(true)
  let maxScrollHeight = 0
  let lastBottom: number | null = null
  let inputUntil = 0
  let pointerId: number | null = null

  function noteInput() {
    inputUntil = Date.now() + SCROLL_INPUT_TIMEOUT
  }

  function isUserScrolling() {
    return pointerId !== null || Date.now() < inputUntil
  }

  function startInput(event: Event) {
    if (!isUserScrolling() && event.target instanceof Element) {
      const container = event.target.closest<HTMLElement>('.container')
      if (container) {
        const bottom = container.scrollTop + container.clientHeight
        maxScrollHeight = Math.max(Math.min(maxScrollHeight, container.scrollHeight), bottom)
        lastBottom = bottom
      }
    }
    noteInput()
  }

  function onWheel(event: WheelEvent) {
    if (event.deltaY !== 0 && !event.ctrlKey) startInput(event)
  }

  function onPointerDown(event: PointerEvent) {
    const target = event.target
    if (event.button !== 0 || !(target instanceof Element)) return
    if (event.pointerType !== 'touch' && !target.classList.contains('container')) return
    startInput(event)
    pointerId = event.pointerId
  }

  function onPointerEnd(event: PointerEvent) {
    if (pointerId !== event.pointerId) return
    pointerId = null
    startInput(event)
  }

  function onKeydown(event: KeyboardEvent) {
    if (
      ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key) &&
      event.target instanceof Element &&
      event.target.classList.contains('container')
    ) {
      noteInput()
    }
  }

  function onScroll(event: Event) {
    const { scrollTop, clientHeight, scrollHeight } = event.target as HTMLElement
    const bottom = scrollTop + clientHeight
    const previousMax = Math.min(maxScrollHeight, scrollHeight)

    if (isUserScrolling()) {
      if (lastBottom !== null && bottom < lastBottom) noteInput()
      if (bottom < previousMax - SCROLL_GUARD) autoScroll.value = false
    }

    maxScrollHeight = Math.max(previousMax, bottom)
    lastBottom = bottom
  }

  function noteProgrammaticScroll(container: HTMLElement) {
    maxScrollHeight = container.scrollTop + container.clientHeight
    lastBottom = maxScrollHeight
  }

  function reset() {
    maxScrollHeight = 0
    lastBottom = null
  }

  function followLatest() {
    autoScroll.value = true
    inputUntil = 0
    pointerId = null
    reset()
  }

  return {
    autoScroll,
    isUserScrolling,
    onWheel,
    onPointerDown,
    onPointerEnd,
    onKeydown,
    onScroll,
    noteProgrammaticScroll,
    reset,
    followLatest
  }
}
