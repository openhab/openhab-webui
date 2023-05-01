/*
 * Field allowing to pick the name of an item from the model
 */

import Blockly from 'blockly'
import ModelPickerPopup from '@/components/model/model-picker-popup.vue'

export class FieldItemModelPicker extends Blockly.FieldTextInput {
  constructor (optValue, optValidator, optConfig) {
    super(optValue, optValidator, optConfig)
    if (optConfig.f7) this.f7 = optConfig.f7
  }

  static fromJson (options) {
    return new FieldItemModelPicker(options['options'], undefined, options)
  }

  showEditor_ (options) {
    if (this.f7) {
      const itemsPicked = (value) => {
        this.value_ = value.label
        this.data = [value.name, value.label]
        this.setEditorValue_(this.label)
      }
      const popup = {
        component: ModelPickerPopup
      }

      this.f7.views.main.router.navigate({
        url: 'pick-from-model',
        route: {
          path: 'pick-from-model',
          popup
        }
      }, {
        props: {
          value: this.value_,
          multiple: false
        }
      })

      this.f7.once('itemsPicked', itemsPicked)
      this.f7.once('modelPickerClosed', () => {
        this.f7.off('itemsPicked', itemsPicked)
      })
    }
  }
}

Blockly.fieldRegistry.register('oh_item_field', FieldItemModelPicker)
