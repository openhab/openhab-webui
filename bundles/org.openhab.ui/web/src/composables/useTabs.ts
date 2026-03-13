import { onBeforeUnmount, onMounted, ref } from 'vue'
import { f7 } from 'framework7-vue'
import Dom7 from 'dom7'

import { showConfirmDialog } from '@/js/dialog-promises'

// Use this helper on pages that have both a design/object tab and a code tab.
// It keeps both representations in sync by converting to code before entering
// the code tab and parsing code back into object state when leaving it.
export async function confirmCodeSwitch(toCode: () => void, fromCode: () => void, tabTo: string, tabFrom: string): Promise<boolean> {
  if (tabTo === 'code') {
    toCode()
    return true
  } else if (tabFrom === 'code') {
    try {
      fromCode()
    } catch (e: unknown) {
      return await showConfirmDialog(
        'Error parsing code - switching tabs will discard changes. Do you want to continue?<BR><BR>' +
          (e instanceof Error ? e.message : String(e)),
        'Error parsing code'
      )
    }
  }
  return true
}

export function useTabs(canSwitchTo: (tabTo: string, tabFrom: string) => Promise<boolean> | boolean = () => true) {
  const currentTab = ref<string | null>(null)
  let highlightEl: HTMLElement | null = null
  let tabbarEl: HTMLElement | null = null
  let tabElements: HTMLElement[] = []
  let tabbarClickHandler: ((event: Event) => void) | null = null

  function normalizeTabSelector(tab: string): string {
    return tab.startsWith('#') ? tab : `#${tab}`
  }

  function isActiveTab(tabSelector: string): boolean {
    const activeTabEl = Dom7('.tab .tab-active')
    return activeTabEl.length > 0 && activeTabEl.attr('id') === tabSelector.slice(1)
  }

  function getActiveTab(): Element | null {
    const activeTabEl = Dom7('.tab .tab-active')
    if (activeTabEl.length > 0) {
      return activeTabEl[0] || null
    }
    return null
  }

  function getTabSelectorFromLinkEl(tabLinkEl: HTMLElement): string | null {
    const targets = [
      tabLinkEl.getAttribute('oh-tab-link'),
      tabLinkEl.getAttribute('tab-link'),
      tabLinkEl.getAttribute('href'),
      tabLinkEl.getAttribute('data-tab')
    ]
    const tabTarget = targets.find((target) => !!target && target.startsWith('#'))
    return tabTarget ? normalizeTabSelector(tabTarget) : null
  }

  function getTabLinkElement(tabSelector: string): HTMLElement | null {
    const normalizedSelector = normalizeTabSelector(tabSelector)
    const normalizedName = normalizedSelector.slice(1).toLowerCase()

    return (
      tabElements.find((el) => {
        const targets = [el.getAttribute('oh-tab-link'), el.getAttribute('tab-link'), el.getAttribute('href'), el.getAttribute('data-tab')]
        if (targets.some((target) => target && normalizeTabSelector(target) === normalizedSelector)) {
          return true
        }

        return (el.textContent || '').trim().toLowerCase() === normalizedName
      }) || null
    )
  }

  const setupHighlightBar = () => {
    if (!tabbarEl) return

    tabElements = Array.from(tabbarEl.querySelectorAll('[oh-tab-link]'))

    highlightEl = document.createElement('div')
    highlightEl.className = 'oh-tab-highlight'
    const initialSelector = currentTab.value ? normalizeTabSelector(currentTab.value) : '#'
    const initialTabLinkEl = getTabLinkElement(initialSelector) || tabElements[0]
    Object.assign(highlightEl.style, getHighlightStyle(initialSelector, initialTabLinkEl))

    tabbarEl.insertBefore(highlightEl, tabbarEl.firstChild)
  }

  const getHighlightStyle = (tabSelector: string, tabLinkEl?: HTMLElement) => {
    const count = tabElements.length || 1
    const width = 100 / count
    const resolvedTabLinkEl = tabLinkEl || getTabLinkElement(tabSelector)
    const index = resolvedTabLinkEl ? Math.max(0, tabElements.indexOf(resolvedTabLinkEl)) : 0
    const isBottom = tabbarEl?.getAttribute('position') === 'bottom'

    return {
      left: `${index * width}%`,
      width: `${width}%`,
      top: isBottom ? '0' : 'auto',
      bottom: isBottom ? 'auto' : '0'
    }
  }

  const updateHighlight = (tabSelector: string, tabLinkEl?: HTMLElement) => {
    if (!highlightEl) return
    const style = getHighlightStyle(tabSelector, tabLinkEl)
    highlightEl.style.left = style.left
    highlightEl.style.width = style.width
    highlightEl.style.top = style.top
    highlightEl.style.bottom = style.bottom
  }

  async function switchTab(tabLinkEl: HTMLElement) {
    let tabSelector: string | null = getTabSelectorFromLinkEl(tabLinkEl)
    if (!tabLinkEl || !tabSelector) return

    if (isActiveTab(tabSelector)) {
      return
    }

    if (canSwitchTo && (await canSwitchTo(tabSelector.slice(1), currentTab.value || ''))) {
      currentTab.value = tabSelector.slice(1)
      f7.tab.show(tabSelector, tabLinkEl)
      updateHighlight(tabSelector, tabLinkEl)
    }
  }

  currentTab.value = getActiveTab()?.getAttribute('id') || null

  // We render our own tab highlight instead of using Framework7's built-in
  // tab-link handling. F7 needs link-tab metadata to style/animate the active
  // tab, but that also triggers automatic tab switching on click, which bypasses
  // canSwitchTo and prevents us from validating/parsing before switching.
  onMounted(() => {
    if (f7.theme !== 'ios') {
      setupHighlightBar()
    }

    tabbarEl = document.querySelector('.oh-tabbar')
    if (!tabbarEl) return

    tabbarClickHandler = (event: Event) => {
      const clickedEl = (event.target as HTMLElement | null)?.closest('[oh-tab-link]')
      if (!(clickedEl instanceof HTMLElement)) return
      if (!tabbarEl?.contains(clickedEl)) return

      event.preventDefault()
      void switchTab(clickedEl)
    }

    tabbarEl.addEventListener('click', tabbarClickHandler)
  })

  onBeforeUnmount(() => {
    if (tabbarEl && tabbarClickHandler) {
      tabbarEl.removeEventListener('click', tabbarClickHandler)
    }
  })

  return {
    currentTab
  }
}
