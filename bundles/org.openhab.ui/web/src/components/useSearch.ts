import { ref, useTemplateRef, type Ref, shallowRef } from 'vue'
import { useEventListener, useThrottleFn, useStorage } from '@vueuse/core'
import { type Searchbar } from 'framework7'
import SearchString, { type Condition } from 'search-string'

import { useSearchMatch } from '@/composables/useSearchMatch'

/**
 * a function that provides search and filter functionality for an item.
 * @returns boolean indicating whether the item matches the search criteria.
 */
export interface KeywordChecker<T = unknown> {
  (item: T, compareString: string): boolean
}

// define props, model and emits
export interface FilterDefinition {
  label: string
  options?: Record<string, string>
  singleSelect?: boolean
  advanced?: boolean
  searchbarKeyword?: string
  keywordChecker?: KeywordChecker
}

export interface UseSearchOptions {
  persistSearchStringKey?: string
  persistStorage?: 'local' | 'session' // default is sesson storage
  filtersDefinitions?: Record<string, FilterDefinition>
}

type ListFilterSelected = Record<string, Set<string>>

type F7SearchbarInstance = { $el: { f7Searchbar: Searchbar.Searchbar | undefined } } & EventSource

const storagePrefix = 'openhab.ui:search:'

export function useSearch<T>(
  searchbar: string | Ref<F7SearchbarInstance | null>,
  haystackFunc: (item: T) => string,
  options: UseSearchOptions = {}
) {
  const { filtersDefinitions } = options
  const persistedQueryString: Ref<string | null> | null = options.persistSearchStringKey
    ? useStorage(storagePrefix + options.persistSearchStringKey, '', options.persistStorage === 'local' ? localStorage : sessionStorage, {
        flush: 'sync',
        writeDefaults: false
      })
    : null

  const keywordCheckers: Record<string, KeywordChecker> = {}
  Object.entries(filtersDefinitions ?? {}).forEach(([type, definition]) => {
    const checker = definition.keywordChecker
    if (!checker) return
    keywordCheckers[definition.searchbarKeyword ?? type] = checker
  })

  const { getWildcardRegex, clearCache } = useSearchMatch()

  // reactive data
  const searchString = shallowRef<SearchString>(SearchString.parse(''))
  const searchbarRef: Ref<F7SearchbarInstance | null> = typeof searchbar === 'string' ? useTemplateRef(searchbar) : searchbar
  const selectedListFilters = ref<ListFilterSelected>({})

  const onSearchbarSearch = useThrottleFn(
    (event: CustomEvent<{ query?: string }>) => {
      const query = event.detail.query ?? ''
      searchString.value = SearchString.parse(query)
      selectedListFilters.value = _syncListFilters(searchString.value) || {}
    },
    300,
    true
  )

  // events
  useEventListener(searchbarRef as Ref<F7SearchbarInstance>, 'searchbar:search', (event: Event) => {
    void onSearchbarSearch(event as CustomEvent<{ query?: string }>)
  })
  useEventListener(searchbarRef as Ref<EventSource>, 'searchbar:clear', onClearSearch)
  useEventListener(searchbarRef as Ref<EventSource>, 'searchbar:disable', onClearSearch)

  function onUpdateSelectedListFilters(selected: ListFilterSelected) {
    selectedListFilters.value = selected
    _syncSearchString()
  }

  // Methods
  function onClearSearch() {
    searchString.value = SearchString.parse('')
    clearCache()
  }

  function restoreSearchbarQuery() {
    if (options.persistSearchStringKey) {
      console.log('Restoring persisted search string for key: ' + options.persistSearchStringKey, persistedQueryString?.value)
      const persisted = persistedQueryString?.value
      if (persisted) {
        searchbarRef?.value?.$el?.f7Searchbar?.search(persisted)
      }
    }
  }

  function persistSearchbarQuery() {
    const key = options.persistSearchStringKey
    if (!key) return
    const toPersist = searchString.value.toString()
    const hasValue = !!toPersist && toPersist !== ''
    console.log('Persisting search string for key: ' + key, toPersist)
    if (options.persistSearchStringKey && persistedQueryString) {
      persistedQueryString.value = hasValue ? toPersist : null
    }
  }

  /**
   * Checks if a string or array of strings matches a search pattern, supporting wildcards and exact match. Utility function for keyword checkers.
   *
   * - If the search string starts with '=', it is treated as an exact match (converted to a regex that matches the whole string).
   * - Otherwise, the search string is treated as a wildcard pattern (case-insensitive).
   * - If the regex is invalid, falls back to case-insensitive string comparison.
   *
   * @param value The string or array of strings to test.
   * @param search The search pattern or string. If it starts with '=', matches exactly.
   * @returns True if any value matches the search pattern, false otherwise.
   */
  function searchValue(value: string[] | string | null, search: string): boolean {
    if (!value) return false
    const regex = getWildcardRegex(search)
    if (!regex) return false
    if (Array.isArray(value)) {
      return value.some((item) => regex.test(item))
    } else {
      return regex.test(value)
    }
  }

  function matchCondition<T>(item: T, condition: Condition): boolean {
    if (!condition.value || !keywordCheckers) return true

    const checker = keywordCheckers[condition.keyword]
    if (!checker) return true // unknown keyword, ignore
    const result = checker(item, condition.value)
    return condition.negated ? !result : result
  }

  function matchConditions<T>(item: T, conditions: Condition[]): boolean {
    return conditions.every((condition) => matchCondition(item, condition))
  }

  function matchText(text: string, searchText: { text: string; negated: boolean }[]): boolean {
    return searchText.every(({ text: search, negated }) => {
      const regex = getWildcardRegex(search)
      const result = regex ? regex.test(text) : text.toLowerCase() === search.toLowerCase()
      return negated ? !result : result
    })
  }

  /**
   * Filters and searches an array of items using advanced keyword and text search logic. Used by components to filter lists
   *
   * @template T The type of items in the array.
   * @param searchString The parsed search string (from search-string) containing conditions and text segments.
   * @param items The array of items to search.
   * @param getItemText Function to extract a searchable string from each item.
   * @param returnType Determines the return type: 'items' (default) returns matching items, 'indices' returns their indices.
   * @returns An array of matching items or their indices, depending on returnType.
   *
   * @overload
   * @param returnType 'items' — returns T[]
   * @returns {T[]}
   *
   * @overload
   * @param returnType 'indices' — returns number[]
   * @returns {number[]}
   *
   * @example
   * // Returns matching items
   * search(searchString, items, getItemText, 'items')
   * // Returns indices of matching items
   * search(searchString, items, getItemText, 'indices')
   */
  function search(items: T[], returnType: 'items'): T[]
  function search(items: T[], returnType: 'indices'): number[]
  function search(items: T[], returnType: 'items' | 'indices' | 'count' = 'items'): (T | number)[] {
    const searchConditions = searchString.value.getConditionArray()
    const searchText = searchString.value.getTextSegments()

    const matches: (T | number)[] = []
    items.forEach((item, idx) => {
      let match = true
      match = matchConditions(item, searchConditions)
      if (!match) return

      if (haystackFunc) {
        const haystack = haystackFunc(item)
        match = matchText(haystack, searchText)
        if (!match) return
      }

      matches.push(returnType === 'items' ? item : idx)
    })

    return matches
  }

  // when the search bar is updated, this will try to sync the list-filters with the search query so that the filter chips reflect the search query, used by components with list-filters and search bar, e.g. things-list and items-list-vlist
  function _syncListFilters(searchString: SearchString) {
    if (!filtersDefinitions) return
    const conditions = searchString.getConditionArray()
    const selectedListFilters: ListFilterSelected = {}
    Object.entries(filtersDefinitions).forEach(([type, definition]) => {
      const searchKeyword = definition.searchbarKeyword ?? type
      const definitionOptions = definition.options ?? {}
      if (!searchKeyword) return

      const condition = conditions.find((c) => c.keyword === searchKeyword)

      const selectedSet = new Set<string>()
      if (condition) {
        const searchValues = condition.value ? condition.value.split('|') : []
        if (!definition.singleSelect && !condition.negated) {
          // negated multiple select doesn't make much sense, so we ignore in syncing filters
          searchValues.filter((v) => v in definitionOptions).forEach((v) => selectedSet.add(v))
        } else {
          if (searchValues.length === 1) {
            // for single select, if there is a value, select it, otherwise clear selection
            const value = searchValues[0]
            if (value && value in definitionOptions) {
              if (condition.negated) {
                Object.keys(definitionOptions)
                  .filter((option) => option !== value)
                  .forEach((option) => selectedSet.add(option))
              } else {
                selectedSet.add(value)
              }
            }
          }
        }
      }
      selectedListFilters[type] = selectedSet
    })

    return selectedListFilters
  }

  function _syncSearchString() {
    if (!filtersDefinitions || !selectedListFilters.value) return

    if (Object.keys(selectedListFilters.value).length === 0) {
      searchbarRef?.value?.$el?.f7Searchbar?.clear()
      return
    }

    Object.entries(filtersDefinitions).forEach(([type, definition]) => {
      const searchbarKeyword = definition.searchbarKeyword ?? type
      // remove from both the negated and non-negated conditions, since we don't know which one is used in the search string
      searchString.value.removeKeyword(searchbarKeyword, true)
      searchString.value.removeKeyword(searchbarKeyword, false)

      const selectedSet = selectedListFilters.value[type]
      if (!selectedSet || selectedSet.size === 0) return

      if (!definition.singleSelect && selectedSet.size > 1) {
        // for multiple select, we join the selected values with '|'
        const conditionValue = Array.from(selectedSet).join('|')
        if (conditionValue && conditionValue !== '') {
          searchString.value.addEntry(searchbarKeyword, conditionValue, false)
        }
      } else if (selectedSet.size === 1) {
        const value = Array.from(selectedSet)[0]
        if (value && value !== '') {
          searchString.value.addEntry(searchbarKeyword, value, false)
        }
      }
    })

    searchbarRef?.value?.$el?.f7Searchbar?.search(searchString.value.toString())
  }

  return {
    searchString, // searchString is the parsed search string of type SearchString, which contains the conditions and text segments of the search query.
    selectedListFilters,
    search, // search takes an array of items and returns the items or their indices that match the search criteria.
    searchValue,
    onUpdateSelectedListFilters,
    persistSearchbarQuery,
    restoreSearchbarQuery
  }
}
