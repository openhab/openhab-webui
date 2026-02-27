<template>
  <equipment-card :element="element" :context="context" :tab-context="config" />
</template>

<script>
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import { OhEquipmentCardParameters } from '@/assets/definitions/widgets/home'
import EquipmentCard from '@/components/cards/equipment-card.vue'

import { useSemanticsStore } from '@/js/stores/useSemanticsStore'
import { useModelStore } from '@/js/stores/useModelStore'

export default {
  components: { EquipmentCard },
  props: {
    context: Object
  },
  setup(props) {
    const { config } = useWidgetContext(props.context)
    return { config }
  },
  computed: {
    element () {
      return useModelStore().getSemanticModelElement(this.config.item, 'equipment') || {
        defaultTitle: 'Equipment Card',
        item: { equipment: [], metadata: { semantics: { value: '' } } },
        equipment: [],
        properties: []
      }
    }
  },
  widget: () => {
    const widget = OhEquipmentCardParameters()
    widget.props.parameters.find((p) => p.name === 'item').options =
      useSemanticsStore().Equipment.map((p) => {
        return { name: p, label: useSemanticsStore().Labels[p] }
      })
    return widget
  }
}
</script>
