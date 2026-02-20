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
import { OhRollershutterItemDefinition } from '@/assets/definitions/widgets/standard/listitems'

export default {
  components: {
    OhListItem
  },
  props: {
    context: Object
  },
  widget: OhRollershutterItemDefinition,
  setup (props) {
    const { config, childContext } = useWidgetContext(props.context)
    return { config, childContext }
  },
  computed: {
    afterComponent () {
      return {
        component: 'oh-rollershutter',
        config: this.config
      }
    }
  }
}
</script>
