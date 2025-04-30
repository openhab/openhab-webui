/* Determine the appropriate default representation of an item when displayed standalone.
   Users may override it by specifying the component's name and configuration
   in the "widget" metadata namespace of the item
 */

import store from '@/js/store'

export default function itemDefaultStandaloneComponent (item) {
  const stateDescription = item.stateDescription || {}
  const metadata = (item.metadata && item.metadata.widget) ? item.metadata.widget : {}
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
      if (store.getters.semanticClasses.Points[tag]) {
        semanticClass = tag
      }
      if (store.getters.semanticClasses.Properties[tag]) {
        semanticProperty = tag
      }
    })

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
          lazyFadeIn: true,
          action: 'photos',
          actionPhotos: [{ item: item.name }]
        }
      }
    }

    if ((semanticClass === 'Control' || semanticClass === 'Setpoint') && !stateDescription.readOnly) {
      if (item.type === 'DateTime') {
        component = {
          component: 'oh-input-card',
          config: {
            type: 'datetime-local',
            sendButton: true
          }
        }
      }
      if (item.type === 'Number') {
        component = {
          component: 'oh-input-card',
          config: {
            type: 'number',
            inputmode: 'decimal',
            sendButton: true
          }
        }
      }
      if (item.type === 'Number:Temperature' || semanticProperty === 'Temperature') {
        component = {
          component: 'oh-stepper-card',
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
    }

    if (semanticClass === 'Switch' && !stateDescription.readOnly) {
      component = {
        component: 'oh-toggle-card'
      }
    }
  }

  if (!component) {
    component = {
      component: 'oh-label-card'
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

  return component
}
