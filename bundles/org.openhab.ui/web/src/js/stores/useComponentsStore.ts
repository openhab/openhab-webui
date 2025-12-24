import { defineStore } from 'pinia'
import { ref } from 'vue'

import * as api from '@/api'

export const useComponentsStore = defineStore('components', () => {
  // States
  const _widgets = ref<api.RootUiComponent[]>([])
  const _pages = ref<api.RootUiComponent[]>([])
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

  function pages (): api.RootUiComponent[] {
    const pages = _pages.value.sort((a, b) => (a.uid ?? '').localeCompare(b.uid ?? ''))
    return pages
  }

  // Actions
  function setPagesAndWidgets (pages: api.RootUiComponent[], widgets: api.RootUiComponent[]): void {
    _pages.value = pages
    _widgets.value = widgets
    ready.value = true
  }

  async function loadPagesAndWidgets (): Promise<void> {
    return Promise.all([
      api.getRegisteredUiComponentsInNamespace({ namespace: 'ui:page' }),
      api.getRegisteredUiComponentsInNamespace({ namespace: 'ui:widget' })
    ]).then((data) => {
      setPagesAndWidgets(data[0] as api.RootUiComponent[], data[1] as api.RootUiComponent[])
    })
  }

  return { ready, widget, widgets, page, pages, loadPagesAndWidgets, setPagesAndWidgets }
})
