<template>
  <div v-if="!config.openIn" ref="container" style="width: 100%"></div>
  <div v-else ref="swatch" :class="config.swatchClasses || ['elevation-4', 'elevation-hover-8', 'elevation-pressed-1', 'elevation-transition']" :style="{
    width: (config.swatchSize) ? config.swatchSize + 'px' : '32px',
    height: (config.swatchSize) ? config.swatchSize + 'px' : '32px',
    borderRadius: (config.swatchBorderRadius) ? config.swatchBorderRadius + 'px' : '6px',
    cursor: 'pointer'
  }"></div>
</template>

<script>
import mixin from '../widget-mixin'

export default {
  name: 'oh-colorpicker',
  mixins: [mixin],
  data () {
    return {
      colorpicker: null,
      delayCommand: false,
      delayUpdate: false,
      pendingCommand: null,
      pendingUpdate: null,
      init: false
    }
  },
  mounted () {
    if (this.color) {
      this.initColorpicker()
    }
  },
  beforeDestroy () {
    if (this.colorpicker) {
      this.colorpicker.destroy()
    }
  },
  computed: {
    color () {
      const state = this.context.store[this.config.item].state
      if (state.split(',').length === 3) {
        let color = this.context.store[this.config.item].state.split(',')
        color[0] = parseInt(color[0])
        color[1] = color[1] / 100
        color[2] = color[2] / 100
        return color
      }
      return null
    }
  },
  watch: {
    color (val) {
      if (this.colorpicker) {
        this.updateValue(val)
      } else {
        this.initColorpicker()
      }
    }
  },
  methods: {
    initColorpicker () {
      const vm = this
      this.colorpicker = this.$f7.colorPicker.create(Object.assign({}, this.config, {
        containerEl: (!this.config.openIn) ? this.$refs.container : undefined,
        targetEl: (this.config.openIn) ? this.$refs.swatch : undefined,
        targetElSetBackgroundColor: true,
        openIn: this.config.openIn,
        modules: this.config.modules || (this.config.openIn) ? ['wheel'] : ['hsb-sliders'],
        value: {
          hsb: this.color
        },
        on: {
          change (colorpicker, value) {
            // skip the first update
            if (!vm.init || vm.context.store[vm.config.item].state === '-') {
              vm.init = true
              return
            }
            if (!value.hsb) return
            vm.sendCommand(value.hsb)
          }
        }
      }))
    },
    sendCommand (hsb) {
      this.pendingUpdate = [...hsb]
      this.pendingCommand = [...hsb]
      const state = this.commandFromHSB(hsb)
      if (state !== this.context.store[this.config.item].state) {
        if (!this.delayCommand) {
          this.delayCommand = true
          this.delayUpdate = true
          this.$store.dispatch('sendCommand', { itemName: this.config.item, cmd: state })
          setTimeout(() => {
            const pendingCommand = [...this.pendingCommand]
            this.pendingCommand = null
            this.delayCommand = false
            if (pendingCommand != null) {
              this.sendCommand(pendingCommand)
            }
          }, 200)
        }
        setTimeout(() => {
          this.updateValue(this.pendingUpdate)
          this.delayUpdate = false
        }, 2000)
      }
    },
    commandFromHSB (hsb) {
      let state = [...hsb]
      state[0] = Math.round(state[0]) % 360
      state[1] = Math.round(state[1] * 100)
      state[2] = Math.round(state[2] * 100)
      state = state.join(',')
      return state
    },
    updateValue (val) {
      if (!this.delayUpdate) {
        this.colorpicker.setValue({ hsb: this.pendingUpdate || val })
        this.pendingUpdate = null
      } else {
        this.pendingUpdate = val
      }
    }
  }
}
</script>
