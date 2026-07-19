import { f7 } from 'framework7-vue'
import WidgetConfigPopup from '@/components/pagedesigner/widget-config-popup.vue'
import { pb, pg, pi, po, pt, WidgetDefinition } from '@/assets/definitions/widgets/helpers'
import { actionGroup, actionParams } from '@/assets/definitions/widgets/actions'

import { useStatesStore } from '@/js/stores/useStatesStore'
import { watch } from 'vue'
import { showToast } from '@/js/dialog-promises'
import * as api from '@/api'

export default {
  props: {
    f7router: Object
  },
  emits: ['action'],
  data() {
    return {
      embeddedSvgReady: false,
      embeddedSvgStateTrackingUnsubscribes: []
    }
  },
  methods: {
    /**
     * Returns the root `<svg>` element of the embedded SVG. Override to supply a different root,
     * e.g. an element handed to a Leaflet svg overlay instead of the canvas background container.
     *
     * @returns {SVGSVGElement|null}
     */
    embeddedSvgRoot() {
      return this.$refs.canvasBackground?.querySelector('svg') || null
    },
    /**
     * Returns the URL of the SVG image to embed. Override when the hosting component configures
     * the image under a different key (e.g. `url` for oh-image).
     *
     * @returns {string|undefined}
     */
    embeddedSvgUrl() {
      return this.config.imageUrl
    },
    /**
     * Fetches and validates the SVG markup from the configured Image URL.
     *
     * @returns {Promise<string>}
     */
    async fetchEmbeddedSvgText() {
      const configuredUrl = this.embeddedSvgUrl()
      let imageUrl = configuredUrl
      // in editmode we add a random number to the URL to always load the latest SVG (avoid caching)
      if (this.context.editmode) {
        imageUrl += (imageUrl.includes('?') ? '&' : '?') + `rnd=${Math.random()}`
      }
      const svgUrl = await this.$oh.media.getImage(imageUrl)
      return fetch(svgUrl).then((response) => {
        if (!response.ok) {
          return Promise.reject(new Error(`Failed to load from ${configuredUrl}. Status: ${response.status} (${response.statusText})`))
        }
        const contentType = (response.headers.get('Content-Type') || '').toLowerCase()
        if (!contentType.includes('image/svg+xml')) {
          return Promise.reject(new Error(`${configuredUrl} is not an SVG file`))
        }
        return response.text()
      })
    },
    /**
     * Embeds the SVG content into the canvas.
     *
     * @returns {Promise<void>}
     */
    async embedSvg() {
      return this.fetchEmbeddedSvgText()
        .then((svgCode) => {
          this.$refs.canvasBackground.innerHTML = svgCode
          const svgEl = this.$refs.canvasBackground.querySelector('svg')
          svgEl.classList.add('oh-canvas-background', 'disable-user-drag')
          return Promise.resolve()
        })
        .catch((error) => {
          console.error('Error embedding SVG:', error)
          return Promise.reject(error)
        })
    },
    /**
     * Opens the config popup for an embedded SVG element.
     *
     * @param id the id of the embedded SVG element
     */
    openSvgSettingsPopup(id) {
      const defaultActionConfig = {
        action: 'toggle',
        actionCommand: 'ON',
        actionCommandAlt: 'OFF'
      }
      const popup = { component: WidgetConfigPopup }
      this.f7router.navigate(
        { url: 'on-svg-click-settings', route: { path: 'on-svg-click-settings', popup } },
        {
          props: {
            widget: new WidgetDefinition('onSvgClickSettings', `SVG onClick Action for ${id}`, '')
              .paramGroup(pg('state', 'State', 'Defines if and how the state is represented in the SVG'), [
                pi('stateItems', 'State Item(s)', 'Item(s) that should be used to determine the state').m().a(),
                pb(
                  'useProxyElementForState',
                  'Use State Proxy Element',
                  'Use "flash" element to highlight the active state. The element is marked with the attribute flash: true and must be part of the elements group'
                ).a(),
                pt(
                  'stateOnColor',
                  'State ON Color',
                  'Color to use when the State is "on". Any CSS color (#rgb, rgb(), named, …) or openHAB HSB (h,s,b) is supported. Applied to the fill, or the stroke for fill:none outline shapes.'
                ).a(),
                pt(
                  'stateOffColor',
                  'State OFF Color',
                  'Color to use when the State is "off". Any CSS color (#rgb, rgb(), named, …) or openHAB HSB (h,s,b) is supported. If omitted, the original color is restored.'
                ).a(),
                po(
                  'colorProperty',
                  'Apply Color To',
                  'Which property the State ON/OFF colors are applied to. "Auto" uses the stroke for outline shapes (fill:none) and the fill otherwise.',
                  [
                    { value: '', label: 'Auto' },
                    { value: 'fill', label: 'Fill' },
                    { value: 'stroke', label: 'Stroke' }
                  ]
                ).a(),
                pt(
                  'stateOnSubstitute',
                  'State ON Substitute',
                  'If Item Type is String and State equals to the given value, this is interpreted as "ON"'
                ).a(),
                pb('stateAsOpacity', 'Use State as Opacity', 'Use the state from 0 - 100 as element opacity').a(),
                pt('stateMinOpacity', 'Minimum Opacity applied', 'This allows an opacity to be kept above this value.').a(),
                pb('invertStateOpacity', 'Invert State opacity', '1 - opacity').a(),
                pt(
                  'stateOnAsStyleClass',
                  'Set Style Class based on On State ',
                  'Provide element-id:classname, separate multiple entries with comma. ON sets the class, if OFF is not provided, OFF removes the class of given element'
                ).a(),
                pt(
                  'stateOffAsStyleClass',
                  'Set Style Class based on Off State ',
                  'Provide element-id:classname, separate multiple entries with comma. OFF sets the class'
                ).a(),
                pb('useDisplayState', 'Use displayState as Text', 'Use the formatted state value to write into tspan').a()
              ])
              .paramGroup(actionGroup(), actionParams()),
            component: {
              config: this.context.component.config?.embeddedSvgActions?.[id] || defaultActionConfig
            }
          }
        }
      )
      const updateWidgetConfig = (config) => {
        f7.emit('svgOnclickConfigUpdate', { id, config })
      }
      f7.on('widgetConfigUpdate', updateWidgetConfig)
      f7.once('widgetConfigClosed', () => {
        f7.off('widgetConfigUpdate', updateWidgetConfig)
      })
    },
    /**
     * Setups the state tracking for the Items linked to embedded SVG elements.
     *
     * This method adds the stateItem or actionItem to the tracking list and subscribes to the Item state mutations.
     * Remember to unsubscribe from the mutations using {@link unsubscribeEmbeddedSvgStateTracking} when the component is destroyed.
     */
    setupEmbeddedSvgStateTracking() {
      if (!this.config.embeddedSvgActions) return

      const svg = this.embeddedSvgRoot()
      if (!svg) return
      const subElements = svg.querySelectorAll('[openhab]')

      const boundItems = new Set()
      for (const subElement of subElements) {
        const stateItems = this.config.embeddedSvgActions[subElement.id]?.stateItems
        const actionItem = this.config.embeddedSvgActions[subElement.id]?.actionItem
        const items = stateItems || (actionItem ? [actionItem] : [])
        if (items.length === 0) continue
        for (const item of items) {
          boundItems.add(item)
          if (!useStatesStore().isItemTracked(item)) useStatesStore().addToTrackingList(item)

          // immediate: seed styling from the already-cached state on (re)mount - on SPA navigation the
          // SSE stream stays connected and won't re-push unchanged states, so a change-only watcher would
          // never re-apply class/color/opacity to the freshly recreated element
          const stop = watch(
            () => useStatesStore().itemStates.get(item),
            (newState) => {
              if (newState) this.applyStateToSvgElement(item, newState, this.config.embeddedSvgActions[subElement.id], subElement)
            },
            { deep: true, immediate: true }
          )

          this.embeddedSvgStateTrackingUnsubscribes.push(stop)
        }
      }

      useStatesStore().updateTrackingList()
      // The states SSE only snapshots the item list present when it connects. Items bound to a
      // late-loaded SVG are registered afterwards, so they may never receive a fresh state and the
      // retained cache can be stale across SPA navigation. Fetch authoritative state once on (re)mount
      // so styling reflects the current Item state regardless of cache/SSE timing.
      this.refreshEmbeddedSvgItemStates(boundItems)
      console.debug('Successfully setup embedded SVG state tracking.')
    },
    /**
     * Unsubscribes from the state tracking for the Items linked to embedded SVG elements.
     */
    unsubscribeEmbeddedSvgStateTracking() {
      for (const unsubscribe of this.embeddedSvgStateTrackingUnsubscribes) {
        unsubscribe()
      }
      this.embeddedSvgStateTrackingUnsubscribes = []
      console.debug('Unsubscribed from embedded SVG state tracking.')
    },
    /**
     * Fetches the authoritative current state of each bound Item from the REST API and pushes it into
     * the states store. This updates the cache (firing the state watchers) so the embedded SVG reflects
     * the live Item state on (re)mount, even when the SSE has not re-snapshotted these late-added Items.
     *
     * @param {Set<string>} items the Item names bound to embedded SVG elements
     */
    refreshEmbeddedSvgItemStates(items) {
      const store = useStatesStore()
      for (const item of items) {
        api
          .getItemByName({ itemName: item })
          .then((data) => {
            if (!data || data.state === undefined || data.state === null) return
            // prefer the accurate state type from a previous SSE update; fall back to the Item type
            const cachedType = store.itemStates.get(item)?.type
            store.setItemState(item, {
              state: data.state,
              displayState: data.transformedState ?? data.state,
              type: cachedType && cachedType !== '-' ? cachedType : this.stateTypeForItemType(data.type)
            })
          })
          .catch((error) => {
            console.warn(`Failed to refresh state for embedded SVG Item ${item}:`, error)
          })
      }
    },
    /**
     * Maps an openHAB Item type (e.g. Contact, Dimmer, Number:Temperature) to the corresponding state
     * type used by {@link isStateOn}. Used as a fallback when no SSE state type is cached yet.
     *
     * @param {string} itemType the Item type
     * @returns {string} the state type
     */
    stateTypeForItemType(itemType) {
      switch ((itemType || '').split(':')[0]) {
        case 'Switch':
          return 'OnOff'
        case 'Contact':
          return 'OpenClosed'
        case 'Dimmer':
        case 'Rollershutter':
          return 'Percent'
        case 'Color':
          return 'HSB'
        case 'Player':
          return 'PlayPause'
        case 'Number':
          return 'Decimal'
        default:
          return 'String'
      }
    },
    /**
     * Subscribes to the mouseover and click events for the embedded SVG elements with the `openhab` attribute.
     */
    subscribeEmbeddedSvgListeners() {
      const svg = this.embeddedSvgRoot()
      if (!svg) return
      const subElements = svg.querySelectorAll('[openhab]')

      for (const subElement of subElements) {
        subElement.setAttribute('cursor', 'pointer')
        // make the whole element clickable, including the interior of fill:none outline shapes
        subElement.style.pointerEvents = 'all'
        // keep the bound handler references so they can actually be removed again on unsubscribe
        const handlers = {
          mouseover: () => this.svgOnMouseOver(subElement),
          click: () => this.svgOnClick(subElement)
        }
        subElement._ohSvgHandlers = handlers
        subElement.addEventListener('mouseover', handlers.mouseover)
        subElement.addEventListener('click', handlers.click)
      }
    },
    /**
     * Unsubscribes from the mouseover and click events for the embedded SVG elements with the `openhab` attribute.
     */
    unsubscribeEmbeddedSvgListeners() {
      const svg = this.embeddedSvgRoot()
      if (!svg) return
      const subElements = svg.querySelectorAll('[openhab]')

      for (const subElement of subElements) {
        const handlers = subElement._ohSvgHandlers
        if (!handlers) continue
        subElement.removeEventListener('mouseover', handlers.mouseover)
        subElement.removeEventListener('click', handlers.click)
        delete subElement._ohSvgHandlers
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
    svgOnMouseOver(el) {
      const flashElement = (el, fillColor) => {
        if (el && !el.flashing) {
          const attributeName = this.svgColorTarget(el)
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
        const fillColor = this.config.embeddedSvgActions && this.config.embeddedSvgActions[el.id] ? 'rgb(0, 255, 0)' : 'rgb(255, 0, 0)'
        if (tagName !== 'g' && !el.flashing) {
          // sometimes instead of fill, stroke colors are used, so if fill = none, then we use stroke instead
          const attributeName = this.svgColorTarget(el)
          const oldFill = el.style.getPropertyValue(attributeName)
          el.style.setProperty(attributeName, fillColor)
          el.flashing = true
          setTimeout(() => {
            el.flashing = false
            el.style.setProperty(attributeName, oldFill)
          }, 200)
        } else {
          // groups cannot be filled, so we need to fill special element marked as "flash"
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
    svgOnClick(el) {
      // if state = ON, use fill or flash file to highlight element (see mouseover)
      console.debug(`Element ${el.id} with openhab attribute clicked!`)

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
    flashEmbeddedSvgComponents() {
      const svg = this.embeddedSvgRoot()
      if (!svg) {
        showToast('SVG embedding has not been properly configured. Ensure that the Image URL points to an SVG file.')
        return
      }
      const subElements = svg.querySelectorAll('[openhab]')

      if (subElements.length === 0) {
        showToast('No SVG elements with an "openhab" attribute found.')
        return
      }

      for (const subElement of subElements) {
        this.svgOnMouseOver(subElement)
      }
    },
    /**
     * Converts a configured color into a CSS color string:
     * - `#rgb`/`#rrggbb` values are returned as-is
     * - openHAB HSB (three comma-separated numbers `h,s,b`) is converted to `rgb(r,g,b)`
     * - any other value is assumed to already be a valid CSS color (named, `rgb()`, `rgba()`,
     *   `hsl()`, `transparent`, `none`, …) and is passed through unchanged
     *
     * @param color color to convert
     * @returns {string|undefined} a CSS color string, or undefined when no color is given
     */
    toRGBStyle: function (color) {
      if (!color) return undefined
      const trimmed = color.trim()
      if (trimmed.startsWith('#')) return trimmed
      const parts = trimmed.split(',')
      const isHsb = parts.length === 3 && parts.every((p) => p.trim() !== '' && !isNaN(Number(p)))
      if (isHsb) {
        const rgb = this.$oh.utils.hsbToRgb(parts[0], parts[1] / 100, parts[2] / 100)
        return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
      }
      return trimmed
    },
    /**
     * Determines which color property a state/flash color should be applied to: `fill`, or `stroke`
     * for outline-only shapes (where the fill is `none`/`transparent`, set inline, via attribute or CSS).
     *
     * @param {Element} element the svg element
     * @returns {'fill'|'stroke'}
     */
    svgColorTarget(element) {
      const fill = element.style.fill || element.getAttribute('fill') || window.getComputedStyle(element).fill
      return fill && fill !== 'none' && fill !== 'transparent' ? 'fill' : 'stroke'
    },
    /**
     * Normalizes any Item state type into an "on" boolean, so state styling behaves consistently
     * across Switch, Contact, Dimmer, Number, Player, Color, String, … Items. Numeric 0 is "off".
     *
     * @param {string} state the (possibly substituted) state value
     * @param {string} stateType the openHAB state type (e.g. OnOff, Percent, Decimal, HSB)
     * @param {string} [stateOnSubstitute] when set, String states have already been mapped to ON/OFF
     * @returns {boolean}
     */
    isStateOn(state, stateType, stateOnSubstitute) {
      switch (stateType) {
        case 'OnOff':
          return state === 'ON'
        case 'OpenClosed':
          return state === 'OPEN'
        case 'UpDown':
          return state === 'UP'
        case 'PlayPause':
          return state === 'PLAY' || state === 'PLAYING'
        case 'RewindFastforward':
          return state === 'REWIND' || state === 'FASTFORWARD'
        case 'HSB': {
          const brightness = parseFloat(String(state).split(',')[2])
          return isNaN(brightness) || brightness > 0
        }
        case 'Percent':
        case 'Dimmer':
        case 'Decimal':
        case 'Quantity':
        case 'Number': {
          const value = parseFloat(state)
          return !isNaN(value) && value > 0
        }
        default:
          if (stateOnSubstitute) return state === 'ON'
          // String / Group / unknown types: treat unambiguous "off" states as off, anything else as on
          return ![undefined, null, '', 'OFF', 'CLOSED', 'DOWN', 'PAUSE', 'NULL', 'UNDEF'].includes(state)
      }
    },
    /**
     * Adds/removes the configured style classes on their target elements based on the on/off state.
     * Runs for every state type. `stateOnAsStyleClass` classes are present while on; `stateOffAsStyleClass`
     * classes are present while off. Each entry is `targetElementId:className`, comma-separated.
     *
     * @param {object} svgElementConfig configuration of the svg element
     * @param {boolean} isOn whether the state is currently "on"
     * @param {Element} svgElement the source element (used for warnings only)
     */
    applyStyleClasses(svgElementConfig, isOn, svgElement) {
      // resolve ids within this component's own SVG first, so several instances of the same SVG
      // on one page (e.g. a personal widget used twice) don't target another instance's elements
      const svgRoot = this.embeddedSvgRoot()
      const setClasses = (spec, add) => {
        if (!spec) return
        for (const entry of spec.split(',')) {
          const [idPart, classPart] = entry.split(':')
          if (!idPart || !classPart) continue
          const targetId = idPart.trim()
          const idSelector = `[id="${targetId.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"]`
          const targetElement = svgRoot?.querySelector(idSelector) || document.getElementById(targetId)
          if (!targetElement) {
            console.warn(`Target element ${targetId} not found for style class expression of ${svgElement.id}`)
            continue
          }
          targetElement.classList[add ? 'add' : 'remove'](classPart.trim())
        }
      }
      setClasses(svgElementConfig.stateOnAsStyleClass, isOn)
      setClasses(svgElementConfig.stateOffAsStyleClass, !isOn)
    },
    /*
     * Applies an Item state to the svg element based on the given configuration.
     *
     * The state is first normalized into an on/off boolean (see {@link isStateOn}) so the same
     * configuration behaves consistently for Switch, Contact, Dimmer, Number, Player, Color and
     * String Items. Three independent representations can then be applied:
     *
     * - <b>Text</b>: <tspan> elements always get the (optionally formatted, via useDisplayState) state as text.
     * - <b>Style classes</b> (stateOnAsStyleClass / stateOffAsStyleClass): toggled for every state type via
     *   {@link applyStyleClasses}. Each entry is `targetElementId:className`. On-classes are present while on,
     *   off-classes while off - useful to drive stroke styling, filters or CSS animations.
     * - <b>Color or opacity</b> applied to the element itself (or, for groups, to the `flash` proxy element or
     *   all child paths). Color targets `fill`, or `stroke` when the element has no fill (fill:none outlines).
     *   When stateAsOpacity is set, numeric states (Percent/Dimmer/Number/…) drive opacity proportionally
     *   (0-100 → 0-1), clamped to stateMinOpacity while on; the off state always collapses to 0 (or 1 if inverted).
     *
     * @param {string} item item name that has triggered the state change
     * @param {object} stateObj the Item state object ({ state, displayState, type })
     * @param {object} svgElementConfig configuration of the svg element
     * @param {Element} svgElement the svg element configured to represent the state
     */
    applyStateToSvgElement(item, stateObj, svgElementConfig, svgElement) {
      let state = svgElementConfig.useDisplayState ? stateObj.displayState : stateObj.state
      const stateType = stateObj.type
      const stateOnSubstitute = svgElementConfig.stateOnSubstitute
      if (stateOnSubstitute && stateType === 'String') {
        state = state === stateOnSubstitute ? 'ON' : 'OFF'
      }

      const isOn = this.isStateOn(state, stateType, stateOnSubstitute)
      console.debug(`Update ${svgElement.id} due to ${item} changing to ${state} (${stateType}, on=${isOn})`)
      const tagName = svgElement.tagName
      const stateOnColorRgbStyle = this.toRGBStyle(svgElementConfig.stateOnColor)
      const stateOffColorRgbStyle = this.toRGBStyle(svgElementConfig.stateOffColor)
      // for Color Items with no explicit on-color, use the Item's own color
      const onColorRgbStyle = stateOnColorRgbStyle || (stateType === 'HSB' ? this.toRGBStyle(state) : undefined)
      const proportional = ['Percent', 'Dimmer', 'Decimal', 'Quantity', 'Number'].includes(stateType)

      if (tagName === 'tspan') {
        // textContent (not innerHTML) so an Item state containing markup is rendered as plain text
        svgElement.textContent = state
      }

      // style classes are independent of the color/opacity representation and run for every state type
      this.applyStyleClasses(svgElementConfig, isOn, svgElement)

      // honor an explicit fill/stroke choice, otherwise auto-detect (fill, or stroke for fill:none shapes)
      const colorProperty = (element) => {
        if (svgElementConfig.colorProperty === 'fill' || svgElementConfig.colorProperty === 'stroke') {
          return svgElementConfig.colorProperty
        }
        return this.svgColorTarget(element)
      }

      function processState(element) {
        if (svgElementConfig.stateAsOpacity) {
          let opacity = isOn ? (proportional && !isNaN(parseFloat(state)) ? parseFloat(state) / 100.0 : 1) : 0
          if (svgElementConfig.invertStateOpacity) opacity = 1 - opacity
          const min = parseFloat(svgElementConfig.stateMinOpacity)
          // clamp only the visible (on) state, so the off state can still fully collapse to 0
          if (!isNaN(min) && opacity > 0 && opacity < min) opacity = min
          element.style.opacity = opacity
          return
        }

        const property = colorProperty(element)
        if (isOn) {
          if (onColorRgbStyle) {
            if (element.dataset.ohOldColor === undefined) element.dataset.ohOldColor = element.style[property] || ''
            element.style[property] = onColorRgbStyle
          }
        } else {
          const restore = stateOffColorRgbStyle ?? element.dataset.ohOldColor
          if (restore !== undefined) element.style[property] = restore
        }
      }

      const useProxy = tagName === 'g' && svgElementConfig.useProxyElementForState
      const element = useProxy ? svgElement.querySelector('[flash]') : svgElement
      if (element) {
        processState(element)
      } else {
        // group without a flash proxy: apply to all child paths
        for (const path of svgElement.querySelectorAll('path')) {
          processState(path)
        }
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
    performAction(evt, prefix, config, context) {
      this.$emit('action', { evt, prefix, config, context })
    }
  }
}
