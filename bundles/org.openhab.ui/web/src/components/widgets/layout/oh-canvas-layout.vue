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
          v-if="config.embedSvg"
          @click="flashEmbeddedSvgComponents()"
          icon-f7="bolt" />
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
        ...config.style
      }">
      <div
        v-if="config.imageUrl || config.imageSrcSet"
        v-show="!config.embedSvg || embeddedSvgReady"
        ref="canvasBackground"
        style="
          height: inherit;
          width: inherit;
          position: absolute;
          top: 0;
          left: 0;
          overflow: hidden;
        ">
        <img
          v-if="!config.embedSvg"
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
import { basicActionsMixin } from '@/components/widgets/widget-basic-actions'
import embeddedSvgMixin from '@/components/widgets/layout/oh-canvas-embedded-svg-mixin'
import OhCanvasLayer from './oh-canvas-layer'
import { OhCanvasLayoutDefinition } from '@/assets/definitions/widgets/layout'

export default {
  emits: ['svgOnClickConfigUpdate'],
  mixins: [mixin, basicActionsMixin, embeddedSvgMixin],
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

    if (this.config.embedSvg) {
      this.embedSvg().then(() => {
        this.subscribeEmbeddedSvgListeners()
        this.setupEmbeddedSvgStateTracking()
        this.embeddedSvgReady = true
      })
    }
  },
  mounted () {
    // Chrome reports a wrong size in fullscreen, store initial resolution and use non-dynamically.
    this.windowWidth = window.screen.width
    this.windowHeight = window.screen.height
  },
  beforeDestroy () {
    if (!this.context.editmode) {
      window.removeEventListener('resize', this.setDimensions)
    }
    if (this.config.embedSvg && this.embeddedSvgReady) {
      this.embeddedSvgReady = false
      this.unsubscribeEmbeddedSvgListeners()
      this.unsubscribeEmbeddedSvgStateTracking()
    }
  },
  methods: {
    hsbToRgb (h, s, b) {
      h = h / 360 // Convert hue to a fraction between 0 and 1
      s = s / 100 // Convert saturation to a fraction between 0 and 1
      b = b / 100 // Convert brightness to a fraction between 0 and 1

      if (s === 0) {
        // Grayscale
        return [b * 255, b * 255, b * 255]
      }

      const i = Math.floor(h * 6)
      const f = h * 6 - i
      const p = b * (1 - s)
      const q = b * (1 - s * f)
      const t = b * (1 - s * (1 - f))

      switch (i % 6) {
        case 0: return [b * 255, t * 255, p * 255]
        case 1: return [q * 255, b * 255, p * 255]
        case 2: return [p * 255, b * 255, t * 255]
        case 3: return [p * 255, q * 255, b * 255]
        case 4: return [t * 255, p * 255, b * 255]
        case 5: return [b * 255, p * 255, q * 255]
      }
    },
    toRGBStyle: function (itemConfig) {
      if (itemConfig.stateOnColor) {
        if (itemConfig.stateOnColor?.trim().startsWith('#')) {
          return itemConfig.stateOnColor
        } else {
          const rgbNumbers = itemConfig.stateOnColor.split(',')
          if (rgbNumbers.length !== 3) {
            console.log(`invalid rgb values in stateOnColor: ${itemConfig.stateOnColor}`)
            return '#ff0000' // not valid returns red
          }
          const rgb = this.hsbToRgb(rgbNumbers[0], rgbNumbers[1], rgbNumbers[2])
          return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
        }
      } else {
        return undefined
      }
    },
    /*
         * In Run mode
         * - Status should be reflected (ON/OFF, OPEN/CLOSE...) by using the below approach of highlighting the element
         *   - if not <g> then fill with color (e.g. red)
         *   - if <g> we expect an element in that group that is marked with an attribute flash, use this element by setting opacity to 1 / 0
         *
         *  To be fixed
         *   - we need to be able to choose an Item even if we don't want to have an action (e.g. only showing the state)
         *   - formulas in input fields are not evaluated but directly converted to config with the current value ... e.g. =item.mysItem.state (where item type is Color)
         *
         *  Options
         *   - Define OFF / ON colors (maybe state to color mapping?) -> stateOnColor (defaults to #00FF##) / stateOffColor (defaults to svg color)
         *   - use state value for opacity
         *   - invert opacity value
         * State Types
         *  - onOff -> Apply Color to Element. Set to original color of element on OFF. Use StateOnColor if defined for ON/OFF. Set opacity to 1 (ON) /  (0) OFF to show hide that element is active
         *  - OpenClosed ->
         *  - HSB -> Apply Color to element style >fill<
         *  - Percent -> Apply Percent to element opacity
         *  - Quantity -> Applied to element body, if element is tspan
         *
         *  Status types and how to handle them
         *  - Switch: ON = activate element (via coloring of element or opacity / color of flash element)
         *  - Contact: OPEN = activate element (via coloring of element or opacity / color of flash element)
         *  - Color: use the color to fill the element (set opacity) open = 0 / closed = 1
         *  - Rollershutter:
         *    - Use percentage to control brightness of color of that element
         *    - write State-Text to element if element has a <tspan>
         *  - Image: Expect the element to be an image element in SVG. Set the xlink:href ot the image data from the state -> data:image/png:base64,...
         *  - String -> State-Text: expects a group that has one <tspan>. Writes the information to that <tspan>
         *  - DateTime -> State-Text: expects a group that has one <tspan>. Writes the information to that <tspan>
         *  - Dimmer -> State-Text: expects a group that has one <tspan>. Writes the information to that <tspan>
         *  - Group -> State-Text: expects a group that has one <tspan>. Writes the information to that <tspan>
         *  - Location -> State-Text: expects a group that has one <tspan>. Writes the information to that <tspan>
         *  - Number -> State-Text: expects a group that has one <tspan>. Writes the information to that <tspan>
         *  - Number:<dimension> -> State-Text: expects a group that has one <tspan>. Writes the information to that <tspan>
         *  - Player -> State-Text: expects a group that has one <tspan>. Writes the information to that <tspan>
         *  - Player -> State-Text: expects a group that has one <tspan>. Writes the information to that <tspan>
         *
         * Allow NOT to send a command in run-mode when clicking on that icon (e.g. a window or door)
         */
    applyStateToSvgElement (el, item, state, stateType, itemConfig) {
      console.log(`Set ${el.id} for ${item} -> ${state} ${stateType} stateColor: ${itemConfig.stateOnColor}`)
      const tagName = el.tagName
      let stateOnColorRgbStyle = this.toRGBStyle(itemConfig)

      switch (stateType) {
        case 'Quantity':
          if (el.tagName === 'tspan') {
            el.innerHTML = state
          }
          break
        case 'OpenClosed':
        case 'Percent':
        case 'HSB':
        case 'OnOff':
          const useProxy = tagName === 'g' && itemConfig.useProxyElementForState
          const element = (useProxy) ? el.querySelector('[flash]') : el
          if (!element) {
            console.error(`Element ${el} is a group element but has no containing element marked as >flash<`)
            return
          }
          if (state === 'ON' || stateType === 'HSB') {
            if (useProxy && itemConfig.stateAsOpacity) { // we use the flash element
              let opacity = (state === 'ON') ? 1 : 0
              opacity = (itemConfig.invertStateOpacity) ? 1 - opacity : opacity
              opacity = (opacity < itemConfig.stateMinOpacity) ? itemConfig.stateMinOpacity : opacity
              // Todo: use fill-opacity if fill not available
              element.style.opacity = opacity
            } else {
              element.oldFill = element.style.fill
              element.style.fill = (itemConfig.stateOnColor) ? stateOnColorRgbStyle : 'rgb(0, 255, 0)'
            }
            if (itemConfig.stateOnAsStyleClass) {
              if (itemConfig.stateOffAsStyleClass) { // if offStates are provided add OffStates
                let offStatesArray = itemConfig.stateOffAsStyleClass.split(',')
                for (const offState of offStatesArray) {
                  const elementClassInfo = offState.split(':')
                  document.getElementById(elementClassInfo[0].trim()).classList.remove(elementClassInfo[1].trim())
                }
              }
              let onStatesArray = itemConfig.stateOnAsStyleClass.split(',')
              for (const onState of onStatesArray) {
                const elementClassInfo = onState.split(':')
                document.getElementById(elementClassInfo[0].trim()).classList.add(elementClassInfo[1].trim())
              }
            }
          } else if (state === 'OFF') {
            const updateColor = (itemConfig.stateOffColor) ? itemConfig.stateOffColor : (element?.oldFill !== 'undefined') ? element?.oldFill : 'undefined'
            if (updateColor !== 'undefined') {
              element.style.fill = updateColor
            }
            if (itemConfig.stateAsOpacity) { // we use the flash element
              let opacity = (itemConfig.invertStateOpacity) ? 1 : 0
              opacity = (opacity < itemConfig.stateMinOpacity) ? itemConfig.stateMinOpacity : opacity
              element.style.opacity = opacity
            }
            if (itemConfig.stateOnAsStyleClass) {
              // remove OnState-Styles first
              let onStatesArray = itemConfig.stateOnAsStyleClass.split(',')
              for (const onState of onStatesArray) {
                const elementClassInfo = onState.split(':')
                document.getElementById(elementClassInfo[0].trim()).classList.remove(elementClassInfo[1].trim())
              }
              if (itemConfig.stateOffAsStyleClass) { // if offStates are provided add OffStates
                let offStatesArray = itemConfig.stateOffAsStyleClass.split(',')
                for (const offState of offStatesArray) {
                  const elementClassInfo = offState.split(':')
                  document.getElementById(elementClassInfo[0].trim()).classList.add(elementClassInfo[1].trim())
                }
              }
            }
          } else { // Percent, OpenClosed
            if (itemConfig.stateAsOpacity && state) {
              // we expect that number between 0 - 100
              let opacity
              if (stateType === 'OpenClosed') {
                opacity = (state === 'OPEN') ? 1 : 0
              } else if (stateType === 'Percent' && !isNaN(state)) {
                opacity = parseFloat(state) / 100.0
              }
              opacity = (itemConfig.invertStateOpacity) ? 1 - opacity : opacity
              opacity = (opacity < itemConfig.stateMinOpacity) ? itemConfig.stateMinOpacity : opacity
              element.style.opacity = opacity
            }
          }
          break
      }
    },
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
