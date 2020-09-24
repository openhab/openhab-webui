/* Determine the appropriate default representation of an item when displayed in a cell.
   Users may override it by specifying the component's name and configuration
   in the "cellWidget" metadata namespace of the item
 */

export default function itemDefaultCellComponent (item, itemNameAsFooter) {
  const stateDescription = item.stateDescription || {}
  let component = null

  if (item.metadata && item.metadata.cellWidget) {
    component = {
      component: item.metadata.cellWidget.value,
      config: item.metadata.cellWidget.config
    }
  } else {
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
  }

  if (!component) {
    component = {
      component: 'oh-label-cell'
    }

    if (item.type.indexOf('Number:') === 0) {
      component.config = {
        trendItem: item.name,
        action: 'analyze',
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
  component.config.item = item.name
  component.config.title = item.label || item.name
  if (item.label && itemNameAsFooter) component.config.footer = item.name
  component.config.stateAsHeader = true
  if (component.component === 'oh-label-cell') component.config.expandable = false

  return component
}
