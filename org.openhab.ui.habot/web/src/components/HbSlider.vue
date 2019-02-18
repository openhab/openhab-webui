<template>
  <q-slider ref="slider" v-model="itemState" :color="color" :class="{'highlight-and-fade': this.model.highlight}"
            :min="parseFloat(model.config.min) || defaultMin" :max="parseFloat(model.config.max) || defaultMax" :step="parseFloat(model.config.step) || defaultStep"
            :snap="model.config.snap" :markers="model.config.markers" :square="model.config.square"
            :label="model.config.label" :label-always="model.config.labelAlways" :label-value="label"
            :fill-handle-always="model.config.fillHandleAlways"
  ></q-slider>
</template>

<script>
export default {
  props: ['model'],
  data () {
    let item = this.$store.getters['items/name'](this.model.config.item)
    let metadata = (item && item.metadata && item.metadata.habot && item.metadata.habot.config) ? item.metadata.habot.config : null
    /* min/step/values considered in that order:
       1. explicit component config (model.config)
       2. those metadata config in the item's "habot" metadata namespace: min, max, step
       3. values found in the item's stateDescription
       4. defaults (min=0, max=100, step=1)
    */
    let min
    if (!min && item && metadata && metadata.min) {
      min = metadata.min
    }
    if (!min && item && item.stateDescription && item.stateDescription.minimum) {
      min = item.stateDescription.minimum
    }
    if (!min) min = 0

    let max
    if (!max && item && metadata && metadata.max) {
      max = metadata.max
    }
    if (!max && item && item.stateDescription && item.stateDescription.maximum) {
      max = item.stateDescription.minimum
    }
    if (!max) max = 100

    let step
    if (!step && item && metadata && metadata.step) {
      step = metadata.step
    }
    if (!step && item && item.stateDescription && item.stateDescription.step) {
      step = item.stateDescription.step
    }
    if (!step) step = 1

    return {
      item: item,
      metadata: metadata,
      defaultMin: min,
      defaultMax: max,
      defaultStep: step,
      wait: false,
      prev: null,
      next: null
    }
  },
  methods: {
    sendCmd (val) {
      this.$store.dispatch('items/sendCmd', { itemName: this.model.config.item, command: this.next.toString(), updateState: true })
    }
  },
  computed: {
    itemState: {
      get () {
        if (!this.item) return
        if (this.wait) return this.next
        let state = this.$store.getters['items/itemState'](this.model.config.item, true)
        if (state === 'OFF') return this.min
        if (state === 'ON') return this.max
        if (this.item.type === 'Color' && state.split(',').length === 3) {
          return parseFloat(state.split(',')[2])
        }
        return parseFloat(state)
      },
      set (val) {
        if (!this.item) return
        this.next = val
        if (this.wait) return
        this.wait = true
        this.sendCmd(val)
        setTimeout(() => {
          this.wait = false
          setTimeout(() => { this.sendCmd(val) })
        }, 500)
      }
    }
  },
  asyncComputed: {
    color () {
      if (!this.model.config.color && this.metadata && this.metadata.color) {
        return this.$expr(this.metadata.color)
      }
      return this.$expr(this.model.config.color)
    },
    label () {
      if (!this.model.config.labelValue) return
      return this.$expr(this.model.config.labelValue, { state: (this.$refs.slider) ? this.$refs.slider.model : this.itemState })
    }
  }
}

</script>
