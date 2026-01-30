import { defineStore } from 'pinia'
import { readonly, ref, type DeepReadonly } from 'vue'

import { useRuntimeStore } from '@/js/stores/useRuntimeStore'

import * as api from '@/api'

export const useComponentsStore = defineStore('components', () => {
  // States
  const _widgets = ref<api.RootUiComponent[]>([])
  const _pages = ref<api.RootUiComponent[]>([])
  const ready = ref<boolean>(false)

  // Getters
  function widget(uid: string): DeepReadonly<api.RootUiComponent> | null {
    const widget = _widgets.value.find((widget) => widget.uid === uid)
    return widget ? readonly(widget) : null
  }

  function widgets(): DeepReadonly<api.RootUiComponent[]> {
    return readonly(_widgets.value.sort((a, b) => a.uid.localeCompare(b.uid)))
  }

  function page(uid: string): DeepReadonly<api.RootUiComponent> | null {
    const page = _pages.value.find((page) => page.uid === uid)
    return page ? readonly(page) : null
  }

  function pages(): DeepReadonly<api.RootUiComponent[]> {
    const pages = _pages.value.sort((a, b) => a.uid.localeCompare(b.uid))
    return readonly(pages)
  }

  // Actions
  function setPagesAndWidgets(pages: api.RootUiComponent[], widgets: api.RootUiComponent[]): void {
    _pages.value = pages
    _widgets.value = widgets
    ready.value = true
  }

  async function loadPagesAndWidgets(): Promise<void> {
    if (useRuntimeStore().apiEndpoint('ui')) {
      return Promise.all([
        api.getRegisteredUiComponentsInNamespace({ namespace: 'ui:page' }),
        api.getRegisteredUiComponentsInNamespace({ namespace: 'ui:widget' })
      ]).then((data) => {
        setPagesAndWidgets(data[0] as api.RootUiComponent[], data[1] as api.RootUiComponent[])
      })
    } else {
      return Promise.resolve()
    }
  }

  return { ready: readonly(ready), widget, widgets, page, pages, loadPagesAndWidgets }
})
