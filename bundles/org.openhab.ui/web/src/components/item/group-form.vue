<template>
  <div class="group-form no-padding">
    <!-- Type -->
    <f7-list-item v-if="item.type === 'Group'"
                  :disabled="!editable"
                  :key="'type-' + groupType"
                  title="Members Base Type"
                  class="aligned-smart-select"
                  smart-select
                  :smart-select-params="{searchbar: true, openIn: 'popup', closeOnSelect: true}">
      <select name="select-basetype" @change="groupType = $event.target.value">
        <option v-for="type in types.GroupTypes"
                :key="type"
                :value="type"
                :selected="type === groupType">
          {{ type }}
        </option>
      </select>
    </f7-list-item>
    <!-- Dimension -->
    <f7-list-item v-if="dimensions.length && groupType && groupType === 'Number'"
                  :disabled="!editable"
                  :key="'dimension-' + groupDimension"
                  title="Dimension"
                  class="aligned-smart-select"
                  smart-select
                  :smart-select-params="{searchbar: true, openIn: 'popup', closeOnSelect: true}">
      <select name="select-dimension" @change="groupDimension = $event.target.value">
        <option key="" value="Number" :selected="groupType === 'Number'" />
        <option v-for="d in dimensions"
                :key="d.name"
                :value="d.name"
                :selected="d.name === groupDimension">
          {{ d.label }}
        </option>
      </select>
    </f7-list-item>
    <!-- (Internal) Unit & State Description -->
    <f7-list-input v-show="groupType && groupDimension && dimensionsReady"
                   :disabled="!editable"
                   ref="groupUnit"
                   label="Unit"
                   type="text"
                   :info="(createMode) ? 'Type a valid unit for the dimension or select from the proposed units. Used internally, for persistence and external systems. Is independent from state visualization in the UI, which is defined through the state description pattern.' : ''"
                   :value="groupDimension ? groupUnit : ''"
                   @change="groupUnit = $event.target.value"
                   :clear-button="editable" />
    <f7-list-input v-show="groupType && groupDimension"
                   :disabled="!editable"
                   label="State Description Pattern"
                   type="text"
                   :info="(createMode) ? 'Pattern or transformation applied to the state for display purposes. Only saved if you change the pre-filled default value.' : ''"
                   :value="stateDescriptionPattern"
                   @input="stateDescriptionPattern = $event.target.value"
                   :clear-button:="editable" />
    <!-- Aggregation Functions -->
    <f7-list-item v-if="aggregationFunctions"
                  :disabled="!editable"
                  title="Aggregation Function"
                  class="aligned-smart-select"
                  smart-select
                  :smart-select-params="{openIn: 'popup', closeOnSelect: true}">
      <select name="select-function" @change="groupFunctionKey = $event.target.value">
        <option v-for="type in aggregationFunctions"
                :key="type.name"
                :value="type.name"
                :selected="type.name === groupFunctionKey">
          {{ type.value }}
        </option>
      </select>
    </f7-list-item>
    <!-- COUNT aggregation function regular expression input -->
    <f7-list-input v-if="aggregationFunctions && groupFunctionKey === 'COUNT'"
                   :disabled="!editable"
                   label="COUNT Expression"
                   type="text"
                   info="Specify the regular expression used to to match the states of the members."
                   :value="groupFunctionParam"
                   @input="groupFunctionParam = $event.target.value"
                   :clear-button="editable" />
  </div>
</template>

<style lang="stylus">
.group-form
  .item-inner
    padding-left 1em
  .list
    margin-top 0
    margin-bottom 0
</style>

<script>
import * as types from '@/assets/item-types.js'

import uomMixin from '@/components/item/uom-mixin'

export default {
  mixins: [uomMixin],
  props: ['item', 'createMode'],
  data () {
    return {
      types,
      groupUnitAutocomplete: null,
      oldGroupType: !this.createMode ? this.item.groupType?.split(':')[0] : '',
      oldGroupDimension: (!this.createMode && this.item.groupType?.split(':').length > 1) ? this.item.groupType.split(':')[1] : '',
      oldGroupUnit: ''
    }
  },
  watch: {
    dimensionsReady (newValue, oldValue) {
      if (oldValue === false && newValue === true) this.initializeAutocompleteGroupUnit()
    }
  },
  computed: {
    editable () {
      return this.createMode || (this.item && this.item.editable)
    },
    groupType: {
      get () {
        return this.item.groupType?.split(':')[0]
      },
      set (newType) {
        const previousAggregationFunctions = this.aggregationFunctions
        this.$set(this.item, 'groupType', '')
        this.$nextTick(() => {
          if (newType !== 'None') {
            this.$set(this.item, 'groupType', newType)
            if (previousAggregationFunctions !== this.aggregationFunctions) {
              this.$set(this.item, 'functionKey', 'None')
            }
          }
        })
      }
    },
    groupDimension: {
      get () {
        const parts = this.item.groupType?.split(':')
        return parts && parts.length > 1 ? parts[1] : ''
      },
      set (newDimension) {
        if (!newDimension) {
          this.groupType = 'Number'
          return
        }
        const dimension = this.dimensions.find((d) => d.name === newDimension)
        this.$set(this.item, 'groupType', 'Number:' + dimension.name)
        this.groupUnit = this.getUnitHint(dimension.name)
        this.$set(this.item, 'stateDescriptionPattern', this.stateDescriptionPattern)
      }
    },
    groupUnit: {
      get () {
        return this.unit
      },
      set (newUnit) {
        this.$set(this.item, 'unit', newUnit)
      }
    },
    stateDescriptionPattern: {
      get () {
        if (this.item.stateDescriptionPattern) return this.item.stateDescriptionPattern
        return this.item.metadata?.stateDescription?.config.pattern || '%.0f %unit%'
      },
      set (newPattern) {
        this.$set(this.item, 'stateDescriptionPattern', newPattern)
      }
    },
    groupFunctionKey: {
      get () {
        return this.item.functionKey.startsWith('COUNT') ? 'COUNT' : this.item.functionKey
      },
      set (newFunctionKey) {
        if (!newFunctionKey) {
          delete this.item.function
          this.$set(this.item, 'functionKey', '')
          return
        }
        this.$set(this.item, 'functionKey', newFunctionKey)
        const parts = newFunctionKey.split('_')
        let func = {
          name: parts[0]
        }
        if (parts.length > 1) {
          func.params = [parts[1], parts[2]]
        }
        this.$set(this.item, 'function', func)
      }
    },
    groupFunctionParam: {
      get () {
        return this.item.function?.params?.length ? this.item.function.params[0] : null
      },
      set (newFunctionParam) {
        this.$set(this.item.function, 'params', [newFunctionParam])
      }
    },
    aggregationFunctions () {
      if (this.groupType === 'None') return null

      const specificAggregationFunctions = (groupType) => {
        switch (this.groupType) {
          case 'Dimmer':
          case 'Rollershutter':
          case 'Number':
            return types.ArithmeticFunctions
          case 'Contact':
            return types.LogicalOpenClosedFunctions
          case 'Player':
            return types.LogicalPlayPauseFunctions
          case 'DateTime':
            return types.DateTimeFunctions
          case 'Switch':
            return types.LogicalOnOffFunctions
        }
        return []
      }
      return [...types.CommonFunctions, ...specificAggregationFunctions(this.groupType)]
    }
  },
  beforeMount () {
    if (this.item.function) {
      this.$set(this.item, 'functionKey', this.item.function.name)
      if (this.item.function.params) {
        this.item.functionKey += '_' + this.item.function.params.join('_')
      }
    } else {
      this.$set(this.item, 'functionKey', 'None')
    }
  },
  methods: {
    typeChanged () {
      if (!this.oldGroupType) return false
      return this.oldGroupType !== this.groupType
    },
    dimensionChanged () {
      if (!this.oldGroupDimension) return false
      return this.oldGroupDimension !== this.dimension
    },
    unitChanged () {
      return this.oldGroupUnit && this.item.unit && this.oldGroupUnit !== this.item.unit
    },
    revertChange () {
      if (!this.oldGroupDimension) {
        this.groupType = this.oldGroupType
        this.$set(this.item, 'unit', '')
      } else {
        this.groupType = this.oldGroupType + ':' + this.oldGroupDimension
        this.$set(this.item, 'unit', this.oldGroupUnit)
      }
    },
    initializeAutocompleteGroupUnit () {
      const self = this
      const unitControl = this.$refs.groupUnit
      if (!unitControl || !unitControl.$el) return
      const inputElement = this.$$(unitControl.$el).find('input')
      this.groupUnitAutocomplete = this.$f7.autocomplete.create({
        inputEl: inputElement,
        openIn: 'dropdown',
        dropdownPlaceholderText: self.getUnitHint(this.dimension),
        source (query, render) {
          let curatedUnits = self.groupDimension ? self.getUnitList(self.groupDimension) : []
          let allUnits = self.groupDimension ? self.getFullUnitList(self.groupDimension) : []
          if (!query || !query.length) {
          // Render curated list by default
            render(curatedUnits)
          } else {
            let units = curatedUnits.filter(u => u.indexOf(query) >= 0)
            if (units.length) {
              // Show full curated list if in curated list
              render(curatedUnits)
            } else {
              // If no match filter on full list
              render(allUnits.filter(u => u.indexOf(query) >= 0))
            }
          }
        }
      })
    }
  },
  mounted () {
    if (!this.createMode && this.groupDimension) {
      this.oldGroupDimension = this.groupDimension
      this.oldGroupUnit = this.groupUnit
      if (this.dimensionsReady) this.initializeAutocompleteGroupUnit()
    }
  },
  beforeDestroy () {
    if (this.groupUnitAutocomplete) {
      this.$f7.autocomplete.destroy(this.groupUnitAutocomplete)
      this.groupUnitAutocomplete = null
    }
  }
}
</script>
