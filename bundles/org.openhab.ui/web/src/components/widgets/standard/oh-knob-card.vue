<template>
  <oh-card :context="context" :content-class="['display-flex', 'justify-content-center']">
    <template #content>
      <oh-knob :context="cardChildContext(context.component)" />
    </template>
  </oh-card>
</template>

<script>
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import OhCard from '@/components/widgets/standard/oh-card.vue'
import OhKnob from '../system/oh-knob.vue'
import { OhKnobCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  props: {
    context: Object
  },
  components: {
    OhCard,
    OhKnob
  },
  widget: OhKnobCardDefinition,
  setup(props) {
    const { cardChildContext } = useWidgetContext(props.context)
    return { cardChildContext }
  }
}
</script>
