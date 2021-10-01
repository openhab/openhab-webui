<template>
  <div ref="ohCanvasLayout" class="oh-canvas-layout" :class="context.editMode ? 'margin-top' : ''">
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
              context.component,
              context.component.parent,
              'canvas'
            )
          "
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
        'user-select': context.editmode ? 'none' : 'auto',
        width: style.width + 'px',
        height: style.height + 'px',
        transform: `scale(${style.scale})`,
        'text-align': 'center',
        position: 'relative',
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
        style="
          height: inherit;
          width: inherit;
          position: absolute;
          top: 0;
          left: 0;
        ">
        <img
          class="oh-canvas-background"
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
      <f7-button
        v-if="!context.editmode"
        @click="toggleFullscreen"
        class="fullscreen-icon"
        :icon-f7="
          fullscreen
            ? 'arrow_down_right_arrow_up_left'
            : 'arrow_up_left_arrow_down_right'
        " />
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
      <oh-canvas-item
        v-for="obj in layout"
        :key="obj.id"
        :id="obj.id"
        :grid-enable="grid.enable"
        :grid-pitch="grid.pitch"
        :context="childContext(obj.item)" />
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

  .fullscreen-icon
    position absolute
    top 2px
    right 2px
    z-index 1000
</style>

<script>
import mixin from '../widget-mixin'
import OhCanvasItem from './oh-canvas-item'
import { OhCanvasLayoutDefinition } from '@/assets/definitions/widgets/layout'

export default {
  mixins: [mixin],
  widget: OhCanvasLayoutDefinition,
  components: {
    OhCanvasItem: OhCanvasItem
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
      }
    }
  },
  created () {
    if (this.config.layoutType === 'fixed' && this.config.fixedType === 'canvas') {
      this.style.width = this.screenWidth = this.config.screenWidth || 1280
      this.style.height = this.screenHeight = this.config.screenHeight || 720
      this.grid.pitch = this.config.grid || 20
      this.grid.enable = this.config.gridEnable || false

      if (!this.context.editmode) {
        window.addEventListener('resize', this.setDimensions)
      }
    }

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
      this.context.component.slots['canvas'].push({
        component: 'oh-canvas-item',
        config: { x: 20, y: 20, h: 150, w: 200 },
        slots: { default: [] }
      })
      this.computeLayout()
    },
    toggleFullscreen () {
      this.$fullscreen.toggle(this.$refs.ohCanvasLayout, {
        wrap: false,
        callback: (fullscreen) => {
          this.canvasLayoutStyle()
          this.fullscreen = fullscreen
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
          layout.push({
            item: item,
            id: Math.random().toString(36).substring(2)
          })
        })
      }
      this.layout = layout
    }
  }
}
</script>
