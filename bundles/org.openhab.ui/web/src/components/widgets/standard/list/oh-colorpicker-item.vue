<template>
  <oh-list-item :context="context">
    <template #after>
      <div style="display: flex; gap: 0.5rem;">
        <generic-widget-component :context="childContext(colorPickerComponent)" />
        <generic-widget-component :context="childContext(switchComponent)" />
      </div>
    </template>
  </oh-list-item>
</template>

<script>
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import OhListItem from './oh-list-item.vue'
import { OhColorpickerItemDefinition } from '@/assets/definitions/widgets/standard/listitems'

export default {
  components: {
    OhListItem
  },
  props: {
    context: Object
  },
  widget: OhColorpickerItemDefinition,
  setup (props) {
    const { config, childContext } = useWidgetContext(props.context)
    return { config, childContext }
  },
  computed: {
    colorPickerComponent () {
      return {
        component: 'oh-colorpicker',
        config: Object.assign({}, this.config, {
          openIn: this.config.openIn || 'auto'
        })
      }
    },
    switchComponent () {
      return {
        component: 'oh-toggle',
        config: this.config
      }
    }
  }
}
</script>
