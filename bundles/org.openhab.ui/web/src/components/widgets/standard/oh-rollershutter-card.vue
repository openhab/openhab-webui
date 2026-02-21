<template>
  <oh-card
    :context="context"
    :content-class="['display-flex', 'justify-content-center', 'oh-rollershutter-card']"
    :content-style="{ height: config.vertical ? '10em' : undefined }">
    <template #content>
      <oh-rollershutter :class="{ vertical: config.vertical }" :context="context" />
    </template>
  </oh-card>
</template>

<style lang="stylus">
.oh-rollershutter-card
  .rollershutter-controls
    .button
      text-overflow clip
    &.vertical
      transform rotate(90deg)
      transform-origin center
      .icon
        margin-top 2px
      .state
        margin-top 2px
        transform rotate(-90deg)
</style>

<script>
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import OhCard from '@/components/widgets/standard/oh-card.vue'
import OhRollershutter from '../system/oh-rollershutter.vue'
import { OhRollershutterCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  props: {
    context: Object
  },
  components: {
    OhCard,
    OhRollershutter
  },
  widget: OhRollershutterCardDefinition,
  setup (props) {
    const { config } = useWidgetContext(props.context)
    return { config }
  },
  data () {
    return {
      value: Math.random()
    }
  }
}
</script>
