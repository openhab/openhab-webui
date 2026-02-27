<template>
  <oh-card :context="context" :content-class="['display-flex', 'justify-content-center']">
    <template #content>
      <oh-stepper :context="cardChildContext(context.component)" />
    </template>
  </oh-card>
</template>

<style lang="stylus">
.slider-card-vertical
  height 300px
</style>

<script>
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import OhCard from '@/components/widgets/standard/oh-card.vue'
import OhStepper from '../system/oh-stepper.vue'
import { OhStepperCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  props: {
    context: Object
  },
  components: {
    OhCard,
    OhStepper
  },
  widget: OhStepperCardDefinition,
  setup (props) {
    const { cardChildContext } = useWidgetContext(props.context)
    return { cardChildContext }
  }
}
</script>
