<template>
  <div ref="ohGridLayout" class="oh-grid-layout">
    <template v-if="context.editmode">
      <!-- normal menu -->
      <f7-block v-if="!fullscreen">
        <f7-menu class="configure-layout-menu">
          <f7-menu-item @click="addItem" icon-f7="plus" text="Add Widget" />
          <f7-menu-item @click="context.editmode.configureWidget(context.component, context.parent, 'oh-grid-layout')" text="Configure Layout" icon-f7="square_pencil" />
        </f7-menu>
        <hr />
      </f7-block>

      <!-- fullscreen fab menu -->
      <template v-if="fullscreen">
        <f7-fab-backdrop></f7-fab-backdrop>
        <f7-fab v-if="context.editmode" position="right-bottom" color="blue">
          <f7-icon f7="menu" />
          <f7-icon ios="f7:xmark" aurora="f7:xmark" md="material:close" />
          <f7-fab-buttons position="top">
            <f7-fab-button label="Exit Fullscreen" fab-close @click="exitFullscreen"><f7-icon size="20" f7="rectangle_arrow_up_right_arrow_down_left_slash" /></f7-fab-button>
            <f7-fab-button label="Configure Layout" fab-close @click="context.editmode.configureWidget(context.component, context.parent, 'oh-grid-layout')"><f7-icon size="20" f7="square_pencil" /></f7-fab-button>
            <f7-fab-button label="Add Widget" fab-close @click="addItem"><f7-icon size="20" f7="plus" /></f7-fab-button>
          </f7-fab-buttons>
        </f7-fab>
      </template>
    </template>

    <grid-layout
      ref="vueGridLayout"
      :is-draggable="!!context.editmode"
      :is-resizable="!!context.editmode"
      :layout.sync="layout"
      :auto-size="config.layoutType !== 'fixed'"
      :col-num="colNum"
      :row-height="rowHeight"
      :max-rows="maxRows"
      :vertical-compact="typeof config.verticalCompact !== 'undefined' ? config.verticalCompact : false"
      :margin="[margin, margin]"
      :responsive="config.layoutType !== 'fixed'"
      :prevent-collision="config.layoutType === 'fixed'"
      :style="{
        background: context.editmode ? 'var(--f7-page-master-border-color)' : false,
        width: style.width + 'px',
        height: style.height + 'px',
        textAlign: 'center'
      }"
      :use-css-transforms="false"
    >
      <div v-if="context.editmode" style="opacity: 0.3; padding: 4px">{{ getCurrentScreenResolution() }}<!--
        --><template v-if="isRetina()"> (Retina <f7-icon tooltip="Screen resolution shown is the fullscreen resolution for websites. Real screen resolution is bigger." f7="info_circle" />)</template><!--
        -->)
      </div>
      <oh-grid-item
        v-for="item in layout"
        :x="item.x"
        :y="item.y"
        :w="item.w"
        :h="item.h"
        :i="item.i"
        :key="item.i"
        :context="childContext(context.component.slots.grid[item.i])" />
    </grid-layout>
  </div>
</template>

<style lang="stylus">
.oh-grid-layout
  overflow-x auto                                           // enable horizontal scroll when screenWidth is larger than current page
  .vue-grid-layout
    margin auto                                             // center grid layout when smaller than current screen
    background-color var(--f7-page-bg-color)                // theme bg (for fullscreen)
  .fab.fab-right-bottom                                     // make smaller fabs to not interfere with layouting
    margin 0 !important
    --f7-fab-margin 8px
    --f7-fab-size 32px
    --f7-fab-button-size 32px
    position: fixed
.configure-layout-menu                                      // nicer menu icons
  .menu-item .menu-item-content .icon
    font-size calc(var(--f7-menu-font-size) + 2px)
    margin-left 4px
  .menu-inner .menu-item:first-child
    margin-right var(--f7-menu-item-spacing)
</style>

<script>
import mixin from '../widget-mixin'
import VueGridLayout from 'vue-grid-layout'
import OhGridItem from './oh-grid-item'
import { OhGridLayoutDefinition } from '@/assets/definitions/widgets/layout'

export default {
  mixins: [mixin],
  widget: OhGridLayoutDefinition,
  components: {
    GridLayout: VueGridLayout.GridLayout,
    OhGridItem: OhGridItem
  },
  data () {
    return {
      layout: [],
      rowHeight: 64,
      maxRows: Infinity,
      margin: Number,
      colNum: Number,
      screenWidth: Number,
      screenHeight: Number,
      fullscreen: this.$fullscreen.getState(),
      navbarHidden: false,
      style: {
        width: Number,
        height: Number
      }
    }
  },
  created () {
    this.colNum = this.config.colNum || 16
    this.margin = this.config.margin || 10

    if (this.config.layoutType === 'fixed') {
      this.style.width = this.screenWidth = this.config.screenWidth || 1280
      this.style.height = this.screenHeight = this.config.screenHeight || 720

      // limit column width to a minimum of 50px
      const maxCols = Math.floor((this.screenWidth - this.margin) / (this.margin + 50))
      if (this.colNum > maxCols) this.colNum = this.context.component.config.colNum = maxCols

      this.maxRows = Math.round(this.colNum * ((this.screenHeight - this.margin) / (this.screenWidth - this.margin)))
      if (!this.context.editmode) {
        window.addEventListener('resize', this.setDimensions)
      }
    }

    this.computeLayout()
  },
  mounted () {
    this.$nextTick(() => {
      this.setDimensions() // call at nexttick for clientWidth to be available
    })

    // Chrome reports a wrong size in fullscreen, store initial resolution and use non-dynamically.
    this.windowWidth = window.screen.width
    this.windowHeight = window.screen.height
  },
  beforeDestroy () {
    if (!this.context.editmode) {
      window.removeEventListener('resize', this.setDimensions)
    }
  },
  methods: {
    isRetina () {
      return window.devicePixelRatio > 1
    },
    getCurrentScreenResolution () {
      return 'Layout Size: ' + this.screenWidth + ' x ' + this.screenHeight + ' (Current Screen: ' + this.windowWidth + ' x ' + this.windowHeight
    },
    addItem () {
      // find free spot for new widget
      var free = true
      var x = 0; var y = 0
      if (this.layout.length !== 0) {
        for (y = 0; y < this.maxRows; y++) {
          for (x = 0; x < this.colNum; x++) {
            free = true
            for (let i = 0; i < this.layout.length; i++) {
              if (!((this.layout[i].x + this.layout[i].w <= x) || (this.layout[i].x >= x + 1) ||
                    (this.layout[i].y + this.layout[i].h <= y) || (this.layout[i].y >= y + 1))) {
                free = false
                break
              }
            }
            if (free) break
          }
          if (free) break
        }
      }
      if (free) {
        this.context.component.slots['grid'].push({
          component: 'oh-grid-item',
          config: { x: x, y: y, h: 1, w: 1 },
          slots: { default: [] }
        })
      } else this.$f7.dialog.alert('No more space available', 'Unable to add widget')

      this.computeLayout()
    },
    setDimensions () {
      if (this.config.layoutType === 'fixed') {
        if (this.config.scale && !this.context.editmode) {
          this.style.width = this.$el.clientWidth
          this.style.height = (this.$el.clientWidth * this.screenHeight) / this.screenWidth
        }
        this.rowHeight = (this.style.height - this.margin) / this.maxRows - this.margin
      } else {
        this.rowHeight = (this.$refs.vueGridLayout.$el.clientWidth - this.margin * this.colNum + 1) / this.colNum
      }
    },
    computeLayout () {
      var layout = []
      if (this.context.component.slots?.grid) {
        this.context.component.slots.grid.forEach((item, index) => {
          layout.push({
            x: item.config.x,
            y: item.config.y,
            w: item.config.w,
            h: item.config.h,
            i: index
          })
        })
      }
      this.layout = layout
    },
    exitFullscreen () {
      this.$fullscreen.exit()
    }
  }
}
</script>
