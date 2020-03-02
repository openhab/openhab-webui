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
      if (value === 'ON') return true
      if (value === 'OFF') return false
      return (['0', 'UNDEF', 'NULL', '-'].indexOf(value.toString()) < 0)
    }
  },
  methods: {
    onChange (value) {
      if (value === this.value) return
      this.$store.dispatch('sendCommand', { itemName: this.config.item, cmd: (value) ? 'ON' : 'OFF' })
    }
  }
}
</script>
