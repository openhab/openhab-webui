<template>
  <f7-card :no-border="config.noBorder" :no-shadow="config.noShadow" :outline="config.outline">
    <f7-card-header v-if="config.title">
      <div>{{ config.title }}</div>
    </f7-card-header>
    <f7-card-content class="oh-gauge-card display-flex justify-content-center">
      <f7-link v-if="config.action" class="oh-gauge-link" @click="performAction">
        <oh-gauge :context="childContext(context.component)" />
      </f7-link>
      <oh-gauge v-else :context="childContext(context.component)" />
    </f7-card-content>
    <oh-card-footer v-if="config.footer" :texts="config.footer" />
  </f7-card>
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
import OhGauge from '../system/oh-gauge.vue'
import OhCardFooter from '../system/oh-card-footer.vue'
import { actionsMixin } from '../widget-actions'
import { OhGaugeCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  mixins: [mixin, actionsMixin],
  components: {
    OhGauge,
    OhCardFooter
  },
  widget: OhGaugeCardDefinition
}
</script>
