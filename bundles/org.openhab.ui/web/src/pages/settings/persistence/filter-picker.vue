<template>
  <f7-list class="strategy-picker-container" v-if="filters">
    <f7-list-item title="Select filters"
                  :smart-select="disabled !== true && filters.length > 0"
                  :smart-select-params="smartSelectParams"
                  ref="smartSelect"
                  class="defaults-picker">
      <select v-if="disabled !== true && filters.length > 0"
              name="filters"
              multiple
              @change="select">
        <option v-for="s in filters"
                :key="s"
                :value="s"
                :selected="value.includes(s) ? true : null">
          {{ s }}
        </option>
      </select>
      <div v-else-if="disabled === true">
        {{ value.join(', ') }}
      </div>
      <div v-else-if="disabled !== true && filters.length === 0">
        No filters available. Please add them first.
      </div>
    </f7-list-item>
  </f7-list>
</template>

<style lang="stylus">
.strategy-picker-container
  .item-content
    padding-left calc(var(--f7-list-item-padding-horizontal) / 2 + var(--f7-safe-area-left))

  .item-media
    padding 0

  .item-inner:after
    display none
</style>

<script>
import { f7 } from 'framework7-vue'

export default {
  props: {
    filters: Array,
    value: Array,
    disabled: Boolean
  },
  emits: ['filters-selected'],
  data () {
    return {
      smartSelectParams: {
        view: f7.view.main,
        openIn: 'popup'
      }
    }
  },
  methods: {
    select () {
      f7.input.validateInputs(this.$refs.smartSelect.$el)
      const value = this.$refs.smartSelect.$el.children[0].f7SmartSelect.getValue()
      this.$emit('filters-selected', value)
    }
  }
}
</script>
