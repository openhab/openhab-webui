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
import embeddedSvgMixin from '@/components/widgets/layout/oh-canvas-embedded-svg-mixin'
import OhCanvasLayer from './oh-canvas-layer'
import { OhCanvasLayoutDefinition } from '@/assets/definitions/widgets/layout'

export default {
  mixins: [mixin, embeddedSvgMixin],
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
    /**
     * Converts a hsb values to rgb
     *
     * @param h hue
     * @param s saturation
     * @param b brightness
     * @returns {[number,number, number]} red, green, blue values
     */
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
    /**
     * Converts a color to an RGB-Style that is valid
     * - color definitions starting with # are treated as valid #rgb and are just returned
     * - otherwise the value is expected to be openHABs hsb which is then converted to rgb colors and returned as rgb(r,g,b)
     * - in case no valid rgb colors are returned on hsb conversion the returned oalor is red (#ff0000)
     *
     * @param color color to be converted to a valid rgb string
     * @returns {string} rgb string
     */
    toRGBStyle: function (color) {
      if (color) {
        if (color?.trim().startsWith('#')) {
          return color
        } else {
          const rgbNumbers = color.split(',')
          if (rgbNumbers.length !== 3) {
            console.log(`invalid rgb values in configured color: ${color}`)
            return '#FF0000' // not valid returns red
          }
          const rgb = this.hsbToRgb(rgbNumbers[0], rgbNumbers[1], rgbNumbers[2])
          return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
        }
      } else {
        return undefined
      }
    },
    /*
     * Applies the state the svg element based on the given configuration
     *
     * <b>State text:</b>
     * - if the element is of type <tspan> the state is automatically written to the body. This is supported for any state type.
     * - <i>useDisplayState</i> is ON, then the formatted state value is used instead
     *
     * <b>Applying state changes</b> of type OnOff, OpenClose, HSB, Percent to the svg-element
     *
     *  - A state is by default applied to the svg element
     *  - In case useProxyElementForState is switched on, the svg element has to be of type <g> (group).
     *    - Within that group the first element marked with the attribute "flash" is used as proxy.
     *  - In general, a color is meant to be applied to the svg element to reflect the state
     *    - Separate colors can be provided for the On / OFF state
     *    - The colors can also be derived by an expression, for example from the thing's color channel
     *  - In case the state item is a color item, the color is directly applied to the svg element
     *  - Alternatively, the opacity of the element can be controlled based on the state's value
     *    - The opacity value is expected to be 0-100.
     *    - The opacity can be inverted by setting <i>invertStateOpacity</i>
     *    - Instead of setting an opacity to 0, which would make the element disappear, the value can be clamped to a minimum value <i>stateMinOpacity</i> to be still visible
     *  - ON/OFF-States can set a style class on ony given element with the svg: stateOnAsStyleClass / stateOffAsStyleClass support this
     *    - A list of style-changes can be provided in the form elementId:classname.
     *    - Multiple entries can be provided in a comma-separated fashion: element1:classA,elementB:classB,....
     *    - This can be even used to start / stop animations via css-class within the svg
     *  - Percent and OpenClose can only be used together when stateAsOpacity=ON. In that case the state's value controls the opacity of the element
     *
     * <b>Configuration parameters<b/>
     *
     * stateItems: a list of items that are used reflection the state.
     *  - Usually this is only them item that reflects the state visually
     *  - Sometimes other states are used in expressions (e.g. stateOnColor). All of these items have to be included in that list.
     *
     * useProxyElementForState: Use "flash" element to highlight the active state. The element is marked with the attribute flash: true and must be part of the elements group
     * useDisplayState: Use the formatted state value to write into tspan
     * stateOnColor: Color that should to be used when State is ON
     * stateOffColor: Color that should to be used when State is OFF
     * stateAsOpacity: Use the state from 0 to 100 as element opacity
     * stateMinOpacity: This allows an opacity to be kept above this value.
     * invertStateOpacity: 1 - opacity
     * stateOnAsStyleClass: Provide element-id:classname, separate multiple entries with comma. ON sets the class, if OFF is not provided, OFF removes the class of given element
     * stateOffAsStyleClass: Provide element-id:classname, separate multiple entries with comma. OFF sets the class
     *
     * @param {string} item item name that has triggered the state change
     * @param {object} state object
     * @param {object} svgElementConfig configuration of the svg element
     * @param {string} svgElement the svg element that has been configured to represent the state
     */
    applyStateToSvgElement (item, stateObj, svgElementConfig, svgElement) {
      const state = (svgElementConfig.useDisplayState) ? stateObj.displayState : stateObj.state
      const stateType = stateObj.type
      console.log(`Update ${svgElement.id} due to ${item} changing to ${state} ${stateType}`)
      const tagName = svgElement.tagName
      const stateOnColorRgbStyle = this.toRGBStyle(svgElementConfig.stateOnColor)
      const stateOffColorRgbStyle = this.toRGBStyle(svgElementConfig.stateOffColor)

      if (svgElement.tagName === 'tspan') {
        svgElement.innerHTML = state
      }

      switch (stateType) {
        // currently no distinction is made regarding different state-types, only the following are supported (yet)
        case 'OpenClosed':
        case 'Percent':
        case 'HSB':
        case 'OnOff':
          const useProxy = tagName === 'g' && svgElementConfig.useProxyElementForState // if proxy should be used and element is of type group
          const element = (useProxy) ? svgElement.querySelector('[flash]') : svgElement
          if (!element) {
            console.error(`Element ${svgElement} is a group element but has no containing element with the attribute "flash"`)
            return
          }
          if (state === 'ON' || stateType === 'HSB') {
            if (useProxy && svgElementConfig.stateAsOpacity) { // we use the flash element
              let opacity = (state === 'ON') ? 1 : 0
              opacity = (svgElementConfig.invertStateOpacity) ? 1 - opacity : opacity
              opacity = (opacity < svgElementConfig.stateMinOpacity) ? svgElementConfig.stateMinOpacity : opacity
              // Todo: use fill-opacity if fill not available
              element.style.opacity = opacity
            } else {
              element.oldFill = element.style.fill
              element.style.fill = stateOnColorRgbStyle
            }
            if (svgElementConfig.stateOnAsStyleClass) {
              if (svgElementConfig.stateOffAsStyleClass) { // if offStates are provided add OffStates
                let offStatesArray = svgElementConfig.stateOffAsStyleClass.split(',')
                for (const offState of offStatesArray) {
                  const elementClassInfo = offState.split(':')
                  const offStateElement = document.getElementById(elementClassInfo[0].trim())
                  if (offStateElement) {
                    offStateElement.classList.remove(elementClassInfo[1].trim())
                  } else {
                    console.warn(`Target element ${elementClassInfo[0].trim()} not found. Please check style stateOffAsStyleClass expression of ${element.id}`)
                  }
                }
              }
              let onStatesArray = svgElementConfig.stateOnAsStyleClass.split(',')
              for (const onState of onStatesArray) {
                const elementClassInfo = onState.split(':')
                const onStateElement = document.getElementById(elementClassInfo[0].trim())
                if (onStateElement) {
                  onStateElement.classList.add(elementClassInfo[1].trim())
                } else {
                  console.warn(`Target element ${elementClassInfo[0].trim()} not found. Please check style stateOnAsStyleClass expression of ${element.id}`)
                }
              }
            }
          } else if (state === 'OFF') {
            const updateColor = (stateOffColorRgbStyle) || ((element?.oldFill !== 'undefined') ? element?.oldFill : 'undefined')
            if (updateColor !== 'undefined') {
              element.style.fill = updateColor
            }
            if (svgElementConfig.stateAsOpacity) { // we use the flash element
              let opacity = (svgElementConfig.invertStateOpacity) ? 1 : 0
              opacity = (opacity < svgElementConfig.stateMinOpacity) ? svgElementConfig.stateMinOpacity : opacity
              element.style.opacity = opacity
            }
            if (svgElementConfig.stateOnAsStyleClass) {
              // remove OnState-Styles first
              let onStatesArray = svgElementConfig.stateOnAsStyleClass.split(',')
              for (const onState of onStatesArray) {
                const elementClassInfo = onState.split(':')
                const onStateElement = document.getElementById(elementClassInfo[0].trim())
                if (onStateElement) {
                  onStateElement.classList.remove(elementClassInfo[1].trim())
                } else {
                  console.warn(`Target element ${elementClassInfo[0].trim()} not found. Please check style stateOnAsStyleClass expression of ${element.id}`)
                }
              }
              if (svgElementConfig.stateOffAsStyleClass) { // if offStates are provided add OffStates
                let offStatesArray = svgElementConfig.stateOffAsStyleClass.split(',')
                for (const offState of offStatesArray) {
                  const elementClassInfo = offState.split(':')
                  const offStateElement = document.getElementById(elementClassInfo[0].trim())
                  if (offStateElement) {
                    offStateElement.classList.add(elementClassInfo[1].trim())
                  } else {
                    console.warn(`Target element ${elementClassInfo[0].trim()} not found. Please check style stateOffAsStyleClass expression of ${element.id}`)
                  }
                }
              }
            }
          } else { // Percent, OpenClosed
            if (svgElementConfig.stateAsOpacity && state) {
              // we expect that number between 0 - 100
              let opacity
              if (stateType === 'OpenClosed') {
                opacity = (state === 'OPEN') ? 1 : 0
              } else if (stateType === 'Percent' && !isNaN(state)) {
                opacity = parseFloat(state) / 100.0
              }
              opacity = (svgElementConfig.invertStateOpacity) ? 1 - opacity : opacity
              opacity = (opacity < svgElementConfig.stateMinOpacity) ? svgElementConfig.stateMinOpacity : opacity
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
