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
    <f7-card-footer v-if="config.footer">
      {{ config.footer }}
    </f7-card-footer>
  </f7-card>
</template>

<style lang="stylus">
 .clickPointer {
    cursor pointer
  }
</style>

<script>
import mixin from '../widget-mixin'
import OhGauge from '../system/oh-gauge.vue'
import { actionsMixin } from '../widget-actions'
import { OhGaugeCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  mixins: [mixin, actionsMixin],
  components: {
    OhGauge
  },
  widget: OhGaugeCardDefinition
}
</script>
