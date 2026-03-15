<template>
  <f7-list class="filter-picker module-picker-container">
    <f7-list-item title="Select Filters" class="defaults-picker" @click="popupOpened = true">
      <template #after>
        <div>{{ localSelected.join(', ') }}<f7-icon f7="chevron_right" style="margin-left: 8px"></f7-icon></div>
      </template>
    </f7-list-item>
  </f7-list>

  <f7-popup v-model:opened="popupOpened" @popup:open="onOpen">
    <f7-page>
      <f7-navbar title="Select Filters">
        <f7-nav-left>
          <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" @click="popupOpened = false" />
        </f7-nav-left>
        <f7-nav-right>
          <f7-link @click="onDone">Done</f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-list class="module-picker-container popup-list">
        <f7-list-item
          v-for="f in allFilters"
          :key="f.name"
          checkbox
          :checked="localSelected.includes(f.name)"
          @change="updateSelectedFilters($event, f.name)">
          {{ f.name }}
        </f7-list-item>
        <f7-list-item link no-chevron media-item subtitle="Add filter definition" @click="openFilterPopup">
          <template #media>
            <f7-icon color="green" aurora="f7:plus_circle_fill" ios="f7:plus_circle_fill" md="material:control_point" />
          </template>
        </f7-list-item>
      </f7-list>
    </f7-page>
  </f7-popup>

  <filter-popup v-model:opened="filterPopupOpen" :filter="null" @add:filter="addFilter" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import FilterPopup from '@/pages/settings/persistence/filter-popup.vue'
import { type Filter, type FiltersDefinition } from '@/assets/definitions/persistence'
import cloneDeep from 'lodash/cloneDeep'

// Props and emits
const selected = defineModel<string[]>('selected', { required: true })
const filtersDefinitions = defineModel<FiltersDefinition>('filter-definitions', { required: true })

// Local state
const popupOpened = ref<boolean>(false)
const filterPopupOpen = ref<boolean>(false)

const localFiltersDefinitions = ref<FiltersDefinition>({} as FiltersDefinition)
const localSelected = ref<string[]>([])

const definitionsDirty = ref<boolean>(false)

// Computed
const allFilters = computed(() => {
  return Object.values(localFiltersDefinitions.value).flat()
})

// Methods
function updateSelectedFilters(event: Event, filter: string) {
  if (!(event.target instanceof HTMLInputElement)) return
  const target = event.target
  if (target.checked) {
    if (!localSelected.value.includes(filter)) {
      localSelected.value = [...localSelected.value, filter]
    }
  } else {
    localSelected.value = localSelected.value.filter((s) => s !== filter)
  }
}

function openFilterPopup() {
  filterPopupOpen.value = true
}

function closePopup() {
  popupOpened.value = false
}

// Event handlers
function addFilter(filter: Filter) {
  localFiltersDefinitions.value[filter.filterTypeName].push(filter.filter)
  // Add the new filter to the list of selected filters
  if (!localSelected.value.includes(filter.filter.name)) {
    localSelected.value = [...localSelected.value, filter.filter.name]
  }
  definitionsDirty.value = true
}

function onOpen() {
  localFiltersDefinitions.value = cloneDeep(filtersDefinitions.value)
  localSelected.value = [...selected.value]
  definitionsDirty.value = false
}

function onDone() {
  if (definitionsDirty.value) {
    filtersDefinitions.value = cloneDeep(localFiltersDefinitions.value)
  }
  selected.value = [...localSelected.value]
  definitionsDirty.value = false
  closePopup()
}
</script>
