import { getVariableScope, getLastVariableKeyValue, setVariableKeyValues } from '@/components/widgets/variable'
import { useStatesStore } from '@/js/stores/useStatesStore'

export default {
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
        const variableScope = getVariableScope(this.context.ctxVars, this.context.varScope, this.config.variable)
        const variableLocation = (variableScope) ? this.context.ctxVars[variableScope] : this.context.vars
        if (this.config.variableKey) {
          return getLastVariableKeyValue(variableLocation[this.config.variable], this.config.variableKey)
        } else {
          return variableLocation[this.config.variable]
        }
      }
      if (this.pendingCommand !== null) return this.pendingCommand // to keep the control reactive when operating
      const value = (this.config.ignoreDisplayState === true) ? this.context.store[this.config.item].state : this.context.store[this.config.item].displayState || this.context.store[this.config.item].state
      console.debug(`slide-mixin: value changed for ${this.config.item}, displayState: ${this.context.store[this.config.item].displayState}, state: ${this.context.store[this.config.item].state}`)
      // use as a brightness control for HSB values
      if (value.split && value.split(',').length === 3) {
        console.debug(`slide-mixin: controlling brightness for ${this.config.item}, HSB value: ${value}`)
        return parseFloat(value.split(',')[2])
      }
      return parseFloat(value)
    },
    unit () {
      if (this.config.unit) return this.config.unit
      if (this.context.store[this.config.item].displayState && this.context.store[this.config.item].displayState.split(' ').length === 2) return this.context.store[this.config.item].displayState.split(' ')[1]
      if (this.config.ignoreDisplayState === true) return this.context.store[this.config.item].state.split(' ')[1]
      return undefined
    }
  },
  methods: {
    sendCommandDebounced (value, stop = false) {
      if ((value === this.value && !stop) || value === this.lastValueSent) return

      if (this.config.variable) {
        const variableScope = getVariableScope(this.context.ctxVars, this.context.varScope, this.config.variable)
        const variableLocation = (variableScope) ? this.context.ctxVars[variableScope] : this.context.vars
        if (this.config.variableKey) {
          value = setVariableKeyValues(variableLocation[this.config.variable], this.config.variableKey, value)
        }
        variableLocation[this.config.variable] = value
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
        const stateType = this.context.store[this.config.item].type
        this.sendCommandTimer = setTimeout(() => {
          useStatesStore().sendCommand(
            this.config.item,
            (this.unit && stateType === 'Quantity') ? this.pendingCommand + ' ' + this.unit : this.pendingCommand.toString()
          )
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
