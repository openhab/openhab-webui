<template>
  <div v-if="layerPreload || layerVisible" v-show="!layerPreload || layerVisible" ref="ohCanvasLayer" class="oh-canvas-layer">
    <oh-canvas-item
      v-for="obj in layer"
      v-bind="$attrs"
      :key="obj.id"
      :id="obj.id"
      :grid-enable="gridEnable"
      :grid-pitch="gridPitch"
      :prevent-deactivation="preventDeactivation"
      :context="childContext(obj.item)"
      @oci-selected="(cid) => emit('oci-selected', cid)"
      @oci-deselected="(cid) => emit('oci-deselected', cid)"
      @oci-drag-stop="(cid) => emit('oci-drag-stop', cid)"
      @oci-dragged="(cid, x, y) => emit('oci-dragged', cid, x, y)" />
  </div>
</template>

<style lang="stylus">
.oh-canvas-layer
  height 100%
  width 100%
  position fixed
  pointer-events none
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import OhCanvasItem from './oh-canvas-item.vue'
import { OhCanvasLayerDefinition } from '@/assets/definitions/widgets/layout'
import { OhCanvasLayer as OhCanvasLayerType, OhCanvasItem as OhCanvasItemType } from '@/types/components/widgets'
import type { WidgetContext } from '@/components/widgets/types'
import type { UiComponent } from '@/api'
import type { OhCanvasItemEmits } from '@/components/widgets/layout/oh-canvas-item.vue'

interface Layer {
  item: UiComponent
  selected: boolean
  id: string
}

let nextCanvasItemRuntimeId = 0

defineOptions({ widget: OhCanvasLayerDefinition })

// props & emits
const props = defineProps<{
  context: WidgetContext
  gridPitch: number
  gridEnable: boolean
  id: string
  preventDeactivation: boolean
}>()

const emit = defineEmits<OhCanvasItemEmits>()

// composables
const { config, defaultSlots, childContext, visible } = useWidgetContext(computed(() => props.context))

let configValue = config.value
if (!OhCanvasLayerType.isConfig(configValue)) {
  throw new Error('Invalid config for oh-canvas-layer')
}

// data and state
const canvasItemRuntimeIds = new WeakMap<UiComponent, string>()

// computed
const layerPreload = computed(() => config.value?.preload === true)
const layerVisible = computed(() => (!props.context.editmode && visible.value) || (props.context.editmode && editVisible.value))
const editVisible = computed(() => !(config.value && config.value.editVisible === false))

const layer = computed<Layer[]>(() => {
  return defaultSlots.value
    .filter((component) => OhCanvasItemType.isComponent(component))
    .map((item) => ({
      item,
      selected: false,
      id: getCanvasItemRuntimeId(item)
    }))
})

function getCanvasItemRuntimeId(item: UiComponent) {
  let itemId = canvasItemRuntimeIds.get(item)
  if (!itemId) {
    itemId = `${props.id}:canvas-item-${++nextCanvasItemRuntimeId}`
    canvasItemRuntimeIds.set(item, itemId)
  }
  return itemId
}
</script>
