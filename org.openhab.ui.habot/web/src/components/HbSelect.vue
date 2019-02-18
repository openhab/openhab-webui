<template>
  <q-select :value="item.state" :options="options"
            :radio="this.model.config.radio"
            :filter="this.model.config.filter"
            :separator="this.model.config.separator"
            :dark="this.model.config.dark"
            :stackLabel="this.model.config.stackLabel"
            :color="color"
            :inverted="this.model.config.inverted"
            :hide-underline="this.model.config.hideUnderline"
            :align="this.model.config.align"
            :disable="disable"
            @change="sendCmd" />
</template>

<script>
export default {
  name: 'HbSelect',
  props: ['model'],
  methods: {
    sendCmd (val) {
      if (this.item && val) {
        this.$store.dispatch('items/sendCmd', { itemName: this.model.config.item, command: val })
      }
    }
  },
  computed: {
    item () {
      return this.$store.getters['items/name'](this.model.config.item)
    },
    options () {
      if (this.model.slots && this.model.slots.options) {
        return this.model.slots.options.map((opt) => {
          return opt.config
        })
      } else if (this.item && this.item.stateDescription && this.item.stateDescription.options) {
        return this.item.stateDescription.options.map((opt) => {
          return {
            label: opt.label,
            value: opt.value
          }
        })
      } else {
        return []
      }
    }
  },
  asyncComputed: {
    color () {
      return this.$expr(this.model.config.color)
    },
    disable () {
      if (!this.model.config.disable) return false
      return this.$expr('=' + this.model.config.disable)
    }
  }
}
</script>
