<template>
  <oh-card :context="context" :content-class="['display-flex', 'justify-content-center']">
    <template #content>
      <oh-sipclient v-bind="config" :context="context" />
    </template>
  </oh-card>
</template>

<script>
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import OhCard from '@/components/widgets/standard/oh-card.vue'
import OhSipclient from '../system/oh-sipclient.vue'
import { OhSIPClientCardDefinition } from '@/assets/definitions/widgets/standard/cards'

export default {
  props: {
    context: Object
  },
  components: {
    OhCard,
    OhSipclient
  },
  widget: OhSIPClientCardDefinition,
  setup (props) {
    const { config } = useWidgetContext(props.context)
    return { config }
  }
}
</script>
