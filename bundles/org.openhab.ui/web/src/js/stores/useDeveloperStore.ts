import { defineStore } from 'pinia'
import { reactive } from 'vue'

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
  return { pinnedObjects }
})
