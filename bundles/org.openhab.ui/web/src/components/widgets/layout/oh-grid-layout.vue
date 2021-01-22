<template>
  <div ref="ohGridLayout" class="oh-grid-layout" style="{ 'overflow-x': config.layoutType === 'fixed' ? 'auto' : 'visible' }">
    <template v-if="!context.editmode">
      <!-- show sidebar menu icon if navbar is hidden -->
      <f7-fab v-if="navbarHidden && !config.hideSidebarButton" position="left-top">
        <f7-link icon-ios="f7:menu" icon-aurora="f7:menu" icon-md="material:menu" panel-open="left" />
      </f7-fab>
      <!-- fullscreen icon -->
      <f7-fab v-if="!context.editmode && $fullscreen.support && config.showFullscreenButton" position="right-top">
        <f7-link :icon-f7="fullscreen ? 'arrow_down_right_arrow_up_left' : 'arrow_up_left_arrow_down_right'" @click="toggleFullscreen" />
      </f7-fab>
    </template>

    <template v-if="context.editmode">
      <!-- normal menu -->
      <f7-block v-if="!fullscreen">
        <f7-menu class="configure-layout-menu">
          <f7-menu-item @click="addItem" icon-f7="plus" text="Add Widget" />
          <f7-menu-item @click="toggleFullscreen" text="Fullscreen" icon-f7="arrow_up_left_arrow_down_right" style="margin-left: auto" />
          <f7-menu-item @click="context.editmode.configureWidget(context.component, context.parent, 'oh-grid-layout')" text="Configure Layout" icon-f7="gear_alt" />
        </f7-menu>
        <hr />
      </f7-block>

      <!-- fullscreen fab menu -->
      <template v-if="fullscreen">
        <f7-fab-backdrop></f7-fab-backdrop>
        <f7-fab v-if="context.editmode" position="right-bottom">
          <f7-icon ios="f7:plus" aurora="f7:plus" md="material:add" />
          <f7-icon ios="f7:xmark" aurora="f7:xmark" md="material:close" />
          <f7-fab-buttons position="top">
            <f7-fab-button fab-close @click="toggleFullscreen" label="Exit Fullscreen"><f7-icon size="20" f7="arrow_down_right_arrow_up_left" /></f7-fab-button>
            <f7-fab-button fab-close @click="context.editmode.configureWidget(context.component, context.parent, 'oh-grid-layout')" label="Configure Layout"><f7-icon size="20" f7="gear_alt" /></f7-fab-button>
            <f7-fab-button fab-close @click="addItem" label="Add Widget"><f7-icon size="20" f7="plus" /></f7-fab-button>
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
        background: context.editmode ? 'rgba(var(--f7-theme-color-rgb), 0.1)' : false,
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
  .fab                                                      // make smaller fabs to not interfere with layouting
    margin 0 !important
    --f7-fab-margin 8px
    --f7-fab-size 32px
    --f7-fab-button-size 32px
    &.fab-left-top a, &.fab-right-top a                     // transparent fabs for sidebar and fullscreen icon
      background-color transparent
      color var(--f7-theme-color)
      box-shadow none
    &.fab-right-bottom
      position: fixed
.configure-layout-menu
  .menu-item .menu-item-content .icon                       // nicer menu icons
    font-size calc(var(--f7-menu-font-size) + 2px)
    margin-left: 4px
  .menu-inner .menu-item:first-child
    margin-right var(--f7-menu-item-spacing)
.fixed-layout-fullscreen.page-current .page-content
  padding-top var(--f7-safe-area-top) !important            // remove bars padding from page when bars invisible
  padding-bottom var(--f7-safe-area-bottom) !important
  #page-settings
    display none                                            // hide page settings
  .layout-page
    margin 0 !important                                     // remove extra margin (for firefox bug 748518?)
  .oh-grid-layout
    min-height 100vh
    overflow-x: visible
.page-current .fixed-layout-navbar-hidden
  display: none
.panel-left.panel-in-breakpoint ~ .view                     // hide sidebar icon when sidebar is visible
  .fab-left-top .panel-open[data-panel="left"]
    display none
</style>

<script>
import mixin from '../widget-mixin'
import VueGridLayout from 'vue-grid-layout'
import OhGridItem from './oh-grid-item'
import { OhGridLayoutDefinition } from '@/assets/definitions/widgets/layout'

import fullscreen from 'vue-fullscreen'
import Vue from 'vue'
Vue.use(fullscreen)

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
      fullscreen: false,
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
    this.computeLayout();

    // register to fullscreen events. vue-fullscreen only supports setting a callback function when entering fullscreen
    // and rerendering during fullscreen causes that callback to point to a deprecated oh-grid-layout instance
    ['', 'webkit'].forEach(pre => document.addEventListener(pre + 'fullscreenchange', this.onFullscreenChange))
  },
  beforeDestroy () {
    // unregister fullscreen events
    ['', 'webkit'].forEach(pre => document.removeEventListener(pre + 'fullscreenchange', this.onFullscreenChange))

    // undo fullscreen changes (show panels and bars)
    console.log("beforeDestroy", this._uid)
    if (this.navbarHidden || this.fullscreen) this.changePanelsVisibility(false)
  },
  mounted () {
    // for rerender detect current display mode
    // this.navbarHidden = !!document.querySelector('.page-current .fixed-layout-navbar-hidden')
    this.fullscreen = this.$fullscreen.getState() || document.body.classList.contains('fixed-layout-fullscreen')
    console.log("uid:", this._uid, "fullscreen:", this.fullscreen, "navbarHidden would be:", !!document.querySelector('.page-current .fixed-layout-navbar-hidden'), "fixed class:", document.body.classList.contains('fixed-layout-fullscreen'))

    this.$nextTick(() => {
      if (!this.context.editmode && this.config.hideNavbar) {
        this.$nextTick(() => { this.changePanelsVisibility(true) }) // page-current is still the previous page on single nextTick :(
      }

      if (this.context.editmode && this.fullscreen) {
        // layout-page gets rerendered when widgets are added and then looses the fullscreen modifications.
        // only re-adjusting the layout-page would be required, but this is better readable
        this.changePanelsVisibility(true)
      }

      this.setDimensions() // call at nexttick for clientWidth to be available
    })

    // Chrome reports a wrong size in fullscreen, store initial resolution and use non-dynamically.
    this.windowWidth = window.screen.width
    this.windowHeight = window.screen.height
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
      var free = true;
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
      // TODO:
      // handler also gets called for each griditem, with refs undefined (???)
      // and gets called multiple times on changes, possibly on rendering, fix later
      if (this.$refs.vueGridLayout && this.$refs.vueGridLayout.$el.clientWidth !== 0) {
        if (this.config.layoutType === 'fixed') {
          if (this.config.scale && !this.context.editmode) {
            this.style.width = this.$el.clientWidth
            this.style.height = (this.$el.clientWidth * this.screenHeight) / this.screenWidth
          }
          this.rowHeight = (this.style.height - this.margin) / this.maxRows - this.margin
        } else {
          this.rowHeight = (this.$refs.vueGridLayout.$el.clientWidth - this.margin * this.colNum + 1) / this.colNum
        }
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
    toggleFullscreen () {
      if (this.$fullscreen.support) {
        this.$fullscreen.toggle(document.body, { wrap: false })
      } else if (this.context.editmode) {
        this.togglePanelsVisibility()
      }
    },
    onFullscreenChange () {
      this.fullscreen = this.$fullscreen.getState()
      if (this.context.editmode) {
        this.changePanelsVisibility(this.fullscreen)
      }
    },
    togglePanelsVisibility () {
      this.fullscreen = !this.fullscreen
      this.changePanelsVisibility(this.fullscreen)
    },
    changePanelsVisibility (hide) {
      console.log("change panels:", hide, this._uid)
      if (hide) {
        // document.body.classList.add('fixed-layout-fullscreen')
        document.querySelector('.page-current').classList.add('fixed-layout-fullscreen')
        this.$f7.toolbar.hide('.toolbar-top', false)
        this.$f7.navbar.hide('.navbar', false) // still required for iphone, where navbar is different
        const navbar = document.querySelector('.page-current .navbar')
        if (navbar) {
          // hidden navbar gets re-shown on scroll. additionally, paddings/margins are still present when hidden.
          // simply renaming the navbar class to a custom hidden class fixes all of this ;-)
          navbar.classList.add('fixed-layout-navbar-hidden')
          navbar.classList.remove('navbar')
        }
        if (this.context.editmode) {
          this.$f7.panel.get('left').disableVisibleBreakpoint()
          if (this.fullscreen) this.$f7.toolbar.hide('.toolbar-bottom', false)
        }
      } else {
        const navbar = document.querySelector('.page-current .fixed-layout-navbar-hidden')
        if (navbar) {
          navbar.classList.add('navbar')
          navbar.classList.remove('fixed-layout-navbar-hidden')
        }
        if (this.context.editmode) {
          if (localStorage.getItem('openhab.ui:panel.visibleBreakpointDisabled') !== 'true') {
            this.$f7.panel.get('left').enableVisibleBreakpoint()
          }
          if (!this.fullscreen) this.$f7.toolbar.show('.toolbar-bottom', false)
        }
        this.$f7.navbar.show('.navbar', false)
        this.$f7.toolbar.show('.toolbar-top', false)
        document.querySelector('.page-current').classList.remove('fixed-layout-fullscreen')
        // document.body.classList.remove('fixed-layout-fullscreen')
      }
      this.navbarHidden = hide
    }
  }
}
</script>
