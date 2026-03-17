<template>
  <f7-popup :opened="opened" @popup:opened="onOpened" @popup:closed="closePopup" class="definitions-popup moduleconfig-popup">
    <f7-page>
      <f7-navbar title="Manage Definitions">
        <f7-nav-left>
          <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" @click="closePopup" />
        </f7-nav-left>
        <f7-nav-right>
          <f7-link v-if="dirty" @click="onDone"> Done </f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-block class="no-margin no-padding">
        <f7-col>
          <f7-block-title medium class="padding-bottom"> Definitions </f7-block-title>
          <f7-block-header> Cron strategy and filter definitions used in a persistence configuration. </f7-block-header>
          <!-- Cron Strategies -->
          <f7-block-title small style="margin-bottom: var(--f7-list-margin-vertical)"> Cron Strategies </f7-block-title>
          <f7-list media-list swipeout>
            <f7-list-item
              v-for="(cs, index) in (localPersistence.cronStrategies || [])"
              :key="cs.name"
              :title="cs.name"
              :footer="cs.cronExpression"
              :link="editable"
              @click="openCronStrategy(cs)"
              swipeout>
              <template #media>
                <f7-link
                  v-if="editable"
                  icon-color="red"
                  icon-aurora="f7:minus_circle_filled"
                  icon-ios="f7:minus_circle_filled"
                  icon-md="material:remove_circle_outline"
                  @click.stop="showSwipeout" />
              </template>
              <f7-swipeout-actions v-if="editable" right>
                <f7-swipeout-button
                  @click.stop="(ev: MouseEvent) => deleteStrategy(ev, 'cronStrategies', index)"
                  style="background-color: var(--f7-swipeout-delete-button-bg-color)">
                  Delete
                </f7-swipeout-button>
              </f7-swipeout-actions>
            </f7-list-item>
          </f7-list>
          <f7-list v-if="editable">
            <f7-list-item link no-chevron media-item subtitle="Add cron strategy" @click="openCronStrategy(null)">
              <template #media>
                <f7-icon color="green" aurora="f7:plus_circle_fill" ios="f7:plus_circle_fill" md="material:control_point" />
              </template>
            </f7-list-item>
          </f7-list>
          <!-- Filters -->
          <f7-block-title small style="margin-bottom: var(--f7-list-margin-vertical)"> Filters </f7-block-title>
          <f7-list v-for="ft in Object.values(FilterTypes)" :key="ft.name" :media-list="editable" swipeout>
            <f7-list-item
              v-for="(f, index) in (localPersistence[ft.name as FilterTypeName])"
              :key="f.name"
              :title="f.name"
              :footer="(typeof ft.footerFn === 'function') ? ft.footerFn(f) : ''"
              :link="editable"
              @click="openFilter({ filterTypeName: ft.name as FilterTypeName, filter: f })"
              swipeout>
              <template #media>
                <f7-link
                  v-if="editable"
                  icon-color="red"
                  icon-aurora="f7:minus_circle_filled"
                  icon-ios="f7:minus_circle_filled"
                  icon-md="material:remove_circle_outline"
                  @click.stop="showSwipeout" />
              </template>
              <f7-swipeout-actions v-if="editable" right>
                <f7-swipeout-button
                  @click.stop="(ev: MouseEvent) => deleteStrategy(ev, ft.name as FilterTypeName, index)"
                  style="background-color: var(--f7-swipeout-delete-button-bg-color)">
                  Delete
                </f7-swipeout-button>
              </f7-swipeout-actions>
            </f7-list-item>
          </f7-list>
          <f7-list v-if="editable">
            <f7-list-item link no-chevron media-item class="auto-dark-text" subtitle="Add filter" @click="openFilter(null)">
              <template #media>
                <f7-icon color="green" aurora="f7:plus_circle_fill" ios="f7:plus_circle_fill" md="material:control_point" />
              </template>
            </f7-list-item>
          </f7-list>
        </f7-col>
      </f7-block>
    </f7-page>
  </f7-popup>

  <!-- Cron Strategy Popup -->
  <cron-strategy-popup
    v-model:opened="cronStrategyPopupOpen"
    :cronStrategy="currentCronStrategy"
    @update:cron-strategy="updateCronStrategy"
    @add:cron-strategy="addCronStrategy" />

  <!-- Filter Popup -->
  <filter-popup v-model:opened="filterPopupOpen" :filter="currentFilter" @update:filter="updateFilter" @add:filter="addFilter" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { f7 } from 'framework7-vue'
import cloneDeep from 'lodash/cloneDeep'

import { FilterTypes } from '@/assets/definitions/persistence'
import CronStrategyPopup from '@/pages/settings/persistence/cron-strategy-popup.vue'
import FilterPopup from '@/pages/settings/persistence/filter-popup.vue'
import type { Filter, FilterTypeName } from '@/assets/definitions/persistence'
import * as api from '@/api'
import { showConfirmDialog } from '@/js/dialog-promises'

// Props and emits
const opened = defineModel<boolean>('opened')
const persistence = defineModel<api.PersistenceServiceConfiguration>('persistence', { required: true })
const props = defineProps<
{
  editable: boolean
}>()

// Local State
const cronStrategyPopupOpen = ref<boolean>(false)
const filterPopupOpen = ref<boolean>(false)
const localPersistence = ref<api.PersistenceServiceConfiguration>(cloneDeep(persistence.value))

const currentCronStrategy = ref<api.PersistenceCronStrategy | null>(null)
const currentFilter = ref<Filter | null>(null)
const dirty = ref<boolean>(false)

// Methods
function openCronStrategy (cronStrategy: api.PersistenceCronStrategy | null) {
  if(!props.editable) return
  currentCronStrategy.value = cronStrategy
  cronStrategyPopupOpen.value = true
}

function addCronStrategy(cronStrategy: api.PersistenceCronStrategy) {
  if(!props.editable) return
  localPersistence.value.cronStrategies.push(cronStrategy)
  currentCronStrategy.value = null
  dirty.value = true
}

function updateCronStrategy(cronstrategy: api.PersistenceCronStrategy | null) {
  if (!props.editable || !cronstrategy) return
  const index = localPersistence.value.cronStrategies.findIndex((cs) => cs.name === cronstrategy.name)
  if (index !== -1) {
    localPersistence.value.cronStrategies[index] = cronstrategy
  }

  currentCronStrategy.value = null
  dirty.value = true
}


function openFilter (filter: Filter | null) {
  if(!props.editable) return
  currentFilter.value = filter
  filterPopupOpen.value = true
}

function addFilter (filter: Filter) {
  if(!props.editable) return
  localPersistence.value[filter.filterTypeName].push(filter.filter)
  filterPopupOpen.value = false
  currentFilter.value = null
  dirty.value = true
}

function updateFilter (filter: Filter | null) {
  if (!props.editable || !filter) return
  const index = localPersistence.value[filter.filterTypeName].findIndex((f) => f.name === filter.filter.name)
  if (index !== -1) {
    localPersistence.value[filter.filterTypeName][index] = filter.filter
  }
  filterPopupOpen.value = false
  currentFilter.value = null
  dirty.value = true
}

function deleteStrategy (ev: MouseEvent, type: FilterTypeName | 'cronStrategies', index: number) {
  if(!props.editable) return
  const sName = localPersistence.value[type][index]?.name
  if(!sName) return
  // Check if strategy is used in configurations
  if (_isStrategyUsed(sName)) {
    showConfirmDialog('Strategy used in configuration(s), delete anyway?', "Delete Persistence Strategy").then((confirmed) => {
      if (!confirmed) return

      _deleteModule(ev, type, index)
      _removeStrategyFromConfiguration(sName)
    })
  } else {
    _deleteModule(ev, type, index)
  }
}

function _removeStrategyFromConfiguration (strategy: string) {
  localPersistence.value.configs.forEach((cfg) => {
    const sIndex = cfg.strategies?.findIndex((s) => s === strategy) ?? -1
    if (sIndex >= 0 && cfg.strategies) cfg.strategies.splice(sIndex, 1)
  })
}

function _isStrategyUsed (csName: string | undefined) {
  return localPersistence.value.configs?.findIndex((cfg) => cfg.strategies?.findIndex((cs) => cs === csName) >= 0) >= 0
}

function _deleteModule (ev: MouseEvent, module: 'cronStrategies' | FilterTypeName, index: number) {
  if (!props.editable) return
  const swipeoutElement = (ev.target as HTMLElement).closest('.swipeout')
  if (swipeoutElement instanceof HTMLElement) {
    f7.swipeout.delete(swipeoutElement, () => {
      localPersistence.value[module].splice(index, 1)
      dirty.value = true
    })
  }
}

function showSwipeout (event: MouseEvent) {
  const swipeoutElement = (event.target as HTMLElement).closest('.swipeout')
  if (swipeoutElement instanceof HTMLElement) {
    f7.swipeout.open(swipeoutElement)
  }
}

function onOpened() {
  // Reset local persistence to match props when popup is opened
  localPersistence.value = cloneDeep(persistence.value)
  dirty.value = false
}

function closePopup () {
  opened.value = false
  cronStrategyPopupOpen.value = false
  filterPopupOpen.value = false
  currentCronStrategy.value = null
  currentFilter.value = null
}

function onDone () {
  if(props.editable) {
    persistence.value = cloneDeep(localPersistence.value)
  }
  dirty.value = false
  closePopup()
}
</script>
