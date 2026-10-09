/**
 * useSearch composable - automates the process of filtering a list based on a tokenized search input using Fuse.js.
 *
 * @description A composable that provides search functionality using Fuse.js. Supports a reactive list to update the fuse search index when the list changes, or an incremental mode where the list is not reactive.
 * @param list - The list of items to search through. Can be a Ref or a plain array (to support manual incremental updates).
 * @param options - Optional search configuration.
 * @param options.filtersDefinitions - Optional filter definitions to customize the search behavior.
 * @param options.haystackFields - Optional list of fields to include in the search. Defaults to all fields defined in the filter definitions.
 * @param options.uidField - Optional field or function to extract the unique identifier for each item.
 * @param options.includeMatches - Whether to include Fuse match details for highlighting.
 * @returns The filtered results and helper functions; see {@link UseSearchResult} for each member.
 */

import { ref, shallowRef, type Ref, computed, isRef, watch } from 'vue'
import { tokensToFuse, type ParsedToken, type FilterDefinition } from '@/components/search-helpers'

import Fuse, { type FuseResult, type FuseResultMatch } from 'fuse.js'

type StringKeyOf<T> = { [K in keyof T]-?: T[K] extends string ? K : never }[keyof T] & string

export interface UseSearchOptions<TItem> {
  filtersDefinitions?: Record<string, FilterDefinition>
  haystackFields?: string[]
  uidField?: StringKeyOf<TItem> | ((item: TItem) => string) // only needed if filteredUids are required
  includeMatches?: boolean
  fuseSearchInterceptor?: (fuseSearch: string | Record<string, unknown>) => string | Record<string, unknown>
}

/** Reactive state and helpers returned by {@link useSearch}. */
export interface UseSearchResult<TItem> {
  /** Raw Fuse results (item, refIndex and, if enabled, matches) for the current search. */
  filteredResults: Readonly<Ref<FuseResult<TItem>[]>>
  /** Items matching the current search/filter. */
  filteredList: Readonly<Ref<TItem[]>>
  /** Indices of the matching items in the source list. */
  filteredIndices: Readonly<Ref<number[]>>
  /** Unique IDs of the matching items. Requires the `uidField` option; empty otherwise. */
  filteredUids: Readonly<Ref<string[]>>
  /** True when a non-empty search or filter is active. */
  isFiltered: Readonly<Ref<boolean>>
  /** Handler for the searchbar's `update:tokenizedSearch` event. */
  onUpdateTokenizedSearch: (newTokenizedSearch: ParsedToken[]) => void
  /** Returns the sorted unique values of a field in the index, for filter option lists. */
  getFuseValuesForField: (fieldName: string) => string[]
  /** Rebuilds the Fuse index, e.g. after the source list was mutated in place. */
  forceUpdateFuseIndex: () => void
  /** Re-runs the current search without changing the index. */
  forceUpdateFuseFilter: () => void
  /** Incrementally adds an item to a non-reactive list; `capSize` drops the oldest item first. */
  addDataToFuse: (newData: TItem, capSize: boolean) => void
}

export function useSearch<TItem>(list: Ref<TItem[]> | TItem[], options: UseSearchOptions<TItem> = {}): UseSearchResult<TItem> {
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

  // Map configured aliases to their underlying paths; otherwise search all fields from the filter definitions.
  const haystackFields =
    options.haystackFields?.map((field) => fieldAliases[field] ?? field) ??
    Object.entries(filtersDefinitions ?? {}).map(([key, def]) => def.path ?? key)

  // reactive data
  const tokenizedSearch = ref<ParsedToken[]>([])
  const _forceUpdateFuseIndex = ref(0) // used to force Fuse to update when the list changes
  const _forceUpdateFuseFilter = ref(0) // used to force Fuse to update when the list changes
  const filteredResults = shallowRef<FuseResult<TItem>[]>([])

  const fuseOptions = computed(() => {
    const keys = Object.entries(filtersDefinitions ?? {})
      .filter(([key, def]) => def.path ?? key)
      .map(([key, def]) => (def.getFn ? { name: def.path ?? key, getFn: def.getFn } : (def.path ?? key)))

    return {
      keys,
      useExtendedSearch: true,
      threshold: 0, // precise search, no fuzzy matching
      ignoreLocation: true, // search anywhere in the string
      shouldSort: false, // don't sort based on search score
      includeMatches: options.includeMatches ?? false // include match data in the search results
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

  const filteredList = computed(() => filteredResults.value.map((item) => item.item))
  const filteredIndices = computed(() => filteredResults.value.map((item) => item.refIndex))
  const filteredUids = computed(() => {
    const { uidField } = options
    if (typeof uidField === 'function') return filteredList.value.map(uidField)
    if (!uidField) return []
    return filteredList.value.map((item) => item[uidField] as string)
  })

  watch(
    [fuseSearch, fuse],
    ([newFuseSearch, newFuse]) => {
      try {
        filteredResults.value = newFuse.search(fuseSearch.value)
      } catch (error) {
        console.error('Error performing Fuse search:', error)
        filteredResults.value = []
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
    const newIndex = fuse.value.getIndex().docs.length - 1
    if (isFiltered.value) {
      const result = new Fuse<TItem>([newData], fuseOptions.value).search(fuseSearch.value)
      if (result.length > 0) {
        filteredResults.value.push({ item: result[0].item, refIndex: newIndex })
      }
    } else {
      filteredResults.value.push({ item: newData, refIndex: newIndex })
    }
  }

  return {
    filteredResults,
    filteredList,
    filteredIndices,
    filteredUids,
    isFiltered,
    onUpdateTokenizedSearch,
    getFuseValuesForField,
    forceUpdateFuseIndex,
    forceUpdateFuseFilter,
    addDataToFuse
  }
}
