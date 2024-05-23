<template>
  <location-card :element="element" :context="context" :tab-context="config" :parent-location="parentLocationName" />
</template>

<script>
import LocationCard from '@/components/cards/location-card.vue'
import mixin from '../widget-mixin'
import { OhLocationCardParameters } from '@/assets/definitions/widgets/home'

export default {
  components: { LocationCard },
  mixins: [mixin],
  computed: {
    element () {
      return this.$store.getters.semanticModelElement(this.config.item, 'location') ||
        { defaultTitle: 'Location Card', item: { equipment: [], metadata: { semantics: { value: '' } } }, equipment: [], properties: [] }
    },
    parentLocationName () {
      return this.element && this.element.parent ? this.element.parent.label || this.element.parent.name : ''
    }
  },
  widget: OhLocationCardParameters
}
</script>
