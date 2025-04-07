<template>
  <oh-card :context="context" :content-class="['oh-gauge-card', 'display-flex', 'justify-content-center']">
    <template #content-root>
      <f7-card-content :style="config.contentStyle" :class="[ ...(Array.isArray(config.contentClass) ? config.contentClass : []), 'oh-gauge-card', 'display-flex', 'justify-content-center']">
        <f7-link v-if="hasAction" class="oh-gauge-link" @click="performAction">
          <oh-gauge :context="childContext(context.component)" />
        </f7-link>
        <oh-gauge v-else :context="childContext(context.component)" />
      </f7-card-content>
    </template>
  </oh-card>
</template>

<style lang="stylus">
.oh-gauge-link
  position absolute
  top 0
  left 0
  width 100%
  height 100%
</style>

<script>
import mixin from '../widget-mixin'
import { actionsMixin } from '@/components/widgets/widget-actions'
import OhCard from '@/components/widgets/standard/oh-card.vue'
import OhGauge from '../system/oh-gauge.vue'
import { OhGaugeCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  mixins: [mixin, actionsMixin],
  components: {
    OhCard,
    OhGauge
  },
  widget: OhGaugeCardDefinition
}
</script>
