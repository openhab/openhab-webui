import { defineStore } from 'pinia'
import { readonly, ref, type DeepReadonly } from 'vue'

import { useRuntimeStore } from '@/js/stores/useRuntimeStore'

import * as api from '@/api'

export const useComponentsStore = defineStore('components', () => {
  // States
  const _widgets = ref<api.EnrichedRootUiComponent[]>([])
  const _pages = ref<api.EnrichedRootUiComponent[]>([])
  const ready = ref<boolean>(false)

  // Getters
  function widget(uid: string): DeepReadonly<api.EnrichedRootUiComponent> | null {
    const widget = _widgets.value.find((widget) => widget.uid === uid)
    return widget ? readonly(widget) : null
  }

  function widgets(): DeepReadonly<api.EnrichedRootUiComponent[]> {
    return readonly(_widgets.value.sort((a, b) => a.uid.localeCompare(b.uid)))
  }

  function page(uid: string): DeepReadonly<api.RootUiComponent> | null {
    const page = _pages.value.find((page) => page.uid === uid)
    return page ? readonly(page) : null
  }

  function pages(): DeepReadonly<api.EnrichedRootUiComponent[]> {
    const pages = _pages.value.sort((a, b) => a.uid.localeCompare(b.uid))
    return readonly(pages)
  }

  // Actions
  function setPagesAndWidgets(pages: api.EnrichedRootUiComponent[], widgets: api.EnrichedRootUiComponent[]): void {
    _pages.value = pages
    _widgets.value = widgets
    ready.value = true
  }

  async function loadPagesAndWidgets(): Promise<void> {
    if (!useRuntimeStore().apiEndpoint('ui')) return

    return Promise.all([
      api.getRegisteredUiComponentsInNamespace({ namespace: 'ui:page' }),
      api.getRegisteredUiComponentsInNamespace({ namespace: 'ui:widget' })
    ]).then((data) => {
      setPagesAndWidgets(data[0] as api.EnrichedRootUiComponent[], data[1] as api.EnrichedRootUiComponent[])
    })
  }

  return { ready: readonly(ready), widget, widgets, page, pages, loadPagesAndWidgets }
})
