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
import OhListItem from './oh-list-item.vue'
import { OhToggleItemDefinition } from '@/assets/definitions/widgets/standard/listitems'
import { useWidgetContext } from '../../useWidgetContext'

export default {
  components: {
    OhListItem
  },
  props: {
    context: Object
  },
  widget: OhToggleItemDefinition,
  setup (props) {
    const { config, childContext } = useWidgetContext(props.context)
    return { config, childContext }
  },
  computed: {
    afterComponent () {
      return {
        component: 'oh-toggle',
        config: this.config
      }
    }
  }
}
</script>
