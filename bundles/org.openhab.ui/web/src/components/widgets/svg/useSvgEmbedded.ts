import { ref, type ComputedRef, type Ref, type WatchHandle } from 'vue'
import type { Router } from 'framework7'
import { f7 } from 'framework7-vue'
import WidgetConfigPopup from '@/components/pagedesigner/widget-config-popup.vue'
import { OhSVGElementDefinition } from '@/assets/definitions/widgets/system/index.ts'

import { useStatesStore } from '@/js/stores/useStatesStore'
import { watch } from 'vue'
import { showToast } from '@/js/dialog-promises'
import * as api from '@/api'

import media from '@/js/openhab/media'
import { hsbToRgb } from '@/js/openhab/utils'

import { OhSvgElement } from '@/types/components/widgets'
import type { ItemState } from '@/js/stores/useStatesStore'
import { StateType, isStateType } from '@/types/openhab'

import type { Framework7Events } from '@/types/framework7-extensions'

// Constants & Type definitions
type SVGElementWithHandlers = SVGElement & { _ohSvgHandlers?: { mouseover: () => void; click: (evt: Event) => void }; flashing?: boolean }

const ITEM_TYPE_TO_STATE_TYPE: Record<string, StateType> = {
  Switch: StateType.OnOff,
  Contact: StateType.OpenClosed,
  Dimmer: StateType.Percent,
  Rollershutter: StateType.Percent,
  Color: StateType.HSB,
  Player: StateType.PlayPause,
  Number: StateType.Decimal
}

function toStateType(stateType: string | undefined): StateType {
  return isStateType(stateType) ? stateType : StateType.String
}

export type useSvgEmbeddedOptions = {
  editmode: Ref<boolean>
  embeddedSvgActions: Ref<Record<string, OhSvgElement.Config>>
  embedSvgFlashing: Ref<boolean>
  performAction: (event: Event | null, prefix: string | null, config: OhSvgElement.Config) => void
  f7router?: Router.Router
  updateSvgElementConfig?: (id: string, config: OhSvgElement.Config) => void
}

export function useSvgEmbedded(options: useSvgEmbeddedOptions) {
  const { editmode, embeddedSvgActions, embedSvgFlashing, f7router } = options

  // state/data
  const embeddedSvgRoot = ref<SVGSVGElement | null>(null)
  const embeddedSvgReady = ref(false)
  const embeddedSvgStateTrackingUnsubscribes: WatchHandle[] = []

  /**
   * Internal function to fetch and validates the SVG markup from the configured Image URL.
   *
   * @returns {Promise<string>}
   */
  async function fetchEmbeddedSvgText(imageUrl: string, cacheBust?: boolean): Promise<string> {
    if (cacheBust) {
      imageUrl += (imageUrl.includes('?') ? '&' : '?') + `rnd=${Math.random()}`
    }
    const svgUrl = await media.getImage(imageUrl)
    const response = await fetch(svgUrl)

    if (!response.ok) {
      throw new Error(`Failed to load from ${imageUrl}. Status: ${response.status} (${response.statusText})`)
    }

    const contentType = (response.headers.get('Content-Type') || '').toLowerCase()
    if (!contentType.includes('image/svg+xml')) {
      throw new Error(`${imageUrl} is not an SVG file`)
    }

    return response.text()
  }

  /**
   * Loads and either embeds the SVG into the given parent element or passes the SVG markup to a custom embedSvg function (function should return the embedded SVG element).
   * This should be called by the component that wants to embed the SVG (typically onMounted or when the imageUrl changes), passing in the parent element and/or a custom embedSvg function.
   *
   * @param imageUrl string
   * @param parentElement parentElement to embed the SVG into (optional if embedSvg function is provided)
   * @param embedSvg function to call with the SVG markup to embed it (optional if parentElement is provided). Should return the embedded SVG DOM element.
   *
   * @returns {Promise<void>}
   */
  async function loadAndEmbedSvg(
    imageUrl: string,
    parentElement?: HTMLElement | null,
    embedSvg?: (svgText: string) => SVGSVGElement | null
  ): Promise<void> {
    const svgCode = await fetchEmbeddedSvgText(imageUrl, Boolean(editmode.value))
    if (embedSvg) {
      embeddedSvgRoot.value = embedSvg(svgCode)
    } else if (parentElement) {
      parentElement.innerHTML = svgCode
      embeddedSvgRoot.value = parentElement.querySelector<SVGSVGElement>('svg')
      embeddedSvgRoot.value?.classList.add('oh-canvas-background', 'disable-user-drag')
    } else {
      throw new Error('No parent element provided for embedding SVG')
    }

    if (embeddedSvgRoot.value) {
      const svgElements = embeddedSvgRoot.value.querySelectorAll<SVGElementWithHandlers>('[openhab]')
      subscribeEmbeddedSvgListeners(svgElements)
      void setupEmbeddedSvgStateTracking(svgElements)
    }
    embeddedSvgReady.value = true
  }

  /**
   * Removes the embedded SVG either from the parent element or by calling a custom unEmbedSvg function, and unsubscribes from the state tracking and event listeners.
   *
   * @param unEmbedSvg function to call with the SVG root element before removing it (optional)
   */
  function removeEmbeddedSvg(unEmbedSvg?: (svgRoot: Ref<SVGSVGElement | null>) => void) {
    if (embeddedSvgRoot.value && embeddedSvgReady.value) {
      unsubscribeEmbeddedSvgListeners()
      unsubscribeEmbeddedSvgStateTracking()
      if (unEmbedSvg) {
        unEmbedSvg(embeddedSvgRoot)
      } else {
        embeddedSvgRoot.value.remove()
      }
    }
    embeddedSvgRoot.value = null
    embeddedSvgReady.value = false
  }

  /**
   * Opens the config popup for an embedded SVG element.
   *
   * @param id the id of the embedded SVG element
   */
  function openSvgSettingsPopup(id: string) {
    const defaultActionConfig: OhSvgElement.Config = {
      action: OhSvgElement.Action.toggle,
      actionCommand: 'ON',
      actionCommandAlt: 'OFF'
    }
    const popup = { component: WidgetConfigPopup }
    const actionConfig: OhSvgElement.Config = embeddedSvgActions.value[id] || defaultActionConfig

    if (!f7router) return

    // @ts-expect-error f7router.navigate is missing the type definition for the below call
    f7router.navigate(
      { url: 'on-svg-click-settings', route: { path: 'on-svg-click-settings', popup } },
      {
        props: {
          widget: OhSVGElementDefinition(),
          component: {
            config: actionConfig
          }
        }
      }
    )

    const updateWidgetConfig = (config: OhSvgElement.Config) => {
      if (options.updateSvgElementConfig) {
        options.updateSvgElementConfig(id, config)
      }
    }
    f7.on('widgetConfigUpdate' as Framework7Events, updateWidgetConfig)
    f7.once('widgetConfigClosed' as Framework7Events, () => {
      f7.off('widgetConfigUpdate' as Framework7Events, updateWidgetConfig)
    })
  }

  /**
   * Setups the state tracking for the Items linked to embedded SVG elements.
   *
   * This method adds the stateItem or actionItem to the tracking list and subscribes to the Item state mutations.
   * Remember to unsubscribe from the mutations using {@link unsubscribeEmbeddedSvgStateTracking} when the component is destroyed.
   */
  async function setupEmbeddedSvgStateTracking(svgElements: NodeListOf<SVGElementWithHandlers>) {
    const boundItems = new Set<string>()
    for (const svgElement of svgElements) {
      const svgElementConfig: OhSvgElement.Config | undefined = embeddedSvgActions.value[svgElement.id]
      const stateItems = svgElementConfig?.stateItems
      const actionItem = svgElementConfig?.actionItem
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
            const svgElementConfig = embeddedSvgActions.value[svgElement.id]
            if (newState && svgElementConfig) {
              applyStateToSvgElement(item, newState, svgElementConfig, svgElement)
            }
          },
          { deep: true, immediate: true }
        )

        embeddedSvgStateTrackingUnsubscribes.push(stop)
      }
    }

    useStatesStore().updateTrackingList()
    // The states SSE only snapshots the item list present when it connects. Items bound to a
    // late-loaded SVG are registered afterwards, so they may never receive a fresh state and the
    // retained cache can be stale across SPA navigation. Fetch authoritative state once on (re)mount
    // so styling reflects the current Item state regardless of cache/SSE timing.
    await refreshEmbeddedSvgItemStates(boundItems)
    console.debug('Successfully setup embedded SVG state tracking.')
  }

  /**
   * Unsubscribes from the state tracking for the Items linked to embedded SVG elements.
   */
  function unsubscribeEmbeddedSvgStateTracking() {
    for (const unsubscribe of embeddedSvgStateTrackingUnsubscribes) {
      unsubscribe()
    }
    embeddedSvgStateTrackingUnsubscribes.length = 0
    console.debug('Unsubscribed from embedded SVG state tracking.')
  }

  /**
   * Fetches the authoritative current state of each bound Item from the REST API and pushes it into
   * the states store. This updates the cache (firing the state watchers) so the embedded SVG reflects
   * the live Item state on (re)mount, even when the SSE has not re-snapshotted these late-added Items.
   *
   * @param {Set<string>} items the Item names bound to embedded SVG elements
   */
  async function refreshEmbeddedSvgItemStates(items: Set<string>) {
    const store = useStatesStore()
    for (const itemName of items) {
      try {
        const item = await api.getItemByName({ itemName: itemName })

        if (!item || item.state === undefined || item.state === null) continue
        // prefer the accurate state type from a previous SSE update; fall back to the Item type
        const cachedType = store.itemStates.get(itemName)?.type
        store.setItemState(itemName, {
          state: item.state,
          displayState: item.transformedState ?? item.state,
          type: cachedType && cachedType !== '-' ? cachedType : stateTypeForItemType(item.type)
        })
      } catch (error) {
        console.warn(`Failed to refresh state for embedded SVG Item ${itemName}:`, error)
      }
    }
  }

  /**
   * Maps an openHAB Item type (e.g. Contact, Dimmer, Number:Temperature) to the corresponding state
   * type used by {@link isStateOn}. Used as a fallback when no SSE state type is cached yet.
   *
   * @param {string} itemType the Item type
   * @returns {string} the state type
   */
  function stateTypeForItemType(itemType: string): StateType {
    const baseType = (itemType || '').split(':')[0]
    return ITEM_TYPE_TO_STATE_TYPE[baseType] ?? StateType.String
  }

  /**
   * Subscribes to the mouseover and click events for the embedded SVG elements with the `openhab` attribute.
   */
  function subscribeEmbeddedSvgListeners(svgElements: NodeListOf<SVGElementWithHandlers>) {
    for (const svgElement of svgElements) {
      svgElement.setAttribute('cursor', 'pointer')
      // make the whole element clickable, including the interior of fill:none outline shapes
      svgElement.style.pointerEvents = 'all'
      // keep the bound handler references so they can actually be removed again on unsubscribe
      const handlers = {
        mouseover: () => svgOnMouseOver(svgElement),
        click: (evt: Event) => svgOnClick(svgElement, evt)
      }
      svgElement._ohSvgHandlers = handlers
      svgElement.addEventListener('mouseover', handlers.mouseover)
      svgElement.addEventListener('click', handlers.click)
    }
  }

  /**
   * Unsubscribes from the mouseover and click events for the embedded SVG elements with the `openhab` attribute.
   */
  function unsubscribeEmbeddedSvgListeners() {
    const svg = embeddedSvgRoot.value
    if (!svg) return
    const subElements = svg.querySelectorAll<SVGElementWithHandlers>('[openhab]')

    for (const subElement of subElements) {
      const handlers = subElement._ohSvgHandlers
      if (!handlers) continue
      subElement.removeEventListener('mouseover', handlers.mouseover)
      subElement.removeEventListener('click', handlers.click)
      delete subElement._ohSvgHandlers
    }
  }

  /**
   * Handles the mouse over event on an element of the embedded SVG.
   *
   * In edit mode, the element flashes when hovered over.
   * In run mode, nothing happens
   *
   * @param {HTMLElement} el
   */
  function svgOnMouseOver(el: SVGElementWithHandlers) {
    const flashElement = (el: SVGElementWithHandlers, fillColor: string) => {
      if (el && !el.flashing) {
        const attributeName = svgColorTarget(el)
        const oldFill = el.style.getPropertyValue(attributeName)
        const oldOpacity = el.style.opacity
        el.style.setProperty(attributeName, fillColor)
        el.style.opacity = '1'
        el.flashing = true
        setTimeout(() => {
          el.style.setProperty(attributeName, oldFill)
          el.style.opacity = oldOpacity
          el.flashing = false
        }, 200)
      }
    }

    if (editmode.value || (!editmode.value && embedSvgFlashing.value)) {
      const tagName = el.tagName
      // fill green if item config is available, red if config is still missing
      const fillColor = embeddedSvgActions.value[el.id] ? 'rgb(0, 255, 0)' : 'rgb(255, 0, 0)'
      if (tagName !== 'g' && !el.flashing) {
        // sometimes instead of fill, stroke colors are used, so if fill = none, then we use stroke instead
        const attributeName = svgColorTarget(el)
        const oldFill = el.style.getPropertyValue(attributeName)
        el.style.setProperty(attributeName, fillColor)
        el.flashing = true
        setTimeout(() => {
          el.flashing = false
          el.style.setProperty(attributeName, oldFill)
        }, 200)
      } else {
        // groups cannot be filled, so we need to fill special element marked as "flash"
        const elementToFlash = el.querySelector<SVGElementWithHandlers>('[flash]')
        if (elementToFlash) {
          flashElement(elementToFlash, fillColor)
        } else {
          // let's try flashing all path elements in the group
          const flashElements = el.querySelectorAll<SVGElementWithHandlers>('path')
          for (const path of flashElements) {
            flashElement(path, fillColor)
          }
        }
      }
    }
  }

  /**
   * Handles the click event on an element of the embedded SVG.
   *
   * In edit mode, the element's configuration popup is opened.
   * In run mode, the element's action is executed.
   *
   * @param {HTMLElement} el
   * @param {Event} evt
   */
  function svgOnClick(el: SVGElementWithHandlers, evt: Event) {
    // if state = ON, use fill or flash file to highlight element (see mouseover)
    console.debug(`Element ${el.id} with openhab attribute clicked!`)

    if (editmode.value) {
      openSvgSettingsPopup(el.id)
    } else {
      if (embeddedSvgActions.value[el.id]) {
        options.performAction(evt, null, embeddedSvgActions.value[el.id])
      }
    }
  }

  /**
   * Flashes all embedded SVG components with the `openhab` attribute.
   */
  function flashEmbeddedSvgComponents() {
    const svg = embeddedSvgRoot.value
    if (!svg) {
      void showToast('SVG embedding has not been properly configured. Ensure that the Image URL points to an SVG file.')
      return
    }
    const subElements = svg.querySelectorAll<SVGElementWithHandlers>('[openhab]')

    if (subElements.length === 0) {
      void showToast('No SVG elements with an "openhab" attribute found.')
      return
    }

    for (const subElement of subElements) {
      svgOnMouseOver(subElement)
    }
  }

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
  function toRGBStyle(color: string | null | undefined): string | undefined {
    if (!color) return undefined
    const trimmed = color.trim()
    if (trimmed.startsWith('#')) return trimmed
    const parts = trimmed.split(',').map((p) => Number(p.trim()))
    if (parts.length === 3 && parts.every((p) => !isNaN(p))) {
      const rgb = hsbToRgb(parts[0], parts[1] / 100, parts[2] / 100)
      return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
    }
    return trimmed
  }

  /**
   * Determines which color property a state/flash color should be applied to: `fill`, or `stroke`
   * for outline-only shapes (where the fill is `none`/`transparent`, set inline, via attribute or CSS).
   *
   * @param {Element} element the svg element
   * @returns {'fill'|'stroke'}
   */
  function svgColorTarget(element: SVGElement): 'fill' | 'stroke' {
    const fill = element.style.fill || element.getAttribute('fill') || window.getComputedStyle(element).fill
    return fill && fill !== 'none' && fill !== 'transparent' ? 'fill' : 'stroke'
  }

  /**
   * Normalizes any Item state type into an "on" boolean, so state styling behaves consistently
   * across Switch, Contact, Dimmer, Number, Player, Color, String, … Items. Numeric 0 is "off".
   *
   * @param {string} state the (possibly substituted) state value
   * @param {string} stateType the openHAB state type (e.g. OnOff, Percent, Decimal, HSB)
   * @param {string} [stateOnSubstitute] when set, String states have already been mapped to ON/OFF
   * @returns {boolean}
   */
  function isStateOn(state: string | undefined, stateType: StateType, stateOnSubstitute: any): boolean {
    if (state === undefined || state === null) return false
    switch (stateType) {
      case StateType.OnOff:
        return state === 'ON'
      case StateType.OpenClosed:
        return state === 'OPEN'
      case StateType.UpDown:
        return state === 'UP'
      case StateType.PlayPause:
        return state === 'PLAY' || state === 'PLAYING'
      case StateType.RewindFastforward:
        return state === 'REWIND' || state === 'FASTFORWARD'
      case StateType.HSB: {
        const brightness = parseFloat(String(state).split(',')[2])
        return isNaN(brightness) || brightness > 0
      }
      case StateType.Percent:
      case StateType.Dimmer:
      case StateType.Decimal:
      case StateType.Quantity:
      case StateType.Number: {
        const value = parseFloat(state)
        return !isNaN(value) && value > 0
      }
      default:
        if (stateOnSubstitute) return state === 'ON'
        // String / Group / unknown types: treat unambiguous "off" states as off, anything else as on
        return ![undefined, null, '', 'OFF', 'CLOSED', 'DOWN', 'PAUSE', 'NULL', 'UNDEF'].includes(state)
    }
  }

  /**
   * Adds/removes the configured style classes on their target elements based on the on/off state.
   * Runs for every state type. `stateOnAsStyleClass` classes are present while on; `stateOffAsStyleClass`
   * classes are present while off. Each entry is `targetElementId:className`, comma-separated.
   *
   * @param {object} svgElementConfig configuration of the svg element
   * @param {boolean} isOn whether the state is currently "on"
   * @param {Element} svgElement the source element (used for warnings only)
   */
  function applyStyleClasses(svgElementConfig: OhSvgElement.Config, isOn: boolean, svgElement: Element) {
    const setClasses = (spec: string | null | undefined, add: boolean) => {
      if (!spec) return
      for (const entry of spec.split(',')) {
        const [idPart, classPart] = entry.split(':')
        if (!idPart || !classPart) continue
        const targetId = idPart.trim()
        const targetElement = document.getElementById(targetId)
        if (!targetElement) {
          console.warn(`Target element ${targetId} not found for style class expression of ${svgElement.id}`)
          continue
        }
        targetElement.classList[add ? 'add' : 'remove'](classPart.trim())
      }
    }
    setClasses(svgElementConfig.stateOnAsStyleClass, isOn)
    setClasses(svgElementConfig.stateOffAsStyleClass, !isOn)
  }

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
  function applyStateToSvgElement(
    item: string,
    stateObj: ItemState,
    svgElementConfig: OhSvgElement.Config,
    svgElement: SVGElementWithHandlers
  ) {
    let state = svgElementConfig.useDisplayState ? (stateObj.displayState ?? '') : (stateObj.state ?? '')
    const stateType = toStateType(stateObj.type)
    const stateOnSubstitute = svgElementConfig.stateOnSubstitute
    if (stateOnSubstitute && stateType === StateType.String) {
      state = state === stateOnSubstitute ? 'ON' : 'OFF'
    }

    const isOn = isStateOn(state, stateType, stateOnSubstitute)
    console.debug(`Update ${svgElement.id} due to ${item} changing to ${state} (${stateType}, on=${isOn})`)
    const tagName = svgElement.tagName
    const stateOnColorRgbStyle = toRGBStyle(svgElementConfig.stateOnColor)
    const stateOffColorRgbStyle = toRGBStyle(svgElementConfig.stateOffColor)
    // for Color Items with no explicit on-color, use the Item's own color
    const onColorRgbStyle = stateOnColorRgbStyle || (stateType === StateType.HSB ? toRGBStyle(state) : undefined)
    const proportional = [StateType.Percent, StateType.Dimmer, StateType.Decimal, StateType.Quantity, StateType.Number].includes(stateType)

    if (tagName === 'tspan') {
      // textContent (not innerHTML) so an Item state containing markup is rendered as plain text
      svgElement.textContent = state
    }

    // style classes are independent of the color/opacity representation and run for every state type
    applyStyleClasses(svgElementConfig, isOn, svgElement)

    // honor an explicit fill/stroke choice, otherwise auto-detect (fill, or stroke for fill:none shapes)
    const colorProperty = (element: SVGElement) => {
      if (
        svgElementConfig.colorProperty === OhSvgElement.ColorProperty.fill ||
        svgElementConfig.colorProperty === OhSvgElement.ColorProperty.stroke
      ) {
        return svgElementConfig.colorProperty
      }
      return svgColorTarget(element)
    }

    function processState(element: SVGElementWithHandlers) {
      if (svgElementConfig.stateAsOpacity) {
        let opacity = isOn ? (proportional && !isNaN(parseFloat(state)) ? parseFloat(state) / 100.0 : 1) : 0
        if (svgElementConfig.invertStateOpacity) opacity = 1 - opacity
        const min = svgElementConfig.stateMinOpacity ? parseFloat(svgElementConfig.stateMinOpacity) : NaN
        // clamp only the visible (on) state, so the off state can still fully collapse to 0
        if (!isNaN(min) && opacity > 0 && opacity < min) opacity = min
        element.style.opacity = String(opacity)
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
    const element = useProxy ? svgElement.querySelector<SVGElementWithHandlers>('[flash]') : svgElement
    if (element) {
      processState(element)
    } else {
      // group without a flash proxy: apply to all child paths
      for (const path of svgElement.querySelectorAll('path')) {
        processState(path)
      }
    }
  }

  return {
    loadAndEmbedSvg,
    removeEmbeddedSvg,
    flashEmbeddedSvgComponents,
    embeddedSvgReady
  }
}
