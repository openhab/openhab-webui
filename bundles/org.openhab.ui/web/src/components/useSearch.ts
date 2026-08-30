/**
 * useSearch composable - automates the process of filtering a list based on a tokenized search input using Fuse.js.
 *
 * @description A composable that provides search functionality using Fuse.js. Supports a reactive list to update the fuse search index when the list changes, or an incremental mode where the list is not reactive.
 * @param list - The list of items to search through. Can be a Ref or a plain array (to support manual incremental updates).
 * @param options - Optional search configuration.
 * @param options.returnType - Optional return type, either 'items' or 'indices'. Defaults to 'items'.
 * @param options.filtersDefinitions - Optional filter definitions to customize the search behavior.
 * @param options.haystackFields - Optional list of fields to include in the search. Defaults to all fields defined in the filter definitions.
 * @returns An object containing the filtered list and utility methods for managing the search.
 */

import { ref, shallowRef, type ShallowRef, type Ref, computed, isRef, watch } from 'vue'
import { tokensToFuse, type ParsedToken, type FilterDefinition } from '@/components/search-helpers'

import Fuse from 'fuse.js'

// define props, model and emits
export type SearchReturnType<TItem, TReturnType extends 'items' | 'indices' | undefined = undefined> = TReturnType extends 'indices'
  ? number[]
  : TItem[]

export interface UseSearchOptions<TReturnType extends 'items' | 'indices' | undefined = undefined> {
  returnType?: TReturnType
  filtersDefinitions?: Record<string, FilterDefinition>
  haystackFields?: string[]
  fuseSearchInterceptor?: (fuseSearch: string | Record<string, unknown>) => string | Record<string, unknown>
}

export interface UseSearchResult<TItem, TReturnType extends 'items' | 'indices' | undefined = undefined> {
  filteredList: Readonly<ShallowRef<SearchReturnType<TItem, TReturnType>>>
  isFiltered: Readonly<Ref<boolean>>
  onUpdateTokenizedSearch: (newTokenizedSearch: ParsedToken[]) => void
  getFuseValuesForField: (fieldName: string) => string[]
  forceUpdateFuseIndex: () => void
  forceUpdateFuseFilter: () => void
  addDataToFuse: (newData: TItem, capSize: boolean) => void
}

export function useSearch<TItem, TReturnType extends 'items' | 'indices' | undefined = undefined>(
  list: Ref<TItem[]> | TItem[],
  options: UseSearchOptions<TReturnType> = {}
): UseSearchResult<TItem, TReturnType> {
  const { filtersDefinitions } = options

  // extract field aliases from filtersDefinitions
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
  const _forceUpdateFuseIndex = ref(0) // used to force Fuse to update when the list changes
  const _forceUpdateFuseFilter = ref(0) // used to force Fuse to update when the list changes
  const filteredList = ref<SearchReturnType<TItem, TReturnType>>([])

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
      void _forceUpdateFuseIndex.value // access to trigger recomputation when list changes
      return new Fuse<TItem>(isRef(list) ? list.value : list, fuseOptions.value)
    } catch (error) {
      console.error('Error creating Fuse instance:', error)
      return new Fuse<TItem>([], fuseOptions.value) // Return an empty Fuse instance on error
    }
  })

  const fuseSearch = computed(() => {
    void _forceUpdateFuseFilter.value
    let tokens = tokensToFuse(tokenizedSearch.value, haystackFields, fieldAliases)
    if (options.fuseSearchInterceptor) {
      tokens = options.fuseSearchInterceptor(tokens)
    }
    return tokens
  })

  watch(
    [fuseSearch, fuse],
    ([newFuseSearch, newFuse]) => {
      try {
        const result = newFuse.search(fuseSearch.value)
        filteredList.value = result.map((item) => (options.returnType === 'indices' ? item.refIndex : item.item))
      } catch (error) {
        console.error('Error performing Fuse search:', error)
        filteredList.value = []
      }
    },
    {
      deep: true,
      immediate: true
    }
  )

  function _logComputedCost(measureName: string) {
    const entries = performance.getEntriesByName(measureName)
    if (entries.length === 0) return console.log('No evaluations yet.')

    const lastEntry = entries[entries.length - 1]
    console.log(`Last Execution Time (${measureName}): ${lastEntry.duration.toFixed(3)} ms`)
  }

  const isFiltered = computed(
    () => (typeof fuseSearch.value === 'string' && fuseSearch.value.length > 0) || Object.keys(fuseSearch.value).length > 0
  )

  // Event
  function onUpdateTokenizedSearch(newTokenizedSearch: ParsedToken[]) {
    tokenizedSearch.value = newTokenizedSearch
  }

  // Methods
  /**
   * Get unique values for a specific field from the Fuse index.
   * @param fieldName
   * @returns An array of unique values for the specified field, sorted alphabetically.
   */
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

  function forceUpdateFuseIndex() {
    _forceUpdateFuseIndex.value++
  }

  function forceUpdateFuseFilter() {
    _forceUpdateFuseFilter.value++
  }

  /**
   * Manually incrementally add to list (assuming it's not a ref).
   * It will update the Fuse index, add the new data to the list and update the filteredList if the new data matches the current search.
   */
  function addDataToFuse(newData: TItem, capSize: boolean = false) {
    if (isRef(list)) {
      console.warn('Cannot add data to Fuse index because the list is a Ref.')
      return
    }

    if (capSize) {
      fuse.value.removeAt(0) // remove the first item to keep the list size capped
    }
    // fuse adds data to the list, so we don't need to add it to the list manually
    fuse.value.add(newData)
    if (isFiltered.value) {
      const result = new Fuse([newData], fuseOptions.value).search(fuseSearch.value)
      if (result.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        filteredList.value.push(options.returnType === 'indices' ? result[0].refIndex : result[0].item)
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      filteredList.value.push(options.returnType === 'indices' ? filteredList.value.length : newData)
    }
  }

  return {
    filteredList,
    isFiltered,
    onUpdateTokenizedSearch,
    getFuseValuesForField,
    forceUpdateFuseIndex,
    forceUpdateFuseFilter,
    addDataToFuse
  } as UseSearchResult<TItem, TReturnType>
}
