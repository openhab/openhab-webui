<template>
  <oh-card
    :context="context"
    :content-class="['display-flex', 'justify-content-center']"
    :content-style="{ height: 'calc(2 * var(--f7-toggle-width))' }">
    <template #content>
      <oh-toggle class="large-vertical-toggle" :context="context" />
    </template>
  </oh-card>
</template>

<style lang="stylus">
.large-vertical-toggle
  transform scale(2) rotate(-90deg)
  transform-origin center
</style>

<script>
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import OhCard from '@/components/widgets/standard/oh-card.vue'
import OhToggle from '../system/oh-toggle.vue'
import { OhToggleCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  props: {
    context: Object
  },
  components: {
    OhCard,
    OhToggle
  },
  widget: OhToggleCardDefinition,
  setup (props) {
    useWidgetContext(props.context)
  },
  data () {
    return {
      value: Math.random()
    }
  }
}
</script>
