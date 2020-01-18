<template>
  <div v-if="showCards">
    <div class="demo-expandable-cards">
      <equipments-card v-for="(items, equipmentType) in semanticItems.equipments" :key="equipmentType"
        :title="equipmentType" :items="items" :subtitle="`${items.length} equipment${items.length > 1 ? 's' : ''}`" :color="color(equipmentType)" />
    </div>
  </div>
</template>

<script>
import EquipmentsCard from '../../components/cards/equipments-card.vue'

export default {
  props: ['semanticItems'],
  components: {
    EquipmentsCard
  },
  data () {
    return {
      showCards: false,
      properties: []
    }
  },
  created () {
    this.showCards = true
  },
  methods: {
    hideCards () {
      this.showCards = false
    },
    color (equipmentType) {
      if (equipmentType === 'HVAC') return 'red'
      if (equipmentType === 'Lightbulb') return 'yellow'
      if (equipmentType === 'Window') return 'blue'
      if (equipmentType === 'Door') return 'green'
      if (equipmentType === 'Camera') return 'pink'
      if (equipmentType === 'Blinds') return 'teal'
      if (equipmentType === 'SmokeDetector' || equipmentType === 'Siren') return 'deeppurple'
      // etc. - use a map
      return 'gray'
    }
  }
}
</script>
