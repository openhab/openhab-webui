<template>
  <div>
    <!-- force full re-render by specifying a unique key -->
    <item-standalone-control :item="item" :context="context" :key="item.name" />
    <div class="display-flex justify-content-center flex-direction-column">
      <div
        v-if="item.type.startsWith('Number') || ['Switch', 'Contact', 'Rollershutter', 'Dimmer', 'String'].includes(item.type)"
        class="display-flex justify-content-center flex-direction-row">
        <f7-button :href="'/analyzer/?items=' + item.name"> Analyze </f7-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ItemStandaloneControl from '@/components/item/item-standalone-control.vue'
import * as api from '@/api'
import type { WidgetContext } from '../widgets/types';

defineProps<{
  item: api.EnrichedItem
  context: Partial<WidgetContext>
}>()
</script>
