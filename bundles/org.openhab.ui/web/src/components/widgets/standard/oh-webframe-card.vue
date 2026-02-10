<template>
  <oh-card :context="context" :content-class="!config.borders ? ['no-padding'] : []">
    <template #content>
      <oh-webframe :context="cardChildContext(context.component)" />
    </template>
  </oh-card>
</template>

<script>
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import OhCard from '@/components/widgets/standard/oh-card.vue'
import OhWebframe from '../system/oh-webframe.vue'
import { OhWebFrameCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  props: {
    context: Object
  },
  components: {
    OhCard,
    OhWebframe
  },
  widget: OhWebFrameCardDefinition,
  setup (props) {
    const { config, cardChildContext } = useWidgetContext(props.context)
    return { config, cardChildContext }
  }
}
</script>
