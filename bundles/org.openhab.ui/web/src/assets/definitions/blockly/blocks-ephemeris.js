/*
* Ephemeris provides calendar related information
* @author stefan.hoehn
*
* See more background info on openHAB ephemeris here: https://www.openhab.org/docs/configuration/actions.html#ephemeris
* See usage discussion here: https://community.openhab.org/t/wip-ephemeris-documentation/84536
* supports jsscripting
*/
import Blockly from 'blockly'

export default function (f7) {
  /*
  * Checks if the provided day is a
  * - bank holiday (needs to be configured in openHAB
  * - weekend
  * - weekday
  * Only DayOffset and ZonedDateTime blocks are allowed as an input
  * Blockly part
  */
  Blockly.Blocks['oh_ephemeris_check'] = {
    init: function () {
      this.appendValueInput('dayInfo')
        .setCheck(['DayOffset', 'ZonedDateTime'])
      this.appendDummyInput()
        .appendField('is')
        .appendField(new Blockly.FieldDropdown([['a holiday', 'holiday'], ['the weekend', 'weekend'], ['a weekday', 'weekday']]), 'checkType')
      this.setColour(0)
      this.setInputsInline(true)
      this.setTooltip('checks if the given day is a holiday, weekend or weekday')
      this.setOutput(true, null)
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-ephemeris.html#holiday-weekend-or-weekday-check')
    }
  }

  /*
  * Checks if the provided day is a bank holiday, weekend or weekday
  * Code part
  */
  Blockly.JavaScript['oh_ephemeris_check'] = function (block) {
    const ephemeris = (this.workspace && this.workspace.jsScriptingAvailable) ? 'actions.Ephemeris' : addEphemeris()
    const dayInfo = Blockly.JavaScript.valueToCode(block, 'dayInfo', Blockly.JavaScript.ORDER_NONE)
    const checkType = block.getFieldValue('checkType')
    let code = ''

    switch (checkType) {
      case 'weekend':
        code += `${ephemeris}.isWeekend(${dayInfo})`
        break
      case 'weekday':
        code += `!${ephemeris}.isWeekend(${dayInfo})`
        break
      case 'holiday':
        code += `${ephemeris}.isBankHoliday(${dayInfo})`
        break
    }
    return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL]
  }

  /*
  * Retrieve the current bonk holiday name
  * Only DayOffset and ZonedDateTime blocks are allowed as an input
  * Blockly part
  */
  Blockly.Blocks['oh_ephemeris_getHolidayName'] = {
    init: function () {
      this.appendValueInput('dayInfo')
        .appendField('holiday name for')
        .setCheck(['DayOffset', 'ZonedDateTime'])
      this.setColour(0)
      this.setInputsInline(true)
      this.setTooltip('name of the holiday for the given day')
      this.setOutput(true, null)
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-ephemeris.html#get-the-holiday-name-for-a-particular-date')
    }
  }

  /*
  * Retrieve the current bonk holiday name
  * Code part
  */
  Blockly.JavaScript['oh_ephemeris_getHolidayName'] = function (block) {
    const ephemeris = (this.workspace && this.workspace.jsScriptingAvailable) ? 'actions.Ephemeris' : addEphemeris()
    const dayInfo = Blockly.JavaScript.valueToCode(block, 'dayInfo', Blockly.JavaScript.ORDER_NONE)
    return [`${ephemeris}.getBankHolidayName(${dayInfo})`, Blockly.JavaScript.ORDER_NONE]
  }

  /*
  * Retrieve the number of days from today until the given bank holiday name
  * Blockly part
  */
  Blockly.Blocks['oh_ephemeris_getDaysUntilHoliday'] = {
    init: function () {
      this.appendValueInput('holidayName')
        .appendField('days until holiday named')
        .setCheck('String')
      this.setColour(0)
      this.setInputsInline(true)
      this.setTooltip('days from today until the given bank holiday name')
      this.setOutput(true, null)
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-ephemeris.html#get-the-number-of-days-until-a-specific-holiday')
    }
  }

  /*
  * Retrieve the number of days from today until the given bank holiday name
  * Code part
  */
  Blockly.JavaScript['oh_ephemeris_getDaysUntilHoliday'] = function (block) {
    const ephemeris = (this.workspace && this.workspace.jsScriptingAvailable) ? 'actions.Ephemeris' : addEphemeris()
    const holidayName = Blockly.JavaScript.valueToCode(block, 'holidayName', Blockly.JavaScript.ORDER_NONE)
    return [`${ephemeris}.getDaysUntil(${holidayName})`, Blockly.JavaScript.ORDER_NONE]
  }

  /*
  * Add ephemeris support to rule
  */
  function addEphemeris () {
    return Blockly.JavaScript.provideFunction_(
      'ephemeris',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.Ephemeris");'])
  }
}
