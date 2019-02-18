<template>
  <q-toggle :value="itemState" true-value="ON" false-value="OFF" @input="onChange" :class="{'highlight-and-fade': this.model.highlight}"></q-toggle>
</template>

<style lang="stylus">

</style>

<script>
export default {
  props: ['model'],
  data () {
    return {
      dimmerState: null
    }
  },
  methods: {
    onChange (val) {
      this.$store.dispatch('items/sendCmd', { itemName: this.model.config.item, command: val, updateState: true })
    }
  },
  computed: {
    item () {
      return this.$store.getters['items/name'](this.model.config.item)
    },
    itemState: {
      get () {
        if (!this.model.config.item) return 'OFF'
        let state = this.$store.getters['items/itemState'](this.model.config.item, true) // use the raw value
        if (state === 'ON' || state === 'OFF') return state
        if (this.item.type === 'Dimmer' || (this.item.type === 'Color' && state.split(',').length === 1)) {
          return (parseFloat(state) > 0) ? 'ON' : 'OFF'
        } else if (this.item.type === 'Color' && state.split(',').length === 3) {
          return (parseFloat(state.split(',')[2]) > 0) ? 'ON' : 'OFF'
        }
        return state
      }
      // set (val) {
      //   console.log('Updating switch')
      //   this.$store.dispatch('items/sendCmd', { itemName: this.model.config.item, command: val })
      // }
    }
  }
}

</script>
