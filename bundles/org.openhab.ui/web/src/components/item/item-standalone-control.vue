<template>
  <generic-widget-component v-if="widgetContext" :context="widgetContext" />
  <!-- <div v-else>{{context.store[item.name].displayState || context.store[item.name].state}}</div> -->
</template>

<script>
export default {
  props: ['item', 'context', 'rawLabel'],
  computed: {
    widgetContext () {
      if (!this.item) return

      let ctx = {}

      if (this.item.metadata && this.item.metadata.widget) {
        ctx.component = {
          component: this.item.metadata.widget.value,
          config: this.item.metadata.widget.config
        }
      } else {
        const stateDescription = this.item.stateDescription || {}

        if (this.item.type === 'Switch' && !stateDescription.readOnly) {
          ctx.component = {
            component: 'oh-toggle-card'
          }
        }

        // temporary until we have a colorpicker control
        if ((this.item.type === 'Dimmer' || this.item.type === 'Color') && !stateDescription.readOnly) {
          ctx.component = {
            component: 'oh-slider-card',
            config: {
              scale: true,
              label: true,
              scaleSubSteps: 5,
              min: stateDescription.min,
              max: stateDescription.max,
              step: stateDescription.step
            }
          }
        }
      }

      if (!ctx.component) {
        ctx.component = {
          component: 'oh-label-card'
        }

        if (this.item.commandDescription && this.item.commandDescription.commandOptions) {
          ctx.component.config = {
            action: 'options',
            actionItem: this.item.name,
            actionOptions: this.item.commandDescription.commandOptions.map((o) => (o.label) ? o.command + '=' + o.label : o.command).join(',')
          }
        }
      }

      if (!ctx.component.config) ctx.component.config = {}
      ctx.component.config.item = this.item.name

      ctx.store = this.context.store

      return ctx
    }
  }
}
</script>
