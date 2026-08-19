<template>
  <div class="oh-searchbar">
    <f7-searchbar
      v-memo="[placeholder, theme.aurora]"
      ref="f7searchbar"
      class="oh-searchbar"
      id="oh-searchbar"
      :disable-button="!theme.aurora"
      :placeholder="placeholder"
      custom-search
      @searchbar:search="onSearchbarSearch"
      @searchbar:clear="onSearchbarClear">
      <template #input-wrap-end>
        <f7-icon ref="filterButtonRef" f7="slider_horizontal_3" class="input-filter-button" @click="showFilters = !showFilters"></f7-icon>
      </template>
    </f7-searchbar>

    <!-- Render outside f7-searchbar to avoid slot-driven re-renders, but keep aligned with wrapper positioning. -->
    <div v-if="showFilters" class="filters autocomplete-dropdown">
      <div class="autocomplete-dropdown-inner">
        <div class="data-table no-safe-areas">
          <table>
            <tbody>
              <tr v-for="(filter, key) in filtersWithOptions" :key="key">
                <td class="label-cell">{{ filter.label }}</td>
                <td class="value-cell">
                  <filter-options-list
                    :filter="filter"
                    :field="key"
                    :token="tokensByField[key] ?? null"
                    @update:token="updateToken"
                    @add:token="addToken"
                    @delete:token="deleteToken"></filter-options-list>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="stylus">
.oh-searchbar
  position relative
  flex-grow 1
  width 100%

  .popover
    width 100%

  .input-clear-button
    right 40px !important
  i.icon.f7-icons.input-filter-button
    position absolute
    top 50%
    transform translateY(-50%)
    right 8px
    z-index 40
    margin 0
    color var(--f7-searchbar-input-clear-button-color, var(--f7-input-clear-button-color))
    width 24px
    height 24px
    align-content center
    cursor pointer

  .filters
    margin -5px calc(var(--f7-searchbar-inner-padding-right) + var(--f7-safe-area-right)) 0 calc(var(--f7-searchbar-inner-padding-left) + var(--f7-safe-area-left))
    width calc(100% - (var(--f7-searchbar-inner-padding-left) + var(--f7-searchbar-inner-padding-right) + var(--f7-safe-area-left) + var(--f7-safe-area-right)))
  .filters.autocomplete-dropdown
    background-color var(--f7-searchbar-input-bg-color, var(--f7-searchbar-bg-color))
    border-radius var(--f7-searchbar-input-border-radius)
  .filters.autocomplete-dropdown .autocomplete-dropdown-placeholder
    color var(--f7-searchbar-placeholder-color)
  .filters.autocomplete-dropdown li:last-child
    border-radius 0 0 var(--f7-searchbar-input-border-radius) var(--f7-searchbar-input-border-radius)
    position relative
    overflow hidden
  .filters.autocomplete-dropdown .item-content
    padding-left calc(var(--f7-searchbar-input-padding-horizontal) + var(--f7-searchbar-input-extra-padding-left, 0px))

  .filters
    .data-table
      table
        table-layout fixed
        width 100%
      tbody
        td
          padding-top 10px !important
          padding-bottom 10px !important
          height unset
        td.value-cell
          word-break break-all
          overflow-wrap break-word
          white-space normal
          width 85%
          background-color var(--f7-list-item-bg-color, var(--f7-card-bg-color))
        td.label-cell
          width 15%
          white-space normal
          background-color var(--f7-list-group-title-bg-color)
          vertical-align top
</style>

<script setup lang="ts">
import { useTemplateRef, onMounted, onUnmounted, onBeforeUnmount, ref, watch, type Ref, computed, nextTick } from 'vue'
import { type Searchbar, type Autocomplete } from 'framework7'
import { f7, theme } from 'framework7-vue'
import { useStorage, useThrottleFn, useEventListener } from '@vueuse/core'
import {
  type FilterDefinition,
  tokenizeString,
  isValueToken,
  isFieldValueToken,
  applySuggestion,
  type Token,
  type ParsedToken,
  type FieldValueToken
} from '@/components/search-helpers'
import FilterOptionsList from '@/pages/filter-options-list.vue'

type F7SearchbarInstance = {
  $el: { f7Searchbar: Searchbar.Searchbar | undefined; querySelector(selector: string): HTMLElement | null }
} & EventSource

const storagePrefix = 'openhab.ui:search:'

const f7SearchbarRef = useTemplateRef<F7SearchbarInstance>('f7searchbar')
const showFilters = ref(false)
const tokenizedSearch = ref<ParsedToken[]>([])
let autocompleteSearchbar: Autocomplete.Autocomplete | null = null
let initialValueString: string | null = null
const rawSearchString = ref<string>('')
let inputEl: HTMLInputElement | null = null
let highlightedSuggestion: string | null = null

const props = defineProps<{
  searchQuery?: string
  persistSearchStringKey?: string
  haystackFields?: string[]
  filtersDefinitions?: Record<string, FilterDefinition>
  placeholder?: string
}>()

const emits = defineEmits<{
  (e: 'update:tokenizedSearch', value: ParsedToken[]): void
}>()

const persistedQueryString: Ref<string | null> | null = props.persistSearchStringKey
  ? useStorage(storagePrefix + props.persistSearchStringKey, '', sessionStorage, {
      flush: 'sync',
      writeDefaults: false
    })
  : null

// Computed
const availableKeys = computed(() => {
  return Object.keys(props.filtersDefinitions ?? {}).sort()
})

const placeholder = computed(() => {
  if (props.placeholder) return props.placeholder
  if (!props.filtersDefinitions || window.innerWidth < 900) return 'Search...'
  return `Search keywords or field:value (${availableKeys.value.join(', ')})`
})

const filtersWithOptions = computed(() => {
  return Object.fromEntries(
    Object.entries(props.filtersDefinitions ?? {}).filter(([type, filter]) => {
      if (!filter.options) return false
      if (typeof filter.options === 'function') return filter.options().length > 0
      return filter.options.length > 0
    })
  )
})

const tokensByField = computed<Record<string, FieldValueToken>>(() => {
  if (!showFilters.value) return {}

  const _tokensByField = tokenizedSearch.value.reduce<Record<string, FieldValueToken>>((acc, token) => {
    if (isFieldValueToken(token)) {
      acc[token.field] = token
    }
    return acc
  }, {})

  return _tokensByField
})

// Watchers
watch(
  () => rawSearchString.value,
  (newValue) => {
    tokenizedSearch.value = tokenizeString(newValue)
    if (autocompleteSearchbar && autocompleteSearchbar.opened) {
    }
    emits('update:tokenizedSearch', tokenizedSearch.value)
  }
)

// Lifecycle
onMounted(() => {
  inputEl = (f7SearchbarRef?.value?.$el?.querySelector('input[type="search"]') as HTMLInputElement) ?? null
  restoreSearchbarQuery()
  createAutocompleteSearchbar()

  useEventListener(document, 'keydown', (e) => {
    if (e.key === 'Escape') showFilters.value = false
  })

  useEventListener(inputEl, 'keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      if (highlightedSuggestion) {
        onAutocompletionClose({ value: [highlightedSuggestion] })
        highlightedSuggestion = null
      }
    }
  })

  useEventListener(document, 'click', (e) => {
    const target = e.target as HTMLElement | null
    if (!target) return

    const clickedInsideFilters = !!target.closest('.filters.autocomplete-dropdown')
    const clickedFilterButton = !!target.closest('.input-filter-button')

    if (!clickedInsideFilters && !clickedFilterButton) {
      showFilters.value = false
    }
  })
})

onBeforeUnmount(() => {
  persistSearchbarQuery()
})

onUnmounted(() => {
  destroyAutocompleteSearchbar()
})

// Events
const updateRawSearchString = useThrottleFn(
  (query: string) => {
    rawSearchString.value = query
  },
  300,
  true
)

function onSearchbarSearch(event: { query?: string }) {
  // Snapshot the query before throttling so delayed execution does not depend on event payload state.
  const query = typeof event.query === 'string' ? event.query : (inputEl?.value ?? '')
  updateRawSearchString(query)
}

function onSearchbarClear() {
  rawSearchString.value = ''
}

function addToken(token: FieldValueToken) {
  if (!isFieldValueToken(token)) return
  const newSearchString = rawSearchString.value + ' ' + `${token.field}:${token.values?.join(',')}`
  f7SearchbarRef?.value?.$el?.f7Searchbar?.search(newSearchString)
  inputEl?.setSelectionRange(newSearchString.length, newSearchString.length)
}

function deleteToken(token: FieldValueToken) {
  if (!isFieldValueToken(token)) return
  const oldSearchString = rawSearchString.value

  const start = token.start ?? 0
  const end = token.start && token.rawToken ? token.start + token.rawToken.length : oldSearchString.length
  const newSearchString = oldSearchString.slice(0, start) + oldSearchString.slice(end)

  f7SearchbarRef?.value?.$el?.f7Searchbar?.search(newSearchString)
  inputEl?.setSelectionRange(newSearchString.length, newSearchString.length)
}

function updateToken(token: FieldValueToken) {
  if (!isFieldValueToken(token)) return
  const oldSearchString = rawSearchString.value

  const start = token.start ?? 0
  const end = token.start && token.rawToken ? token.start + token.rawToken.length : oldSearchString.length
  const newSearchString = oldSearchString.slice(0, start) + `${token.field}:${token.values?.join(',')}` + oldSearchString.slice(end)
  f7SearchbarRef?.value?.$el?.f7Searchbar?.search(newSearchString)
  inputEl?.setSelectionRange(newSearchString.length, newSearchString.length)
}

// Methods

function restoreSearchbarQuery(key?: string) {
  key = key ?? props.persistSearchStringKey
  if (!key || !persistedQueryString) return

  console.log('Restoring persisted search string for key: ' + key, persistedQueryString?.value)
  const persisted = persistedQueryString?.value
  if (persisted && typeof persisted === 'string') {
    if (autocompleteSearchbar && !Array.isArray((autocompleteSearchbar as { value?: unknown }).value)) {
      ;(autocompleteSearchbar as { value: string[] }).value = []
    }
    f7SearchbarRef?.value?.$el?.f7Searchbar?.search(persisted)
  }
}

function persistSearchbarQuery(key?: string) {
  key = key ?? props.persistSearchStringKey
  if (!key || !persistedQueryString) return

  const toPersist = rawSearchString.value
  const hasValue = !!toPersist && toPersist !== ''
  console.log('Persisting search string for key: ' + key, toPersist)
  if (key && persistedQueryString) {
    persistedQueryString.value = hasValue ? toPersist : null
  }
}

// Autocomplete Methods & Events
function createAutocompleteSearchbar() {
  if (!f7SearchbarRef?.value?.$el || !inputEl) return null

  if (autocompleteSearchbar) {
    autocompleteSearchbar.destroy()
    autocompleteSearchbar = null
  }

  autocompleteSearchbar = f7.autocomplete.create({
    openIn: 'dropdown',
    inputEl,
    value: [],
    // limit: 10,
    source: autocompleteSource,
    updateInputValueOnSelect: false,
    on: {
      opened: function () {
        showFilters.value = false
        // Hack to address "close" triggering and a value being set even though the user didn't select anything. This is likely a bug in Framework7's autocomplete component.
        initialValueString = JSON.stringify((this as { value?: unknown }).value || [])
      },
      close: onAutocompletionClose
    }
  })
}

function destroyAutocompleteSearchbar() {
  if (!autocompleteSearchbar) return

  autocompleteSearchbar.destroy()
  autocompleteSearchbar = null
}

async function autocompleteSource(query: string, render: (suggestions: string[]) => void) {
  if (autocompleteSearchbar && !Array.isArray((autocompleteSearchbar as { value?: unknown }).value)) {
    ;(autocompleteSearchbar as { value: string[] }).value = []
  }

  const cursorPosition = inputEl?.selectionStart !== 0 ? (inputEl?.selectionStart ?? 0) : query.length
  const previousChar = cursorPosition > query.length + 1 ? ' ' : (query[cursorPosition - 1] ?? ' ')

  let suggestions: string[] = []

  if (query.length === 0) {
    render([])
    return
  }

  const token = tokenizeString(query, cursorPosition)
  if (!token) {
    render(suggestions)
    return
  }

  if (previousChar === ' ') {
    suggestions = availableKeys.value.map((f) => `${f}:`)
  } else if (isValueToken(token)) {
    const fieldQuery = token.values?.[0]?.toLowerCase() ?? ''
    suggestions = availableKeys.value.filter((f) => f.startsWith(fieldQuery)).map((f) => `${f}:`)
  } else if (isFieldValueToken(token)) {
    const optionsFnOrArray = props.filtersDefinitions?.[token.field ?? '']?.options
    const options = typeof optionsFnOrArray === 'function' ? (optionsFnOrArray() ?? []) : (optionsFnOrArray ?? [])
    const valueQuery = previousChar === ',' ? '' : (token.values?.[token.values?.length - 1]?.toLowerCase() ?? '')
    suggestions = options.filter((o) => o.toLowerCase().startsWith(valueQuery))
  }

  // save first option as highlighted suggestion for tab completion
  highlightedSuggestion = suggestions[0]
  render(suggestions ?? [])
}

function onAutocompletionClose(autocomplete: any) {
  const query = inputEl?.value ?? ''
  const cursorPosition = inputEl?.selectionStart !== 0 ? (inputEl?.selectionStart ?? 0) : query.length
  const currentChar = cursorPosition > query.length ? ' ' : (query[cursorPosition] ?? ' ')

  const currentValueString = JSON.stringify(autocomplete?.value || [])
  // see hack note in opened event handler above
  if (initialValueString === currentValueString) return

  const value = autocomplete?.value?.[0] as string | undefined
  if (!value) return

  const token = tokenizeString(query, inputEl?.selectionStart ?? value.length)
  const { newSearchString, newToken } = applySuggestion(query, token, value, currentChar === ',')
  f7SearchbarRef?.value?.$el?.f7Searchbar?.search(newSearchString)

  nextTick(() => {
    inputEl?.focus()
    if (inputEl) {
      const selectionStart = (token?.start ?? 0) + (newToken?.rawToken?.length ?? 0)
      inputEl.setSelectionRange(selectionStart, selectionStart)
    }
  })
}

defineExpose({
  persistSearchbarQuery,
  restoreSearchbarQuery
})
</script>
