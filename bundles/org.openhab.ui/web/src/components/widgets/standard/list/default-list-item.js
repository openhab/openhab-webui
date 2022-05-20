/* Determine the appropriate default representation of an item when displayed in a list.
   Users may override it by specifying the component's name and configuration
   in the "listWidget" metadata namespace of the item
 */

export default function itemDefaultListComponent (item, itemNameAsFooterOrLocation) {
  const stateDescription = item.stateDescription || {}
  const metadata = (item.metadata && item.metadata.listWidget) ? item.metadata.listWidget : {}
  let component = null

  if (metadata.value && metadata.value !== ' ') {
    component = {
      component: metadata.value,
      config: Object.assign({}, metadata.config)
    }
  } else {
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
  if (item.category && !component.config.icon) component.config.icon = 'oh:' + item.category
  if (item.category && ['Switch', 'Rollershutter', 'Contact', 'Dimmer', 'Group'].indexOf(item.type) >= 0) component.config.iconUseState = true
  if (item.label && itemNameAsFooterOrLocation === true) component.config.footer = item.name
  else if (item.label && itemNameAsFooterOrLocation) component.config.footer = itemNameAsFooterOrLocation
  if (!item.category) component.config.fallbackIconToInitial = true

  return component
}

/* The functions below deal with specifically with equipment representation in the home page cards */

export function itemPathLabel (item) {
  if (!item.modelPath) return '(?) > ' + item.name
  return item.modelPath.map((parent) => {
    return parent.label || parent.name
  }).join(' > ')
}

function promotedEquipmentContext (item, config, itemNameAsFooterOrLocation) {
  let c = itemDefaultListComponent(item, itemNameAsFooterOrLocation)
  const parts = (config.equipmentPromotedLabel && config.equipmentPromotedLabel.length > 0) ? config.equipmentPromotedLabel : false
  c.config.title = [
    !parts || parts.includes('equipment') ? (item.parent.label || item.parent.name) : null, // Default setting: display parent name
    parts && parts.includes('separator') ? '>' : null,
    parts && parts.includes('item') ? (item.label || item.name) : null
  ].flat().join(' ')
  return c
}

export function itemAccordionEquipmentComponent (item, config, itemNameAsFooterOrLocation) {
  if (item.equipmentOrPoints.length === 0) {
    // Item is a point or equipment without points or sub-equipment
    return itemDefaultListComponent(item, itemNameAsFooterOrLocation)
  }

  if (item.equipmentOrPoints.length === 1 && config.equipmentPromoteSingle) {
    // TODO: take into account visibility for promoting single elements (do not count siblings not visible)
    return promotedEquipmentContext(item.equipmentOrPoints[0], config, itemNameAsFooterOrLocation)
  }

  // Try to promote main item based on widgetOrder metadata
  let promoted = config.equipmentPromoteMain ? item.points.find((p) => {
    return p.metadata && p.metadata.widgetOrder && p.metadata.widgetOrder && p.metadata.widgetOrder.value && (+p.metadata.widgetOrder.value) === 0
  }) : null

  let c = promoted ? promotedEquipmentContext(promoted, config, itemNameAsFooterOrLocation) : itemDefaultListComponent(item, itemNameAsFooterOrLocation)
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
          default: item.equipmentOrPoints.filter((i) => { return i !== promoted }).map((i) => itemAccordionEquipmentComponent(i, config, false))
        }
      }
    ]
  }

  return c
}

export function equipmentListComponent (items, config, isLocationContext) {
  let components = []
  const isAccordion = config && config.equipmentNesting && config.equipmentNesting === 'accordion'
  if (!isAccordion) {
    const standaloneEquipment = items.filter((eqpt) => eqpt.equipmentOrPoints.length === 0).map((eqpt) => itemDefaultListComponent(eqpt))
    const equipmentWithPoints = items.filter((eqpt) => eqpt.equipmentOrPoints.length !== 0).map((eqpt) => {
      return [
        {
          component: 'oh-list-item',
          config: {
            title: isLocationContext ? (eqpt.label || eqpt.name) : [itemPathLabel(eqpt), eqpt.label || eqpt.name].filter((label) => label && label.length > 0).join(' > '),
            divider: true
          }
        },
        ...eqpt.equipmentOrPoints.map((p) => itemDefaultListComponent(p))
      ]
    })
    components = [...standaloneEquipment, ...equipmentWithPoints].flat()
  } else {
    components = items.map((item) => itemAccordionEquipmentComponent(item, config || {}, isLocationContext ? false : itemPathLabel(item)))
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
