<template>
  <template v-if="visible">
    <vue-draggable-resizable
      v-if="context.editmode"
      v-model:active="active"
      :id="'oh-canvas-item-vdr-' + id"
      :key="reloadKey"
      :x="x"
      :y="y"
      :w="w"
      :h="h"
      :z="active ? 10 : 0"
      :parent="false"
      :draggable="true"
      :resizable="!autosize"
      class="oh-canvas-item oh-canvas-item-editmode no-margin"
      :grid="gridEnable ? [gridPitch, gridPitch] : undefined"
      :min-height="gridEnable ? gridPitch : undefined"
      :min-width="gridEnable ? gridPitch : undefined"
      :on-drag-start="onDragStartCallback"
      :on-resize-start="onResizeStartCallback"
      :prevent-deactivation="preventDeactivation"
      @dragging="onDrag"
      @resizing="onResize"
      @drag-stop="onDragStop"
      @resize-stop="onResizeStop">
      <f7-menu class="configure-canvas-menu disable-user-select">
        <f7-menu-item icon-f7="menu" dropdown icon-only>
          <f7-menu-dropdown right>
            <f7-menu-dropdown-item
              @click="context.editmode.configureWidget(context.component, context.parent)"
              href="#"
              text="Configure container" />
            <f7-menu-dropdown-item
              v-if="defaultSlots.length > 0"
              @click="context.editmode.configureWidget(defaultSlots[0], context)"
              href="#"
              text="Configure Widget" />
            <f7-menu-dropdown-item @click="context.editmode.editWidgetCode(context.component, context.parent)" href="#" text="Edit YAML" />
            <f7-menu-dropdown-item v-if="defaultSlots.length > 0" @click="toggleAutoSize()" href="#">
              <span>Auto Size</span>
              <f7-icon class="margin-left" :f7="autosize ? 'checkmark_square' : 'square'" />
            </f7-menu-dropdown-item>
            <f7-menu-dropdown-item v-if="defaultSlots.length > 0" @click="toggleShadow()" href="#">
              <span>Shadow</span>
              <f7-icon class="margin-left" :f7="shadow ? 'checkmark_square' : 'square'" />
            </f7-menu-dropdown-item>
            <f7-menu-dropdown-item v-if="defaultSlots.length > 0" divider />
            <f7-menu-dropdown-item @click="context.editmode.copyWidget(context.component, context.parent)" href="#" text="Copy" />
            <f7-menu-dropdown-item @click="context.editmode.cutWidget(context.component, context.parent)" href="#" text="Cut" />
            <f7-menu-dropdown-item divider />
            <f7-menu-dropdown-item
              @click="context.editmode.bringWidgetToFront(context.component, context.parent)"
              href="#"
              text="Bring to Front" />
            <f7-menu-dropdown-item @click="context.editmode.moveWidgetDown(context.component, context.parent)" href="#" text="Move Up" />
            <f7-menu-dropdown-item @click="context.editmode.moveWidgetUp(context.component, context.parent)" href="#" text="Move Down" />
            <f7-menu-dropdown-item
              @click="context.editmode.sendWidgetToBack(context.component, context.parent)"
              href="#"
              text="Send to Back" />
            <f7-menu-dropdown-item divider />
            <f7-menu-dropdown-item @click="context.editmode.removeWidget(context.component, context.parent)" href="#" text="Remove Item" />
          </f7-menu-dropdown>
        </f7-menu-item>
      </f7-menu>
      <div
        @click.capture="eventControl"
        :style="{
        width: autosize ? 'auto' : w + 'px',
        height: autosize ? 'auto' : h + 'px'
      }"
        class="disable-user-select">
        <oh-placeholder-widget
          v-if="!defaultSlots.length"
          @click="context.editmode.addWidget(context.component, null, context.parent)"
          class="oh-canvas-item-content" />
        <generic-widget-component
          v-else-if="defaultSlots.length"
          :context="childContext(defaultSlots[0])"
          class="oh-canvas-item-content"
          :class="{
            'oh-canvas-item-styled': styled,
            'oh-canvas-item-shadow': styled && shadow,
          }" />
        <f7-icon class="drag-handle disable-user-select" f7="move" size="15" color="gray" />
        <div class="oh-canvas-item-id disable-user-select">{{ config.id }}</div>
        <div v-if="active" class="oh-canvas-item-msg disable-user-select">{{ editMessage }}</div>
      </div>
    </vue-draggable-resizable>
    <div
      v-else
      :ref="root"
      :style="{
        left: x + 'px',
        top: y + 'px',
        width: autosize ? 'auto' : w + 'px',
        height: autosize ? 'auto' : h + 'px'
      }"
      class="oh-canvas-item oh-canvas-item-runmode">
      <generic-widget-component
        v-if="ready"
        :context="childContext(defaultSlots[0])"
        class="oh-canvas-item-content"
        :class="{
          'oh-canvas-item-styled': styled,
          'oh-canvas-item-shadow': styled && shadow,
        }" />
    </div>
  </template>
</template>

<style lang="stylus">
.oh-canvas-item-runmode
  display block

.oh-canvas-item-editmode
  outline 1px dashed #F00
  cursor move
  color red
  font-size 10px

  *
    cursor move !important

.oh-canvas-item
  position absolute
  pointer-events auto

  .oh-canvas-item-content
    width 100%
    height 100%
    margin 0

  .oh-canvas-item-styled        // override background obscuring styles from system widgets
    &.card                    // apply to card items
      box-shadow none
      background none
      .card-content, .card-footer
        .segmented, .stepper, .toggle
          background var(--f7-card-bg-color)

  .oh-canvas-item-shadow        // shadow tuned to various card widgets
    &.card                    // apply to card items
      .card-content, .card-footer
        .segmented, .stepper, .toggle
          box-shadow  var(--oh-canvas-item-box-shadow)
        .oh-slider
          .range-bar, .range-knob, .range-knob-label
            box-shadow  var(--oh-canvas-item-box-shadow)
        img, svg
          filter var(--oh-canvas-item-svg-shadow)
      .label-card-content
        text-shadow var(--oh-canvas-item-text-shadow)

  .oh-canvas-item-id
    position absolute
    bottom 0
    right 0

  .oh-canvas-item-msg
    position absolute
    bottom -22px
    right 0

  .placeholder-widget a
    height 100%
    padding 0
    display flex

  .drag-handle                // show drag handle on upper left corner
    position absolute !important
    top 0px
    left 0px
    padding 2px
    z-index 1000

  .configure-canvas-menu        // show menu icon on upper right corner
    position absolute
    top 2px
    right 2px
    .menu-inner
      padding 0px
    .menu-inner:after
      width 0px
</style>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, type VNodeRef } from 'vue'
import 'vue-draggable-resizable/style.css'
import VueDraggableResizable from 'vue-draggable-resizable'

import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import { OhCanvasItemDefinition } from '@/assets/definitions/widgets/layout'
import type { WidgetContext } from '@/components/widgets/types'
import GenericWidgetComponent from '@/components/widgets/generic-widget-component.vue'
import OhPlaceholderWidget from '@/components/widgets/layout/oh-placeholder-widget.vue'

defineOptions({ widget: OhCanvasItemDefinition })

// props & emits
const props = defineProps<{
  context: WidgetContext
  gridPitch: number
  gridEnable: boolean
  id: string
  preventDeactivation: boolean
}>()

export interface OhCanvasItemEmits {
  (e: 'oci-selected', id: string): void
  (e: 'oci-deselected', id: string): void
  (e: 'oci-drag-stop', id: string): void
  (e: 'oci-dragged', id: string, x: number, y: number): void
}

const emit = defineEmits<OhCanvasItemEmits>();

// composables
const { config, visible, childContext, defaultSlots } = useWidgetContext(props.context)

// data (state)
const root = ref<VNodeRef | null>(null)
const reloadKey = ref(0)
const dragging = ref(false)
const resizing = ref(false)
const active = ref(false)
// run mode only:
const ready = ref(false)
const resizeObserver = ref<ResizeObserver | null>(null)

// computed
const x = computed({
  get: () => (config.value?.x as number) ?? 20,
  set: (val) => { props.context.component.config.x = val }
})

const y = computed({
  get: () => (config.value?.y as number) ?? 20,
  set: (val) => { props.context.component.config.y = val }
})

const w = computed<number | 'auto'>({
  get: () => (config.value?.w as number | string as 'auto') ?? 100,
  set: (val: number | 'auto') => { props.context.component.config.w = val }
})

const h = computed<number | 'auto'>({
  get: () => (config.value?.h as number | string as 'auto') ?? 100,
  set: (val: number | 'auto') => { props.context.component.config.h = val }
})

const shadow = computed({
  get: () => config.value?.noCanvasShadow === false,
  set: (val) => { props.context.component.config.noCanvasShadow = val }
})

const styled = computed(() => config.value?.notStyled === false)

const autosize = computed(() => w.value === 'auto')

const editMessage = computed(() => {
  if (dragging.value) return `(${x.value}, ${y.value})`
  if (resizing.value) return `${w.value}x${h.value}`
  return ''
})

// watchers
watch(active, (val) => {
  if (val) {
    emit('oci-selected', props.id)
  } else {
    emit('oci-deselected', props.id)
  }
})

// lifecycle
onMounted(() => {
  // In Edit Mode: No need to wait for the root element to have actual dimensions
  if (props.context.editmode) {
    ready.value = true
    return
  }

  // In Run Mode: Wait for the element to have actual dimensions
  resizeObserver.value = new ResizeObserver((entries) => {
    for (const entry of entries) {
      // Once width/height is non-zero, the layout is stable enough for f7-swiper
      if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
        ready.value = true
        resizeObserver.value?.disconnect()
      }
    }
  })

  // Start observing the root element of this component
  if (root.value) {
    resizeObserver.value.observe(root.value)
  } else {
    ready.value = true
  }
})

onBeforeUnmount(() => {
  if (resizeObserver.value) {
    resizeObserver.value.disconnect()
  }
})

// methods
const toggleAutoSize = () => {
  if (w.value === 'auto') {
    const elem = document.getElementById('oh-canvas-item-vdr-' + props.id)
    if (elem) {
      w.value = props.context.component.config.w = Math.max(10, elem.clientWidth)
      h.value = props.context.component.config.h = Math.max(10, elem.clientHeight)
    }
  } else {
    w.value = props.context.component.config.w = 'auto'
    h.value = props.context.component.config.h = 'auto'
    reloadKey.value += 1
  }
}

const toggleShadow = () => {
  shadow.value = !shadow.value
}

const onResize = (newX: number, newY: number, width: number, height: number) => {
  x.value = newX
  y.value = newY
  w.value = width
  h.value = height
}

const onDrag = (newX: number, newY: number) => {
  emit('oci-dragged', props.id, newX - x.value, newY - y.value)
  moveTo(newX, newY)
}

const moveTo = (newX: number, newY: number) => {
  x.value = newX
  y.value = newY
}

const onResizeStartCallback = (_handle: unknown, _x: number, _y: number, _width: number, _height: number) => {
  if (w.value === 'auto' || h.value === 'auto') return false

  const posOK = onDragStartCallback(_x, _y)
  if (props.gridEnable) {
    const snapW = Math.round((w.value as number) / props.gridPitch) * props.gridPitch
    const snapH = Math.round((h.value as number) / props.gridPitch) * props.gridPitch

    if (w.value === snapW && h.value === snapH) {
      // Widget already on grid, can continue to resize
      resizing.value = posOK
    } else {
      // Widget was not on grid, snap to grid upon first action
      onResize(x.value, y.value, snapW, snapH)
      resizing.value = false
    }
  } else {
    resizing.value = true
  }

  if (resizing.value) dragging.value = false
  return resizing.value
}

const onDragStartCallback = (_x: number, _y: number) => {
  if (!props.context.editmode) return false

  if (props.gridEnable) {
    const snapX = Math.round(x.value / props.gridPitch) * props.gridPitch
    const snapY = Math.round(y.value / props.gridPitch) * props.gridPitch

    if (x.value === snapX && y.value === snapY) {
      // Origin on grid, continue dragging action
      dragging.value = true
    } else {
      // Snap to grid and stop action
      onDrag(snapX, snapY)
      dragging.value = true
    }
  } else {
    dragging.value = true
  }

  if (dragging.value) resizing.value = false
  return dragging.value
}

const onResizeStop = () => {
  resizing.value = false
}

const onDragStop = () => {
  emit('oci-drag-stop', props.id)
  dragging.value = false
}

const eventControl = (ev: Event) => {
  // Events are captured before bubbling to prevent undesired widget interaction
  // when a widget has been added but the page is in edit mode.
  if (props.context.editmode && defaultSlots.value.length > 0) {
    ev.stopPropagation()
    ev.preventDefault()
  }
}
</script>
