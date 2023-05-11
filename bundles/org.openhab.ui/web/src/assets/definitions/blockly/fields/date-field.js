/*
 * Field allowing to pick a date from a calendar
 */

import Blockly from 'blockly'
import dayjs from 'dayjs'

export class FieldDatePicker extends Blockly.FieldTextInput {
  constructor (optValue, optValidator, optConfig) {
    let value = optValue
    if (value === '') {
      value = dayjs().format('YYYY-MM-DD')
    }
    super(value, optValidator, optConfig)
    if (optConfig.f7) this.f7 = optConfig.f7
  }

  static fromJson (options) {
    return new FieldDatePicker(options['options'], undefined, options)
  }

  showEditor_ (options) {
    if (this.f7) {
      let inputEl = document.createElement('input')
      inputEl.setAttribute('type', 'text')
      inputEl.setAttribute('value', this.value_)
      options.target.appendChild(inputEl)
      const self = this
      if (this.calendarPicker_) {
        this.calendarPicker_.setValue([this.value_])
      } else {
        this.calendarPicker_ = this.f7.calendar.create({
          inputEl: options.target,
          openIn: 'popup',
          closeOnSelect: true,
          value: (this.value_) ? [this.value_] : undefined,
          on: {
            change (calendar, value) {
              if (value.length < 1) return
              if (!value[0].toISOString) return
              self.setEditorValue_(dayjs(value[0]).format('YYYY-MM-DD'))
            }
          }
        })
      }
      this.calendarPicker_.open()
    }
  }

  dispose () {
    if (this.calendarPicker_) this.calendarPicker_.destroy()
    super.dispose()
  }
}

Blockly.fieldRegistry.register('oh_date_field', FieldDatePicker)
