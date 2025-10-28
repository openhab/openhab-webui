<template>
  <div ref="ohGridLayout" class="oh-grid-layout">
    <template v-if="context.editmode">
      <!-- normal menu -->
      <f7-block v-if="!fullscreen">
        <f7-menu class="configure-layout-menu">
          <f7-menu-item @click="addItem" icon-f7="plus" text="Add Widget" />
          <f7-menu-item style="margin-left: auto" icon-f7="grid" dropdown>
            <f7-menu-dropdown right>
              <f7-menu-dropdown-item @click="context.editmode.configureWidget(context.component, context.parent, 'oh-grid-layout')" href="#" text="Configure Grid Layout" />
            </f7-menu-dropdown>
          </f7-menu-item>
        </f7-menu>
        <hr>
      </f7-block>

      <!-- fullscreen fab menu -->
      <template v-if="fullscreen">
        <f7-fab-backdrop />
        <f7-fab v-if="context.editmode" position="right-bottom" color="blue">
          <f7-icon f7="menu" />
          <f7-icon ios="f7:xmark" aurora="f7:xmark" md="material:close" />
          <f7-fab-buttons position="top">
            <f7-fab-button label="Exit Fullscreen" fab-close @click="exitFullscreen">
              <f7-icon size="20" f7="rectangle_arrow_up_right_arrow_down_left_slash" />
            </f7-fab-button>
            <f7-fab-button label="Configure Grid Layout" fab-close @click="context.editmode.configureWidget(context.component, context.parent, 'oh-grid-layout')">
              <f7-icon size="20" f7="square_pencil" />
            </f7-fab-button>
            <f7-fab-button label="Add Widget" fab-close @click="addItem">
              <f7-icon size="20" f7="plus" />
            </f7-fab-button>
          </f7-fab-buttons>
        </f7-fab>
      </template>
    </template>

    <grid-layout
      ref="vueGridLayout"
      :is-draggable="!!context.editmode"
      :is-resizable="!!context.editmode"
      v-model:layout="layout"
      :auto-size="config.layoutType !== 'fixed'"
      :col-num="colNum"
      :row-height="rowHeight"
      :max-rows="maxRows"
      :vertical-compact="config.verticalCompact || false"
      :margin="[margin, margin]"
      :responsive="config.layoutType !== 'fixed'"
      :prevent-collision="config.layoutType === 'fixed'"
      :style="{
        background: context.editmode ? 'var(--f7-page-master-border-color)' : false,
        width: style.width + 'px',
        height: style.height + 'px',
        textAlign: 'center'
      }"
      :use-css-transforms="false">
      <div v-if="context.editmode" style="opacity: 0.3; padding: 4px; user-select: none;">
        {{ getCurrentScreenResolution() }}
        <span v-if="isRetina()"><f7-icon tooltip="Screen resolution shown is the fullscreen resolution for websites. Real screen resolution is bigger." f7="info_circle" /></span>
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
</style>

<script>
import { nextTick, defineAsyncComponent } from 'vue'
import { f7 } from 'framework7-vue'

import mixin from '../widget-mixin'
import OhGridItem from './oh-grid-item.vue'
import { OhGridLayoutDefinition } from '@/assets/definitions/widgets/layout'

export default {
  mixins: [mixin],
  widget: OhGridLayoutDefinition,
  components: {
    'grid-layout': defineAsyncComponent(() => import('grid-layout-plus').then((mod) => mod.GridLayout)),
    OhGridItem
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
      fullscreen: this.$fullscreen.isFullscreen,
      navbarHidden: false,
      style: {
        width: Number,
        height: Number
      }
    }
  },
  created () {
    this.colNum = this.config.colNum || 16
    this.margin = this.config.margin >= 0 ? this.config.margin : 10

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
    nextTick(() => {
      this.setDimensions() // call at nexttick for clientWidth to be available
    })

    // Chrome reports a wrong size in fullscreen, store initial resolution and use non-dynamically.
    this.windowWidth = window.screen.width
    this.windowHeight = window.screen.height
  },
  beforeUnmount () {
    if (!this.context.editmode) {
      window.removeEventListener('resize', this.setDimensions)
    }
  },
  methods: {
    isRetina () {
      return window.devicePixelRatio > 1
    },
    getCurrentScreenResolution () {
      return 'Layout Size: ' + this.screenWidth + ' x ' + this.screenHeight + ' (Current Screen: ' + this.windowWidth + ' x ' + this.windowHeight + ')'
    },
    createItem (size) {
      // find a free spot for a new square widget of "size" on a side
      for (let y = 0; y <= this.maxRows - size; y++) {
        for (let x = 0; x <= this.colNum - size; x++) {
          if (!this.layout.some((item) => item.x + item.w > x && item.x < x + size && item.y + item.h > y && item.y < y + size)) {
            const newItem = {
              component: 'oh-grid-item',
              config: { x, y, h: size, w: size },
              slots: { default: [] }
            }
            this.context.component.slots['grid'].push(newItem)
            this.computeLayout()
            return newItem
          }
        }
      }
    },
    addItem () {
      // try adding a 2x2 widget, or a 1x1 widget if there's no room left
      if (!this.createItem(2) && !this.createItem(1)) {
        f7.dialog.alert('No more space available', 'Unable to add widget')
      }
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
      let layout = []
      if (this.context.component.slots && this.context.component.slots.grid) {
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
