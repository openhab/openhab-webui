<template>
  <f7-input ref="input" v-bind="config" :value="value" @input="$evt => updated($evt.target.value)" @calendar:change="updated" @texteditor:change="updated" @colorpicker:change="updated" />
</template>

<script>
import mixin from '../widget-mixin'

export default {
  mixins: [mixin],
  computed: {
    value () {
      if (this.config.variable && this.context.vars[this.config.variable] !== undefined) {
        return this.context.vars[this.config.variable]
      }
      return (this.config.item) ? this.context.store[this.config.item].state : this.config.value
    }
  },
  methods: {
    updated (value) {
      if (this.config.variable) {
        this.$set(this.context.vars, this.config.variable, value)
      }
    }
  }
}
</script>
