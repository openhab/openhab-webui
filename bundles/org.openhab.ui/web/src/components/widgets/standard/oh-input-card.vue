<template>
  <oh-card :context="context">
    <template #content>
      <oh-input class="input-card-content"
                :context="childContext(context.component)" />
    </template>
  </oh-card>
</template>

<style lang="stylus">
.input-card-content
  width calc(100% - 2*var(--f7-card-content-padding)) !important
  .input-field
    font-size 1.2rem
</style>

<script>
import mixin from '../widget-mixin'
import OhCard from '@/components/widgets/standard/oh-card.vue'
import { OhInput } from '@/components/widgets/system'
import { OhInputCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  mixins: [mixin],
  components: {
    OhCard,
    OhInput
  },
  widget: OhInputCardDefinition
}
</script>
