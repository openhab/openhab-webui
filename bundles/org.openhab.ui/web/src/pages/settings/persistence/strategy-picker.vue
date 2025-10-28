<template>
  <f7-list class="strategy-picker-container" v-if="strategies">
    <f7-list-item :title="title"
                  :smart-select="disabled !== true"
                  :smart-select-params="smartSelectParams"
                  ref="smartSelect"
                  class="defaults-picker">
      <select v-if="disabled !== true"
              :name="name"
              multiple
              @change="select">
        <option v-for="s in strategies"
                :key="s"
                :value="s"
                :selected="value.includes(s) ? true : null">
          {{ s }}
        </option>
      </select>
      <div v-else>
        {{ value.join(', ') }}
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
  .item-title
    padding-left 8px
</style>

<script>
import { f7 } from 'framework7-vue'

export default {
  props: {
    title: String,
    name: String,
    strategies: Array,
    value: Array,
    disabled: Boolean
  },
  emits: ['strategies-selected'],
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
      this.$emit('strategies-selected', value)
    }
  }
}
</script>
