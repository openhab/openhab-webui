<template>
  <div v-if="loading" class="tool-widget-loading">
    <f7-preloader size="24" color="blue" />
  </div>
  <div v-else-if="item" class="tool-widget-card-wrapper">
    <item-standalone-control :item="item" :context="widgetContext" />
  </div>
</template>

<style lang="stylus" scoped>
.tool-widget-loading
  display flex
  justify-content center
  align-items center
  padding 20px 0

.tool-widget-card-wrapper
  margin 16px 16px 0 16px
  box-sizing border-box
  --f7-card-margin-horizontal 0
  --f7-card-margin-vertical 0
</style>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import * as api from '@/api'
import { useStatesStore } from '@/js/stores/useStatesStore.ts'
import ItemStandaloneControl from '@/components/item/item-standalone-control.vue'

const statesStore = useStatesStore()

// Props
const props = defineProps<{
  content: string
}>()

// State
const item = ref<api.EnrichedItem | null>(null)
const loading = ref(false)

// Computed
const parsedToolCall = computed(() => {
  try {
    const parsed = JSON.parse(props.content)
    if (
      parsed &&
      (parsed.tool === 'item-send-command' || parsed.tool === 'item-get-state') &&
      parsed.params &&
      typeof parsed.params.itemName === 'string'
    ) {
      return {
        itemName: parsed.params.itemName,
        tool: parsed.tool
      }
    }
  } catch (e) {
    // Ignore JSON parsing errors
  }
  return null
})

const widgetContext = computed(() => ({
  store: statesStore.trackedItems
}))

// Lifecycle
onMounted(async () => {
  if (parsedToolCall.value) {
    loading.value = true
    try {
      const data = await api.getItemByName({
        itemName: parsedToolCall.value.itemName,
        metadata: 'semantics,widget'
      })
      if (data) {
        item.value = data
      }
    } catch (e) {
      console.error(`Failed to fetch item for tool call: ${parsedToolCall.value.itemName}`, e)
    } finally {
      loading.value = false
    }
  }
})
</script>
