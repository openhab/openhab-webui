<template>
  <div class="group-form no-padding">
    <!-- Type -->
    <f7-list-item v-if="item.type === 'Group'" :disabled="!editable" title="Members Base Type" class="aligned-smart-select" smart-select :smart-select-params="{searchbar: true, openIn: 'popup', closeOnSelect: true}">
      <select name="select-basetype" @change="groupType = $event.target.value">
        <option v-for="type in types.GroupTypes" :key="type" :value="type" :selected="item.groupType ? type === item.groupType : false">
          {{ type }}
        </option>
      </select>
    </f7-list-item>
    <!-- Dimension -->
    <f7-list-item v-if="dimensions.length && item.groupType && item.groupType.startsWith('Number')" :disabled="!editable" title="Dimension" class="aligned-smart-select" smart-select :smart-select-params="{searchbar: true, openIn: 'popup', closeOnSelect: true}">
      <select name="select-dimension" @change="groupDimension = $event.target.value">
        <option key="" value="Number" :selected="item.type === 'Number'" />
        <option v-for="d in dimensions" :key="d.name" :value="d.name" :selected="'Number:' + d.name === item.groupType">
          {{ d.label }}
        </option>
      </select>
    </f7-list-item>
    <!-- (Internal) Unit & State Description -->
    <f7-list-input v-show="groupType && groupDimension && dimensionsReady"
                   ref="groupUnit"
                   label="Unit"
                   type="text"
                   :info="(createMode) ? 'Type any valid unit for the dimension or select from one of the proposed units. Used internally, for persistence and external systems. \
                                          It is independent from the state visualization in the UI, which is defined through the state description pattern.' : ''"
                   :value="groupDimension ? groupUnit : ''"
                   @change="groupUnit = $event.target.value" :clear-button="editable" />
    <f7-list-input v-show="groupType && groupDimension"
                   label="State Description Pattern"
                   type="text"
                   :info="(createMode) ? 'Pattern or transformation applied to the state for display purposes. Only saved if you change the pre-filled default value.' : ''"
                   :value="getStateDescription()"
                   @input="item.stateDescriptionPattern = $event.target.value" :clear-button:="editable" />
    <!-- Aggregation Functions -->
    <f7-list-item v-if="aggregationFunctions" :disabled="!editable" title="Aggregation Function" class="align-popup-list-item" smart-select :smart-select-params="{openIn: 'popup', closeOnSelect: true}">
      <select name="select-function" @change="groupFunctionKey = $event.target.value">
        <option v-for="type in aggregationFunctions" :key="type.name" :value="type.name" :selected="type.name === groupFunctionKey">
          {{ type.value }}
        </option>
      </select>
    </f7-list-item>
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
      oldGroupDimension: '',
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
        if (!this.createMode) {
          this.oldGroupDimension = ''
        }
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
        if (!this.createMode) {
          this.oldGroupDimension = this.groupDimension
        }
        if (!newDimension) {
          this.groupType = 'Number'
          return
        }
        const dimension = this.dimensions.find((d) => d.name === newDimension)
        this.$set(this.item, 'groupType', 'Number:' + dimension.name)
        this.groupUnit = this.getUnitHint(dimension.name)
        this.$set(this.item, 'stateDescriptionPattern', this.getStateDescription())
      }
    },
    groupUnit: {
      get () {
        return this.unit
      },
      set (newUnit) {
        if (!this.createMode) {
          this.oldGroupUnit = this.unit
        }
        this.$set(this.item, 'unit', newUnit)
      }
    },
    groupFunctionKey: {
      get () {
        return this.item.functionKey
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
    aggregationFunctions () {
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
      return null
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
    dimensionChanged () {
      if (!this.oldGroupDimension) {
        return false
      }
      return this.oldGroupDimension !== this.dimension
    },
    unitChanged () {
      return this.oldGroupUnit && this.item.unit && this.oldGroupUnit !== this.item.unit
    },
    revertDimensionChange () {
      if (!this.oldGroupDimension) {
        this.groupType = 'Number'
        this.$set(this.item, 'unit', '')
      } else {
        this.groupType = 'Number:' + this.oldGroupDimension
        this.$set(this.item, 'unit', this.oldGroupUnit)
      }
    },
    getStateDescription () {
      return this.item.stateDescriptionPattern ? this.item.stateDescriptionPattern : '%.0f %unit%'
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
