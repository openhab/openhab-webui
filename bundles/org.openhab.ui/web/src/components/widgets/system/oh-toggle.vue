<template>
  <f7-toggle v-bind="config" :checked="value" @toggle:change="onChange" />
</template>

<script>
import mixin from '../widget-mixin'

export default {
  name: 'oh-toggle',
  mixins: [mixin],
  mounted () {
    delete this.config.value
  },
  computed: {
    value () {
      if (!this.context.store[this.config.item]) return
      const value = this.context.store[this.config.item].state
      return value === 'ON'
    }
  },
  methods: {
    onChange (value) {
      if (value === this.value) return
      this.$emit('command', this.config.item, value ? 'ON' : 'OFF')
    }
  }
}
</script>
