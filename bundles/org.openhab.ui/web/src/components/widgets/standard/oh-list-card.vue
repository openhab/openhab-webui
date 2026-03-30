<template>
  <oh-card :context="context">
    <template #content>
      <oh-list :context="cardChildContext(context.component)" />
    </template>
  </oh-card>
</template>

<script>
import { computed } from 'vue'
import OhCard from '@/components/widgets/standard/oh-card.vue'
import OhList from '../system/oh-list.vue'
import { OhListCardDefinition } from '@/assets/definitions/widgets/standard/cards'
import { useWidgetContext } from '@/components/widgets/useWidgetContext'

export default {
  props: {
    context: Object
  },
  components: {
    OhCard,
    OhList
  },
  widget: OhListCardDefinition,
  setup(props) {
    const { cardChildContext } = useWidgetContext(computed(() => props.context))
    return { cardChildContext }
  }
}
</script>
