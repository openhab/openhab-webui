import variableMixin from '../variable-mixin'

export default {
  mixins: [variableMixin],
  data () {
    return {
      pendingCommand: null
    }
  },
  mounted () {
    delete this.config.value

    this.commandInterval = this.config.commandInterval ? this.config.commandInterval : 200
    this.delayStateDisplay = this.config.delayStateDisplay ? this.config.delayStateDisplay : 2000
  },
  computed: {
    value () {
      if (this.config.variable) {
        if (this.config.variableKey) {
          return this.getLastVariableKeyValue(this.context.vars[this.config.variable], this.config.variableKey)
        } else {
          return this.context.vars[this.config.variable]
        }
      }
      if (this.pendingCommand !== null) return this.pendingCommand // to keep the control reactive when operating
      const value = this.context.store[this.config.item].state
      // use as a brightness control for HSB values
      if (value.split && value.split(',').length === 3) return parseFloat(value.split(',')[2])
      return parseFloat(value)
    }
  },
  methods: {
    sendCommandDebounced (value, stop = false) {
      if ((value === this.value && !stop) || value === this.lastValueSent) return

      if (this.config.variable) {
        if (this.config.variableKey) {
          value = this.setVariableKeyValues(this.context.vars[this.config.variable], this.config.variableKey, value)
        }
        this.$set(this.context.vars, this.config.variable, value)
        return
      }

      if (!this.config.item) return

      this.pendingCommand = value

      if (this.config.releaseOnly && !stop) return

      let diff = this.lastDateSent ? Date.now() - this.lastDateSent : this.commandInterval
      let delay = diff < this.commandInterval ? this.commandInterval - diff : stop ? 0 : this.commandInterval

      if (this.sendCommandTimer && stop) {
        clearTimeout(this.sendCommandTimer)
        this.sendCommandTimer = null
      }
      if (!this.sendCommandTimer) {
        if (this.displayLockTimer) clearTimeout(this.displayLockTimer)
        this.sendCommandTimer = setTimeout(() => {
          this.$store.dispatch('sendCommand', { itemName: this.config.item, cmd: this.pendingCommand.toString() })
          this.lastValueSent = this.pendingCommand
          this.lastDateSent = Date.now()
          this.sendCommandTimer = null

          // keep displaying `pendingCommand` as value for `delayStateDisplay` time to give sse state some time to update
          this.displayLockTimer = setTimeout(() => { this.pendingCommand = null }, this.delayStateDisplay)
        }, delay)
      }
    }
  }
}
