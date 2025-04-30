<template>
  <equipment-card :element="element" :context="context" :tab-context="config" />
</template>

<script>
import mixin from '../widget-mixin'
import store from '@/js/store'
import { OhEquipmentCardParameters } from '@/assets/definitions/widgets/home'
import EquipmentCard from '@/components/cards/equipment-card.vue'

export default {
  components: { EquipmentCard },
  mixins: [mixin],
  computed: {
    element () {
      return this.$store.getters.semanticModelElement(this.config.item, 'equipment') ||
        { defaultTitle: 'Equipment Card', item: { equipment: [], metadata: { semantics: { value: '' } } }, equipment: [], properties: [] }
    }
  },
  widget: () => {
    const widget = OhEquipmentCardParameters()
    widget.props.parameters.find(p => p.name === 'item').options = store.state.semantics.Equipment
    return widget
  }
}
</script>
