<template>
  <div
    ref="ohCanvasLayout"
    class="oh-canvas-layout disable-user-select"
    :class="context.editmode ? 'margin-top' : ''"
    tabindex="0"
    @keydown="onKeyDown"
    @keyup="onKeyUp">
    <f7-block v-if="context.editmode">
      <f7-menu class="configure-layout-menu">
        <f7-menu-item v-if="context.editmode.isEditable" @click="addItem" icon="margin-left" icon-f7="plus" text="Add Widget" />
        <f7-menu-item
          v-if="context.editmode.isEditable && context.clipboardtype"
          @click="context.editmode.pasteWidget(activeLayer, context.component)"
          icon-f7="square_on_square" />
        <f7-menu-item
          @click="toggleGrid()"
          icon="margin-left-half"
          :icon-f7="grid.enable ? 'circle_grid_3x3_fill' : 'scircle_grid_3x3'"
          style="margin-left: auto"
          text="Grid" />
        <f7-menu-item v-if="config.embedSvg" @click="flashEmbeddedSvgComponents()" icon-f7="bolt" />
        <f7-menu-item dropdown icon-f7="rectangle_3_offgrid">
          <f7-menu-dropdown right>
            <f7-menu-dropdown-item
              @click="context.editmode.configureWidget(context.component, context.parent, 'oh-canvas-layout')"
              href="#"
              text="Canvas Layout Settings" />
            <f7-menu-dropdown-item divider />
            <f7-menu-dropdown-item v-if="context.editmode.isEditable" @click="addLayer()" href="#" text="Add Layer" />
            <f7-menu-dropdown-item @click="configureLayer()" href="#" text="Layer Settings" />
            <template v-if="slots.canvas.length > 1 && context.editmode.isEditable">
              <f7-menu-dropdown-item divider />
              <f7-menu-dropdown-item class="justify-content-center" text="Layers" />
              <f7-menu-dropdown-item
                v-for="(obj, idx) in layers.slice().reverse()"
                :key="idx"
                @click="setActiveLayer(layers.length - idx - 1)"
                href="#">
                <span>{{ obj.item.config && obj.item.config.layerName ? obj.item.config.layerName : `Layer ${layers.length - idx}` }}</span>
                <f7-icon class="margin-left" :f7="layers.length - idx - 1 == actLyrIdx ? 'pencil_circle_fill' : ''" />
                <f7-icon
                  class="margin-left"
                  :f7="!(obj.item.config && obj.item.config.editVisible === false) ? 'eye_fill' : 'eye_slash_fill'" />
              </f7-menu-dropdown-item>
              <f7-menu-dropdown-item divider />
              <f7-menu-dropdown-item @click="hideOtherLayers()" href="#" text="Hide Other Layers" />
              <f7-menu-dropdown-item @click="showOtherLayers()" href="#" text="Show Other Layers" />
              <f7-menu-dropdown-item divider />
              <f7-menu-dropdown-item
                @click="setActiveLayer(context.editmode.bringWidgetToFront(activeLayer, context, 'canvas'))"
                href="#"
                text="Bring Layer to Front" />
              <f7-menu-dropdown-item
                @click="setActiveLayer(context.editmode.moveWidgetDown(activeLayer, context, 'canvas'))"
                href="#"
                text="Move Layer Up" />
              <f7-menu-dropdown-item
                @click="setActiveLayer(context.editmode.moveWidgetUp(activeLayer, context, 'canvas'))"
                href="#"
                text="Move Layer Down" />
              <f7-menu-dropdown-item
                @click="setActiveLayer(context.editmode.sendWidgetToBack(activeLayer, context, 'canvas'))"
                href="#"
                text="Send Layer to Back" />
              <f7-menu-dropdown-item divider />
              <f7-menu-dropdown-item @click="removeLayer()" href="#" text="Remove Layer" />
            </template>
          </f7-menu-dropdown>
        </f7-menu-item>
      </f7-menu>
      <hr />
    </f7-block>
    <div ref="canvasLayoutContainer" class="oh-canvas-layout-container" :style="canvasStyle">
      <div
        v-if="config.imageUrl || config.imageSrcSet"
        v-show="!config.embedSvg || embeddedSvgReady"
        ref="canvasBackground"
        style="height: inherit; width: inherit; position: absolute; top: 0; left: 0; overflow: hidden">
        <img v-if="!config.embedSvg" class="oh-canvas-background disable-user-drag" :src="config.imageUrl" :srcset="config.imageSrcSet" />
      </div>
      <!-- Grid lines -->
      <div
        :style="{
          height: 'inherit',
          width: 'inherit',
          position: 'absolute',
          top: 0,
          left: 0,
          'background-image':
            'linear-gradient(-90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px), linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px)',
          'background-size': `${grid.pitch}px ${grid.pitch}px, ${grid.pitch}px ${grid.pitch}px`,
          visibility: context.editmode && grid.enable ? 'inherit' : 'hidden'
        }" />
      <div v-if="context.editmode" style="opacity: 0.3; padding: 4px; position: absolute; width: 100%">
        {{ getCurrentScreenResolution() }}
        <span v-if="isRetina()"
          ><f7-icon
            tooltip="Screen resolution shown is the fullscreen resolution for websites. Real screen resolution is bigger."
            f7="info_circle"
        /></span>
      </div>
      <oh-canvas-layer
        v-for="obj in layers"
        :key="obj.id"
        :id="obj.id"
        :grid-enable="grid.enable"
        :grid-pitch="grid.pitch"
        :prevent-deactivation="preventDeactivation"
        :context="childContext(obj.item)"
        @oci-dragged="ociDragged"
        @oci-drag-stop="ociDragStop"
        @oci-selected="ociSelected"
        @oci-deselected="ociDeselected" />
    </div>
  </div>
</template>

<style lang="stylus">
.oh-canvas-layout
  overflow visible // prevent widget menus from scrolling page

  .oh-canvas-layout-container
    margin auto // center layout when smaller than current screen
    background-color var(--f7-page-bg-color) // theme bg (for fullscreen)
    transform-origin top

  .oh-canvas-background
    height 100%
    width 100%
    object-fit contain

.oh-canvas-layout.disable-user-select:focus
  outline none
</style>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  onBeforeUnmount,
  getCurrentInstance,
  ref,
  reactive,
  useTemplateRef,
  toRef,
  onBeforeMount
} from 'vue'
import { f7 } from 'framework7-vue'
import type { Router } from 'framework7'

import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import { useSvgEmbedded } from '@/components/widgets/svg/useSvgEmbedded'
import OhCanvasLayer from './oh-canvas-layer.vue'
import type { OhCanvasItemSelection } from './oh-canvas-item.vue'
import { OhCanvasLayer as OhCanvasLayerType, OhCanvasLayout as OhCanvasLayoutType, OhSvgElement, OhCanvasItem as OhCanvasItemType } from '@/types/components/widgets'
import { OhCanvasLayoutDefinition } from '@/assets/definitions/widgets/layout'
import { showToast } from '@/js/dialog-promises'
import type { WidgetContext } from '../types'

import type { Framework7Events } from '@/types/framework7-extensions'

import * as api from '@/api'

// Constants / stores / types
const instance = getCurrentInstance()
const globalProps = instance?.appContext.config.globalProperties

const defaultConfig = {
  layoutType: 'fixed',
  fixedType: 'canvas'
} as OhCanvasLayoutType.Config

// Defines
const props = defineProps<{
  context: WidgetContext
  f7router: Router.Router
}>()

const emits = defineEmits<{
  (e: 'action', payload: { evt: Event | null; prefix: string | null; config: OhSvgElement.Config; context: WidgetContext }): void
}>()

defineOptions({
  widget: OhCanvasLayoutDefinition
})

// Composables
const context = computed(() => props.context)
const { config: rawConfig, childContext, slots } = useWidgetContext(context)

// config is validated and typed as OhCanvasLayoutType.Config
const config = computed(() => {
  const raw : unknown = rawConfig.value
  if (OhCanvasLayoutType.isConfig(raw)) {
    return raw
  }
  console.log('Invalid config for oh-canvas-layout, using default config')

  return defaultConfig
})

const { loadAndEmbedSvg, removeEmbeddedSvg, embeddedSvgReady, flashEmbeddedSvgComponents } = useSvgEmbedded({
  editmode: computed(() => Boolean(context.value.editmode)),
  embeddedSvgActions: toRef(config.value.embeddedSvgActions || {}),
  embedSvgFlashing: toRef(config.value.embedSvgFlashing || false),
  performAction: (evt, prefix, config) => {
    emits('action', { evt, prefix, config, context: context.value })
  },
  f7router: props.f7router,
  updateSvgElementConfig: (id, config) => {
    f7.emit('svgOnclickConfigUpdate' as Framework7Events, { id, config })
  }
})

// State/Data
const canvasBackground = useTemplateRef('canvasBackground')
const layers = ref<{ item: OhCanvasLayerType.Component; id: string }[]>([])

let nextCanvasLayerRuntimeId = 0
const canvasLayerRuntimeIds = new WeakMap<api.UiComponent, string>()

const style = reactive({
  width: 0,
  height: 0,
  scale: 1.0
})

const grid = reactive({
  pitch: 0,
  enable: false
})

const actLyrIdx = ref(0)
const preventDeactivation = ref(false)

const selectedItems = new Map<string, OhCanvasItemType.Component>()
let windowWidth = 0
let windowHeight = 0
let screenWidth = 0
let screenHeight = 0

// Computed
const activeLayer = computed(() => {
  return slots.value.canvas[actLyrIdx.value]
})

const canvasStyle = computed(
  () =>
    ({
      background: context.value.editmode ? 'var(--f7-page-master-border-color)' : false,
      width: style.width + 'px',
      height: style.height + 'px',
      transform: `scale(${style.scale})`,
      'text-align': 'center',
      position: 'relative',
      overflow: context.value.editmode ? 'visible' : 'hidden',
      '--oh-canvas-item-box-shadow': config.value.boxShadow ? config.value.boxShadow : '0px 0px 4px 2px #444',
      '--oh-canvas-item-svg-shadow': config.value.filterShadow ? config.value.filterShadow : 'drop-shadow(0px 0px 4px #444)',
      '--oh-canvas-item-text-shadow': config.value.textShadow ? config.value.textShadow : '#444 0px 0px 4px',
      ...config.value.style
    }) as any
)

// Lifecycle
onBeforeMount(() => {
  style.width = screenWidth = config.value.screenWidth || 1280
  style.height = screenHeight = config.value.screenHeight || 720
  grid.pitch = config.value.grid || 20
  grid.enable = config.value.gridEnable || false
  actLyrIdx.value = config.value.activeIdx || 0

  if (globalProps) {
    globalProps.$fullscreen.isEnabled = true
  }

  canvasLayoutStyle()
  computeLayout()
})

onMounted(async () => {
  // Chrome reports a wrong size in fullscreen, store initial resolution and use non-dynamically.
  windowWidth = window.screen.width
  windowHeight = window.screen.height
  if (config.value.embedSvg && config.value.imageUrl) {
    try {
      await loadAndEmbedSvg(config.value.imageUrl, canvasBackground.value)
    } catch (err) {
      nextTick(() => {
        showToast('Failed to embed SVG: ' + err)
      })
    }
  }
})

onBeforeUnmount(() => {
  removeEmbeddedSvg()
})

// methods
function isRetina() {
  return window.devicePixelRatio > 1
}

function getCurrentScreenResolution() {
  return 'Layout Size: ' + screenWidth + ' x ' + screenHeight + ' (Current Screen: ' + windowWidth + ' x ' + windowHeight + ')'
}

function addItem() {
  if (!context.value.editmode?.isEditable) {
    return
  }
  if (!slots.value.canvas[0]) {
    addLayer()
  }
  if (!slots.value.canvas[actLyrIdx.value].slots) {
    slots.value.canvas[actLyrIdx.value].slots = { default: [] }
  }
  slots.value.canvas[actLyrIdx.value].slots!.default.push({
    component: 'oh-canvas-item',
    config: { x: 20, y: 20, h: 150, w: 200 },
    slots: { default: [] }
  })
  computeLayout()
}

function addLayer() {
  if (!context.value.editmode?.isEditable) {
    return
  }
  slots.value.canvas.push({
    component: 'oh-canvas-layer',
    config: {},
    slots: { default: [] }
  } as any) //TODO - fix type
  actLyrIdx.value = slots.value.canvas.length - 1
  computeLayout()
}

function removeLayer() {
  if (!context.value.editmode?.isEditable) {
    return
  }
  slots.value.canvas.splice(actLyrIdx.value, 1)
  setActiveLayer(Math.min(0, actLyrIdx.value--))
  computeLayout()
}

function setActiveLayer(idx: number) {
  if (!context.value.editmode?.isEditable) {
    return actLyrIdx
  }
  actLyrIdx.value = context.value.component.config.activeIdx = idx
  slots.value.canvas[actLyrIdx.value].config = slots.value.canvas[actLyrIdx.value].config || {}
  delete slots.value.canvas[actLyrIdx.value].config.editVisible
  return actLyrIdx
}

function configureLayer() {
  context.value.editmode?.configureWidget(slots.value.canvas[actLyrIdx.value], context.value.component, 'oh-canvas-layer')
}

function hideOtherLayers() {
  if (!context.value.editmode?.isEditable) {
    return
  }
  slots.value.canvas.forEach((layer: any, idx: number) => {
    if (idx !== actLyrIdx.value && OhCanvasLayerType.isComponent(layer, {})) {
      layer.config.editVisible = false
    }
  })
}

function showOtherLayers() {
  if (!context.value.editmode?.isEditable) {
    return
  }
  slots.value.canvas.forEach((layer: any, idx: number) => {
    if (idx !== actLyrIdx.value) {
      layer.config.editVisible = true
    }
  })
}

function toggleGrid() {
  if (!context.value.editmode?.isEditable) {
    return
  }
  context.value.component.config.gridEnable = grid.enable = !grid.enable
}

function canvasLayoutStyle() {
  if (config.value.scale && !context.value.editmode) {
    style.scale = parent.innerWidth / screenWidth
  } else {
    style.scale = 1.0
  }
}

function computeLayout() {
  let _layers: { item: OhCanvasLayerType.Component; id: string }[] = []
  if (slots.value.canvas && Array.isArray(slots.value.canvas)) {
    slots.value.canvas.forEach((item: api.UiComponent) => {
      if (OhCanvasLayerType.isComponent(item)) {
        let layerId = canvasLayerRuntimeIds.get(item)
        if (!layerId) {
          layerId = `canvas-layer-${++nextCanvasLayerRuntimeId}`
          canvasLayerRuntimeIds.set(item, layerId)
        }
        _layers.push({
          item,
          id: layerId
        })
      } else {
        console.log('Wrong component type in canvas: ' + item.component)
      }
    })
  }
  layers.value = _layers
}

function onKeyDown(ev: KeyboardEvent) {
  let moveX = 0,
    moveY = 0
  switch (ev.key) {
    case 'Shift':
      preventDeactivation.value = true
      break
    case 'ArrowDown':
      moveY = 1
      break
    case 'ArrowUp':
      moveY = -1
      break
    case 'ArrowRight':
      moveX = 1
      break
    case 'ArrowLeft':
      moveX = -1
      break
  }
  if (moveX || moveY) {
    const moveBy = grid.enable ? grid.pitch : 1
    const didMove = moveSelectedItems(null, moveX * moveBy, moveY * moveBy)
    if (didMove) {
      ev.stopPropagation()
      ev.preventDefault()
    }
  }
}

function onKeyUp(ev: KeyboardEvent) {
  switch (ev.key) {
    case 'Shift':
      preventDeactivation.value = false
      break
  }
}

function moveSelectedItems(exceptId: string | null, deltaX: number, deltaY: number) {
  let movedSomething = false

  selectedItems.forEach((component, itemId) => {
    if (itemId !== exceptId) {
      if (component.component !== 'oh-canvas-item') {
        return
      }

      const currentX = typeof component.config.x === 'number' ? component.config.x : 20
      const currentY = typeof component.config.y === 'number' ? component.config.y : 20

      component.config.x = currentX + deltaX
      component.config.y = currentY + deltaY
      movedSomething = true
    }
  })

  return movedSomething
}

function ociSelected(item: OhCanvasItemSelection) {
  selectedItems.set(item.id, item.component)
}

function ociDeselected(itemId: string) {
  selectedItems.delete(itemId)
}

function ociDragged(item: string, deltaX: number, deltaY: number) {
  // Move all selected (active) items, except the source one (already moved)
  // if there are several objects selected
  if (selectedItems.size > 1) {
    moveSelectedItems(item, deltaX, deltaY)
  }
}

function ociDragStop(itemId: string) {
}
</script>
