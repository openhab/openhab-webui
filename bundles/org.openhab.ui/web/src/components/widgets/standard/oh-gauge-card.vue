<template>
  <oh-card :context="context" :content-class="['oh-gauge-card', 'display-flex', 'justify-content-center']">
    <template #content>
      <oh-gauge :context="childContext(context.component)" />
    </template>
  </oh-card>
</template>

<script>
import mixin from '../widget-mixin'
import OhCard from '@/components/widgets/standard/oh-card.vue'
import OhGauge from '../system/oh-gauge.vue'
import { OhGaugeCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  mixins: [mixin],
  components: {
    OhCard,
    OhGauge
  },
  widget: OhGaugeCardDefinition
}
</script>
