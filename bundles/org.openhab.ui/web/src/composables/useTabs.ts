import { onBeforeUnmount, onMounted, ref, shallowRef, useTemplateRef } from 'vue'
import { f7 } from 'framework7-vue'
import Dom7 from 'dom7'

import { showConfirmDialog } from '@/js/dialog-promises'

type TemplateRefTarget = HTMLElement | { $el?: unknown; el?: unknown } | null | undefined

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

// To use useTabs, ensure the tabbar has a ref and the tab links have oh-tab-link attributes instead of the default tab-link attributes. Example:
// <f7-toolbar ref="myTabs" tabbar position="top">
//   <f7-link oh-tab-link="#design" tab-link-active> Design </f7-link>
//   <f7-link oh-tab-link="#code"> Code </f7-link>
// </f7-toolbar>
export function useTabs(
  canSwitchTo: (tabTo: string, tabFrom: string) => Promise<boolean> | boolean = () => true,
  tabbarRefOrName: string | TemplateRefTarget
) {
  const currentTab = ref<string | null>(null)
  const tabbarRef =
    typeof tabbarRefOrName === 'string'
      ? useTemplateRef<TemplateRefTarget>(tabbarRefOrName)
      : shallowRef<TemplateRefTarget>(tabbarRefOrName)

  let highlightEl: HTMLElement | null = null
  let tabbarEl: HTMLElement | null = null
  let tabElements: HTMLElement[] = []
  let tabbarClickHandler: ((event: Event) => void) | null = null

  function normalizeTabSelector(tab: string): string {
    return tab.startsWith('#') ? tab : `#${tab}`
  }

  function getTabsScopeElement(): ParentNode {
    if (!tabbarEl) return document
    return tabbarEl.closest('.page') || document
  }

  function isActiveTab(tabSelector: string): boolean {
    const activeTabEl = getActiveTab()
    return !!activeTabEl && activeTabEl.getAttribute('id') === tabSelector.slice(1)
  }

  function getActiveTab(): Element | null {
    const tabsScopeEl = getTabsScopeElement()

    for (const tabLinkEl of tabElements) {
      const tabSelector = getTabSelectorFromLinkEl(tabLinkEl)
      if (!tabSelector) continue
      const targetTabEl = Dom7(tabsScopeEl).find(tabSelector)
      if (targetTabEl.length > 0 && targetTabEl.hasClass('tab-active')) {
        return targetTabEl[0] || null
      }
    }

    const activeTabEl = Dom7(tabsScopeEl).find('.tab.tab-active')
    if (activeTabEl.length > 0) {
      return activeTabEl[0] || null
    }
    return null
  }

  function getTabSelectorFromLinkEl(tabLinkEl: HTMLElement): string | null {
    const tabTarget = tabLinkEl.getAttribute('oh-tab-link')
    if (!tabTarget || !tabTarget.startsWith('#')) return null
    return tabTarget ? normalizeTabSelector(tabTarget) : null
  }

  function getTabLinkElement(tabSelector: string): HTMLElement | null {
    const normalizedSelector = normalizeTabSelector(tabSelector)

    return tabElements.find((el) => normalizeTabSelector(el.getAttribute('oh-tab-link') || '') === normalizedSelector) || null
  }

  function resolveElement(target: TemplateRefTarget): HTMLElement | null {
    if (target instanceof HTMLElement) return target
    if (!target || typeof target !== 'object') return null
    if (target.$el instanceof HTMLElement) return target.$el
    if (target.el instanceof HTMLElement) return target.el
    return null
  }

  const setupHighlightBar = () => {
    if (!tabbarEl) return

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

  async function switchTab(tab: HTMLElement | string) {
    let tabSelector: string | null = typeof tab === 'string' ? normalizeTabSelector(tab) : getTabSelectorFromLinkEl(tab)
    const targetTabLinkEl = typeof tab === 'string' ? getTabLinkElement(tabSelector || '') : tab
    if (!targetTabLinkEl || !tabSelector) return

    if (isActiveTab(tabSelector)) {
      return
    }

    if (canSwitchTo && (await canSwitchTo(tabSelector.slice(1), currentTab.value || ''))) {
      currentTab.value = tabSelector.slice(1)
      f7.tab.show(tabSelector, targetTabLinkEl)
      updateHighlight(tabSelector, targetTabLinkEl)
    }
  }

  onMounted(() => {
    tabbarEl = resolveElement(tabbarRef.value)
    if (!tabbarEl) {
      console.warn(
        `[useTabs] Tabbar ref "${typeof tabbarRefOrName === 'string' ? tabbarRefOrName : '(element)'}" did not resolve to an element.`
      )
      return
    }

    tabElements = Array.from(tabbarEl.querySelectorAll('[oh-tab-link]'))
    currentTab.value = getActiveTab()?.getAttribute('id') || null

    // We render our own tab highlight instead of using Framework7's built-in
    // tab-link handling. F7 needs link-tab metadata to style/animate the active
    // tab, but that also triggers automatic tab switching on click, which bypasses
    // canSwitchTo and prevents us from validating/parsing before switching.
    if (f7.theme !== 'ios') {
      setupHighlightBar()
    }

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
    currentTab,
    switchTab
  }
}
