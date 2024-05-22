<template>
 <property-card :element="element" :context="context" :tab-context="config" />
</template>

<script>
import mixin from '../widget-mixin'
import { OhPropertyCardParameters } from '@/assets/definitions/widgets/home'
import PropertyCard from '@/components/cards/property-card.vue'

export default {
  components: { PropertyCard },
  mixins: [mixin],
  computed: {
    element () {
      return this.$store.getters.semanticModelElement(this.config.item, 'property')
        ||{defaultTitle: 'Property Card', item: {equipment: [], metadata: {semantics: {value: ""}}}, equipment: [], properties: [], points: []}
    }
  },
  widget: OhPropertyCardParameters
}
</script>

