<template>
  <oh-list-item :context="context">
    <template #after>
      <div
        v-if="(config.after === undefined) && (context.store[config.item].displayState || (context.store[config.item].state !== 'NULL'))">
        {{ context.store[config.item].displayState || context.store[config.item].state }}
      </div>
    </template>
  </oh-list-item>
</template>

<script>
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import { actionsMixin } from '../../widget-actions'
import OhListItem from './oh-list-item.vue'
import { OhLabelItemDefinition } from '@/assets/definitions/widgets/standard/listitems'

export default {
  components: {
    OhListItem
  },
  mixins: [actionsMixin],
  props: {
    context: Object
  },
  widget: OhLabelItemDefinition,
  setup (props) {
    const { config, evaluateExpression } = useWidgetContext(props.context)
    return { config, evaluateExpression }
  }
}
</script>
