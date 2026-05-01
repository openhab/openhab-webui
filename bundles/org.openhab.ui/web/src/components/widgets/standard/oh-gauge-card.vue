<template>
  <oh-card :context="context" :content-class="['oh-gauge-card', 'display-flex', 'justify-content-center']">
    <template #content-root>
      <f7-card-content
        :style="config.contentStyle"
        :class="[
          ...(Array.isArray(config.contentClass) ? config.contentClass : []),
          'oh-gauge-card',
          'display-flex',
          'justify-content-center'
        ]">
        <f7-link v-if="hasAction" class="oh-gauge-link" @click="performAction">
          <oh-gauge :context="cardChildContext(context.component)" />
        </f7-link>
        <oh-gauge v-else :context="cardChildContext(context.component)" />
      </f7-card-content>
    </template>
  </oh-card>
</template>

<style lang="stylus">
.oh-gauge-link
  width 100%
  height 100%
</style>

<script>
import { computed } from 'vue'
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import OhCard from '@/components/widgets/standard/oh-card.vue'
import OhGauge from '../system/oh-gauge.vue'
import { OhGaugeCardDefinition } from '@/assets/definitions/widgets/standard/cards'
import { useWidgetAction } from '@/components/widgets/useWidgetAction.ts'

export default {
  props: {
    context: Object
  },
  components: {
    OhCard,
    OhGauge
  },
  widget: OhGaugeCardDefinition,
  setup(props) {
    const context = computed(() => props.context)
    const { config, cardChildContext, hasAction, evaluateExpression } = useWidgetContext(context)
    const { performAction } = useWidgetAction(context, config, evaluateExpression)
    return { config, cardChildContext, hasAction, performAction }
  }
}
</script>
