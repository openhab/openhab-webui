<template>
  <div v-if="item" class="group-form no-padding">
    <f7-list inline-labels no-hairlines-md>
      <f7-list-item v-if="item.type === 'Group'" title="Members Base Type" smart-select :smart-select-params="{openIn: 'popup', closeOnSelect: true}">
        <select name="select-basetype" @change="setGroupType($event.target.value)">
          <option v-for="type in types.GroupTypes" :key="type" :value="type" :selected="type === item.groupType.split(':')[0]">
            {{ type }}
          </option>
        </select>
      </f7-list-item>
      <f7-list-item v-if="dimensions.length && item.groupType && item.groupType.startsWith('Number')" title="Dimension" type="text" smart-select :smart-select-params="{searchbar: true, openIn: 'popup', closeOnSelect: true}">
        <select name="select-dimension" @change="setDimension($event.target.value)">
          <option key="Number" value="Number" :selected="item.type === 'Number'">
            &nbsp;
          </option>
          <option v-for="(d, i) in dimensions" :key="d.name" :value="i" :selected="'Number:' + d.name === item.groupType">
            {{ d.label }}
          </option>
        </select>
      </f7-list-item>
      <f7-list-item key="function-picker-arithmetic" v-if="item.type === 'Group' && item.groupType && (['Dimmer', 'Rollershutter'].indexOf(item.groupType) >= 0 || item.groupType.indexOf('Number') === 0)" title="Aggregation Function" smart-select :smart-select-params="{openIn: 'popover', closeOnSelect: true}">
        <select name="select-function" @change="setFunction($event.target.value)">
          <option v-for="type in types.ArithmeticFunctions" :key="type.name" :value="type.name" :selected="type.name === item.functionKey">
            {{ type.value }}
          </option>
        </select>
      </f7-list-item>
      <f7-list-item key="function-picker-logicalopenclosed" v-else-if="item.type === 'Group' && item.groupType && ['Contact'].indexOf(item.groupType) >= 0" title="Aggregation Function" smart-select :smart-select-params="{openIn: 'popup', closeOnSelect: true}">
        <select name="select-function" @change="setFunction($event.target.value)">
          <option v-for="type in types.LogicalOpenClosedFunctions" :key="type.name" :value="type.name" :selected="type.name === item.functionKey">
            {{ type.value }}
          </option>
        </select>
      </f7-list-item>
      <f7-list-item key="function-picker-logicalplaypause" v-else-if="item.type === 'Group' && item.groupType && ['Player'].indexOf(item.groupType) >= 0" title="Aggregation Function" smart-select :smart-select-params="{openIn: 'popup', closeOnSelect: true}">
        <select name="select-function" @change="setFunction($event.target.value)">
          <option v-for="type in types.LogicalPlayPauseFunctions" :key="type.name" :value="type.name" :selected="type.name === item.functionKey">
            {{ type.value }}
          </option>
        </select>
      </f7-list-item>
      <f7-list-item key="function-picker-datetime" v-else-if="item.type === 'Group' && item.groupType && ['DateTime'].indexOf(item.groupType) >= 0" title="Aggregation Function" smart-select :smart-select-params="{openIn: 'popup', closeOnSelect: true}">
        <select name="select-function" @change="setFunction($event.target.value)">
          <option v-for="type in types.DateTimeFunctions" :key="type.name" :value="type.name" :selected="type.name === item.functionKey">
            {{ type.value }}
          </option>
        </select>
      </f7-list-item>
      <f7-list-item key="function-picker-logicalonoff" v-else-if="item.type === 'Group' && item.groupType && ['Switch', 'None'].indexOf(item.groupType) >= 0" title="Aggregation Function" smart-select :smart-select-params="{openIn: 'popup', closeOnSelect: true}">
        <select name="select-function" @change="setFunction($event.target.value)">
          <option v-for="type in types.LogicalOnOffFunctions" :key="type.name" :value="type.name" :selected="type.name === item.functionKey">
            {{ type.value }}
          </option>
        </select>
      </f7-list-item>
    </f7-list>
  </div>
</template>

<script>
import * as types from '@/assets/item-types.js'

import uomMixin from '@/components/item/uom-mixin'

export default {
  mixins: [uomMixin],
  props: ['item'],
  data () {
    return {
      types
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
    setGroupType (type) {
      this.$set(this.item, 'groupType', '')
      this.$set(this.item, 'functionKey', 'None')
      this.$nextTick(() => {
        if (type !== 'None') this.$set(this.item, 'groupType', type)
      })
    },
    setDimension (index) {
      const dimension = this.dimensions[index]
      this.setGroupType('Number:' + dimension.name)
      this.$set(this.item, 'unit', dimension.systemUnit)
    },
    setFunction (key) {
      if (!key) {
        delete this.item.function
        return
      }
      this.$set(this.item, 'functionKey', key)
      const splitted = key.split('_')
      let func = {
        name: splitted[0]
      }
      if (splitted.length > 1) {
        func.params = [splitted[1], splitted[2]]
      }
      this.$set(this.item, 'function', func)
    }
  }
}
</script>

<style lang="stylus">
.group-form
  .list
    margin-top 0
    margin-bottom 0
</style>
