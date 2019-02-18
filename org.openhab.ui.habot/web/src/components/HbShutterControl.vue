<template>
  <q-btn-group :flat="this.model.config.flat" :rounded="this.model.config.rounded" :outline="this.model.config.outline" :push="this.model.config.push"
    :class="{'highlight-and-fade': this.model.highlight}">
    <q-btn :flat="this.model.config.flat" :rounded="this.model.config.rounded" :outline="this.model.config.outline" :dense="this.model.config.dense"
           :push="this.model.config.push" :glossy="this.model.config.glossy" :no-ripple="this.model.config.noRipple"
           :size="this.model.config.size" :icon="iconUpDown('up')" :text-color="upColor" @click="sendCmd('UP')" />
    <q-btn :flat="this.model.config.flat" :rounded="this.model.config.rounded" :outline="this.model.config.outline" :push="this.model.config.push"
           :glossy="this.model.config.glossy" :no-ripple="this.model.config.noRipple" :dense="this.model.config.dense"
           :size="this.model.config.size" :icon="this.model.config.stopIcon || 'stop'" :text-color="stopColor" @click="sendCmd('STOP')" />
    <q-btn :flat="this.model.config.flat" :rounded="this.model.config.rounded" :outline="this.model.config.outline" :push="this.model.config.push"
           :glossy="this.model.config.glossy" :no-ripple="this.model.config.noRipple" :dense="this.model.config.dense"
           :size="this.model.config.size" :icon="iconUpDown('down')" :text-color="downColor" @click="sendCmd('DOWN')" />
  </q-btn-group>
</template>

<script>
import HbBtn from 'components/HbBtn.vue'
export default {
  name: 'HbBtnGroup',
  props: ['model'],
  components: {
    HbBtn
  },
  methods: {
    iconUpDown (direction) {
      switch (this.model.config.upDownIcons) {
        case 'keyboard_arrow':
          return 'keyboard_arrow_' + direction
        case 'arrow_drop':
          return 'arrow_drop_' + direction
        default:
          return 'arrow_' + direction + 'ward'
      }
    },
    sendCmd (cmd) {
      this.$store.dispatch('items/sendCmd', { itemName: this.model.config.item, command: cmd })
    }
  },
  computed: {
    stopColor () {
      return 'negative'
      // return (this.itemState === 'UP' || this.itemState === 'DOWN') ? 'red' : ''
    },
    downColor () {
      return ''
      // return this.itemState === 'DOWN' ? 'secondary' : ''
    },
    upColor () {
      return ''
      // return this.itemState === 'UP' ? 'secondary' : ''
    },
    item () {
      return this.$store.getters['items/name'](this.model.config.item)
    },
    itemState: {
      get () {
        if (!this.model.config.item) return ''
        return this.$store.getters['items/itemState'](this.model.config.item)
      }
    }
  }
}
</script>
