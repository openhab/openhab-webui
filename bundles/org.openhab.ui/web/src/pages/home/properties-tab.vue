<template>
  <div v-if="showCards">
    <div class="demo-expandable-cards">
      <property-card v-for="(items, property) in semanticItems.properties" :key="property"
        :title="property" :items="items" :subtitle="`${items.length} item${items.length > 1 ? 's' : ''}`" :color="color(property)" />
    </div>
  </div>
</template>

<script>
import PropertyCard from '../../components/cards/property-card.vue'

export default {
  props: ['semanticItems'],
  components: {
    PropertyCard
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
    color (property) {
      if (property === 'Temperature') return 'red'
      if (property === 'Light') return 'orange'
      if (property === 'Humidity') return 'blue'
      if (property === 'Presence') return 'teal'
      if (property === 'Pressure') return 'deeppurple'
      // etc. - use a map
      return 'gray'
    }
  }
}
</script>
