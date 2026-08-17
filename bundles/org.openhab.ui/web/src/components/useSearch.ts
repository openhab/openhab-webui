import { ref, type Ref, shallowRef, computed } from 'vue'
import { tokensToFuse, type ParsedToken, type FilterDefinition } from '@/components/search-helpers'

import Fuse from 'fuse.js'

/**
 * a function that provides search and filter functionality for an item.
 * @returns boolean indicating whether the item matches the search criteria.
 */
export interface KeywordChecker<T = unknown> {
  (item: T, compareString: string): boolean
}

// define props, model and emits
export interface UseSearchOptions {
  returnType?: 'items' | 'indices'
  filtersDefinitions?: Record<string, FilterDefinition>
  haystackFields?: string[]
}

export function useSearch<T>(list: Ref<T[]>, options: UseSearchOptions = {}) {
  const { filtersDefinitions } = options

  const fieldAliases: Record<string, string> = Object.fromEntries(
    Object.entries(filtersDefinitions ?? {})
      .filter((entry): entry is [string, FilterDefinition & { path: string }] => {
        const [key, def] = entry
        return typeof def.path === 'string' && key !== def.path
      })
      .map(([key, def]) => [key, def.path])
  )
  const haystackFields =
    options.haystackFields?.map((field) => fieldAliases[field] ?? field) ??
    Object.entries(filtersDefinitions ?? {}).map(([key, def]) => def.path ?? key)

  // reactive data
  const tokenizedSearch = ref<ParsedToken[]>([])

  const fuseOptions = computed(() => {
    const keys = Object.entries(filtersDefinitions ?? {})
      .filter(([key, def]) => def.path ?? key)
      .map(([key, def]) => (def.getFn ? { name: def.path ?? key, getFn: def.getFn } : (def.path ?? key)))

    return {
      keys,
      useExtendedSearch: true,
      threshold: 0, // precise search, no fuzzy matching
      ignoreLocation: true // search anywhere in the string
    }
  })

  const fuse = computed(() => {
    try {
      const fuseInstance = new Fuse<T>(list.value, fuseOptions.value)
      return fuseInstance
    } catch (error) {
      console.error('Error creating Fuse instance:', error)
      return new Fuse<T>([], fuseOptions.value) // Return an empty Fuse instance on error
    }
  })

  const filteredList = computed(() => {
    const fuseSearch = tokensToFuse(tokenizedSearch.value, haystackFields, fieldAliases)
    console.debug('fuseSearch', fuseSearch)
    try {
      const result = fuse.value.search(fuseSearch)
      return result.map((item) => (options.returnType === 'indices' ? item.refIndex : item.item))
    } catch (error) {
      console.error('Error performing Fuse search:', error)
      return []
    }
  })

  const isFiltered = computed(() => tokenizedSearch.value.length > 0)

  // Event
  function onUpdateTokenizedSearch(newTokenizedSearch: ParsedToken[]) {
    tokenizedSearch.value = newTokenizedSearch
  }

  // Methods
  function getFuseValuesForField(fieldName: string): string[] {
    const field = fieldAliases[fieldName] ?? fieldName
    const keys = fuse.value.getIndex().keys
    const fieldIndex = keys.findIndex((key) => key.id === field)

    if (fieldIndex === -1) return []

    const uniqueValues = new Set<string>()
    fuse.value.getIndex().records.forEach((record) => {
      // Fuse stores field data matching in the order of the keys array
      const fieldData = record.$![fieldIndex]
      if (!fieldData) return []

      if (Array.isArray(fieldData)) {
        fieldData.forEach((val) => uniqueValues.add(val.v))
      } else {
        uniqueValues.add(fieldData.v)
      }
    })

    return Array.from(uniqueValues).sort()
  }

  return {
    filteredList,
    isFiltered,
    onUpdateTokenizedSearch,
    getFuseValuesForField
  }
}
