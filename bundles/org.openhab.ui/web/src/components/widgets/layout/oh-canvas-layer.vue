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
import { computed, ref } from 'vue'
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import OhCanvasItem from './oh-canvas-item.vue'
import { OhCanvasLayerDefinition } from '@/assets/definitions/widgets/layout'
import type { WidgetContext } from '@/components/widgets/types'
import type { UiComponent } from '@/api'
import type { OhCanvasItemEmits } from '@/components/widgets/layout/oh-canvas-item.vue'

defineExpose({ widget: OhCanvasLayerDefinition })

// props & emits
const props = defineProps<{
  context: WidgetContext,
  gridPitch: number,
  gridEnable: boolean,
  id: string,
  preventDeactivation: boolean
}>()

const emit = defineEmits<OhCanvasItemEmits>()

// composables
const { config, defaultSlots, childContext, visible } = useWidgetContext(props.context)

// data (state)
interface Layer {
  item: UiComponent,
  selected: boolean,
  id: string
}

const layer = ref<Layer[]>([])

// computed
const layerPreload = computed(() => config.value?.preload === true)
const layerVisible = computed(() => (!props.context.editmode && visible.value) || (props.context.editmode && editVisible.value))
const editVisible = computed(() => !(config.value && (config.value.editVisible === false)))

// methods
const computeLayer = () => {
  let l: Layer[] = []
  defaultSlots.value.forEach((item: UiComponent) => {
    if (item.component === 'oh-canvas-item') {
      l.push({
        item,
        selected: false,
        id: Math.random().toString(36).substring(2)
      })
    } else {
      console.log('Wrong component type in canvas layer: ' + item.component)
    }
  })
  layer.value = l
}

// lifecycle
computeLayer()
</script>
