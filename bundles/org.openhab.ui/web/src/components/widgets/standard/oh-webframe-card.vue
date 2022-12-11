<template>
  <f7-card :no-border="config.noBorder" :no-shadow="config.noShadow" :outline="config.outline">
    <f7-card-header v-if="config.title">
      <div>{{ config.title }}</div>
    </f7-card-header>
    <f7-card-content :class="{ 'no-padding': !config.borders }">
      <oh-webframe :context="childContext(context.component)" />
    </f7-card-content>
    <oh-card-footer v-if="config.footer" :texts="config.footer" />
  </f7-card>
</template>

<script>
import mixin from '../widget-mixin'
import OhWebframe from '../system/oh-webframe.vue'
import OhCardFooter from '../system/oh-card-footer.vue'
import { OhWebFrameCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  mixins: [mixin],
  components: {
    OhWebframe,
    OhCardFooter
  },
  widget: OhWebFrameCardDefinition
}
</script>
