<template>
  <oh-card :context="context" :content-class="[]" :content-style="{ padding: '0' }">
    <template #content>
      <oh-json :context="context" />
    </template>
  </oh-card>
</template>

<script>
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import OhCard from '@/components/widgets/standard/oh-card.vue'
import OhJson from '../system/oh-json.vue'
import { OhJsonCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  props: {
    context: Object
  },
  mixins: [],
  components: {
    OhCard,
    OhJson
  },
  setup (props) {
    useWidgetContext(props.context)
  },
  widget: OhJsonCardDefinition,
  data () {
    return {
      value: Math.random()
    }
  }
}
</script>
