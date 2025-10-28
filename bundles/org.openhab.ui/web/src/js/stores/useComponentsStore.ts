import { defineStore } from 'pinia'
import { ref } from 'vue'

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
  function widget (uid: string) {
    return _widgets.value.find((widget) => widget.uid === uid)
  }

  function widgets () {
    return _widgets.value.sort((a, b) => a.uid.localeCompare(b.uid))
  }

  function page (uid: string) {
    return _pages.value.find((page) => page.uid === uid)
  }

  function pages (): Page[] {
    const pages = _pages.value.sort((a, b) => a.uid.localeCompare(b.uid))
    return pages
  }

  // Actions
  function setPagesAndWidgets (pages: Page[], widgets: Widget[]): void {
    _pages.value = pages
    _widgets.value = widgets
    ready.value = true
  }

  async function loadPagesAndWidgets (): Promise<void> {
    if (useRuntimeStore().apiEndpoint('ui')) {
      return Promise.all([
        api.get('/rest/ui/components/ui:page'),
        api.get('/rest/ui/components/ui:widget')
      ]).then((data: [Page[], Widget[]]) => {
        _pages.value = data[0]
        _widgets.value = data[1]
        ready.value = true
      })
    } else {
      return Promise.resolve()
    }
  }

  return { ready, widget, widgets, page, pages, loadPagesAndWidgets, setPagesAndWidgets }
})
