import WidgetConfigPopup from '@/components/pagedesigner/widget-config-popup.vue'
import { pb, pg, pi, pt, WidgetDefinition } from '@/assets/definitions/widgets/helpers'
import { actionGroup, actionParams } from '@/assets/definitions/widgets/actions'

export default {
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
          widget: new WidgetDefinition('onSvgClickSettings', 'SVG onClick Action', '')
            .paramGroup(pg('state', 'State', 'Defines if and how the state is represented in the SVG'), [
              pi('stateItems', 'State Item(s)', 'Item(s) that should be used to determine the state').m().a(),
              pb('useProxyElementForState', 'Use State Proxy Element', 'Use "flash" element to highlight the active state. The element is marked with the attribute flash: true and must be part of the elements group').a(),
              pt('stateOnColor', 'State ON Color', 'Color that should to be used when State is ON').a(),
              pt('stateOffColor', 'State OFF Color', 'Color that should to be used when State is OFF').a(),
              pb('stateAsOpacity', 'Use State as Opacity', 'Use the state from 0 - 100 as element opacity').a(),
              pt('stateMinOpacity', 'Minimum Opacity applied', 'This allows an opacity to be kept above this value.').a(),
              pb('invertStateOpacity', 'Invert State opacity', '1 - opacity').a()
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
              this.applyStateToSvgElement(subElement, state.states.itemStates[item].state, state.states.itemStates[item].type, this.config.embeddedSvgActions[subElement.id])
            }
          })
          this.embeddedSvgStateTrackingUnsubscribes.push(unsubscribe)
        }
      }

      this.$store.dispatch('updateTrackingList')
      console.debug('Setup up embedded SVG state tracking.')
    },
    /**
     * Unsubscribes from the state tracking for the Items linked to embedded SVG elements.
     */
    unsubscribeEmbeddedSvgStateTracking () {
      for (const unsubscribe of this.embeddedSvgStateTrackingUnsubscribes) {
        unsubscribe()
      }
      console.debug('Unsubscribed from embedded SVG state tracking.')
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
    /**
     * Flashes all embedded SVG components with the `openhab` attribute.
     */
    flashEmbeddedSvgComponents () {
      const svg = this.$refs.canvasBackground.querySelector('svg')
      const subElements = svg.querySelectorAll('[openhab]')

      for (const subElement of subElements) {
        this.svgOnMouseOver(subElement)
      }
    }
  }
}
