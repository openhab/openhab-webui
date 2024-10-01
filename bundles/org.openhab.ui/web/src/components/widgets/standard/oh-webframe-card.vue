<template>
  <oh-card :context="context" :content-class="!config.borders ? ['no-padding'] : []">
    <template #content>
      <oh-webframe :context="childContext(context.component)" />
    </template>
  </oh-card>
</template>

<script>
import mixin from '../widget-mixin'
import OhCard from '@/components/widgets/standard/oh-card.vue'
import OhWebframe from '../system/oh-webframe.vue'
import { OhWebFrameCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  mixins: [mixin],
  components: {
    OhCard,
    OhWebframe
  },
  widget: OhWebFrameCardDefinition
}
</script>
