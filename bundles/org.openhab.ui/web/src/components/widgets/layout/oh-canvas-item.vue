<template>
  <vue-draggable-resizable
    :id="'oh-canvas-item-vdr-' + id"
    :key="reloadKey"
    :x="x"
    :y="y"
    :w="w"
    :h="h"
    :z="active ? 10 : 0"
    :parent="false"
    :draggable="!!context.editmode"
    :resizable="!!context.editmode && !autosize"
    :class-name="!!context.editmode ? 'oh-canvas-item-editmode' : 'oh-canvas-item-runmode'"
    :grid="gridEnable ? [gridPitch, gridPitch] : undefined"
    :min-height="gridEnable ? gridPitch : undefined"
    :min-width="gridEnable ? gridPitch : undefined"
    v-if="visible"
    class="oh-canvas-item no-margin"
    @dragging="onDrag"
    @resizing="onResize"
    :on-drag-start="onDragStartCallback"
    :on-resize-start="onResizeStartCallback"
    @dragstop="onDragStop"
    @resizestop="onResizeStop"
    v-model:active="active"
    :prevent-deactivation="preventDeactivation">
    <f7-menu v-if="context.editmode" class="configure-canvas-menu disable-user-select">
      <f7-menu-item icon-f7="menu" dropdown icon-only>
        <f7-menu-dropdown right>
          <f7-menu-dropdown-item @click="context.editmode.configureWidget(context.component, context.parent)" href="#" text="Configure container" />
          <f7-menu-dropdown-item v-if="context.component.slots.default.length > 0"
                                 @click="context.editmode.configureWidget(context.component.slots.default[0], context)"
                                 href="#"
                                 text="Configure Widget" />
          <f7-menu-dropdown-item @click="context.editmode.editWidgetCode(context.component, context.parent)" href="#" text="Edit YAML" />
          <f7-menu-dropdown-item v-if="context.component.slots.default.length > 0"
                                 @click="toggleAutoSize()"
                                 href="#">
            <span>Auto Size</span>
            <f7-icon class="margin-left" :f7="autosize ? 'checkmark_square' : 'square'" />
          </f7-menu-dropdown-item>
          <f7-menu-dropdown-item v-if="context.component.slots.default.length > 0"
                                 @click="toggleShadow()"
                                 href="#">
            <span>Shadow</span>
            <f7-icon class="margin-left" :f7="shadow ? 'checkmark_square' : 'square'" />
          </f7-menu-dropdown-item>
          <f7-menu-dropdown-item v-if="context.component.slots.default.length > 0" divider />
          <f7-menu-dropdown-item @click="context.editmode.copyWidget(context.component, context.parent)" href="#" text="Copy" />
          <f7-menu-dropdown-item @click="context.editmode.cutWidget(context.component, context.parent)" href="#" text="Cut" />
          <f7-menu-dropdown-item divider />
          <f7-menu-dropdown-item @click="context.editmode.bringWidgetToFront(context.component, context.parent)" href="#" text="Bring to Front" />
          <f7-menu-dropdown-item @click="context.editmode.moveWidgetDown(context.component, context.parent)" href="#" text="Move Up" />
          <f7-menu-dropdown-item @click="context.editmode.moveWidgetUp(context.component, context.parent)" href="#" text="Move Down" />
          <f7-menu-dropdown-item @click="context.editmode.sendWidgetToBack(context.component, context.parent)" href="#" text="Send to Back" />
          <f7-menu-dropdown-item divider />
          <f7-menu-dropdown-item @click="context.editmode.removeWidget(context.component, context.parent)" href="#" text="Remove Item" />
        </f7-menu-dropdown>
      </f7-menu-item>
    </f7-menu>
    <div
      @click.capture="eventControl"
      style="width: 100%; height: 100%; position: absolute"
      class="disable-user-select">
      <oh-placeholder-widget v-if="context.editmode && !context.component.slots.default.length"
                             @click="context.editmode.addWidget(context.component, null, context.parent)"
                             class="oh-canvas-item-content" />
      <generic-widget-component v-else-if="context.component.slots.default.length"
                                :context="childContext(context.component.slots.default[0])"
                                @command="onCommand"
                                class="oh-canvas-item-content"
                                :class="{
                                  'oh-canvas-item-styled': styled,
                                  'oh-canvas-item-shadow': styled && shadow,
                                }" />
      <f7-icon v-if="context.editmode"
               class="drag-handle disable-user-select"
               f7="move"
               size="15"
               color="gray" />
      <div v-if="context.editmode" class="oh-canvas-item-id disable-user-select">
        {{ config.id }}
      </div>
      <div v-if="context.editmode && active" class="oh-canvas-item-msg disable-user-select">
        {{ editMessage }}
      </div>
    </div>
  </vue-draggable-resizable>
</template>

<style lang="stylus">
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

<script>
import { defineAsyncComponent } from 'vue'
import mixin from '../widget-mixin'
import OhPlaceholderWidget from './oh-placeholder-widget.vue'
import { OhCanvasItemDefinition } from '@/assets/definitions/widgets/layout'

export default {
  mixins: [mixin],
  widget: OhCanvasItemDefinition,
  components: {
    'vue-draggable-resizable': defineAsyncComponent(() => Promise.all([
      import(/* webpackChunkName: "canvas-layout" */ 'vue-draggable-resizable/style.css'),
      import(/* webpackChunkName: "canvas-layout" */ 'vue-draggable-resizable')
    ]).then((component) => {
      return component[1].default
    })),
    OhPlaceholderWidget
  },
  props: {
    gridPitch: Number,
    gridEnable: Boolean,
    id: String,
    preventDeactivation: Boolean
  },
  emits: ['oci-selected', 'oci-deselected', 'oci-drag-stop', 'oci-dragged'],
  data () {
    return {
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      reloadKey: 0,
      shadow: true,
      styled: true,
      dragging: false,
      resizing: false,
      active: false
    }
  },
  created () {
    this.x = this.config.x || 20
    this.y = this.config.y || 20
    this.w = this.config.w || 100
    this.h = this.config.h || 100
    this.shadow = !this.config.noCanvasShadow
    this.styled = !this.config.notStyled
  },
  computed: {
    autosize () {
      return this.w === 'auto'
    },
    editMessage () {
      if (this.dragging) {
        return `(${this.x}, ${this.y})`
      } else if (this.resizing) {
        return `${this.w}x${this.h}`
      } else {
        return ''
      }
    }
  },
  watch: {
    active (val) {
      if (val) this.$emit('oci-selected', this)
      else this.$emit('oci-deselected', this)
    }
  },
  methods: {
    toggleAutoSize () {
      if (this.w === 'auto') {
        const elem = document.getElementById('oh-canvas-item-vdr-' + this.id)
        this.w = this.context.component.config.w = Math.max(10, elem.clientWidth)
        this.h = this.context.component.config.h = Math.max(10, elem.clientHeight)
      } else {
        this.w = this.context.component.config.w = 'auto'
        this.h = this.context.component.config.h = 'auto'
        this.reloadKey += 1
      }
    },
    toggleShadow () {
      this.shadow = !this.shadow
      this.context.component.config.noCanvasShadow = !this.shadow
    },
    onResize (x, y, width, height) {
      this.x = this.context.component.config.x = x
      this.y = this.context.component.config.y = y
      this.w = this.context.component.config.w = width
      this.h = this.context.component.config.h = height
    },
    onDrag (x, y) {
      this.$emit('oci-dragged', this, x - this.x, y - this.y)
      this.moveTo(x, y)
    },
    moveTo (x, y) {
      this.x = this.context.component.config.x = x
      this.y = this.context.component.config.y = y
    },
    onResizeStartCallback (ev) {
      if (this.w === 'auto' || this.h === 'auto') {
        return false
      }

      const posOK = this.onDragStartCallback(ev)
      if (this.gridEnable) {
        const snapW = Math.round(this.w / this.gridPitch) * this.gridPitch
        const snapH = Math.round(this.h / this.gridPitch) * this.gridPitch

        if (this.w === snapW && this.h === snapH) {
          // Widget already on grid, can continue to resize
          this.resizing = posOK
        } else {
          // Widget was not on grid, snap to grid upon first action
          this.onResize(this.x, this.y, snapW, snapH)
          this.resizing = false
        }
      } else {
        this.resizing = true
      }

      if (this.resizing) this.dragging = false
      return this.resizing
    },
    onDragStartCallback (ev) {
      if (!this.context.editmode) return false

      if (this.gridEnable) {
        const snapX = Math.round(this.x / this.gridPitch) * this.gridPitch
        const snapY = Math.round(this.y / this.gridPitch) * this.gridPitch

        if (this.x === snapX && this.y === snapY) {
          // Origin on grid, continue dragging action
          this.dragging = true
        } else {
          // First snap to grid component and stop action
          this.onDrag(snapX, snapY)
          this.dragging = true
        }
      } else {
        this.dragging = true
      }

      if (this.dragging) this.resizing = false
      return this.dragging
    },
    onResizeStop () {
      this.resizing = false
    },
    onDragStop () {
      this.$emit('oci-drag-stop', this)
      this.stopDrag()
    },
    stopDrag () {
      this.dragging = false
    },
    eventControl (ev) {
      // Events are captured before bubbling to prevent undesired widget interaction when a widget has been
      // added but the page is in edit mode.
      if (this.context.editmode && this.context.component.slots.default.length > 0) {
        ev.stopPropagation()
        ev.preventDefault()
      }
    }
  }
}
</script>
