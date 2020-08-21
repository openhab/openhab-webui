/* Determine the appropriate default representation of an item when displayed in a list.
   Users may override it by specifying the component's name and configuration
   in the "listWidget" metadata namespace of the item
 */

export default function itemDefaultListComponent (item, itemNameAsFooter) {
  const stateDescription = item.stateDescription || {}
  let component = null

  if (item.metadata && item.metadata.listWidget) {
    component = {
      component: item.metadata.listWidget.value,
      config: item.metadata.listWidget.config
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

    if (item.type.indexOf('Number:') === 0) {
      component.config = {
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
  if (item.category) component.config.icon = 'oh:' + item.category
  if (item.label && itemNameAsFooter) component.config.footer = item.name
  if (!item.category) component.config.fallbackIconToInitial = true

  return component
}
