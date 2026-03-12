<template>
  <oh-card :context="context" :content-class="['display-flex', 'justify-content-center']">
    <template #content>
        <oh-json :context="context" />
    </template>
  </oh-card>
</template>

<script>
import mixin from '../widget-mixin'
import OhCard from '@/components/widgets/standard/oh-card.vue'
import OhJson from '../system/oh-json.vue'
import { OhJsonCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  mixins: [mixin],
  components: {
    OhCard,
    OhJson
  },
  widget: OhJsonCardDefinition,
  data () {
    return {
      value: Math.random()
    }
  }
}
</script>
