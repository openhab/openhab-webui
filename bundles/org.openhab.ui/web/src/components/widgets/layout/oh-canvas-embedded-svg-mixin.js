import WidgetConfigPopup from '@/components/pagedesigner/widget-config-popup.vue'
import { pb, pg, pi, pt, WidgetDefinition } from '@/assets/definitions/widgets/helpers'
import { actionGroup, actionParams } from '@/assets/definitions/widgets/actions'

export default {
  emits: ['svgOnClickConfigUpdate', 'action'],
  data () {
    return {
      embeddedSvgReady: false,
      embeddedSvgStateTrackingUnsubscribes: []
    }
  },
  methods: {
    /**
     * Embeds the SVG content into the canvas.
     *
     * @returns {Promise<void>}
     */
    embedSvg () {
      // Load the real SVG content, in editmode we add a random number to the URL to prevent caching
      const svgUrl = (this.context.editmode) ? this.config.imageUrl + `?rnd=${Math.random()}` : this.config.imageUrl
      return fetch(svgUrl)
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
     * Opens the config popup for an embedded SVG element.
     *
     * @param id the id of the embedded SVG element
     */
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
          widget: new WidgetDefinition('onSvgClickSettings', `SVG onClick Action for ${id}`, '')
            .paramGroup(pg('state', 'State', 'Defines if and how the state is represented in the SVG'), [
              pi('stateItems', 'State Item(s)', 'Item(s) that should be used to determine the state').m().a(),
              pb('useProxyElementForState', 'Use State Proxy Element', 'Use "flash" element to highlight the active state. The element is marked with the attribute flash: true and must be part of the elements group').a(),
              pt('stateOnColor', 'State ON Color', 'Color that should to be used when State is ON. #rgb and rgb(r,g,b) expressions are supported.').a(),
              pt('stateOffColor', 'State OFF Color', 'Color that should to be used when State is OFF. #rgb and rgb(r,g,b) expressions are supported.').a(),
              pt('stateOnSubstitute', 'State ON Substitute', 'If Item Type is String and State equals to the given value, this is interpreted as "ON"').a(),
              pb('stateAsOpacity', 'Use State as Opacity', 'Use the state from 0 - 100 as element opacity').a(),
              pt('stateMinOpacity', 'Minimum Opacity applied', 'This allows an opacity to be kept above this value.').a(),
              pb('invertStateOpacity', 'Invert State opacity', '1 - opacity').a(),
              pt('stateOnAsStyleClass', 'Set Style Class based on On State ', 'Provide element-id:classname, separate multiple entries with comma. ON sets the class, if OFF is not provided, OFF removes the class of given element').a(),
              pt('stateOffAsStyleClass', 'Set Style Class based on Off State ', 'Provide element-id:classname, separate multiple entries with comma. OFF sets the class').a(),
              pb('useDisplayState', 'Use displayState as Text', 'Use the formatted state value to write into tspan').a()
            ])
            .paramGroup(actionGroup(), actionParams()),
          component: {
            config: (this.config.embeddedSvgActions ? this.context.component.config.embeddedSvgActions[id] || defaultActionConfig : defaultActionConfig)
          }
        }
      })
      this.$f7.once('widgetConfigUpdate', (config) => {
        this.$f7.emit('svgOnClickConfigUpdate', { id, config })
      })
    },
    /**
     * Setups the state tracking for the Items linked to embedded SVG elements.
     *
     * This method adds the stateItem or actionItem to the tracking list and subscribes to the Item state mutations.
     * Remember to unsubscribe from the mutations using {@link unsubscribeEmbeddedSvgStateTracking} when the component is destroyed.
     */
    setupEmbeddedSvgStateTracking () {
      if (!this.config.embeddedSvgActions) return

      const svg = this.$refs.canvasBackground.querySelector('svg')
      const subElements = svg.querySelectorAll('[openhab]')

      for (const subElement of subElements) {
        const stateItems = this.config.embeddedSvgActions[subElement.id]?.stateItems
        const actionItem = this.config.embeddedSvgActions[subElement.id]?.actionItem
        const items = stateItems || (actionItem ? [actionItem] : [])
        if (items.length === 0) continue
        for (const item of items) {
          if (!this.$store.getters.isItemTracked(item)) this.$store.commit('addToTrackingList', item)
          const unsubscribe = this.$store.subscribe((mutation, state) => {
            if (mutation.type === 'setItemState' && mutation.payload.itemName === item) {
              this.applyStateToSvgElement(item, state.states.itemStates[item], this.config.embeddedSvgActions[subElement.id], subElement)
            }
          })
          this.embeddedSvgStateTrackingUnsubscribes.push(unsubscribe)
        }
      }

      this.$store.dispatch('updateTrackingList')
      console.info('Successfully setup embedded SVG state tracking.')
    },
    /**
     * Unsubscribes from the state tracking for the Items linked to embedded SVG elements.
     */
    unsubscribeEmbeddedSvgStateTracking () {
      for (const unsubscribe of this.embeddedSvgStateTrackingUnsubscribes) {
        unsubscribe()
      }
      console.info('Unsubscribed from embedded SVG state tracking.')
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
     * Handles the mouse over event on an element of the embedded SVG.
     *
     * In edit mode, the element flashes when hovered over.
     * In run mode, nothing happens
     *
     * @param {HTMLElement} el
     */
    svgOnMouseOver (el) {
      function flashElement (el, fillColor) {
        if (el && !el.flashing) {
          const attributeName = (el.style.fill !== 'none') ? 'fill' : 'stroke'
          const oldFill = el.style.getPropertyValue(attributeName)
          const oldOpacity = el.style.opacity
          el.style.setProperty(attributeName, fillColor)
          el.style.opacity = 1
          el.flashing = true
          setTimeout(() => {
            el.style.setProperty(attributeName, oldFill)
            el.style.opacity = oldOpacity
            el.flashing = false
          }, 200)
        }
      }

      if (this.context.editmode || (!this.context.editmode && this.config.embedSvgFlashing)) {
        const tagName = el.tagName
        // fill green if item config is available, red if config is still missing
        const fillColor = (this.config.embeddedSvgActions && this.config.embeddedSvgActions[el.id]) ? 'rgb(0, 255, 0)' : 'rgb(255, 0, 0)'
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
          const elementToFlash = el.querySelector('[flash]')
          if (elementToFlash) {
            flashElement(elementToFlash, fillColor)
          } else {
            // let's try flashing all path elements in the group
            const flashElements = el.querySelectorAll('path')
            for (const path of flashElements) {
              flashElement(path, fillColor)
            }
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
        if (this.config.embeddedSvgActions && this.config.embeddedSvgActions[el.id]) {
          this.performAction(null, null, this.config.embeddedSvgActions[el.id], this.context)
        }
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
    /**
     * Converts a color to a valid RGB CSS style:
     * - color definitions starting with # are treated as valid #rgb and are just returned
     * - otherwise the value is expected to be openHABs HSB which is then converted to rgb colors and returned as rgb(r,g,b)
     * - in case no valid rgb colors are returned on hsb conversion the returned calor is red (#ff0000)
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
            console.info(`invalid rgb values in configured color: ${color}`)
            return '#FF0000' // not valid returns red
          }
          const rgb = this.$oh.utils.hsbToRgb(rgbNumbers[0], rgbNumbers[1] / 100, rgbNumbers[2] / 100)
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
     *  - In case useProxyElementForState is enabled, the svg element has to be of type <g> (group).
     *    - Within that group the first element marked with the attribute "flash" is used as proxy.
     *  - In general, a color is meant to be applied to the svg element to reflect the state
     *    - Separate colors can be provided for the ON / OFF state
     *    - The colors can also be derived by an expression, for example from the thing's color channel
     *  - In case the state item is a color item, the color is directly applied to the svg element
     *  - Alternatively, the opacity of the element can be controlled based on the state's value
     *    - The opacity value is expected to be 0-100.
     *    - The opacity can be inverted by setting <i>invertStateOpacity</i>
     *    - Instead of setting an opacity to 0, which would make the element disappear, the value can be clamped to a minimum value <i>stateMinOpacity</i> to be still visible
     *  - ON/OFF-States can set a style class on ony given element with the svg: stateOnAsStyleClass / stateOffAsStyleClass support this
     *    - A list of style-changes can be provided in the form elementId:classname.
     *    - Multiple entries can be provided in a comma-separated fashion: element1:classA,elementB:classB,...
     *    - This can be even used to start / stop animations via css-class within the svg
     *  - Percent and OpenClose can only be used together when stateAsOpacity=ON. In that case the state's value controls the opacity of the element
     *
     * <b>Configuration parameters:</b>
     *
     * - stateItems: a list of items to listen for state updates to reflect the item state in the svg.
     *   - Usually this is only them item that reflects the state visually
     *   - Sometimes other states are used in expressions (e.g. stateOnColor). All of these items have to be included in that list.
     * - useProxyElementForState: Use "flash" element to highlight the active state. The element is marked with the attribute flash: true and must be part of the elements group
     * - useDisplayState: Use the formatted state value to write into tspan
     * - stateOnColor: Color that should to be used when State is ON
     * - stateOffColor: Color that should to be used when State is OFF
     * - stateAsOpacity: Use the state from 0 to 100 as element opacity
     * - stateMinOpacity: This allows an opacity to be kept above this value.
     * - invertStateOpacity: 1 - opacity
     * - stateOnAsStyleClass: Provide element-id:classname, separate multiple entries with comma. ON sets the class, if OFF is not provided, OFF removes the class of given element
     * - stateOffAsStyleClass: Provide element-id:classname, separate multiple entries with comma. OFF sets the class
     *
     * @param {string} item item name that has triggered the state change
     * @param {object} state object
     * @param {object} svgElementConfig configuration of the svg element
     * @param {string} svgElement the svg element that has been configured to represent the state
     */
    applyStateToSvgElement (item, stateObj, svgElementConfig, svgElement) {
      let state = (svgElementConfig.useDisplayState) ? stateObj.displayState : stateObj.state
      const stateType = stateObj.type
      const stateOnSubstitute = svgElementConfig.stateOnSubstitute
      if (stateOnSubstitute && stateType === 'String') {
        state = (state === stateOnSubstitute) ? 'ON' : 'OFF'
      }

      console.info(`Update ${svgElement.id} due to ${item} changing to ${state} ${stateType}`)
      const tagName = svgElement.tagName
      const stateOnColorRgbStyle = this.toRGBStyle(svgElementConfig.stateOnColor)
      const stateOffColorRgbStyle = this.toRGBStyle(svgElementConfig.stateOffColor)

      if (tagName === 'tspan') {
        svgElement.innerHTML = state
      }

      function processState (useProxy, element) {
        if (state === 'ON' || stateType === 'HSB') {
          if (useProxy && svgElementConfig.stateAsOpacity) { // we use the flash element
            let opacity = (state === 'ON') ? 1 : 0
            opacity = (svgElementConfig.invertStateOpacity) ? 1 - opacity : opacity
            opacity = (opacity < svgElementConfig.stateMinOpacity) ? svgElementConfig.stateMinOpacity : opacity
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
          if (svgElementConfig.stateAsOpacity && state) { // meant to be used as opacity
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
          } else if (state) { // treat it as color use the colorOnState that may be computed based on that
            if (stateOnColorRgbStyle) {
              element.style.fill = stateOnColorRgbStyle
            }
          }
        }
      }

      switch (stateType) {
        // currently no distinction is made regarding different state-types, only the following are supported (yet)
        case 'OpenClosed':
        case 'Percent':
        case 'HSB':
        case 'OnOff':
        case 'String':
          const useProxy = tagName === 'g' && svgElementConfig.useProxyElementForState // if proxy should be used and element is of type group
          const element = (useProxy) ? svgElement.querySelector('[flash]') : svgElement
          if (element) {
            processState(useProxy, element)
          } else {
            // let's try processing all paths within the group instead
            const pathElements = svgElement.querySelectorAll('path')
            for (const path of pathElements) {
              processState(useProxy, path)
            }
          }
          break
      }
    },
    /**
     * Emits the action event with the given parameters.
     *
     * NOTE: We cannot perform the widget action mixin here because this would cause a circular dependency.
     * @param evt
     * @param prefix
     * @param config
     * @param context
     */
    performAction (evt, prefix, config, context) {
      this.$emit('action', { evt, prefix, config, context })
    }
  }
}
