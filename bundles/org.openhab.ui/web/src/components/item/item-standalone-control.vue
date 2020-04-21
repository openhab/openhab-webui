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

      const stateDescription = this.item.stateDescription || {}

      if (this.item.metadata && this.item.metadata.widget) {
        ctx.component = {
          component: this.item.metadata.widget.value,
          config: this.item.metadata.widget.config
        }
      } else {
        if (this.item.type === 'Switch' && !stateDescription.readOnly) {
          ctx.component = {
            component: 'oh-toggle-card'
          }
        }

        if ((this.item.type === 'Dimmer') && !stateDescription.readOnly) {
          ctx.component = {
            component: 'oh-slider-card',
            config: {
              scale: true,
              label: true,
              scaleSubSteps: 5,
              min: stateDescription.minimum,
              max: stateDescription.maximum,
              step: stateDescription.step
            }
          }
        }

        if ((this.item.type === 'Color') && !stateDescription.readOnly) {
          ctx.component = {
            component: 'oh-colorpicker-card',
            config: {
              sliderLabel: true,
              sliderValue: true
            }
          }
        }

        if (this.item.type === 'Rollershutter' && !stateDescription.readOnly) {
          ctx.component = {
            component: 'oh-rollershutter-card',
            config: {
              vertical: true
            }
          }
        }

        if (this.item.type === 'Player' && !stateDescription.readOnly) {
          ctx.component = {
            component: 'oh-player-card',
            config: {
              vertical: true
            }
          }
        }
      }

      if (!ctx.component) {
        ctx.component = {
          component: 'oh-label-card'
        }

        if (this.item.type.indexOf('Number:') === 0) {
          ctx.component.config = {
            trendItem: this.item.name
          }
        } else if (this.item.commandDescription && this.item.commandDescription.commandOptions && !stateDescription.readOnly) {
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
