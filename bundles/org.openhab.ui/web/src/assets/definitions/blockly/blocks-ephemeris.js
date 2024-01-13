/*
* Ephemeris provides calendar related information
* @author stefan.hoehn
*
* See more background info on openHAB ephemeris here: https://www.openhab.org/docs/configuration/actions.html#ephemeris
* See usage discussion here: https://community.openhab.org/t/wip-ephemeris-documentation/84536
* supports jsscripting
*/
import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript.js'

export default function (f7, isGraalJs) {
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
  javascriptGenerator['oh_ephemeris_check'] = function (block) {
    const ephemeris = (isGraalJs) ? 'actions.Ephemeris' : addEphemeris()
    const dayInfo = javascriptGenerator.valueToCode(block, 'dayInfo', javascriptGenerator.ORDER_NONE)
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
    return [code, javascriptGenerator.ORDER_FUNCTION_CALL]
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
  javascriptGenerator['oh_ephemeris_getHolidayName'] = function (block) {
    const ephemeris = (isGraalJs) ? 'actions.Ephemeris' : addEphemeris()
    const dayInfo = javascriptGenerator.valueToCode(block, 'dayInfo', javascriptGenerator.ORDER_NONE)
    return [`${ephemeris}.getBankHolidayName(${dayInfo})`, javascriptGenerator.ORDER_NONE]
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
  javascriptGenerator['oh_ephemeris_getDaysUntilHoliday'] = function (block) {
    const ephemeris = (isGraalJs) ? 'actions.Ephemeris' : addEphemeris()
    const holidayName = javascriptGenerator.valueToCode(block, 'holidayName', javascriptGenerator.ORDER_NONE)
    return [`${ephemeris}.getDaysUntil(${holidayName})`, javascriptGenerator.ORDER_NONE]
  }

  /*
  * Add ephemeris support to rule
  */
  function addEphemeris () {
    return javascriptGenerator.provideFunction_(
      'ephemeris',
      ['var ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.Ephemeris");'])
  }
}
