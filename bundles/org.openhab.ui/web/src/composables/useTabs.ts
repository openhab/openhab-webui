import { onMounted, ref } from 'vue'
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

  async function switchTab(event: MouseEvent, tab: string) {
    const tabSelector = normalizeTabSelector(tab)
    if (isActiveTab(tabSelector)) {
      return
    }

    // Access the clicked element
    const targetTabLinkEl = event.currentTarget
    if (!(targetTabLinkEl instanceof HTMLElement)) return

    if (canSwitchTo && (await canSwitchTo(tabSelector.slice(1), currentTab.value || ''))) {
      currentTab.value = tabSelector.slice(1)
      f7.tab.show(tabSelector, targetTabLinkEl)
      updateHighlight(tabSelector, targetTabLinkEl)
    }
  }

  function getTabLinkElement(tabSelector: string): HTMLElement | null {
    const normalizedSelector = normalizeTabSelector(tabSelector)
    const normalizedName = normalizedSelector.slice(1).toLowerCase()

    return (
      tabElements.find((el) => {
        const targets = [el.getAttribute('tab-link'), el.getAttribute('href'), el.getAttribute('data-tab')]
        if (targets.some((target) => target && normalizeTabSelector(target) === normalizedSelector)) {
          return true
        }

        return (el.textContent || '').trim().toLowerCase() === normalizedName
      }) || null
    )
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

  currentTab.value = getActiveTab()?.getAttribute('id') || null

  // We render our own tab highlight instead of using Framework7's built-in
  // tab-link handling. F7 needs link-tab metadata to style/animate the active
  // tab, but that also triggers automatic tab switching on click, which bypasses
  // canSwitchTo and prevents us from validating/parsing before switching.
  onMounted(() => {
    if (f7.theme !== 'ios') {
      tabbarEl = document.querySelector('.persistence-edit-page .oh-tabbar')
      if (tabbarEl) {
        tabElements = Array.from(tabbarEl.querySelectorAll('.oh-tab-link'))

        highlightEl = document.createElement('div')
        highlightEl.className = 'oh-tab-highlight'
        const initialSelector = currentTab.value ? normalizeTabSelector(currentTab.value) : '#'
        const initialTabLinkEl = getTabLinkElement(initialSelector) || tabElements[0]
        Object.assign(highlightEl.style, getHighlightStyle(initialSelector, initialTabLinkEl))

        tabbarEl.insertBefore(highlightEl, tabbarEl.firstChild)
      }
    }
  })

  return {
    currentTab,
    switchTab
  }
}
