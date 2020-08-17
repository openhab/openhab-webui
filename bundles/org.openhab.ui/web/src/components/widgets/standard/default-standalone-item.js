/* Determine the appropriate default representation of an item when displayed standalone.
   Users may override it by specifying the component's name and configuration
   in the "widget" metadata namespace of the item
 */

export default function itemDefaultStandaloneComponent (item) {
  const stateDescription = item.stateDescription || {}
  let component = null

  if (item.metadata && item.metadata.widget) {
    component = {
      component: item.metadata.widget.value,
      config: item.metadata.widget.config
    }
  } else {
    if (item.type === 'Switch' && !stateDescription.readOnly) {
      component = {
        component: 'oh-toggle-card'
      }
    }

    if (item.type === 'Dimmer' && !stateDescription.readOnly) {
      component = {
        component: 'oh-slider-card',
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
        component: 'oh-colorpicker-card',
        config: {
          sliderLabel: true,
          sliderValue: true
        }
      }
    }

    if (item.type === 'Rollershutter' && !stateDescription.readOnly) {
      component = {
        component: 'oh-rollershutter-card',
        config: {
          vertical: true
        }
      }
    }

    if (item.type === 'Player' && !stateDescription.readOnly) {
      component = {
        component: 'oh-player-card',
        config: {
          vertical: true
        }
      }
    }

    if (item.type === 'Image') {
      component = {
        component: 'oh-image-card',
        config: {
          lazy: true,
          lazyFadeIn: true
        }
      }
    }
  }

  if (!component) {
    component = {
      component: 'oh-label-card'
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
        actionItem: item.name,
        actionOptions: item.commandDescription.commandOptions.map((o) => (o.label) ? o.command + '=' + o.label : o.command).join(',')
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

  return component
}
