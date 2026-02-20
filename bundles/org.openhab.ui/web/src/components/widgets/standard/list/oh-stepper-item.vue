<template>
  <oh-list-item :context="context">
    <template #after>
      <div>
        <generic-widget-component :context="childContext(afterComponent)" />
      </div>
    </template>
  </oh-list-item>
</template>

<script>
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import OhListItem from './oh-list-item.vue'
import { OhStepperItemDefinition } from '@/assets/definitions/widgets/standard/listitems'

export default {
  components: {
    OhListItem
  },
  props: {
    context: Object
  },
  setup (props) {
    const { config, childContext } = useWidgetContext(props.context)
    return { config, childContext }
  },
  widget: OhStepperItemDefinition,
  computed: {
    afterComponent () {
      return {
        component: 'oh-stepper',
        config: this.config
      }
    }
  }
}
</script>
