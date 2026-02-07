<template>
  <f7-popup :opened="opened && !!currentFilterType" class="moduleconfig-popup">
    <f7-page v-if="opened">
      <f7-navbar>
        <f7-nav-left>
          <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" @click="$emit('close')" />
        </f7-nav-left>
        <f7-nav-title> Configure {{ filterTypeLabel }} filter </f7-nav-title>
        <f7-nav-right>
          <f7-link v-show="currentFilter.name" @click="updateFilter"> Done </f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-block class="no-margin no-padding">
        <f7-col>
          <f7-list>
            <f7-list-input
              ref="name"
              label="Name"
              type="text"
              placeholder="Required"
              :value="currentFilter.name"
              @input="currentFilter.name = $event.target.value"
              :disabled="!createMode ? true : null"
              :info="(createMode) ? 'Note: cannot be changed after the creation' : ''"
              required
              validate
              pattern="[A-Za-z0-9_]+"
              error-message="Required. A-Z,a-z only" />
          </f7-list>
        </f7-col>
        <f7-col>
          <f7-block-title medium> Configuration </f7-block-title>
          <config-sheet
            ref="config-sheet"
            :parameter-groups="[]"
            :parameters="filterConfigDescriptionParameters"
            :configuration="currentFilter" />
        </f7-col>
      </f7-block>
    </f7-page>
  </f7-popup>

  <filter-type-picker :opened="opened && !currentFilterType" @close="$emit('close')" @filter-type-selected="setFilterType" />
</template>

<script>
import { f7 } from 'framework7-vue'
import cloneDeep from 'lodash/cloneDeep'
import FilterTypePicker from '@/pages/settings/persistence/filter-type-picker.vue'
import ConfigSheet from '@/components/config/config-sheet.vue'

export default {
  components: { ConfigSheet, FilterTypePicker },
  props: {
    opened: Boolean,
    persistence: Object,
    filterType: Object,
    filter: Object
  },
  emits: ['close', 'filterConfigUpdate'],
  data () {
    const initialFilter = this.filter ? cloneDeep(this.filter) : { name: null }
    // Initialize values property for equalsFilters
    if (this.filterType?.name === 'equalsFilters') {
      if (!this.filter) {
        initialFilter.values = ''
      } else if (Array.isArray(initialFilter.values)) {
        initialFilter.values = initialFilter.values.join(', ')
      }
    }
    return {
      currentFilterType: this.filterType,
      currentFilter: initialFilter
    }
  },
  computed: {
    createMode () {
      return !this.filter
    },
    filterConfigDescriptionParameters () {
      return this.currentFilterType?.configDescriptionParameters
    },
    filterTypeLabel () {
      return this.currentFilterType?.label?.toLowerCase() || ''
    }
  },
  watch: {
    filter: {
      handler (newVal) {
        const initialFilter = newVal ? cloneDeep(newVal) : { name: null }
        // Initialize values property for equalsFilters
        if (this.currentFilterType?.name === 'equalsFilters') {
          if (!newVal) {
            initialFilter.values = ''
          } else if (Array.isArray(initialFilter.values)) {
            initialFilter.values = initialFilter.values.join(', ')
          }
        }
        this.currentFilter = initialFilter
      },
      immediate: true
    },
    filterType: {
      handler (newVal) {
        this.currentFilterType = newVal
        if (this.currentFilterType?.name === 'equalsFilters') {
          if (this.currentFilter?.values == null) {
            this.currentFilter.values = ''
          } else if (Array.isArray(this.currentFilter.values)) {
            this.currentFilter.values = this.currentFilter.values.join(', ')
          }
        }
      },
      immediate: true
    }
  },
  methods: {
    setFilterType (filterType) {
      this.currentFilterType = filterType
      if (this.currentFilterType?.name === 'equalsFilters') {
        if (this.currentFilter?.values == null) {
          this.currentFilter.values = ''
        } else if (Array.isArray(this.currentFilter.values)) {
          this.currentFilter.values = this.currentFilter.values.join(', ')
        }
      }
    },
    updateFilter () {
      if (!this.$refs['config-sheet'].isValid()) {
        f7.dialog.alert('Please review the configuration and correct validation errors')
        return
      }
      if (this.currentFilterType?.name === 'includeFilters') {
        if (this.currentFilter.upper <= this.currentFilter.lower) {
          f7.dialog.alert('The lower bound value must be less than the upper bound value')
          return
        }
      }

      // Modify persistence directly and save the filter
      if (!this.persistence[this.currentFilterType.name]) this.persistence[this.currentFilterType.name] = []

      // Check for duplicates (unless editing existing)
      const existingIndex = this.persistence[this.currentFilterType.name].findIndex((f) => f.name === this.currentFilter.name)
      if (this.createMode && existingIndex !== -1) {
        f7.dialog.alert('A filter with the same name already exists!')
        return
      }

      // Handle comma-separated values for equalsFilters
      let filterToSave = cloneDeep(this.currentFilter)
      if (this.currentFilterType.name === 'equalsFilters' && typeof filterToSave.values === 'string') {
        filterToSave.values = filterToSave.values.split(',').map((v) => v.trim())
      }

      // Add or update in persistence
      if (this.createMode) {
        this.persistence[this.currentFilterType.name].push(filterToSave)
      } else if (existingIndex !== -1) {
        this.persistence[this.currentFilterType.name][existingIndex] = filterToSave
      }

      // Emit via Vue event system so parent can listen directly
      this.$emit('filterConfigUpdate', this.currentFilter)
      this.$emit('close')
    }
  }
}
</script>
