<template>
  <f7-toggle v-bind="config" :checked="value" @toggle:change="onChange" @click.native.stop />
</template>

<script>
import mixin from '../widget-mixin'
import { OhToggleDefinition } from '@/assets/definitions/widgets/system'

export default {
  mixins: [mixin],
  widget: OhToggleDefinition,
  mounted () {
    delete this.config.value
  },
  computed: {
    value () {
      if (this.config.variable) return this.context.vars[this.config.variable]
      if (!this.context.store[this.config.item]) return
      const value = this.context.store[this.config.item].state
      if (value === 'ON') return true
      if (value === 'OFF') return false
      if (value.split(',').length === 3) return (value.split(',')[2] !== '0')
      return (['0', 'UNDEF', 'NULL', '-'].indexOf(value.toString()) < 0)
    }
  },
  methods: {
    onChange (value) {
      if (value === this.value) return
      if (this.config.variable) {
        this.$set(this.context.vars, this.config.variable, value)
      } else if (this.config.item) {
        this.$store.dispatch('sendCommand', { itemName: this.config.item, cmd: (value) ? 'ON' : 'OFF' })
      }
    }
  }
}
</script>
