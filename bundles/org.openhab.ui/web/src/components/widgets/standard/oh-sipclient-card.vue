<template>
  <f7-card :no-border="config.noBorder" :no-shadow="config.noShadow" :outline="config.outline">
    <f7-card-header v-if="config.title">
      <div>{{ config.title }}</div>
    </f7-card-header>
    <f7-card-content class="display-flex justify-content-center">
      <oh-sipclient v-bind="config" :context="context" />
    </f7-card-content>
    <oh-card-footer v-if="config.footer" :texts="config.footer" />
  </f7-card>
</template>

<script>
import mixin from '../widget-mixin'
import OhSipclient from '../system/oh-sipclient.vue'
import OhCardFooter from '../system/oh-card-footer.vue'
import { OhSIPClientCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  mixins: [mixin],
  components: {
    OhSipclient,
    OhCardFooter
  },
  widget: OhSIPClientCardDefinition
}
</script>
