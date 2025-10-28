<template>
  <oh-card :context="context" :content-class="['display-flex', 'justify-content-center']">
    <template #content>
      <oh-stepper :context="childContext(context.component)" />
    </template>
  </oh-card>
</template>

<style lang="stylus">
.slider-card-vertical
  height 300px
</style>

<script>
import mixin from '../widget-mixin'
import OhCard from '@/components/widgets/standard/oh-card.vue'
import OhStepper from '../system/oh-stepper.vue'
import { OhStepperCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  mixins: [mixin],
  components: {
    OhCard,
    OhStepper
  },
  widget: OhStepperCardDefinition
}
</script>
