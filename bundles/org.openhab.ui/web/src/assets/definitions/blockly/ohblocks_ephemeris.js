import Blockly from 'blockly'
import { FieldItemModelPicker } from './ohitemfield'

export default function defineOHBlocks_Ephemeris(f7) {

  Blockly.Blocks['oh_ephemeris_basic'] = {
    init: function() {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([['isWeekend','isWeekend'], ['getBankHolidayName','getBankHolidayName'], ['getNextBankHoliday','getNextBankHoliday'], ['isBankHoliday','isBankHoliday']]), 'type')
      this.setOutput(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  };

  Blockly.JavaScript['oh_ephemeris_basic'] = function (block) {
    const ephemeris = Blockly.JavaScript.provideFunction_(
      'Ephemeris',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.Ephemeris");'])
    var type = block.getFieldValue('type');
    var code = ephemeris + '.' + type + '()';
    return [code, Blockly.JavaScript.ORDER_NONE];
  };
  
  Blockly.Blocks['oh_ephemeris_offset'] = {
    init: function() {
      this.appendValueInput('offset')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown([['isWeekend', 'isWeekend'], ['getBankHolidayName', 'getBankHolidayName'], ['getNextBankHoliday', 'getNextBankHoliday'], ['isBankHoliday', 'isBankHoliday']]), 'type')
        .appendField('Offset Days')
      this.setOutput(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  };  

  Blockly.JavaScript['oh_ephemeris_offset'] = function (block) {
    const ephemeris = Blockly.JavaScript.provideFunction_(
      'Ephemeris',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.Ephemeris");'])
    var type = block.getFieldValue('type')
    var offsetValue = Blockly.JavaScript.valueToCode(block, 'NAME', Blockly.JavaScript.ORDER_ATOMIC)
    var code = ephemeris + '.' + type + '(' + offsetValue + ')'
    return [code, Blockly.JavaScript.ORDER_NONE]
  };


  Blockly.Blocks['oh_Ephemeris_getBankHolidayName'] = {
    init: function () {
      this.appendValueInput('offsetDays')
        .appendField('getBankHolidayName')
      this.setColour(0)
      this.setInputsInline(true)
      this.setTooltip('name of the holiday today, or null if today is not a bank holiday')
      this.setOutput(true, null)
    }
  }

  Blockly.JavaScript['oh_Ephemeris_getBankHolidayName'] = function (block) {
    const ephemeris = Blockly.JavaScript.provideFunction_(
      'Ephemeris',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.Ephemeris");'])
    var code = ephemeris + '.getBankHolidayName'
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
    }
  }

  Blockly.JavaScript['oh_Ephemeris_getNextBankHoliday'] = function (block) {
    const ephemeris = Blockly.JavaScript.provideFunction_(
      'Ephemeris',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.Ephemeris");'])
    var code = ephemeris + '.getNextBankHoliday'
    return [code, 0]
  }

  Blockly.Blocks['oh_Ephemeris_isBankHoliday'] = {
    init: function () {
      this.appendValueInput('offsetDays')
        .appendField('isBankHoliday')
      this.setColour(0)
      this.setInputsInline(true)
      this.setTooltip('true if today is a bank holiday (see below), false otherwise')
      this.setOutput(true, null)
    }
  }

  Blockly.JavaScript['oh_Ephemeris_isBankHoliday'] = function (block) {
    const ephemeris = Blockly.JavaScript.provideFunction_(
      'Ephemeris',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.Ephemeris");'])
    var code = ephemeris + '.isBankHoliday'
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
    }
  }

  Blockly.JavaScript['oh_Ephemeris_isWeekend'] = function (block) {
    const ephemeris = Blockly.JavaScript.provideFunction_(
      'Ephemeris',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.Ephemeris");'])
    var code = ephemeris + '.isWeekend'
    return [code, 0]
  }
}
