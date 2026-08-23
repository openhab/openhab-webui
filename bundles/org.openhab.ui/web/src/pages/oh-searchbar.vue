<template>
  <div class="oh-searchbar-container">
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

    <f7-popover
      class="filters-popover"
      :opened="showFilters"
      :backdrop="false"
      targetEl=".input-filter-button"
      containerEl=".searchbar-input-wrap"
      vertical-position="auto"
      :closeOnEscape="true"
      @popover:closed="showFilters = false">
      <div class="autocomplete-dropdown-inner">
        <div class="data-table no-safe-areas">
          <table>
            <tbody>
              <tr>
                <td class="label-cell">
                  <div>Includes</div>
                </td>
                <td class="text-input-cell">
                  <f7-input type="text" :value="includedKeywords" @input="onTextInput('include-input', $event)" />
                </td>
              </tr>
              <tr>
                <td class="label-cell">
                  <div>Excludes</div>
                </td>
                <td class="text-input-cell">
                  <f7-input type="text" :value="excludedKeywords" @input="onTextInput('exclude-input', $event)" />
                </td>
              </tr>
              <tr v-for="(filter, key) in filtersWithOptions" :key="key">
                <td class="label-cell" :class="{ 'filter-selected': anyFiltersSelected(key) }">{{ filter.label }}</td>
                <td class="value-cell">
                  <div>
                    <filter-options-list
                      :filter="filter"
                      :field="key"
                      :token="(tokensByField[key] as FieldValueToken) ?? null"
                      @update:token="updateToken"
                      @add:token="addToken"
                      @delete:token="deleteToken"></filter-options-list>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </f7-popover>
  </div>
</template>

<style lang="stylus">
.oh-searchbar-container
  position relative
  flex-grow 1
  width 100%

  .input-clear-button
    right 40px !important
  .input-filter-button
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

.aurora .oh-searchbar-container
  .filters-popover
    // left calc(var(--f7-searchbar-inner-padding-left, 0px) + var(--f7-safe-area-left, 0px)) !important
    // right calc(var(--f7-searchbar-inner-padding-right, 0px) + var(--f7-safe-area-right, 0px)) !important
    left 0px !important
    right 0px !important
    top 0px !important
    // top calc(var(--f7-searchbar-height, 48px) - 4px) !important
    width unset
    background-color var(--f7-searchbar-input-bg-color, var(--f7-searchbar-bg-color))
    border-radius var(--f7-searchbar-input-border-radius)
    padding-top 38px
    z-index 29
  .filters-popover li:last-child
    overflow hidden
  .filters-popover .item-content
    padding-left calc(var(--f7-searchbar-input-padding-horizontal) + var(--f7-searchbar-input-extra-padding-left, 0px))

  .filters-popover
    .data-table
      table
        table-layout fixed
        width 100%
      tbody
        td
          padding-top 10px !important
          padding-bottom 10px !important
          height unset
        td.label-cell
          width 15%
          background-color var(--f7-list-group-title-bg-color)
          vertical-align top
          border-left 4px solid transparent
        td.label-cell.filter-selected
          border-left 4px solid var(--f7-color-blue)
        td.text-input-cell
          input
            padding unset
            background-color inherit
            border-radius unset
        td.value-cell
          word-break break-all
          overflow-wrap break-word
          white-space normal
          width 85%
          background-color var(--f7-searchbar-input-bg-color, var(--f7-searchbar-bg-color))
          .filter-text-input
            width 100%
            height 32px
            padding-left 0px
        td.value-cell > div
            max-height calc(var(--f7-chip-height, 32px) * 3 + 12px)
            overflow-y auto
            display flex
            flex-wrap wrap
            align-content flex-start
            scrollbar-gutter stable
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
  tokensToString,
  type ParsedToken,
  type FieldValueToken,
  type ValueToken
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

const includedKeywords = computed({
  get: () => {
    const tokens = tokenizedSearch.value.filter((t): t is ValueToken => isValueToken(t)).filter((t) => !t.negated)
    return tokens.map((t) => t.values.join(',')).join(' ')
  },
  set: (newValue: string) => {
    // strip out all existing value tokens that are not negated, and append the new value token string to the end of the search string
    const tokens = tokenizedSearch.value.filter((t) => !isValueToken(t) || (isValueToken(t) && t.negated))
    let newSearchString = tokensToString(tokens)
    if (newSearchString.length > 0) newSearchString += ' '
    newSearchString += newValue
    f7SearchbarRef?.value?.$el?.f7Searchbar?.search(newSearchString)
  }
})

const excludedKeywords = computed({
  get: () => {
    const tokens = tokenizedSearch.value.filter((t): t is ValueToken => isValueToken(t)).filter((t) => t.negated)
    return tokens.map((t) => t.values.join(',')).join(' ')
  },
  set: (newValue: string) => {
    // strip out all existing value tokens that are negated, and append the new value token string to the end of the search string
    const tokens = tokenizedSearch.value.filter((t) => !isValueToken(t) || (isValueToken(t) && !t.negated))
    const newValueNegated = newValue
      .split(' ')
      .map((v) => v.trim())
      .filter((v) => v !== '')
      .map((v) => '-' + v)
      .join(' ')
    let newSearchString = tokensToString(tokens)
    if (newSearchString.length > 0) newSearchString += ' '
    newSearchString += newValueNegated
    f7SearchbarRef?.value?.$el?.f7Searchbar?.search(newSearchString)
  }
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

  useEventListener(inputEl, 'keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      if (highlightedSuggestion) {
        onAutocompletionClose({ value: [highlightedSuggestion] })
        highlightedSuggestion = null
      }
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

function onTextInput(id: 'include-input' | 'exclude-input', event: Event) {
  const target = event.target as HTMLInputElement
  if (!target) return
  const query = target.value ?? ''

  if (id === 'include-input') {
    includedKeywords.value = query
  } else {
    excludedKeywords.value = query
  }
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
function anyFiltersSelected(field: string): boolean {
  const token = tokensByField.value[field]
  return !!token && !Array.isArray(token) && isFieldValueToken(token) && token.values.length > 0
}

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
