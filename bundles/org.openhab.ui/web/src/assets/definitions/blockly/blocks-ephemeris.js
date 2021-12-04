/*
* Ephemeris provides calendar related information
* @author stefan.hoehn
*
* See more background info on openHAB ephemeris here: https://www.openhab.org/docs/configuration/actions.html#ephemeris
* See usage discussion here: https://community.openhab.org/t/wip-ephemeris-documentation/84536
*/
import Blockly from 'blockly'
import { FieldDatePicker } from './fields/date-field'

export default function (f7) {
  /*
  * Typed (EphemerisDay) block that can be used with the Ephemeris check block
  * Note that the block basically returns a zero day offset for the check
  * Blockly part
  */
  Blockly.Blocks['oh_ephemeris_today'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('today')
      this.setOutput(true, 'EphemerisDay')
      this.setColour(70)
      this.setTooltip('today\'s date for ephemeris check block')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/actions.html#ephemeris')
    }
  }

  /*
  * Typed block that can be used with Ephemeris check block
  * Code part
  */
  Blockly.JavaScript['oh_ephemeris_today'] = function (block) {
    addEphemeris()
    let code = '0'
    return [code, Blockly.JavaScript.ORDER_NONE]
  }

  /*
  * Typed (EphemerisDay) block with a day positve or negative offset that can be used with the Ephemeris check block
  * Blockly part
  */
  Blockly.Blocks['oh_ephemeris_today_offset'] = {
    init: function () {
      this.appendValueInput('offset')
        .setCheck('Number')
        .appendField('today +/-')
      this.appendDummyInput()
        .appendField('days')
      this.setOutput(true, 'EphemerisDay')
      this.setColour(70)
      this.setTooltip('today with a positive or negative day offset for ephemeris check block')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/actions.html#ephemeris')
    }
  }

  /*
  * Typed (EphemerisDay) block with a day positve or negative offset that can be used with the Ephemeris check block
  * Code part
  */
  Blockly.JavaScript['oh_ephemeris_today_offset'] = function (block) {
    let offsetValue = Blockly.JavaScript.valueToCode(block, 'offset', Blockly.JavaScript.ORDER_ATOMIC)
    let code = `${offsetValue}`
    return [code, Blockly.JavaScript.ORDER_NONE]
  }

  /*
  * Typed (EphemerisDate) block that can be used with the Ephemeris check block
  * Allows the selection of a date. The default is the current date
  * Blockly part
  */
  Blockly.Blocks['oh_ephemeris_date'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('date')
        .appendField(new FieldDatePicker('', null, { f7 }, 'date'), 'day')
      this.setOutput(true, 'EphemerisDate')
      this.setColour(70)
      this.setTooltip('Calender entry for ephemeris check block or other openHAB Blocks that require a day input')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/actions.html#ephemeris')
    }
  }

  /*
  * Typed (EphemerisDate) block that can be used with the Ephemeris check block
  * Code part
  */
  Blockly.JavaScript['oh_ephemeris_date'] = function (block) {
    const { dtf, zdt, getZonedDateTime } = addDateSupport()
    let day = block.getFieldValue('day')
    let code = `${getZonedDateTime}('${day}')`
    return [code, Blockly.JavaScript.ORDER_NONE]
  }

  /*
  * Typed (EphemerisDate) block that can be used with the Ephemeris check block
  * Allows input as string in the format yyyy-MM-dd
  * Blockly part
  */
  Blockly.Blocks['oh_ephemeris_date_text'] = {
    init: function () {
      this.appendValueInput('day')
        .appendField('date')
      this.setOutput(true, 'EphemerisDate')
      this.setColour(70)
      this.setTooltip('Calender entry as yyyy-MM-dd for ephemeris check block or other openHAB Blocks that require a day input')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/actions.html#ephemeris')
    }
  }

  /*
  * Typed (EphemerisDate) block that can be used with the Ephemeris check block
  * Code part
  */
  Blockly.JavaScript['oh_ephemeris_date_text'] = function (block) {
    const { dtf, zdt, getZonedDateTime } = addDateSupport()
    let day = Blockly.JavaScript.valueToCode(block, 'day', Blockly.JavaScript.ORDER_ATOMIC)
    let code = `${getZonedDateTime}(${day})`
    return [code, Blockly.JavaScript.ORDER_NONE]
  }

  /*
  * Returns a string representation of an ephemeris date
  * Blockly part
  */
  Blockly.Blocks['oh_ephemeris_text_of_date'] = {
    init: function () {
      this.appendValueInput('date')
        .appendField('text of')
        .setCheck('EphemerisDate')
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([['without time', 'without'], ['with time', 'with']]), 'withtime')

      this.setOutput(true, 'String')
      this.setColour(160)
      this.setTooltip('converts an ephemeris date into a date string')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/actions.html#ephemeris')
    }
  }

  /*
  * Returns a string representation of an ephemeris date
  * Code part
  */
  Blockly.JavaScript['oh_ephemeris_text_of_date'] = function (block) {
    const { dtf, zdt, getZonedDatetime } = addDateSupport()
    let date = Blockly.JavaScript.valueToCode(block, 'date', Blockly.JavaScript.ORDER_ATOMIC)
    let withtime = block.getFieldValue('withtime')
    let pattern = 'yyyy-MM-dd'
    if (withtime === 'with') {
      pattern = 'yyyy-MM-dd HH:mm:ss'
    }
    let code = `${date}.format(${dtf}.ofPattern('${pattern}'))`
    return [code, Blockly.JavaScript.ORDER_NONE]
  }

  /*
  * Checks if the provided day is a
  * - bank holiday (needs to be configured in openHAB
  * - weekend
  * - weekday
  * Only EphemerisDay and EphemerisDate blocks are allowed as an input
  * Blockly part
  */
  Blockly.Blocks['oh_ephemeris_check'] = {
    init: function () {
      this.appendValueInput('dayInfo')
        .setCheck(['EphemerisDay', 'EphemerisDate'])
      this.appendDummyInput()
        .appendField('is')
        .appendField(new Blockly.FieldDropdown([['a holiday', 'holiday'], ['the weekend', 'weekend'], ['a weekday', 'weekday']]), 'checkType')
      this.setColour(0)
      this.setInputsInline(true)
      this.setTooltip('checks if the given day is a holiday, weekend or weekday')
      this.setOutput(true, null)
      this.setHelpUrl('https://www.openhab.org/docs/configuration/actions.html#ephemeris')
    }
  }

  /*
  * Checks if the provided day is a bank holiday, weekend or weekday
  * Code part
  */
  Blockly.JavaScript['oh_ephemeris_check'] = function (block) {
    const ephemeris = addEphemeris()

    let dayInfo = Blockly.JavaScript.valueToCode(block, 'dayInfo', Blockly.JavaScript.ORDER_NONE)
    let checkType = block.getFieldValue('checkType')
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
  * Only EphemerisDay and EphemerisDate blocks are allowed as an input
  * Blockly part
  */
  Blockly.Blocks['oh_ephemeris_getHolidayName'] = {
    init: function () {
      this.appendValueInput('dayInfo')
        .appendField('holiday name for')
        .setCheck(['EphemerisDay', 'EphemerisDate'])
      this.setColour(0)
      this.setInputsInline(true)
      this.setTooltip('name of the holiday for the given day')
      this.setOutput(true, null)
      this.setHelpUrl('https://www.openhab.org/docs/configuration/actions.html#ephemeris')
    }
  }

  /*
  * Retrieve the current bonk holiday name
  * Code part
  */
  Blockly.JavaScript['oh_ephemeris_getHolidayName'] = function (block) {
    const ephemeris = addEphemeris()
    let dayInfo = Blockly.JavaScript.valueToCode(block, 'dayInfo', Blockly.JavaScript.ORDER_NONE)
    let code = `${ephemeris}.getBankHolidayName(${dayInfo})`
    return [code, Blockly.JavaScript.ORDER_NONE]
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
      this.setHelpUrl('https://www.openhab.org/docs/configuration/actions.html#ephemeris')
    }
  }

  /*
  * Retrieve the number of days from today until the given bank holiday name
  * Code part
  */
  Blockly.JavaScript['oh_ephemeris_getDaysUntilHoliday'] = function (block) {
    const ephemeris = addEphemeris()
    let holidayName = Blockly.JavaScript.valueToCode(block, 'holidayName', Blockly.JavaScript.ORDER_NONE)
    let code = `${ephemeris}.getDaysUntil(${holidayName})`
    return [code, Blockly.JavaScript.ORDER_NONE]
  }

  /*
  * Add ephemeris support to rule
  */
  function addEphemeris () {
    return Blockly.JavaScript.provideFunction_(
      'ephemeris',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.Ephemeris");'])
  }

  /*
  * Add ZoneDateTime and DateTimeFormatter support to rule
  */
  function addDateSupport () {
    const dtf = Blockly.JavaScript.provideFunction_(
      'dtf',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("java.time.format.DateTimeFormatter");'])
    const zdt = Blockly.JavaScript.provideFunction_(
      'zdt',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("java.time.ZonedDateTime");'])
    const getZonedDateTime = Blockly.JavaScript.provideFunction_(
      'getZonedDateTime',
      [
        'function ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' (datetime) {',
        `  return ${zdt}.parse(datetime + ' 00:00:00 +00:00', dtf.ofPattern('yyyy-MM-dd HH:mm:ss z'))`,
        '}'
      ])
    return { dtf, zdt, getZonedDateTime }
  }
}
