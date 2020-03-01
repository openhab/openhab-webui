<template>
  <f7-stepper ref="stepper" v-bind="config" @stepper:change="onChange"
   manual-input-mode />
</template>

<script>
import mixin from '../widget-mixin'

export default {
  name: 'oh-stepper',
  mixins: [mixin],
  mounted () {
    delete this.config.value
  },
  computed: {
    value () {
      const value = parseFloat(this.context.store[this.config.item].state)
      return value
    }
  },
  watch: {
    value (newValue) {
      if (isNaN(newValue) || !isFinite(newValue)) return
      this.$refs.stepper.setValue(newValue)
    }
  },
  methods: {
    onChange (value) {
      if (value === this.value) return
      this.$store.dispatch('sendCommand', { itemName: this.config.item, cmd: value.toString() })
    }
  }
}
</script>
