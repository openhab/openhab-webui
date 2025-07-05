<template>
  <div>
    <item-standalone-control :item="item" :context="context" />
    <div class="display-flex justify-content-center flex-direction-column">
      <div v-if="item.type.indexOf('Number') === 0 || item.type === 'Switch' || item.type === 'Contact' || item.type === 'Rollershutter' || item.type === 'Dimmer' || item.type === 'String'"
           class="display-flex justify-content-center flex-direction-row">
        <f7-button :href="'/analyzer/?items=' + item.name">
          Analyze
        </f7-button>
      </div>
    </div>
  </div>
</template>

<script>
import ItemStandaloneControl from '@/components/item/item-standalone-control.vue'

export default {
  props: ['item', 'context'],
  components: {
    ItemStandaloneControl
  }
}
</script>
