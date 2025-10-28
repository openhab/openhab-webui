<template>
  <div v-if="ready" class="disable-user-select model-tab">
    <div v-for="(elements, idx) in groups" :key="idx">
      <f7-block-title medium v-if="elements.length > 0 && elements[0].separator">
        {{ elements[0].separator }}
      </f7-block-title>
      <div class="model-cards-section" v-if="elements.length > 0">
        <div v-for="(element, idx) in elements.filter((e) => !isCardExcluded(e))" :key="idx">
          <location-card v-if="type === 'locations' && !element.separator && (element.equipment.length > 0 || element.properties.length > 0)"
                         :key="element.key"
                         type="location"
                         :element="element"
                         :context="cardContext(element)"
                         :parent-location="parentLocationName(element.item)"
                         :tab-context="tabContext(type)" />
          <equipment-card v-if="type === 'equipment' && !element.separator"
                          :key="element.key"
                          type="equipment"
                          :element="element"
                          :context="cardContext(element)"
                          :tab-context="tabContext(type)" />
          <property-card v-if="type === 'properties' && !element.separator"
                         :key="element.key"
                         type="property"
                         :element="element"
                         :context="cardContext(element)"
                         :tab-context="tabContext(type)" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="stylus">
.model-tab > div:not(:has(.model-card))
  display none

.model-cards-section
  justify-content center
  margin-top 2rem
  margin-left calc(0.5 * var(--f7-card-expandable-margin-horizontal))
  margin-right calc(0.5 * var(--f7-card-expandable-margin-horizontal))
  .card
    margin-left calc(0.5 * var(--f7-card-expandable-margin-horizontal))
    margin-right calc(0.5 * var(--f7-card-expandable-margin-horizontal))

@media (max-width 1023px)
  .model-cards-section
    padding-left var(--f7-safe-area-left)
    padding-right var(--f7-safe-area-right)

@media (min-width 768px)
  .model-cards-section
    display flex
    flex-wrap wrap

  .model-cards-section .card
    flex-shrink 10
    min-width 0

@media (min-width 768px) and (max-width 1023px)
  .model-cards-section .card
    width 340px
    margin-top 0

  .model-cards-section .card:nth-child(n + 3)
    margin-top 0

@media (min-width 1024px)
  .model-cards-section
    .card
      width 340px
      margin-top 0

  .model-cards-section .card:nth-child(n + 3)
    margin-top 0

  // hide scrollbar
  .card-expandable.card-opened .card-content
      overflow-y scroll
      scrollbar-width none /* Firefox */
      -ms-overflow-style none  /* IE 10+ */

  .card-expandable.card-opened .card-content::-webkit-scrollbar /* WebKit */
      width 0
      height 0
</style>

<script>
import cardGroups from './homecards-grouping'
import LocationCard from '../../components/cards/location-card.vue'
import EquipmentCard from '../../components/cards/equipment-card.vue'
import PropertyCard from '../../components/cards/property-card.vue'

import { useStatesStore } from '@/js/stores/useStatesStore'
import { useModelStore } from '@/js/stores/useModelStore'

export default {
  props: {
    type: String,
    page: Object
  },
  components: {
    LocationCard,
    EquipmentCard,
    PropertyCard
  },
  computed: {
    ready () {
      return useModelStore().ready
    },
    groups (state) {
      return cardGroups(useModelStore(), this.type, this.page)
    }
  },
  methods: {
    isCardExcluded (card) {
      if (!card.key) return
      const page = this.page
      const type = this.type
      const excludedCards = (page && page.slots && page.slots[type] && page.slots[type][0] && page.slots[type][0].config && page.slots[type][0].config.excludedCards) ? page.slots[type][0].config.excludedCards : []
      const excludedIdx = excludedCards.indexOf(card.key)
      return excludedIdx >= 0
    },
    cardContext (element) {
      let context = {
        component: element.card || {
          component: (this.type === 'locations') ? 'oh-location-card' : (this.type === 'equipment') ? 'oh-equipment-card' : 'oh-property-card',
          config: {}
        },
        store: useStatesStore().trackedItems
      }
      const page = this.page
      const type = this.type
      if (page && page.slots && page.slots[type] && page.slots[type][0] && page.slots[type][0].config && page.slots[type][0].config.badges) {
        context.badgeOverrides = page.slots[type][0].config.badges
      }
      return context
    },
    parentLocationName (item) {
      return item.parent ? item.parent.label || item.parent.name : ''
    },
    tabContext (type) {
      const page = this.page
      if (page && page.slots && page.slots[type] && page.slots[type][0] && page.slots[type][0].config) {
        return page.slots[type][0].config
      } else {
        return {}
      }
    }
  }
}
</script>
