<template>
  <f7-popup :opened="opened" class="persistence-definitions-popup">
    <f7-page v-if="opened">
      <f7-navbar title="Manage Definitions">
        <f7-nav-left>
          <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" @click="onClose" />
        </f7-nav-left>
        <f7-nav-right>
          <f7-link v-if="hasChanges" @click="onDone"> Done </f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-block>
        <f7-block-title medium> Definitions </f7-block-title>
        <f7-block-header> Cron strategy and filter definitions used in a persistence configuration. </f7-block-header>
        <!-- Cron Strategies -->
        <f7-block-title small style="margin-bottom: var(--f7-list-margin-vertical)"> Cron Strategies </f7-block-title>
        <f7-list media-list swipeout>
          <f7-list-item
            v-for="(cs, index) in (persistenceLocal.cronStrategies || [])"
            :key="cs.name"
            :title="cs.name"
            :footer="cs.cronExpression"
            :link="editable"
            @click="editCronStrategy(cs)"
            swipeout>
            <template #media>
              <f7-link
                v-if="editable"
                icon-color="red"
                icon-aurora="f7:minus_circle_filled"
                icon-ios="f7:minus_circle_filled"
                icon-md="material:remove_circle_outline"
                @click="showSwipeout" />
            </template>
            <f7-swipeout-actions right v-if="editable">
              <f7-swipeout-button
                @click="(ev) => deleteCronStrategy(ev, index)"
                style="background-color: var(--f7-swipeout-delete-button-bg-color)">
                Delete
              </f7-swipeout-button>
            </f7-swipeout-actions>
          </f7-list-item>
        </f7-list>
        <f7-list>
          <f7-list-item link no-chevron media-item :color="uiOptionsStore.darkMode" subtitle="Add cron strategy" @click="addCronStrategy">
            <template #media>
              <f7-icon color="green" aurora="f7:plus_circle_fill" ios="f7:plus_circle_fill" md="material:control_point" />
            </template>
          </f7-list-item>
        </f7-list>
        <!-- Filters -->
        <f7-block-title small style="margin-bottom: var(--f7-list-margin-vertical)"> Filters </f7-block-title>
        <f7-list v-for="ft in FilterTypes" :key="ft.name" :media-list="editable" swipeout>
          <f7-list-item
            v-for="(f, index) in (persistenceLocal[ft.name] || [])"
            :key="f.name"
            :title="f.name"
            :footer="(typeof ft.footerFn === 'function') ? ft.footerFn(f) : ''"
            :link="editable"
            @click="editFilter(ft, f)"
            swipeout>
            <template #media>
              <f7-link
                v-if="editable"
                icon-color="red"
                icon-aurora="f7:minus_circle_filled"
                icon-ios="f7:minus_circle_filled"
                icon-md="material:remove_circle_outline"
                @click="showSwipeout" />
            </template>
            <f7-swipeout-actions right v-if="editable">
              <f7-swipeout-button
                @click="(ev) => deleteFilter(ev, ft, index)"
                style="background-color: var(--f7-swipeout-delete-button-bg-color)">
                Delete
              </f7-swipeout-button>
            </f7-swipeout-actions>
          </f7-list-item>
        </f7-list>
        <f7-list>
          <f7-list-item link no-chevron media-item :color="uiOptionsStore.darkMode" subtitle="Add filter" @click="addFilter">
            <template #media>
              <f7-icon color="green" aurora="f7:plus_circle_fill" ios="f7:plus_circle_fill" md="material:control_point" />
            </template>
          </f7-list-item>
        </f7-list>
      </f7-block>
    </f7-page>
  </f7-popup>

  <!-- Cron Strategy Popup -->
  <cron-strategy-popup
    v-model:opened="cronStrategyPopupOpen"
    :persistence="persistenceLocal"
    :cronStrategy="currentCronStrategy"
    @close="cronStrategyPopupOpen = false; currentCronStrategy = null"
    @cron-strategy-config-update="handleCronStrategyUpdate" />

  <!-- Filter Popup -->
  <filter-popup
    v-model:opened="filterPopupOpen"
    :persistence="persistenceLocal"
    :filter="currentFilter"
    :filterType="currentFilterType"
    @close="filterPopupOpen = false; currentFilterType = null; currentFilter = null"
    @filter-config-update="handleFilterUpdate" />
</template>

<style lang="stylus">
.persistence-definitions-popup
  .block
    padding-left var(--f7-safe-area-left)
    padding-right var(--f7-safe-area-right)
  .media-list
    margin-bottom 0
  .list
    margin-top 0
    margin-bottom 0
</style>

<script>
import { f7 } from 'framework7-vue'
import cloneDeep from 'lodash/cloneDeep'
import fastDeepEqual from 'fast-deep-equal/es6'
import { mapStores } from 'pinia'


import { useUIOptionsStore } from  '@/js/stores/useUIOptionsStore'
import { FilterTypes } from '@/assets/definitions/persistence'
import CronStrategyPopup from '@/pages/settings/persistence/cron-strategy-popup.vue'
import FilterPopup from '@/pages/settings/persistence/filter-popup.vue'

export default {
  emits: ['close', 'definitionsUpdate'],
  props: {
    opened: Boolean,
    persistence: Object,
    editable: Boolean
  },
  components: {
    CronStrategyPopup,
    FilterPopup
  },
  data () {
    return {
      FilterTypes,
      persistenceLocal: cloneDeep(this.persistence || {}),

      // popup visibility
      cronStrategyPopupOpen: false,
      filterPopupOpen: false,

      currentCronStrategy: null,
      currentFilterType: null,
      currentFilter: null
    }
  },
  watch: {
    persistence: {
      handler (newPersistence) {
        if (newPersistence) {
          this.persistenceLocal = cloneDeep(newPersistence)
        }
      },
      deep: true
    }
  },
  computed: {
    hasChanges () {
      if (!this.persistence || !this.persistenceLocal) return false
      if (!fastDeepEqual(this.persistence.cronStrategies, this.persistenceLocal.cronStrategies)) return true
      for (const filterType of FilterTypes.map((ft) => ft.name)) {
        if (!fastDeepEqual(this.persistence[filterType], this.persistenceLocal[filterType])) return true
      }
      return false
    },
    ...mapStores(useUIOptionsStore)
  },
  methods: {
    addCronStrategy () {
      this.editCronStrategy(null)
    },
    editCronStrategy (cronStrategy) {
      this.currentCronStrategy = cronStrategy || undefined
      this.cronStrategyPopupOpen = true
    },
    handleCronStrategyUpdate () {
      // Nested popup modified persistenceLocal directly, just close it
      this.cronStrategyPopupOpen = false
      this.currentCronStrategy = null
    },
    deleteCronStrategy (ev, index) {
      const csName = this.persistenceLocal.cronStrategies[index].name
      // Check if strategy is used in configurations
      if (this.isCronStrategyUsed(csName)) {
        f7.dialog.confirm(
          'Cron strategy used in configuration(s), delete anyway?',
          () => {
            this.deleteModule(ev, 'cronStrategies', index)
          }
        )
      } else {
        this.deleteModule(ev, 'cronStrategies', index)
      }
    },
    isCronStrategyUsed (csName) {
      return this.persistenceLocal.configs?.findIndex((cfg) => cfg.strategies?.findIndex((cs) => cs === csName) >= 0) >= 0
    },
    addFilter () {
      this.editFilter(null, null)
    },
    editFilter (filterType, filter) {
      this.currentFilterType = filterType
      this.currentFilter = filter || undefined
      this.filterPopupOpen = true
    },
    handleFilterUpdate () {
      // Nested popup modified persistenceLocal directly, just close it
      this.filterPopupOpen = false
      this.currentFilterType = null
      this.currentFilter = null
    },
    deleteFilter (ev, filterType, index) {
      const filterName = this.persistenceLocal[filterType.name][index].name
      // Check if filter is used in configurations
      if (this.isFilterUsed(filterName)) {
        f7.dialog.confirm(
          'Filter used in configuration(s), delete anyway?',
          () => {
            this.deleteModule(ev, filterType.name, index)
          }
        )
      } else {
        this.deleteModule(ev, filterType.name, index)
      }
    },
    isFilterUsed (filterName) {
      return this.persistenceLocal.configs?.findIndex((cfg) => cfg.filters?.findIndex((f) => f === filterName) >= 0) >= 0
    },
    deleteModule (ev, module, index) {
      if (!this.editable) return
      let swipeoutElement = ev.target
      ev.cancelBubble = true
      while (!swipeoutElement.classList.contains('swipeout')) {
        swipeoutElement = swipeoutElement.parentElement
      }
      f7.swipeout.delete(swipeoutElement, () => {
        this.persistenceLocal[module].splice(index, 1)
      })
    },
    showSwipeout (event) {
      let swipeoutElement = event.target
      event.cancelBubble = true
      while (!swipeoutElement.classList.contains('swipeout')) {
        swipeoutElement = swipeoutElement.parentElement
      }

      if (swipeoutElement) {
        f7.swipeout.open(swipeoutElement)
      }
    },
    onClose () {
        this.persistenceLocal = cloneDeep(this.persistence)
        this.$emit('close')
    },
    onDone () {
      this.$emit('definitionsUpdate', this.persistenceLocal)
    }
  }
}
</script>
