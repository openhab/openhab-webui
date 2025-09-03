<template>
  <oh-card :context="context"
           :content-class="['display-flex', 'justify-content-center']"
           :content-style="{ height: 'calc(2 * var(--f7-toggle-width))' }">
    <template #content>
      <oh-toggle class="large-vertical-toggle" :context="context" @command="onCommand" />
    </template>
  </oh-card>
</template>

<style lang="stylus">
.large-vertical-toggle
  transform scale(2) rotate(-90deg)
  transform-origin center
</style>

<script>
import mixin from '../widget-mixin'
import OhCard from '@/components/widgets/standard/oh-card.vue'
import OhToggle from '../system/oh-toggle.vue'
import { OhToggleCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  mixins: [mixin],
  components: {
    OhCard,
    OhToggle
  },
  widget: OhToggleCardDefinition,
  data () {
    return {
      value: Math.random()
    }
  }
}
</script>
