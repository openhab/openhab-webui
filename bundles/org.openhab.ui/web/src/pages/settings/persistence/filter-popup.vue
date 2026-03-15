<template>
  <f7-popup :opened="opened" @popup:opened="onOpen" class="filter-popup">
    <f7-page>
      <f7-navbar>
        <f7-nav-left>
          <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" @click="closePopup" />
        </f7-nav-left>
        <f7-nav-title>{{ title }}</f7-nav-title>
        <f7-nav-right>
          <f7-link v-show="localFilter.filter.name != ''" @click="onDone">{{ createMode ? 'Add' : 'Done' }}</f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-block v-if="!localFilter.filterTypeName">
        <f7-row v-for="(ftRow, rowIndex) in filterTypesMatrix" :key="rowIndex" class="margin-bottom">
          <f7-col
            v-for="ft in ftRow"
            :key="ft.name"
            class="elevation-2 elevation-hover-6 elevation-pressed-1 persistence-filter-big-button"
            width="50">
            <f7-link class="display-flex flex-direction-column no-ripple" no-ripple @click="setFilterType(ft.name as FilterTypeName)">
              <f7-icon size="35" :f7="ft.icon" class="margin" />
              {{ ft.label }}<br />Filter
            </f7-link>
          </f7-col>
        </f7-row>
      </f7-block>
      <f7-block v-else class="no-margin no-padding">
        <f7-col>
          <f7-list>
            <f7-list-input
              ref="name"
              label="Name"
              type="text"
              placeholder="Required"
              :value="localFilter.filter.name"
              @input="localFilter.filter.name = $event.target.value"
              :disabled="!createMode ? true : null"
              :info="createMode ? 'Note: cannot be changed after the creation' : ''"
              required
              validate
              pattern="[A-Za-z0-9_]+"
              error-message="Required. Use only letters, numbers, and _." />
          </f7-list>
        </f7-col>
        <f7-col>
          <f7-block-title medium> Configuration </f7-block-title>
          <config-sheet
            ref="config-sheet"
            :parameter-groups="[]"
            :parameters="filterConfigDescriptionParameters"
            :configuration="localFilter.filter" />
        </f7-col>
      </f7-block>
    </f7-page>
  </f7-popup>
</template>

<style lang="stylus">
.persistence-filter-big-button
  background var(--f7-card-bg-color)
  text-align center
  height 7.5rem
  .link
    color var(--f7-text-color)
</style>

<script setup lang="ts">
import { ref, computed, useTemplateRef, inject } from 'vue'
import { f7 } from 'framework7-vue'
import ConfigSheet from '@/components/config/config-sheet.vue'
import { FilterTypeName, FilterTypes, persistenceKey, type Filter } from '@/assets/definitions/persistence'

import * as api from '@/api'
import cloneDeep from 'lodash/cloneDeep'

// Props and emits
const opened = defineModel<boolean>('opened')
const filter = defineModel<Filter | null>('filter', { required: true })
const emits = defineEmits<{
  (e: 'add:filter', filter: Filter): void
}>()

// Local variables
const filterTypesMatrix = createFilterTypesMatrix()

// Refs and reactive data
// Non-null assertion: this popup is only rendered within persistence-edit which always provides the key
const persistence = inject(persistenceKey)!

const configSheetRef = useTemplateRef('config-sheet')
const localFilter = ref<Filter>({ filter: { name: '' } } as Filter) // props.filter will be copied to this localFilter on open

// computed properties
const createMode = computed(() => !filter.value)
const filterConfigDescriptionParameters = computed(() => filterType.value?.configDescriptionParameters || [])
const filterTypeLabel = computed(() => filterType.value?.label?.toLowerCase() || '')
const filterType = computed(() => (localFilter.value.filterTypeName ? FilterTypes[localFilter.value.filterTypeName] : null))
const title = computed(() => (localFilter.value.filterTypeName ? `Configure ${filterTypeLabel.value} filter` : 'Select Filter Type'))

// methods
function createFilterTypesMatrix() {
  const matrix = []
  const columns = 2
  const filterTypesList = Object.values(FilterTypes)

  for (let i = 0; i < filterTypesList.length; i += columns) {
    matrix.push(filterTypesList.slice(i, i + columns))
  }
  return matrix
}

function setFilterType(filterTypeName: FilterTypeName) {
  localFilter.value.filterTypeName = filterTypeName
  localFilter.value.filter = { name: filterTypeName }
  if (localFilter.value.filterTypeName === FilterTypeName.EqualsFilters) {
    if (!localFilter.value.filter.values) {
      localFilter.value.filter.values = ['']
    }
  }
}

function closePopup() {
  opened.value = false
}

// Events
function onOpen() {
  localFilter.value = filter.value ? cloneDeep(filter.value) : ({ filter: { name: '' } } as Filter)
  if (localFilter.value.filterTypeName === FilterTypeName.EqualsFilters && !filter.value) {
    localFilter.value.filter.values = ['']
  }
}

function onDone() {
  if (!localFilter.value.filterTypeName) {
    f7.dialog.alert('Please select a filter type')
    return
  }

  if (!configSheetRef.value?.isValid()) {
    f7.dialog.alert('Please review the configuration and correct validation errors')
    return
  }

  if (localFilter.value.filterTypeName === FilterTypeName.IncludeFilters) {
    if (localFilter.value.filter.lower == null || localFilter.value.filter.upper == null) {
      f7.dialog.alert('Please provide both lower and upper bound values')
      return
    }
    if (localFilter.value.filter.upper <= localFilter.value.filter.lower) {
      f7.dialog.alert('The lower bound value must be less than the upper bound value')
      return
    }
  }

  const existingIndex = persistence.value[localFilter.value.filterTypeName].findIndex((f) => f.name === localFilter.value.filter.name)
  if (createMode.value && existingIndex !== -1) {
    f7.dialog.alert('A filter with the same name already exists!')
    return
  }

  // Handle comma-separated values for equalsFilters
  let filterToSave = cloneDeep(localFilter.value)
  if (localFilter.value.filterTypeName === FilterTypeName.EqualsFilters && typeof filterToSave.filter.values === 'string') {
    filterToSave.filter.values = (filterToSave.filter.values as string).split(',').map((v) => v.trim())
  }

  if (createMode.value) {
    emits('add:filter', filterToSave)
  } else {
    filter.value = filterToSave
  }

  closePopup()
}
</script>
