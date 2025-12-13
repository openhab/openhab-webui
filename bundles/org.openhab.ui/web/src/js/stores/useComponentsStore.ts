import { defineStore } from 'pinia'
import { ref } from 'vue'

import { getRegisteredUiComponentsInNamespace, type RootUiComponent } from '@/api'

export const useComponentsStore = defineStore('components', () => {
  // States
  const _widgets = ref<RootUiComponent[]>([])
  const _pages = ref<RootUiComponent[]>([])
  const ready = ref<boolean>(false)

  // Getters
  function widget (uid: string) {
    return _widgets.value.find((widget) => widget.uid === uid)
  }

  function widgets () {
    return _widgets.value.sort((a, b) => (a.uid ?? '').localeCompare(b.uid ?? ''))
  }

  function page (uid: string) {
    return _pages.value.find((page) => page.uid === uid)
  }

  function pages (): RootUiComponent[] {
    const pages = _pages.value.sort((a, b) => (a.uid ?? '').localeCompare(b.uid ?? ''))
    return pages
  }

  // Actions
  function setPagesAndWidgets (pages: RootUiComponent[], widgets: RootUiComponent[]): void {
    _pages.value = pages
    _widgets.value = widgets
    ready.value = true
  }

  async function loadPagesAndWidgets (): Promise<void> {
    return Promise.all([
      getRegisteredUiComponentsInNamespace({ path: { namespace: 'ui:page' }}),
      getRegisteredUiComponentsInNamespace({ path: { namespace: 'ui:widget' }})
    ]).then((data) => {
      setPagesAndWidgets(data[0].data as RootUiComponent[], data[1].data as RootUiComponent[])
    })
  }

  return { ready, widget, widgets, page, pages, loadPagesAndWidgets, setPagesAndWidgets }
})
