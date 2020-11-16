<template>
  <f7-button v-bind="config" @click="clicked">
    <template v-if="context.component.slots && context.component.slots.default">
      <generic-widget-component :context="childContext(slotComponent)" v-for="(slotComponent, idx) in context.component.slots.default" :key="'default-' + idx" />
    </template>
  </f7-button>
</template>

<script>
import mixin from '../widget-mixin'
import { OhButtonDefinition } from '@/assets/definitions/widgets/system'
import { actionsMixin } from '../widget-actions'

export default {
  mixins: [mixin, actionsMixin],
  widget: OhButtonDefinition,
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
