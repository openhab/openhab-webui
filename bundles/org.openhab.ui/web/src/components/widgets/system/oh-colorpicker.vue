<template>
  <div :style="{
    width: '100%',
    ...config.style
  }">
    <div v-if="!config.openIn" ref="container" style="width: 100%" />
    <div v-else
         ref="swatch"
         :class="config.swatchClasses || ['elevation-4', 'elevation-hover-8', 'elevation-pressed-1', 'elevation-transition']"
         :style="{
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
      ignoreInput: false,
      delayCommand: false,
      pendingCommand: null,
      lastCommand: null,
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
        color[1] = Math.round(color[1]) / 100
        color[2] = Math.round(color[2]) / 100
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
            // Ignore input for a few millis after a new state has been received to prevent sending a command on external state change
            if (vm.ignoreInput) return
            vm.sendCommand(value.hsb)
          }
        }
      }))
      // fixes color picker sliders at 0% because display width not available on component mount in widgets
      setTimeout(() => {
        this.colorPicker.hueRangeSlider?.calcSize()
        this.colorPicker.saturationRangeSlider?.calcSize()
        this.colorPicker.brightnessRangeSlider?.calcSize()
      })
    },
    sendCommand (hsb) {
      console.debug('oh-colorpicker: Received command ' + hsb)
      const cmd = this.commandFromHSB(hsb)
      const state = this.commandFromHSB(this.color)
      if (cmd !== state) {
        this.pendingCommand = [...hsb]
        if (!this.delayCommand) {
          this.delayCommand = true
          console.debug(state + ' -> ' + cmd)
          this.$store.dispatch('sendCommand', { itemName: this.config.item, cmd, updateState: true })
          this.lastCommand = cmd
          setTimeout(() => {
            const pendingCommand = [...this.pendingCommand]
            this.pendingCommand = null
            this.delayCommand = false
            if (pendingCommand != null && this.commandFromHSB(pendingCommand) !== this.lastCommand) {
              this.sendCommand(pendingCommand)
            }
          }, 200)
        }
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
      console.debug('oh-colorpicker: Updating value to ' + val)
      this.ignoreInput = true
      this.colorPicker.setValue({ hsb: val })
      setTimeout(() => {
        this.ignoreInput = false
      }, 10)
    }
  }
}
</script>
