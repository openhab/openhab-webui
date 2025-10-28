<template>
  <oh-card :context="context" :content-class="['display-flex', 'justify-content-center']">
    <template #content>
      <oh-knob :context="childContext(context.component)" />
    </template>
  </oh-card>
</template>

<script>
import mixin from '../widget-mixin'
import OhCard from '@/components/widgets/standard/oh-card.vue'
import OhKnob from '../system/oh-knob.vue'
import { OhKnobCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  mixins: [mixin],
  components: {
    OhCard,
    OhKnob
  },
  widget: OhKnobCardDefinition
}
</script>
