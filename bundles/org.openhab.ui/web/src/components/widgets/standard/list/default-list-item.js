/** Determine the appropriate default representation of an item when displayed in a list.
 * Users may override it by specifying the component's name and configuration
 * in the "listWidget" metadata namespace of the item
 * @param item item for which a list component is created
 * @param {object} [footer] configuration of the label of the component footer. If undefined nothing is displayed in the footer.
 * Refer to {@see itemContextLabel} for valid options.
 */

import * as Semantics from '@/assets/semantics'

export default function itemDefaultListComponent (item, footer) {
  const stateDescription = item.stateDescription || {}
  const metadata = (item.metadata && item.metadata.listWidget) ? item.metadata.listWidget : {}
  let component = null
  let semanticClass = {}
  let semanticProperty = {}

  if (metadata.value && metadata.value !== ' ') {
    component = {
      component: metadata.value,
      config: Object.assign({}, metadata.config)
    }
  } else {
    item.tags.forEach((tag) => {
      if (Semantics.Points.indexOf(tag) >= 0) {
        semanticClass = tag
      }
      if (Semantics.Properties.indexOf(tag) >= 0) {
        semanticProperty = tag
      }
    })

    if (item.type === 'Switch' && !stateDescription.readOnly) {
      component = {
        component: 'oh-toggle-item'
      }
    }

    if (item.type === 'Dimmer' && !stateDescription.readOnly) {
      component = {
        component: 'oh-slider-item',
        config: {
          scale: true,
          label: true,
          scaleSubSteps: 5,
          min: stateDescription.minimum,
          max: stateDescription.maximum,
          step: stateDescription.step
        }
      }
    }

    if (item.type === 'Color' && !stateDescription.readOnly) {
      component = {
        component: 'oh-colorpicker-item',
        config: {
          navbarTitleText: item.label || item.name
        }
      }
    }

    if (item.type === 'Rollershutter' && !stateDescription.readOnly) {
      component = {
        component: 'oh-rollershutter-item'
      }
    }

    if (item.type === 'Player' && !stateDescription.readOnly) {
      component = {
        component: 'oh-player-item'
      }
    }

    if (item.type === 'Image') {
      component = {
        component: 'oh-list-item',
        config: {
          action: 'photos',
          actionPhotos: [{ item: item.name }]
        }
      }
    }

    if ((semanticClass === 'Control' || semanticClass === 'Setpoint') && !stateDescription.readOnly) {
      if (item.type === 'DateTime') {
        component = {
          component: 'oh-input-item',
          config: {
            type: 'datetime-local',
            sendButton: true,
            clearButton: true
          }
        }
      }
      if (item.type === 'Number') {
        component = {
          component: 'oh-input-item',
          config: {
            type: 'number',
            inputmode: 'decimal',
            sendButton: true
          }
        }
      }
      if (item.type === 'Number:Temperature' || semanticProperty === 'Temperature') {
        component = {
          component: 'oh-stepper-item',
          config: {
            min: stateDescription.minimum,
            max: stateDescription.maximum,
            step: stateDescription.step,
            buttonsOnly: false
          }
        }
      }
      if (semanticProperty === 'ColorTemperature' || semanticProperty === 'Level' || semanticProperty === 'SoundVolume') {
        component = {
          component: 'oh-slider-item',
          config: {
            scale: true,
            label: true,
            scaleSubSteps: 5,
            min: stateDescription.minimum,
            max: stateDescription.maximum,
            step: stateDescription.step
          }
        }
      }
    }

    if (semanticClass === 'Switch' && !stateDescription.readOnly) {
      component = {
        component: 'oh-toggle-item'
      }
    }
  }

  if (!component) {
    component = {
      component: 'oh-label-item'
    }

    if (item.type.indexOf('Number') === 0 && (!item.commandDescription || !item.commandDescription.commandOptions || stateDescription.readOnly)) {
      component.config = {
        action: 'analyzer',
        actionAnalyzerItems: [item.name]
      }
    } else if (item.commandDescription && item.commandDescription.commandOptions && !stateDescription.readOnly) {
      component.config = {
        action: 'options',
        actionItem: item.name
        // command options will be retrieved on click from the API
      }
    } else if (item.type.indexOf('Group') === 0) {
      component.config = {
        action: 'group',
        actionGroupPopupItem: item.name
      }
    }
  }

  if (!component.config) component.config = {}
  if ((!metadata.value || metadata.value === ' ') && typeof metadata.config === 'object') {
    component.config = Object.assign({}, component.config, metadata.config)
  }
  if (!component.config.item) component.config.item = item.name
  if (!component.config.title) component.config.title = item.label || item.name
  if (item.category && !component.config.icon) component.config.icon = item.category
  if (item.category && !['Call', 'Image', 'Location', 'String'].includes(item.type)) component.config.iconUseState = true
  if (item.label && footer && footer.contextLabelSource) {
    let text = itemContextLabel(item, footer)
    if (text) component.config.footer = text
  }
  if (!item.category) component.config.fallbackIconToInitial = true
  return component
}

/** Provides a context label for items to be displayed in footer or divider according to configuration
 * @param item item for which a label component is returned
 * @param {object} [config] configuration of the source of the label. If undefined nothing is returned
 * @param {string} config.contextLabelSource defines what will be displayed in the footer, can be either: itemName, path, parent, none
 * @param {number} config.[contextLabelPathTrimStart] number of element to strip from the beginning of the path
 * @param {number} config.[contextLabelPathTrimEnd] number of elements to trim from the end of the path
 * @param {boolean} considerItem consider the item itself as part of the context (for path/parent options)
 */
export function itemContextLabel (item, config, considerItem) {
  let label
  if (config && config.contextLabelSource && config.contextLabelSource !== 'none') {
    switch (config.contextLabelSource) {
      case 'itemName':
        label = item.name
        break
      case 'parent':
        const parent = considerItem ? item : item.parent
        if (parent && parent.label) {
          label = parent.label
        }
        break
      case 'path':
        label = itemPathLabel(item, config.contextLabelPathTrimStart, config.contextLabelPathTrimEnd, considerItem)
        break
    }
  }
  return label
}

export function itemPathLabel (item, trimStart, trimEnd, includeItem) {
  if (!item.modelPath) return '(?) > ' + item.name
  const path = includeItem ? item.modelPath.concat([item]) : item.modelPath
  return path.slice(trimStart, trimEnd ? -trimEnd : undefined).map((parent) => {
    return parent.label || parent.name
  }).join(' > ')
}

/* The functions below deal with specifically with equipment representation in the home page cards */

function promotedEquipmentComponent (item, config, hasLocationContext) {
  let c = itemDefaultListComponent(item)
  // Item is promoted so consider parent for context label
  let text = itemContextLabel(item.parent, hasLocationContext ? undefined : config)
  if (text) c.config.footer = text
  const parts = (config.equipmentPromotedLabel && config.equipmentPromotedLabel.length > 0) ? config.equipmentPromotedLabel : false
  c.config.title = [
    !parts || parts.includes('equipment') ? (item.parent.label || item.parent.name) : null, // Default setting: display parent name
    parts && parts.includes('separator') ? '>' : null,
    parts && parts.includes('item') ? (item.label || item.name) : null
  ].flat().join(' ')
  return c
}

export function itemAccordionEquipmentComponent (item, config, hasLocationContext) {
  if (item.equipmentOrPoints.length === 0) {
    // Item is a point or equipment without points or sub-equipment
    return itemDefaultListComponent(item, hasLocationContext ? undefined : config)
  }

  if (item.equipmentOrPoints.length === 1 && config.equipmentPromoteSingle) {
    // TODO: take into account visibility for promoting single elements (do not count siblings not visible)
    return promotedEquipmentComponent(item.equipmentOrPoints[0], config, hasLocationContext)
  }

  // Try to promote main item based on widgetOrder metadata
  let promoted = config.equipmentPromoteMain ? item.points.find((p) => {
    return p.metadata && p.metadata.widgetOrder && p.metadata.widgetOrder && p.metadata.widgetOrder.value && (+p.metadata.widgetOrder.value) === 0
  }) : null

  let c = promoted ? promotedEquipmentComponent(promoted, config, hasLocationContext) : itemDefaultListComponent(item, hasLocationContext ? undefined : config)
  c.config.action = undefined
  c.slots = {
    accordion: [
      {
        component: 'oh-list',
        config: {
          mediaList: true,
          accordionEquipment: true
        },
        slots: {
          default: item.equipmentOrPoints.filter((i) => { return i !== promoted }).map((i) => itemAccordionEquipmentComponent(i, config, true))
        }
      }
    ]
  }

  return c
}

export function equipmentListComponent (items, config, hasLocationContext) {
  let components = []
  const isAccordion = config && config.equipmentNesting && config.equipmentNesting === 'accordion'
  if (!isAccordion) {
    const standaloneEquipment = items.filter((eqpt) => eqpt.equipmentOrPoints.length === 0).map((eqpt) => itemDefaultListComponent(eqpt, hasLocationContext ? undefined : config))
    const equipmentWithPoints = items.filter((eqpt) => eqpt.equipmentOrPoints.length !== 0).map((eqpt) => {
      return [
        {
          component: 'oh-list-item',
          config: {
            title: hasLocationContext ? (eqpt.label || eqpt.name) : itemContextLabel(eqpt, config, true),
            divider: true
          }
        },
        ...eqpt.equipmentOrPoints.map((p) => itemDefaultListComponent(p))
      ]
    })
    components = [...standaloneEquipment, ...equipmentWithPoints].flat()
  } else {
    components = items.map((item) => itemAccordionEquipmentComponent(item, config || {}))
  }

  return {
    component: 'oh-list',
    config: {
      accordionEquipment: isAccordion,
      mediaList: true
    },
    slots: {
      default: [...components].flat()
    }
  }
}
