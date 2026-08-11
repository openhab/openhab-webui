import { ref, useTemplateRef, type Ref, shallowRef, computed, watch } from 'vue'
import { f7 } from 'framework7-vue'
import { useEventListener, useThrottleFn, useStorage } from '@vueuse/core'
import { type Searchbar, type Autocomplete } from 'framework7'
import { parseAdvancedQueryRobustDeep, getAutocompleteContext, getUniqueValuesForField, applySuggestion } from '@/components/search-helpers'

import Fuse from 'fuse.js'

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
  path?: string
  hideOptions?: boolean
  getFn?: (item: unknown) => string
}

export interface UseSearchOptions {
  persistSearchStringKey?: string
  persistStorage?: 'local' | 'session' // default is sesson storage
  returnType?: 'items' | 'indices'
  filtersDefinitions?: Record<string, FilterDefinition>
  haystackFields?: string[]
}

type ListFilterSelected = Record<string, Set<string>>

type F7SearchbarInstance = { $el: { f7Searchbar: Searchbar.Searchbar | undefined } } & EventSource

const storagePrefix = 'openhab.ui:search:'

export function useSearch<T>(list: Ref<T[]>, searchbar: string | Ref<F7SearchbarInstance | null>, options: UseSearchOptions = {}) {
  const { filtersDefinitions } = options

  let autocompleteSearchbar: Autocomplete.Autocomplete | null = null
  let inputEl: HTMLInputElement | null = null
  const fieldAliases: Record<string, string> = Object.fromEntries(
    Object.entries(filtersDefinitions ?? {})
      .filter((entry): entry is [string, FilterDefinition & { path: string }] => {
        const [key, def] = entry
        return typeof def.path === 'string' && key !== def.path
      })
      .map(([key, def]) => [key, def.path])
  )
  const haystackFields = options.haystackFields ?? Object.entries(filtersDefinitions ?? {}).map(([key, def]) => def.path ?? key)

  const persistedQueryString: Ref<string | null> | null = options.persistSearchStringKey
    ? useStorage(storagePrefix + options.persistSearchStringKey, '', options.persistStorage === 'local' ? localStorage : sessionStorage, {
        flush: 'sync',
        writeDefaults: false
      })
    : null

  // reactive data
  const rawSearchString = shallowRef<string>('')
  const parsedSearchString = shallowRef(parseAdvancedQueryRobustDeep('', haystackFields, fieldAliases))
  const searchbarRef: Ref<F7SearchbarInstance | null> = typeof searchbar === 'string' ? useTemplateRef(searchbar) : searchbar
  const selectedListFilters = ref<ListFilterSelected>({})

  const onSearchbarSearch = useThrottleFn(
    (event: CustomEvent<{ query?: string }>) => {
      const query = event.detail.query ?? ''
      rawSearchString.value = query
      parsedSearchString.value = parseAdvancedQueryRobustDeep(query, haystackFields, fieldAliases)
      console.debug('onSearchbarSearch: parsedSearchString:', parsedSearchString.value)
    },
    300,
    true
  )

  const fuseAvailableKeys = computed(() => {
    return Object.keys(filtersDefinitions ?? {}).sort()
  })

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
    const fuseInstance = new Fuse<T>(list.value, fuseOptions.value)
    return fuseInstance
  })

  const searchPlaceholder = computed(() => {
    if (!filtersDefinitions || window.innerWidth < 900) return 'Search...'
    const fields = fuseAvailableKeys.value.join(', ')
    return `Search keywords or field:value (${fields})`
  })

  const filteredList = computed(() => {
    return fuse.value.search(parsedSearchString.value).map((item) => {
      if (options.returnType === 'indices') {
        return item.refIndex
      } else {
        return item.item
      }
    })
  })

  watch(rawSearchString, (newValue: string) => {
    if (newValue !== inputEl?.value) {
      searchbarRef?.value?.$el?.f7Searchbar?.search(newValue)
    }
  })

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
    rawSearchString.value = ''
  }

  function createAutocompleteSearchbar() {
    const searchbarElement = searchbarRef?.value?.$el
    if (!(searchbarElement instanceof HTMLElement)) return null

    inputEl = searchbarElement.querySelector<HTMLInputElement>('input[type="search"]')
    if (!inputEl) return null

    if (autocompleteSearchbar) {
      autocompleteSearchbar.destroy()
      autocompleteSearchbar = null
    }

    autocompleteSearchbar = f7.autocomplete.create({
      openIn: 'dropdown',
      inputEl,
      // limit: 10,
      source: autocompleteSource,
      typeahead: true,
      updateInputValueOnSelect: false,
      on: {
        change: (value) => {
          console.debug('autocomplete change event, value:', value)
          if (!value) return

          const cursorPosition = inputEl?.selectionStart ?? value.length
          const newText = applySuggestion(
            rawSearchString.value,
            (value[0] as string) ?? '',
            getAutocompleteContext(rawSearchString.value, cursorPosition),
            cursorPosition
          )
          console.debug('autocomplete change event, newText:', newText)
          rawSearchString.value = newText ?? ''
        }
      }
    })
  }

  function destroyAutocompleteSearchbar() {
    if (!autocompleteSearchbar) return

    autocompleteSearchbar.destroy()
    autocompleteSearchbar = null
  }

  function autocompleteSource(query: string, render: (suggestions: string[]) => void) {
    let suggestions: string[] = []
    const cursorPosition = inputEl?.selectionStart ?? query.length

    if (query.length === 0) {
      render(suggestions)
      return
    }

    const context = getAutocompleteContext(query, cursorPosition)
    if (context.type === 'field') {
      suggestions = fuseAvailableKeys.value.filter((f) => f.startsWith(context.query.toLowerCase())).map((f) => `${f}:`)
    } else if (context.type === 'value' && context.field && !filtersDefinitions?.[context.field]?.hideOptions) {
      const predefinedValues = getUniqueValuesForField(fuse.value, fieldAliases[context.field] ?? context.field)
      suggestions = predefinedValues.filter((v) => v.indexOf(context.query.toLowerCase()) >= 0)
    }

    // Render items by passing array with result items
    render(suggestions)
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
    const toPersist = rawSearchString.value
    const hasValue = !!toPersist && toPersist !== ''
    console.log('Persisting search string for key: ' + key, toPersist)
    if (options.persistSearchStringKey && persistedQueryString) {
      persistedQueryString.value = hasValue ? toPersist : null
    }
  }

  // when the search bar is updated, this will try to sync the list-filters with the search query so that the filter chips reflect the search query, used by components with list-filters and search bar, e.g. things-list and items-list-vlist
  // function _syncListFilters(earchString: SearchString) {
  function _syncListFilters() {
    /*
    const searchString = searchString.value
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
    */
  }

  function _syncSearchString() {
    /*
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
    */
  }

  return {
    rawSearchString,
    parsedSearchString,
    selectedListFilters,
    filteredList,
    onUpdateSelectedListFilters,
    persistSearchbarQuery,
    restoreSearchbarQuery,
    createAutocompleteSearchbar,
    destroyAutocompleteSearchbar,
    searchPlaceholder
  }
}
