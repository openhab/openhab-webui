import { defineStore } from 'pinia'
import { reactive, toRaw, watch } from 'vue'

interface PinnedObjects {
  items: Array<string>
  things: Array<string>
  rules: Array<string>
  scenes: Array<string>
  scripts: Array<string>
  pages: Array<string>
  widgets: Array<string>
  transformations: Array<string>
  persistenceConfigs: Array<string>
}

export const useDeveloperStore = defineStore('developer', () => {
  const pinnedObjects = reactive<PinnedObjects>({
    items: [],
    things: [],
    rules: [],
    scenes: [],
    scripts: [],
    pages: [],
    widgets: [],
    transformations: [],
    persistenceConfigs: []
  })

  const pinCollections = reactive<Record<string, PinnedObjects>>({})

  const STORAGE_KEY = 'openhab.ui:developer.pinCollections'

  function loadPinCollections () {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        Object.assign(pinCollections, parsed)
      }
    } catch (e) {
      // ignore malformed data
    }
  }

  watch(
    pinCollections,
    (val) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
      } catch (e) {
        console.warn('Failed to persist pinCollections', e)
      }
    },
    { deep: true }
  )

  loadPinCollections()

  return {
    pinnedObjects,
    pinCollections
  }
})
