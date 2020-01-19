<template>
  <div v-if="item" class="group-form no-padding">
    <f7-list inline-labels no-hairlines-md>
      <f7-list-item v-if="item.type === 'Group'" title="Members Base Type" smart-select :smart-select-params="{openIn: 'popup', closeOnSelect: true}">
        <select name="select-basetype" @change="setGroupType($event.target.value)">
          <option v-for="type in types.GroupTypes" :key="type" :value="type" :selected="type === item.groupType">{{type}}</option>
        </select>
      </f7-list-item>
      <f7-list-item key="function-picker-arithmetic" v-if="item.type === 'Group' && ['Number', 'Dimmer', 'Rollershutter'].indexOf(item.groupType) >= 0" title="Aggregation Function" smart-select :smart-select-params="{openIn: 'popover', closeOnSelect: true}">
        <select name="select-function" @change="setFunction($event.target.value)">
          <option v-for="type in types.ArithmeticFunctions" :key="type.name" :value="type.name" :selected="type.name === item.functionKey">{{type.value}}</option>
        </select>
      </f7-list-item>
      <f7-list-item key="function-picker-logicalopenclosed" v-else-if="item.type === 'Group' && ['Contact'].indexOf(item.groupType) >= 0" title="Aggregation Function" smart-select :smart-select-params="{openIn: 'popup', closeOnSelect: true}">
        <select name="select-function" @change="setFunction($event.target.value)">
          <option v-for="type in types.LogicalOpenClosedFunctions" :key="type.name" :value="type.name" :selected="type.name === item.functionKey">{{type.value}}</option>
        </select>
      </f7-list-item>
      <f7-list-item key="function-picker-datetime" v-else-if="item.type === 'Group' && ['DateTime'].indexOf(item.groupType) >= 0" title="Aggregation Function" smart-select :smart-select-params="{openIn: 'popup', closeOnSelect: true}">
        <select name="select-function" @change="setFunction($event.target.value)">
          <option v-for="type in types.DateTimeFunctions" :key="type.name" :value="type.name" :selected="type.name === item.functionKey">{{type.value}}</option>
        </select>
      </f7-list-item>
      <f7-list-item key="function-picker-logicalonoff" v-else-if="item.type === 'Group' && ['Switch', 'None'].indexOf(item.groupType) >= 0" title="Aggregation Function" smart-select :smart-select-params="{openIn: 'popup', closeOnSelect: true}">
        <select name="select-function" @change="setFunction($event.target.value)">
          <option v-for="type in types.LogicalOnOffFunctions" :key="type.name" :value="type.name" :selected="type.name === item.functionKey">{{type.value}}</option>
        </select>
      </f7-list-item>
    </f7-list>
  </div>
</template>

<script>
import * as types from '@/assets/item-types.js'

export default {
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
        this.$set(this.item, 'groupType', type)
      })
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
