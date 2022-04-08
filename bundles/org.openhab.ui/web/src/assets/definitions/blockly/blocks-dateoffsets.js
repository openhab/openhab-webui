import Blockly from 'blockly'
import { FieldDatePicker } from './fields/date-field'
import { addDateSupport } from './utils'

export default function (f7) {
  /*
  * Typed (DayOffset) block that can be used with the Ephemeris check block
  * Note that the block basically returns a zero day offset for the check
  * Blockly part
  */
  Blockly.Blocks['oh_dayoffset_today'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('today')
      this.setOutput(true, 'DayOffset')
      this.setColour(70)
      this.setTooltip('today\'s date for ephemeris check block')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-date-handling.html#today')
    }
  }

  /*
  * Typed block that can be used with Ephemeris check block
  * Code part
  */
  Blockly.JavaScript['oh_dayoffset_today'] = function (block) {
    let code = '0'
    return [code, Blockly.JavaScript.ORDER_NONE]
  }

  /*
  * Typed (DayOffset) block with a day positve or negative offset that can be used
  * Blockly part
  */
  Blockly.Blocks['oh_dayoffset'] = {
    init: function () {
      this.appendValueInput('offset')
        .setCheck('Number')
        .appendField('today +/-')
      this.appendDummyInput()
        .appendField('days')
      this.setOutput(true, 'DayOffset')
      this.setColour(70)
      this.setTooltip('today with a positive or negative day offset for ephemeris check block')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-date-handling.html#today-x-days')
    }
  }

  /*
  * Typed (DayOffset) block with a day positve or negative offset
  * Code part
  */
  Blockly.JavaScript['oh_dayoffset'] = function (block) {
    let offsetValue = Blockly.JavaScript.valueToCode(block, 'offset', Blockly.JavaScript.ORDER_ATOMIC)
    let code = `${offsetValue}`
    return [code, Blockly.JavaScript.ORDER_NONE]
  }

  /*
  * Typed (ZonedDateTime) block that adds or substracts a specified amount from the current time
  * Blockly part
  */
  Blockly.Blocks['oh_zdt_plusminus'] = {
    init: function () {
      this.appendValueInput('offset')
        .setCheck('Number')
        .appendField('now')
        .appendField(new Blockly.FieldDropdown([
          ['+', 'plus'], ['-', 'minus']]), 'plusminus')
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['seconds', 'Seconds'], ['minutes', 'Minutes'],
          ['hours', 'Hours'], ['days', 'Days'], ['weeks', 'Weeks'],
          ['months', 'Months'], ['years', 'Years']
        ]), 'period')
      this.setOutput(true, 'ZonedDateTime')
      this.setColour(70)
      this.setTooltip('today with a positive or negative day offset for ephemeris check block')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-date-handling.html#get-date-now-with-offset')
    }
  }

  /*
  * Typed (DayOffset) block with a day positve or negative offset that can be used with the Ephemeris check block
  * Code part
  */
  Blockly.JavaScript['oh_zdt_plusminus'] = function (block) {
    const { dtf, zdt, getZonedDatetime } = addDateSupport()
    let offsetValue = Blockly.JavaScript.valueToCode(block, 'offset', Blockly.JavaScript.ORDER_ATOMIC)
    let plusMinus = block.getFieldValue('plusminus')
    let period = block.getFieldValue('period')
    let code = `${zdt}.now().${plusMinus}${period}(${offsetValue})`
    return [code, Blockly.JavaScript.ORDER_ATOMIC]
  }

  /*
  * Typed date (ZonedDateTime) block that can be used with the Ephemeris check block
  * Allows the selection of a date. The default is the current date
  * Blockly part
  */
  Blockly.Blocks['oh_zdt'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('date')
        .appendField(new FieldDatePicker('', null, { f7 }, 'date'), 'day')
      this.setOutput(true, 'ZonedDateTime')
      this.setColour(70)
      this.setTooltip('Calender entry for ephemeris check block or other openHAB Blocks that require a day or date input in the format yyyy-MM-dd')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-date-handling.html#date-picker')
    }
  }

  /*
  * Typed (ZonedDateTime) block that can be used with the Ephemeris check block
  * Code part
  */
  Blockly.JavaScript['oh_zdt'] = function (block) {
    const { dtf, zdt, getZonedDateTime } = addDateSupport()
    let day = block.getFieldValue('day')
    let code = `${getZonedDateTime}('${day}')`
    return [code, Blockly.JavaScript.ORDER_NONE]
  }

  /*
  * Typed (ZonedDateTime) block that can be used with the Ephemeris check block
  * Allows input as string in the format format yyyy-MM-dd or yyyy-MM-dd HH:mm:ss or yyyy-MM-dd HH:mm:ss +HH:mm
  * Blockly part
  */
  Blockly.Blocks['oh_zdt_fromText'] = {
    init: function () {
      this.appendValueInput('day') // cannot be renamed for backward compatibility reasons
        .appendField('datetime')
        .setCheck('String')
      this.setOutput(true, 'ZonedDateTime')
      this.setColour(70)
      this.setTooltip('Calender entry as format yyyy-MM-dd or yyyy-MM-dd HH:mm:ss or yyyy-MM-dd HH:mm:ss +HH:mm (ZonedDateTime)')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-date-handling.html#get-date')
    }
  }

  /*
  * Typed (ZonedDateTime) block that can be used with the Ephemeris check block
  * Code part
  */
  Blockly.JavaScript['oh_zdt_fromText'] = function (block) {
    const { dtf, zdt, getZonedDateTime } = addDateSupport()
    let day = Blockly.JavaScript.valueToCode(block, 'day', Blockly.JavaScript.ORDER_ATOMIC)
    let code = `${getZonedDateTime}(${day})`
    return [code, Blockly.JavaScript.ORDER_NONE]
  }

  /*
  * Returns a string representation of an ephemeris date
  * Blockly part
  */
  Blockly.Blocks['oh_zdt_toText'] = {
    init: function () {
      this.appendValueInput('date')
        .appendField('text of')
        .setCheck('ZonedDateTime')
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([['without time', 'without'], ['with time', 'with']]), 'withtime')

      this.setOutput(true, 'String')
      this.setColour(160)
      this.setTooltip('converts an ZonedDateTime into a date string')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-date-handling.html#get-string-representation-of-date')
    }
  }

  /*
  * Returns a string representation of an ephemeris date
  * Code part
  */
  Blockly.JavaScript['oh_zdt_toText'] = function (block) {
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
}
