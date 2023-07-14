/*
 * Field allowing to pick the name of a thing from the model
 */

import Blockly from 'blockly'
import ThingPicker from '@/components/config/controls/thing-picker.vue'

export class FieldThingPicker extends Blockly.FieldTextInput {
  constructor (optValue, optValidator, optConfig) {
    super(optValue, optValidator, optConfig)
    if (optConfig.f7) this.f7 = optConfig.f7
  }

  static fromJson (options) {
    return new FieldThingPicker(options['options'], undefined, options)
  }

  showEditor_ (options) {
    if (this.f7) {
      const itemsPicked = (value) => {
        this.setEditorValue_(value)
      }
      const popup = {
        component: ThingPicker
      }

      this.f7.views.main.router.navigate({
        url: 'thing-select',
        route: {
          path: 'thing-select',
          popup
        }
      }, {
        props: {
          value: this.value_,
          multiple: false,
          openOnReady: true
        }
      })
      this.f7.once('thingPicked', itemsPicked)
    }
  }
}

Blockly.fieldRegistry.register('oh_thing_field', FieldThingPicker)
