<template>
  <oh-card :context="context">
    <template #content>
      <oh-list v-bind="$attrs" :context="childContext(context.component)" />
    </template>
  </oh-card>
</template>

<script>
import mixin from '../widget-mixin'
import OhCard from '@/components/widgets/standard/oh-card.vue'
import OhList from '../system/oh-list.vue'
import { OhListCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  mixins: [mixin],
  components: {
    OhCard,
    OhList
  },
  widget: OhListCardDefinition
}
</script>
