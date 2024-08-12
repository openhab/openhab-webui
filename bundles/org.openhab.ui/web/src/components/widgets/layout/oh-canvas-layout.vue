<template>
  <div ref="ohCanvasLayout" class="oh-canvas-layout disable-user-select" :class="context.editmode ? 'margin-top' : ''" @keydown="onKeyDown" @keyup="onKeyUp">
    <f7-block v-if="context.editmode">
      <f7-menu class="configure-layout-menu">
        <f7-menu-item
          @click="addItem"
          icon="margin-left"
          icon-f7="plus"
          text="Add Widget" />
        <f7-menu-item
          v-if="context.clipboardtype"
          @click="
            context.editmode.pasteWidget(
              activeLayer,
              context.component)"
          icon-f7="square_on_square" />
        <f7-menu-item
          @click="toggleGrid()"
          icon="margin-left-half"
          :icon-f7="grid.enable ? 'circle_grid_3x3_fill' : 'scircle_grid_3x3'"
          style="margin-left: auto"
          text="Grid" />
        <f7-menu-item
          dropdown
          icon-f7="rectangle_3_offgrid">
          <f7-menu-dropdown right>
            <f7-menu-dropdown-item
              @click="
                context.editmode.configureWidget(
                  context.component,
                  context.parent,
                  'oh-canvas-layout'
                )
              "
              href="#"
              text="Configure Canvas Layout" />
            <f7-menu-dropdown-item divider />
            <f7-menu-dropdown-item @click="addLayer()" href="#" text="Add Layer" />
            <f7-menu-dropdown-item @click="configureLayer()" href="#" text="Configure Layer" />
            <template v-if="layerToolsVisible">
              <f7-menu-dropdown-item divider />
              <f7-menu-dropdown-item class="justify-content-center" text="Layers" />
              <f7-menu-dropdown-item
                v-for="(obj, idx) in layout.slice().reverse()"
                :key="idx"
                @click="setActiveLayer(layout.length - idx - 1)"
                href="#">
                <span>{{ (obj.item.config && obj.item.config.layerName) ? obj.item.config.layerName : `Layer ${layout.length - idx}` }}</span>
                <f7-icon class="margin-left" :f7="(layout.length - idx - 1) == actLyrIdx ? 'pencil_circle_fill' : ''" />
                <f7-icon class="margin-left" :f7="!(obj.item.config && (obj.item.config.editVisible === false)) ? 'eye_fill' : 'eye_slash_fill'" />
              </f7-menu-dropdown-item>
              <f7-menu-dropdown-item divider />
              <f7-menu-dropdown-item @click="hideOtherLayers()" href="#" text="Hide Other Layers" />
              <f7-menu-dropdown-item @click="showOtherLayers()" href="#" text="Show Other Layers" />
              <f7-menu-dropdown-item divider />
              <f7-menu-dropdown-item @click="setActiveLayer(context.editmode.bringWidgetToFront(activeLayer, context, 'canvas'))" href="#" text="Bring Layer to Front" />
              <f7-menu-dropdown-item @click="setActiveLayer(context.editmode.moveWidgetDown(activeLayer, context, 'canvas'))" href="#" text="Move Layer Up" />
              <f7-menu-dropdown-item @click="setActiveLayer(context.editmode.moveWidgetUp(activeLayer, context, 'canvas'))" href="#" text="Move Layer Down" />
              <f7-menu-dropdown-item @click="setActiveLayer(context.editmode.sendWidgetToBack(activeLayer, context, 'canvas'))" href="#" text="Send Layer to Back" />
              <f7-menu-dropdown-item divider />
              <f7-menu-dropdown-item @click="removeLayer()" href="#" text="Remove Layer" />
            </template>
          </f7-menu-dropdown>
        </f7-menu-item>
      </f7-menu>
      <hr>
    </f7-block>
    <div
      ref="canvasLayoutContainer"
      class="oh-canvas-layout-container"
      :style="{
        background: context.editmode
          ? 'var(--f7-page-master-border-color)'
          : false,
        width: style.width + 'px',
        height: style.height + 'px',
        transform: `scale(${style.scale})`,
        'text-align': 'center',
        position: 'relative',
        overflow: context.editmode ? 'visible' : 'hidden',
        '--oh-canvas-item-box-shadow': config.boxShadow
          ? config.boxShadow
          : '0px 0px 4px 2px #444',
        '--oh-canvas-item-svg-shadow': config.filterShadow
          ? config.filterShadow
          : 'drop-shadow(0px 0px 4px #444)',
        '--oh-canvas-item-text-shadow': config.textShadow
          ? config.textShadow
          : '#444 0px 0px 4px',
      }">
      <div
        v-if="config.imageUrl || config.imageSrcSet"
        style="
          height: inherit;
          width: inherit;
          position: absolute;
          top: 0;
          left: 0;
        ">
        <img
          class="oh-canvas-background disable-user-drag"
          :src="config.imageUrl"
          :srcset="config.imageSrcSet">
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
          visibility: context.editmode && grid.enable ? 'inherit' : 'hidden',
        }" />
      <div
        v-if="context.editmode"
        style="
          opacity: 0.3;
          padding: 4px;
          position: absolute;
          width: 100%;
        ">
        {{ getCurrentScreenResolution() }}
        <span v-if="isRetina()"><f7-icon
          tooltip="Screen resolution shown is the fullscreen resolution for websites. Real screen resolution is bigger."
          f7="info_circle" /></span>
      </div>
      <oh-canvas-layer
        v-for="obj in layout"
        :key="obj.id"
        :id="obj.id"
        :grid-enable="grid.enable"
        :grid-pitch="grid.pitch"
        :prevent-deactivation="preventDeactivation"
        :context="childContext(obj.item)"
        @ociDragged="ociDragged"
        @ociDragStop="ociDragStop"
        @ociSelected="ociSelected"
        @ociDeselected="ociDeselected" />
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
</style>

<script>
import mixin from '../widget-mixin'
import OhCanvasLayer from './oh-canvas-layer'
import { OhCanvasLayoutDefinition } from '@/assets/definitions/widgets/layout'

export default {
  mixins: [mixin],
  widget: OhCanvasLayoutDefinition,
  components: {
    OhCanvasLayer
  },
  data () {
    return {
      layout: [],
      screenWidth: Number,
      screenHeight: Number,
      fullscreen: this.$fullscreen.getState(),
      navbarHidden: false,
      style: {
        width: Number,
        height: Number,
        scale: 1.0
      },
      grid: {
        pitch: Number,
        enable: false
      },
      actLyrIdx: 0,
      preventDeactivation: false,
      selectedItems: []
    }
  },
  computed: {
    activeLayer () {
      return this.context.component.slots.canvas[this.actLyrIdx]
    },
    layerToolsVisible () {
      return this.context.component.slots.canvas.length > 1
    }
  },
  created () {
    if (this.config.layoutType === 'fixed' && this.config.fixedType === 'canvas') {
      this.style.width = this.screenWidth = this.config.screenWidth || 1280
      this.style.height = this.screenHeight = this.config.screenHeight || 720
      this.grid.pitch = this.config.grid || 20
      this.grid.enable = this.config.gridEnable || false
      this.actLyrIdx = this.config.activeIdx || 0

      if (!this.context.editmode) {
        window.addEventListener('resize', this.setDimensions)
      }
    }
    this.$fullscreen.support = true
    this.canvasLayoutStyle()
    this.computeLayout()
  },
  mounted () {
    // Chrome reports a wrong size in fullscreen, store initial resolution and use non-dynamically.
    this.windowWidth = window.screen.width
    this.windowHeight = window.screen.height
  },
  methods: {
    isRetina () {
      return window.devicePixelRatio > 1
    },
    getCurrentScreenResolution () {
      return (
        'Layout Size: ' +
        this.screenWidth +
        ' x ' +
        this.screenHeight +
        ' (Current Screen: ' +
        this.windowWidth +
        ' x ' +
        this.windowHeight +
        ')'
      )
    },
    addItem () {
      if (!this.context.component.slots?.canvas[0]) {
        this.addLayer()
      }
      this.context.component.slots.canvas[this.actLyrIdx].slots.default.push({
        component: 'oh-canvas-item',
        config: { x: 20, y: 20, h: 150, w: 200 },
        slots: { default: [] }
      })
      this.computeLayout()
    },
    addLayer () {
      this.context.component.slots.canvas.push({
        component: 'oh-canvas-layer',
        config: {},
        slots: { default: [] }
      })
      this.actLyrIdx = this.context.component.slots.canvas.length - 1
      this.computeLayout()
    },
    removeLayer () {
      this.context.component.slots.canvas.splice(this.actLyrIdx, 1)
      this.setActiveLayer(Math.min(0, this.actLyrIdx--))
      this.computeLayout()
    },
    setActiveLayer (idx) {
      this.actLyrIdx = this.context.component.config.activeIdx = idx
      this.context.component.slots.canvas[this.actLyrIdx].config = this.context.component.slots.canvas[this.actLyrIdx].config || {}
      delete this.context.component.slots.canvas[this.actLyrIdx].config.editVisible
    },
    configureLayer () {
      this.context.editmode.configureWidget(this.context.component.slots.canvas[this.actLyrIdx], this.context.component, 'oh-canvas-layer')
    },
    hideOtherLayers () {
      this.context.component.slots.canvas.forEach((layer, idx) => {
        if (idx !== this.actLyrIdx) {
          this.$set(layer, 'config', layer.config || {})
          this.$set(layer.config, 'editVisible', false)
        }
      })
    },
    showOtherLayers () {
      this.context.component.slots.canvas.forEach((layer, idx) => {
        if (idx !== this.actLyrIdx) {
          layer.config.editVisible = true
        }
      })
    },
    toggleGrid () {
      this.context.component.config.gridEnable = this.grid.enable = !this.grid.enable
    },
    canvasLayoutStyle () {
      if (this.config.scale && !this.context.editmode) {
        this.style.scale = parent.innerWidth / this.screenWidth
      } else {
        this.style.scale = 1.0
      }
    },
    computeLayout () {
      let layout = []
      if (this.context.component.slots?.canvas) {
        this.context.component.slots.canvas.forEach((item) => {
          if (item.component === 'oh-canvas-layer') {
            layout.push({
              item,
              id: Math.random().toString(36).substring(2)
            })
          } else {
            console.log('Wrong component type in canvas: ' + item.component)
          }
        })
      }
      this.layout = layout
    },
    onKeyDown (ev) {
      let moveX = 0, moveY = 0
      switch (ev.key) {
        case 'Shift':
          this.preventDeactivation = true
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
        const moveBy = this.grid.enable ? this.grid.pitch : 1
        const didMove = this.moveSelectedItems(null, moveX * moveBy, moveY * moveBy)
        if (didMove) {
          ev.stopPropagation()
          ev.preventDefault()
        }
      }
    },
    onKeyUp (ev) {
      switch (ev.key) {
        case 'Shift':
          this.preventDeactivation = false
          break
      }
    },
    moveSelectedItems (exceptId, deltaX, deltaY) {
      let movedSomething = false
      this.selectedItems.forEach(i => {
        if (i.id !== exceptId) {
          i.moveTo(i.x + deltaX, i.y + deltaY)
          movedSomething = true
        }
      })
      return movedSomething
    },
    ociSelected (item) {
      this.selectedItems.push(item)
    },
    ociDeselected (item) {
      this.selectedItems.splice(this.selectedItems.indexOf(item), 1)
    },
    ociDragged (item, deltaX, deltaY) {
      // Move all selected (active) items, except the source one (already moved)
      // if there are several objects selected
      if (this.selectedItems.length > 1) {
        this.moveSelectedItems(item.id, deltaX, deltaY)
      }
    },
    ociDragStop (itemId) {
      // Notify items of drag end in case of multiple items selection
      if (this.selectedItems.length > 1) {
        this.selectedItems.forEach(item => {
          item.stopDrag()
        })
      }
    }
  }
}
</script>
