<template>
  <location-card :element="element" :context="context" :tab-context="config" :parent-location="parentLocationName" />
</template>

<script>
import LocationCard from '@/components/cards/location-card.vue'
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import { OhLocationCardParameters } from '@/assets/definitions/widgets/home'

import { useModelStore } from '@/js/stores/useModelStore'

export default {
  components: { LocationCard },
  props: {
    context: Object
  },
  setup (props) {
    const { config } = useWidgetContext(props.context)
    return { config }
  },
  computed: {
    element () {
      return useModelStore().getSemanticModelElement(this.config.item, 'location') ||
        { defaultTitle: 'Location Card', item: { equipment: [], metadata: { semantics: { value: '' } } }, equipment: [], properties: [] }
    },
    parentLocationName () {
      return this.element && this.element.parent ? this.element.parent.label || this.element.parent.name : ''
    }
  },
  widget: OhLocationCardParameters
}
</script>
