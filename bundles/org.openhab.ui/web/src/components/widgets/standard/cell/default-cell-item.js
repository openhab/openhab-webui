/* Determine the appropriate default representation of an item when displayed in a cell.
   Users may override it by specifying the component's name and configuration
   in the "cellWidget" metadata namespace of the item
 */

export default function itemDefaultCellComponent (item, itemNameAsFooter) {
  const stateDescription = item.stateDescription || {}
  const metadata = (item.metadata && item.metadata.cellWidget) ? item.metadata.cellWidget : {}
  let component = null
  let semanticClass = {}
  let semanticProperty = {}

  if (metadata.value && metadata.value !== ' ') {
    component = {
      component: metadata.value,
      config: Object.assign({}, metadata.config)
    }
  } else {
    if (item.metadata?.semantics?.value) {
      const semantics = item.metadata.semantics.value.split('_')
      const semanticType = semantics[0]
      const tag = semantics.at(-1)
      if (semanticType === 'Point') {
        semanticClass = tag
        semanticProperty = item.metadata.semantics.config?.relatesTo?.split('_')?.at(-1) || {}
      }
    }

    if (item.type === 'Switch' && !stateDescription.readOnly) {
      component = {
        component: 'oh-cell',
        config: {
          color: 'blue',
          action: 'toggle',
          actionItem: item.name,
          actionCommand: 'ON',
          actionCommandAlt: 'OFF'
        }
      }
    }

    if (item.type === 'Dimmer' && !stateDescription.readOnly) {
      component = {
        component: 'oh-slider-cell',
        config: {
          color: 'blue',
          action: 'toggle',
          actionItem: item.name,
          actionCommand: 'ON',
          actionCommandAlt: 'OFF',
          scaleSubSteps: 5,
          min: stateDescription.minimum,
          max: stateDescription.maximum,
          step: stateDescription.step
        }
      }
    }

    if (item.type === 'Color' && !stateDescription.readOnly) {
      component = {
        component: 'oh-colorpicker-cell',
        config: {
          color: 'yellow',
          action: 'toggle',
          actionItem: item.name,
          actionCommand: 'ON',
          actionCommandAlt: 'OFF'
        }
      }
    }

    if (item.type === 'Rollershutter' && !stateDescription.readOnly) {
      component = {
        component: 'oh-rollershutter-cell'
      }
    }

    // if (item.type === 'Player' && !stateDescription.readOnly) {
    //   component = {
    //     component: 'oh-player-item'
    //   }
    // }

    // if (item.type === 'Image') {
    //   component = {
    //     component: 'oh-list-item',
    //     config: {
    //       action: 'photos',
    //       actionPhotos: [{ item: item.name }]
    //     }
    //   }
    // }

    if ((semanticClass === 'Control' || semanticClass === 'Setpoint') && !stateDescription.readOnly) {
      if (item.type === 'Number:Temperature' || semanticProperty === 'Temperature') {
        component = {
          component: 'oh-knob-cell',
          config: {
            min: stateDescription.minimum,
            max: stateDescription.maximum,
            stepSize: stateDescription.step
          }
        }
      }
      if (semanticProperty === 'ColorTemperature' || semanticProperty === 'Level' || semanticProperty === 'SoundVolume') {
        component = {
          component: 'oh-slider-cell',
          config: {
            color: 'blue',
            action: 'toggle',
            actionItem: item.name,
            actionCommand: 'ON',
            actionCommandAlt: 'OFF',
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
        component: 'oh-cell',
        config: {
          color: 'blue',
          action: 'toggle',
          actionItem: item.name,
          actionCommand: 'ON',
          actionCommandAlt: 'OFF'
        }
      }
    }
  }

  if (!component) {
    component = {
      component: 'oh-label-cell'
    }

    if (item.type.indexOf('Number') === 0 && (!item.commandDescription || !item.commandDescription.commandOptions || stateDescription.readOnly)) {
      component.config = {
        trendItem: item.name,
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
  if (item.label && itemNameAsFooter && !component.config.footer) component.config.footer = item.name
  component.config.stateAsHeader = true
  if (component.component === 'oh-label-cell') component.config.expandable = false

  return component
}
