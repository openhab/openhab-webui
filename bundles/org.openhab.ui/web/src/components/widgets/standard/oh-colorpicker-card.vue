<template>
  <oh-card :context="context" :content-class="['display-flex', 'justify-content-center']">
    <template #content>
      <oh-colorpicker :context="context" />
    </template>
  </oh-card>
</template>

<script>
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import OhCard from '@/components/widgets/standard/oh-card.vue'
import OhColorpicker from '../system/oh-colorpicker.vue'
import { OhColorpickerCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  props: {
    context: Object
  },
  components: {
    OhCard,
    OhColorpicker
  },
  widget: OhColorpickerCardDefinition,
  setup(props) {
    useWidgetContext(props.context)
  },
  data () {
    return {
      value: Math.random()
    }
  }
}
</script>
