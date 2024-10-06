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
import OhCanvasLayer from './oh-canvas-layer'
import { OhCanvasLayoutDefinition } from '@/assets/definitions/widgets/layout'
import WidgetConfigPopup from '@/components/pagedesigner/widget-config-popup.vue'
import { pb, pg, pi, pt, WidgetDefinition } from '@/assets/definitions/widgets/helpers'
import { actionGroup, actionParams } from '@/assets/definitions/widgets/actions'
import { basicActionsMixin } from '@/components/widgets/widget-basic-actions'

export default {
  emits: ['svgOnClickConfigUpdate'],
  mixins: [mixin, basicActionsMixin],
  widget: OhCanvasLayoutDefinition,
  components: {
    OhCanvasLayer
  },
  data () {
    return {
      embeddedSvgReady: false,
      embeddedSvgStateTrackingUnsubscribes: [],

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

    if (this.config.embedSvg) {
      if (!this.embeddedSvgReady) {
        this.embedSvg().then(() => {
          this.subscribeEmbeddedSvgListeners()
          this.setupEmbeddedSvgStateTracking()
          this.embeddedSvgReady = true
        })
      } else {
        this.subscribeEmbeddedSvgListeners()
        this.setupEmbeddedSvgStateTracking()
      }
    }
  },
  beforeDestroy () {
    if (this.config.embedSvg && this.embeddedSvgReady) {
      this.unsubscribeEmbeddedSvgListeners()
      this.unsubscribeEmbeddedSvgStateTracking()
    }
  },
  methods: {
    /**
     * Embeds the SVG content into the canvas.
     *
     * @returns {Promise<void>}
     */
    embedSvg () {
      // Load the real SVG content
      return fetch(this.config.imageUrl)
        .then(response => response.text())
        .then(svgCode => {
          this.$refs.canvasBackground.innerHTML = svgCode
          const svgEl = this.$refs.canvasBackground.querySelector('svg')
          svgEl.classList.add('oh-canvas-background', 'disable-user-drag')
          return Promise.resolve()
        })
        .catch(error => {
          console.error('Error embedding SVG:', error)
          return Promise.reject(error)
        })
    },
    /**
     * Setups the state tracking for the Items linked to embedded SVG elements.
     *
     * This method adds the stateItem or actionItem to the tracking list and subscribes to the Item state mutations.
     * Remember to unsubscribe from the mutations using {@link unsubscribeEmbeddedSvgStateTracking} when the component is destroyed.
     */
    setupEmbeddedSvgStateTracking () {
      const svg = this.$refs.canvasBackground.querySelector('svg')
      const subElements = svg.querySelectorAll('[openhab]')

      for (const subElement of subElements) {
        const item = this.config.embeddedSvgActions[subElement.id]?.stateItem || this.config.embeddedSvgActions[subElement.id]?.actionItem
        if (!item) continue
        if (!this.$store.getters.isItemTracked(item)) this.$store.commit('addToTrackingList', item)
        const unsubscribe = this.$store.subscribe((mutation, state) => {
          if (mutation.type === 'setItemState' && mutation.payload.itemName === item) {
            this.applyStateToSvgElement(subElement, state.states.itemStates[item].state, state.states.itemStates[item].type, this.config.embeddedSvgActions[subElement.id])
          }
        })
        this.embeddedSvgStateTrackingUnsubscribes.push(unsubscribe)
      }

      this.$store.dispatch('updateTrackingList')
    },
    /**
     * Unsubscribes from the state tracking for the Items linked to embedded SVG elements.
     */
    unsubscribeEmbeddedSvgStateTracking () {
      for (const unsubscribe of this.embeddedSvgStateTrackingUnsubscribes) {
        unsubscribe()
      }
    },
    /**
     * Subscribes to the mouseover and click events for the embedded SVG elements with the `openhab` attribute.
     */
    subscribeEmbeddedSvgListeners () {
      const svg = this.$refs.canvasBackground.querySelector('svg')
      const subElements = svg.querySelectorAll('[openhab]')

      for (const subElement of subElements) {
        subElement.setAttribute('cursor', 'pointer')
        subElement.addEventListener('mouseover', () => { this.svgOnMouseOver(subElement) })

        subElement.addEventListener('click', () => { return this.svgOnClick(subElement) })
      }
    },
    /**
     * Unsubscribes from the mouseover and click events for the embedded SVG elements with the `openhab` attribute.
     */
    unsubscribeEmbeddedSvgListeners () {
      const svg = this.$refs.canvasBackground.querySelector('svg')
      const subElements = svg.querySelectorAll('[openhab]')

      for (const subElement of subElements) {
        subElement.removeEventListener('mouseover', () => { this.svgOnMouseOver(subElement) })

        subElement.removeEventListener('click', () => { return this.svgOnClick(subElement) })
      }
    },
    /**
     * Flashes all embedded SVG components with the `openhab` attribute.
     */
    flashEmbeddedSvgComponents () {
      const svg = this.$refs.canvasBackground.querySelector('svg')
      const subElements = svg.querySelectorAll('[openhab]')

      for (const subElement of subElements) {
        this.svgOnMouseOver(subElement)
      }
    },
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
        if (itemConfig.stateOnColor.trim().startsWith('#')) {
          return itemConfig.stateOnColor
        } else {
          const rgbNumbers = itemConfig.stateOnColor.split(',')
          const rgb = this.hsbToRgb(rgbNumbers[0], rgbNumbers[1], rgbNumbers[2])
          return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
        }
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
         *  Status types and how to handle them
         *  - Switch: ON = activate element (via coloring of element or opacity / color of flash element)
         *  - Contact: OPEN = activate element (via coloring of element or opacity / color of flash element)
         *  - Color: use the color to fill the element
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
    applyStateToSvgElement (el, state, stateType, itemConfig) {
      console.log(`Set ${el.id} -> ${state} ${stateType} stateColor: ${itemConfig.stateOnColor}`)
      const tagName = el.tagName
      let stateOnColorRgbStyle = this.toRGBStyle(itemConfig)

      switch (stateType) {
        case 'HSB':
          break
        case 'Percent':
          break
        case 'OnOff':
          const element = (tagName !== 'g') ? el : el.querySelector('[flash]')
          if (state === 'ON' || state === 'OPEN') {
            element.oldFill = element.style.fill
            element.style.fill = (itemConfig.stateOnColor) ? stateOnColorRgbStyle : 'rgb(0, 255, 0)'
            if (tagName === 'g') {
              element.oldOpacity = element.style.opacity
              element.style.opacity = 1
            }
          } else if (state === 'OFF' || state === 'CLOSED') {
            const updateColor = (itemConfig.stateOffColor) ? itemConfig.stateOffColor : (element.oldFill !== 'undefined') ? element.oldFill : 'undefined'
            if (updateColor !== 'undefined') { element.style.fill = updateColor }
          } else { // state opacity -> needs to be checked against state type?
            if (itemConfig.stateAsOpacity && state) {
              // we expect that number between 0 - 100
              if (!isNaN(state)) {
                let opacity = parseFloat(state) / 100.0
                element.style.opacity = (itemConfig.invertStateOpacity) ? 1 - opacity : opacity
              }
            }
          }
          break
      }
    },
    /**
     * Handles the mouse over event on an element of the embedded SVG.
     *
     * In edit mode, the element flashes when hovered over.
     * In run mode, nothing happens
     *
     * @param {HTMLElement} el
     */
    svgOnMouseOver (el) {
      if (this.context.editmode || (!this.context.editmode && this.config.embedSvgFlashing)) {
        const tagName = el.tagName
        // fill green if item config is available, red if config is still missing
        const fillColor = (this.config.embeddedSvgActions[el.id]) ? 'rgb(0, 255, 0)' : 'rgb(255, 0, 0)'
        if (tagName !== 'g' && !el.flashing) {
          // sometimes instead of fill, stroke colors are used, so if fill = none, then we use stroke instead
          const attributeName = (el.style.fill !== 'none') ? 'fill' : 'stroke'
          const oldFill = el.style.getPropertyValue(attributeName)
          el.style.setProperty(attributeName, fillColor)
          el.flashing = true
          setTimeout(() => {
            el.flashing = false
            el.style.setProperty(attributeName, oldFill)
          }, 200)
        } else { // groups cannot be filled, so we need to fill special element marked as "flash"
          const flashElement = el.querySelector('[flash]')
          if (flashElement && !flashElement.flashing) {
            const attributeName = (flashElement.style.fill !== 'none') ? 'fill' : 'stroke'
            const oldFill = flashElement.style.getPropertyValue(attributeName)
            const oldOpacity = flashElement.style.opacity
            flashElement.style.setProperty(attributeName, fillColor)
            flashElement.style.opacity = 1
            flashElement.flashing = true
            setTimeout(() => {
              flashElement.style.setProperty(attributeName, oldFill)
              flashElement.style.opacity = oldOpacity
              flashElement.flashing = false
            }, 200)
          }
        }
      }
    },
    /**
     * Handles the click event on an element of the embedded SVG.
     *
     * In edit mode, the element's configuration popup is opened.
     * In run mode, the element's action is executed.
     *
     * @param {HTMLElement} el
     */
    svgOnClick (el) {
      // if state = ON, use fill or flash file to highlight element (see mouseover)
      console.log(`Element ${el.id} with openhab attribute clicked!`)

      if (this.context.editmode) {
        this.openSvgSettingsPopup(el.id)
      } else {
        this.performBasicAction(event, '', this.config.embeddedSvgActions[el.id], this.context)
      }
    },
    openSvgSettingsPopup (id) {
      const defaultActionConfig = {
        action: 'toggle',
        actionCommand: 'ON',
        actionCommandAlt: 'OFF'
      }
      const popup = { component: WidgetConfigPopup }
      const that = this
      this.$f7router.navigate({ url: 'on-svg-click-settings', route: { path: 'on-svg-click-settings', popup } }, {
        props: {
          component: {
            config: (this.config.embeddedSvgActions ? this.context.component.config.embeddedSvgActions[id] || defaultActionConfig : defaultActionConfig)
          },
          widget: new WidgetDefinition('onSvgClickSettings', 'SVG onClick Action', '')
            .paramGroup(pg('state', 'State', 'Defines if and how the state is represented in the SVG'), [
              pi('stateItem', 'State Item', 'Item that should be used to determine the state').a(),
              pt('stateOnColor', 'State ON Color', 'Color that should to be used when State is ON').a(),
              pt('stateOffColor', 'State OFF Color', 'Color that should to be used when State is OFF').a(),
              pb('stateAsOpacity', 'Use State as Opacity', 'Use the state from 0 - 100 as element opacity').a(),
              pb('invertStateOpacity', 'Invert state opacity', '1 - opacity').a()
            ])
            .paramGroup(actionGroup(), actionParams())
        }
      })
      this.$f7.once('widgetConfigUpdate', (config) => {
        this.$f7.emit('svgOnClickConfigUpdate', { id, config })
      })
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
