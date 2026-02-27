<template>
  <property-card :element="element" :context="context" :tab-context="config" />
</template>

<script>
import { useSemanticsStore } from '@/js/stores/useSemanticsStore'
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import { OhPropertyCardParameters } from '@/assets/definitions/widgets/home'
import PropertyCard from '@/components/cards/property-card.vue'

import { useModelStore } from '@/js/stores/useModelStore'

export default {
  components: { PropertyCard },
  props: {
    context: Object
  },
  setup (props) {
    const { config } = useWidgetContext(props.context)
    return { config }
  },
  computed: {
    element () {
      return useModelStore().getSemanticModelElement(this.config.item, 'property') || {
        defaultTitle: 'Property Card',
        item: { equipment: [], metadata: { semantics: { value: '' } } },
        equipment: [],
        properties: [],
        points: []
      }
    }
  },
  widget: () => {
    const widget = OhPropertyCardParameters()
    widget.props.parameters.find((p) => p.name === 'item').options = useSemanticsStore().Properties.map((p) => { return { name: p, label: useSemanticsStore().Labels[p] } })
    return widget
  }
}
</script>
