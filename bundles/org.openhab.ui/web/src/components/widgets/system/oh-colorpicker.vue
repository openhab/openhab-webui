<template>
  <div :style="{
    width: '100%',
    ...config.style
  }">
    <div v-if="!config.openIn" ref="container" style="width: 100%" />
    <div v-else ref="swatch" :class="config.swatchClasses || ['elevation-4', 'elevation-hover-8', 'elevation-pressed-1', 'elevation-transition']" :style="{
      width: (config.swatchSize) ? config.swatchSize + 'px' : '32px',
      height: (config.swatchSize) ? config.swatchSize + 'px' : '32px',
      borderRadius: (config.swatchBorderRadius) ? config.swatchBorderRadius + 'px' : '6px',
      cursor: 'pointer'
    }" />
  </div>
</template>

<script>
import mixin from '../widget-mixin'
import { OhColorpickerDefinition } from '@/assets/definitions/widgets/system'

export default {
  mixins: [mixin],
  widget: OhColorpickerDefinition,
  data () {
    return {
      colorPicker: null,
      delayCommand: false,
      delayUpdate: false,
      pendingCommand: null,
      lastCommand: null,
      pendingUpdate: null,
      init: false
    }
  },
  mounted () {
    if (this.color) {
      this.initColorPicker()
    }
  },
  beforeDestroy () {
    if (this.colorPicker) {
      this.colorPicker.destroy()
    }
  },
  computed: {
    color () {
      const state = this.context.store[this.config.item].state
      if (state && state.split(',').length === 3) {
        let color = this.context.store[this.config.item].state.split(',')
        color[0] = parseInt(color[0])
        color[1] = color[1] / 100
        color[2] = color[2] / 100
        return color
      }
      return [0, 0, 0]
    }
  },
  watch: {
    color (val) {
      if (this.colorPicker) {
        this.updateValue(val)
      } else {
        this.initColorPicker()
      }
    }
  },
  methods: {
    initColorPicker () {
      const vm = this
      this.colorPicker = this.$f7.colorPicker.create(Object.assign({}, this.config, {
        containerEl: (!this.config.openIn) ? this.$refs.container : undefined,
        targetEl: (this.config.openIn) ? this.$refs.swatch : undefined,
        targetElSetBackgroundColor: true,
        openIn: this.config.openIn,
        modules: this.config.modules || ((this.config.openIn) ? ['wheel'] : ['hsb-sliders']),
        value: {
          hsb: this.color
        },
        on: {
          change (colorPicker, value) {
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
      console.debug('oh-colorpicker: Received command ' + hsb)
      const cmd = this.commandFromHSB(hsb)
      const state = this.commandFromHSB(this.color)
      this.pendingCommand = [...hsb]
      if (!this.areHSBEqual(this.roundedHSB(state), this.roundedHSB(this.context.store[this.config.item].state))) {
        if (!this.delayCommand) {
          this.delayCommand = true
          this.delayUpdate = true
          console.debug(this.context.store[this.config.item].state + ' -> ' + state)
          this.$store.dispatch('sendCommand', { itemName: this.config.item, cmd: state, updateState: true })
          this.lastCommand = state
          setTimeout(() => {
            const pendingCommand = [...this.pendingCommand]
            this.pendingCommand = null
            this.delayCommand = false
            if (pendingCommand != null && this.commandFromHSB(pendingCommand) !== this.lastCommand) {
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
    areHSBEqual (hsb1, hsb2) {
      // for the purposes of NOT entering an endless loop, we consider transient non-HSB values to be equal
      if (hsb1.length !== hsb2.length) return false
      if (hsb1.length !== 3 || hsb2.length !== 3) return false
      return (hsb1[0] === hsb2[0] && hsb1[1] === hsb2[1] && hsb1[2] === hsb2[2])
    },
    roundedHSB (state) {
      if (!state) return []
      let hsb = state.split(',')
      if (hsb.length !== 3) return hsb
      return hsb.map((c) => Math.round(c))
    },
    updateValue (val) {
      if (!this.delayUpdate) {
        this.pendingUpdate = null
      } else {
        this.pendingUpdate = val
      }
      console.debug('oh-colorpicker: Updating value to ' + val)
      this.colorPicker.setValue({ hsb: val })
    }
  }
}
</script>
