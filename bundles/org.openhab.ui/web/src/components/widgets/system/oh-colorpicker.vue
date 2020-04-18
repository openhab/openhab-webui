<template>
  <div ref="container" style="width: 100%"></div>
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
    this.colorpicker.destroy()
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
        containerEl: this.$refs.container,
        modules: this.config.modules || ['hsb-sliders'],
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
