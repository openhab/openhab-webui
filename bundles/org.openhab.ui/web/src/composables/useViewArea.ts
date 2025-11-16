import { nextTick, onMounted, onUnmounted, provide, ref } from 'vue'

/**
 * Composable providing the functionality to evaluate widget expressions.
 *
 * The `screen.viewAreaWidth` and `screen.viewAreaHeight` properties are only available to expressions
 * if `viewAreaWidth` and `viewAreaHeight` refs are provided via Vue's dependency injection mechanism.
 *
 * Widget expression evaluations need access to the current widget context and props.
 * If they are available at composable instantiation, they can be passed as properties to the composable.
 * If they, however, aren't available at instantiation (e.g. because they are computed), they can be passed as function parameters later.
 *
 * @param properties
 */

/**
 * Composable providing the view area dimensions of the current Framework7 page.
 *
 * The view area width and height are retrieved by observing the current page content element and reading its computed style.
 */
export function useViewArea () {
  // data
  const viewAreaWidth = ref<number>(0)
  const viewAreaHeight = ref<number>(0)

  let resizeObserver: ResizeObserver | null = null
  let observedElement: Element | null = null

  // dependency injection
  provide('viewAreaWidth', viewAreaWidth)
  provide('viewAreaHeight', viewAreaHeight)

  // lifecycle
  onMounted(() => {
    void nextTick(() => {
      // attempt to observe the current page content element; fall back to window resize event
      observedElement = getPageContentEl()
      if (observedElement && typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          updateViewAreaDimensions()
        })
        resizeObserver.observe(observedElement)
      } else {
        console.warn('ResizeObserver not supported or page content element not found; falling back to window resize event for view area dimension updates.')
        window.addEventListener('resize', updateViewAreaDimensions)
      }
    })
  })

  onUnmounted(() => {
    if (resizeObserver) {
      try {
        resizeObserver.disconnect()
      } catch (e) {
        // ignore
      }
      resizeObserver = null
    } else {
      window.removeEventListener('resize', updateViewAreaDimensions)
    }
    observedElement = null
  })

  // methods
  function getPageContentEl (): HTMLElement | null {
    return document.querySelector('.page-current > .page-content')
  }

  function updateViewAreaDimensions () {
    const pageContent = getPageContentEl()
    if (pageContent) {
      const pageContentStyle = window.getComputedStyle(pageContent)
      viewAreaHeight.value = pageContent.clientHeight -
        parseFloat(pageContentStyle.paddingTop) -
        parseFloat(pageContentStyle.paddingBottom)
      viewAreaWidth.value = pageContent.clientWidth -
        parseFloat(pageContentStyle.paddingLeft) -
        parseFloat(pageContentStyle.paddingRight)
    } else {
      viewAreaHeight.value = 0
      viewAreaWidth.value = 0
    }
  }

  return { viewAreaWidth, viewAreaHeight }
}
