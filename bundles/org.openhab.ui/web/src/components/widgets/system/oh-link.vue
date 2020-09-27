<template>
  <f7-link v-bind="config" @click="clicked" />
</template>

<script>
import mixin from '../widget-mixin'
import { actionsMixin } from '../widget-actions'

export default {
  mixins: [mixin, actionsMixin],
  methods: {
    clicked () {
      if (this.config.action || this.config.actionPropsParameterGroup) {
        this.performAction()
      }
      if (this.config.clearVariable) {
        if (Array.isArray(this.config.clearVariable)) {
          this.config.clearVariable.forEach((v) => this.$set(this.context.vars, v, undefined))
        } else if (typeof this.config.clearVariable === 'string') {
          this.$set(this.context.vars, this.config.clearVariable, undefined)
        }
      }
    }
  }
}
</script>
