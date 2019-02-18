<template>
  <div v-if="!this.model.config.inline" class="q-color-swatch q-mr-md q-ml-md overflow-hidden hb-color-swatch shadow-4" @click="showModal = true"
    :class="{'highlight-and-fade': this.model.highlight}">
    <div class="fit" v-if="colorHex" :style="{ 'background-color': colorHex }"></div>
    <q-modal minimized v-model="showModal">
      <q-color-picker class="hb-color-modal" v-model="rgb" />
    </q-modal>
  </div>
  <q-color-picker v-else-if="this.model.config.inline && !this.model.config.brightness" v-model="rgb" />
  <q-list v-else no-border>
    <q-item dense>
      <q-color-picker v-model="rgb" class="hb-color-picker" />
    </q-item>
    <q-item dense>
      <q-item-side icon="brightness_low" />
      <hb-slider :model="model" />
      <q-item-side right icon="brightness_high" />
    </q-item>
  </q-list>
</template>

<style lang="stylus">
.hb-color-swatch
  display inline-block
  cursor pointer
  vertical-align middle
.hb-color-modal.q-color
    width 300px
.hb-color-picker
  position relative
  left 50%
  transform translateX(-50%)
.q-color-inputs
  display none
</style>

<script>
import { colors } from 'quasar'
const { rgbToHsv, hsvToRgb, rgbToHex } = colors

export default {
  props: ['model'],
  data () {
    return {
      wait: false,
      next: null,
      prev: null,
      nextCmd: null,
      showModal: false
    }
  },
  methods: {
    sendCmd () {
      this.$store.dispatch('items/sendCmd', { itemName: this.model.config.item, command: this.nextCmd, updateState: true })
    },
    itemStateToHsv (state) {
      return { h: parseFloat(state.split(',')[0]), s: parseFloat(state.split(',')[1]), v: parseFloat(state.split(',')[2]) }
    }
  },
  watch: {
    itemState (state) {
      if (state.split(',').length !== 3) return
      this.prev = state
    }
  },
  computed: {
    itemState () {
      return this.$store.getters['items/itemState'](this.model.config.item)
    },
    rgb: {
      get () {
        if (this.wait) return this.next
        let state = this.itemState
        // if (state === 'OFF') return { r: 0, g: 0, b: 0 }
        // if (state === 'ON') return hsvToRgb(this.itemStateToHsv(this.prev))
        if (state.split(',').length === 1) {
          let l = parseFloat(state)
          if (this.prev) {
            let hsv = this.itemStateToHsv(this.prev)
            hsv.v = l
            return hsvToRgb(hsv)
          } else {
            return { r: l, g: l, b: l }
          }
        }
        let rgb = hsvToRgb({ h: parseFloat(state.split(',')[0]), s: parseFloat(state.split(',')[1]), v: parseFloat(state.split(',')[2]) })
        return rgb
      },
      set (val) {
        let hsv = rgbToHsv(val)
        if (isNaN(hsv.h) || isNaN(hsv.h) || isNaN(hsv.v)) return
        let cmd = [hsv.h, hsv.s, hsv.v].join(',')
        this.next = val
        this.nextCmd = cmd
        if (this.wait) return
        this.wait = true
        this.sendCmd()
        setTimeout(() => {
          this.wait = false
          setTimeout(() => { this.sendCmd() })
        }, 500)
      }
    },
    colorHex () {
      if (!this.model.config.item) return null
      return rgbToHex(this.rgb)
    }
  }
}

</script>
