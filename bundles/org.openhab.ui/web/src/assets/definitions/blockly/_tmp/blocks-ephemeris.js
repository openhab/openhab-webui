/*
* Ephemeris provides calendar related information
* This code has been originally provided by https://github.com/bigbasec
*
* See more background info on openHAB ephemeris here: https://www.openhab.org/docs/configuration/actions.html#ephemeris
*/

import Blockly from 'blockly'
import { FieldItemModelPicker } from './ohitemfield'

export default function defineOHBlocks_Ephemeris (f7) {
  Blockly.Blocks['oh_ephemeris_basic'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([['isWeekend', 'isWeekend'], ['getBankHolidayName', 'getBankHolidayName'], ['getNextBankHoliday', 'getNextBankHoliday'], ['isBankHoliday', 'isBankHoliday']]), 'type')
      this.setOutput(true, null)
      this.setColour(0)
      this.setTooltip('provides calendar related information')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/actions.html#ephemeris')
    }
  }

  Blockly.JavaScript['oh_ephemeris_basic'] = function (block) {
    addEphemeris()
    let type = block.getFieldValue('type')
    let code = `ephemeris.${type}()`
    return [code, Blockly.JavaScript.ORDER_NONE]
  }

  Blockly.Blocks['oh_ephemeris_offset'] = {
    init: function () {
      this.appendValueInput('offset')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown([['isWeekend', 'isWeekend'], ['getBankHolidayName', 'getBankHolidayName'], ['getNextBankHoliday', 'getNextBankHoliday'], ['isBankHoliday', 'isBankHoliday']]), 'type')
        .appendField('offset days')
      this.setOutput(true, null)
      this.setColour(0)
      this.setTooltip('the offset to the given type in days')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/actions.html#ephemeris')
    }
  }

  Blockly.JavaScript['oh_ephemeris_offset'] = function (block) {
    addEphemeris()
    let type = block.getFieldValue('type')
    let offsetValue = Blockly.JavaScript.valueToCode(block, 'offset', Blockly.JavaScript.ORDER_ATOMIC)
    let code = `ephemeris.${type}(${offsetValue})`
    return [code, Blockly.JavaScript.ORDER_NONE]
  }

  Blockly.Blocks['oh_ephemeris_getBankHolidayName'] = {
    init: function () {
      this.appendValueInput('offsetDays')
        .appendField('getBankHolidayName')
      this.setColour(0)
      this.setInputsInline(true)
      this.setTooltip('name of the holiday today, or null if today is not a bank holiday')
      this.setOutput(true, null)
      this.setHelpUrl('https://www.openhab.org/docs/configuration/actions.html#ephemeris')
    }
  }

  Blockly.JavaScript['oh_ephemeris_getBankHolidayName'] = function (block) {
    addEphemeris()
    let code = 'ephemeris.getBankHolidayName'
    return [code, 0]
  }

  Blockly.Blocks['oh_Ephemeris_getNextBankHoliday'] = {
    init: function () {
      this.appendValueInput('offsetDays')
        .appendField('getNextBankHoliday')
      this.setColour(0)
      this.setInputsInline(true)
      this.setTooltip('name of the next bank holiday')
      this.setOutput(true, null)
      this.setHelpUrl('https://www.openhab.org/docs/configuration/actions.html#ephemeris')
    }
  }

  Blockly.JavaScript['oh_Ephemeris_getNextBankHoliday'] = function (block) {
    addEphemeris()
    let code = 'ephemeris.getNextBankHoliday'
    return [code, 0]
  }

  Blockly.Blocks['oh_Ephemeris_isBankHoliday'] = {
    init: function () {
      this.appendValueInput('offsetDays')
        .appendField('isBankHoliday')
      this.setColour(0)
      this.setInputsInline(true)
      this.setTooltip('true if today is a bank holiday, false otherwise')
      this.setOutput(true, null)
      this.setHelpUrl('https://www.openhab.org/docs/configuration/actions.html#ephemeris')
    }
  }

  Blockly.JavaScript['oh_Ephemeris_isBankHoliday'] = function (block) {
    addEphemeris()
    let code = 'ephemeris.isBankHoliday'
    return [code, 0]
  }

  Blockly.Blocks['oh_Ephemeris_isWeekend'] = {
    init: function () {
      this.appendValueInput('offsetDays')
        .appendField('isWeekend')
      this.setColour(0)
      this.setInputsInline(true)
      this.setTooltip('true if today is a weekend, false otherwise')
      this.setOutput(true, null)
      this.setHelpUrl('https://www.openhab.org/docs/configuration/actions.html#ephemeris')
    }
  }

  Blockly.JavaScript['oh_Ephemeris_isWeekend'] = function (block) {
    addEphemeris()
    let code = 'ephemeris.isWeekend'
    return [code, 0]
  }

  function addEphemeris () {
    Blockly.JavaScript.provideFunction_(
      'ephemeris',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type(\'org.openhab.core.model.script.actions.Ephemeris\')'])
  }
}
