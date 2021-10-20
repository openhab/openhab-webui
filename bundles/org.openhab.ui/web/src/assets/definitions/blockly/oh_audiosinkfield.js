/*
* This code has been originally provided by https://github.com/bigbasec
* @author stefan.hoehn
*
* See more background info on openHAB multimedia here: https://www.openhab.org/docs/configuration/multimedia.html
*/
import Blockly from 'blockly'

export class FieldAudiosinkPicker extends Blockly.FieldTextInput {
  constructor (optValue, optValidator, optConfig) {
    super(optValue, optValidator, optConfig)
    if (optConfig.f7) this.f7 = optConfig.f7
  }

  static fromJson (options) {
    return new FieldAudiosinkPicker(options['options'], undefined, options)
  }

  showEditor_ (options) {
    if (this.f7) {
      const itemPicked = (value) => {
        this.value_ = value.id
        this.setEditorValue_(this.id)
      }

      this.f7.views.main.router.navigate({
        url: 'pick-from-audiosink',
        route: {
          path: 'pick-from-audiosink',
          popup
        }
      }, {
        props: {
          value: this.value_,
          id: this.id_
        }
      })

      this.f7.once('itemPicked', itemPicked)
      this.f7.once('audiosinkPickerClosed', () => {
        this.f7.off('itemPicked', itemPicked)
      })
    }
  }
}

Blockly.fieldRegistry.register('oh_audiosink_field', FieldAudiosinkPicker)
