import { defineStore } from 'pinia'
import { readonly, ref } from 'vue'

import api from '@/js/openhab/api'

import { useRuntimeStore } from '@/js/stores/useRuntimeStore'

interface Widget {
  uid: string
}

interface Page {
  uid: string
}

export const useComponentsStore = defineStore('components', () => {
  // States
  const _widgets = ref<Widget[]>([])
  const _pages = ref<Page[]>([])
  const ready = ref<boolean>(false)

  // Getters
  function widget(uid: string): Readonly<Widget> | null {
    const widget = _widgets.value.find((widget) => widget.uid === uid)
    return widget ? readonly(widget) : null
  }

  function widgets(): Readonly<Widget[]> {
    return readonly(_widgets.value.sort((a, b) => a.uid.localeCompare(b.uid)))
  }

  function page(uid: string): Readonly<Page> | null {
    const page = _pages.value.find((page) => page.uid === uid)
    return page ? readonly(page) : null
  }

  function pages(): Readonly<Page[]> {
    const pages = _pages.value.sort((a, b) => a.uid.localeCompare(b.uid))
    return readonly(pages)
  }

  // Actions
  function setPagesAndWidgets(pages: Page[], widgets: Widget[]): void {
    _pages.value = pages
    _widgets.value = widgets
    ready.value = true
  }

  async function loadPagesAndWidgets(): Promise<void> {
    if (useRuntimeStore().apiEndpoint('ui')) {
      return Promise.all([api.get('/rest/ui/components/ui:page'), api.get('/rest/ui/components/ui:widget')]).then(
        (data: [Page[], Widget[]]) => {
          setPagesAndWidgets(data[0], data[1])
        }
      )
    } else {
      return Promise.resolve()
    }
  }

  return { ready: readonly(ready), widget, widgets, page, pages, loadPagesAndWidgets }
})
