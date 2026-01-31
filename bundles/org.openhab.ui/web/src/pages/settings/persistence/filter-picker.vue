<template>
  <f7-list class="module-picker-container">
    <f7-list-item :title="title" class="defaults-picker" @click="popupOpened = true">
      <template #after>
        <div>{{ localValue.join(', ') }}<f7-icon f7="chevron_right" style="margin-left: 8px;"></f7-icon></div>
      </template>
    </f7-list-item>
  </f7-list>

  <f7-popup v-model:opened="popupOpened">
    <f7-page>
      <f7-navbar :title="title">
        <f7-nav-left>
          <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" @click="popupOpened = false" />
        </f7-nav-left>
        <f7-nav-right>
          <f7-link @click="onDone">Done</f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-list class="module-picker-container popup-list">
        <f7-list-item v-for="s in localFilters" :key="s" checkbox :checked="localValue.includes(s)" @change="toggleFilter(s)">
          {{ s }}
        </f7-list-item>
        <f7-list-item link no-chevron media-item :color="(theme.dark) ? 'black' : 'white'" subtitle="Add filter" @click="openFilterPopup">
          <template #media>
            <f7-icon color="green" aurora="f7:plus_circle_fill" ios="f7:plus_circle_fill" md="material:control_point" />
          </template>
        </f7-list-item>
      </f7-list>
    </f7-page>
  </f7-popup>

  <filter-popup
    v-model:opened="filterPopupOpen"
    :persistence="persistence"
    @close="filterPopupOpen = false"
    @filter-config-update="handleFilterUpdate($event)" />
</template>

<script>
import { theme } from 'framework7-vue'
import FilterPopup from '@/pages/settings/persistence/filter-popup.vue'

export default {
  components: { FilterPopup },
  props: {
    title: String,
    filters: Array,
    value: Array,
    persistence: Object
  },
  emits: ['filtersSelected'],
  data () {
    return {
      popupOpened: false,
      filterPopupOpen: false,

      localFilters: this.filters || [],
      localValue: [...this.value],
    }
  },
  computed: {
    theme () {
      return theme
    }
  },
  watch: {
    value: {
      handler (newVal) {
        this.localValue = [...newVal]
      },
      immediate: true
    },
    filters: {
      handler (newVal) {
        this.localFilters = newVal || []
      },
      immediate: true
    }
  },
  methods: {
    toggleFilter (filter) {
      if (this.localValue.includes(filter)) {
        this.localValue = this.localValue.filter(s => s !== filter)
      } else {
        this.localValue = [...this.localValue, filter]
      }
    },
    openFilterPopup () {
      this.filterPopupOpen = true
    },
    handleFilterUpdate (ev) {
      const filterName = ev.name
      // Update localValue FIRST so the new item will be checked when the list re-renders
      if (!this.localValue.includes(filterName)) {
        this.localValue = [...this.localValue, filterName]
      }
      // Then add to available filters
      if (!this.localFilters.includes(filterName)) {
        this.localFilters = [...this.localFilters, filterName]
      }
    },
    onDone () {
      this.$emit('filtersSelected', this.localValue)
      this.popupOpened = false
    }
  }
}
</script>
