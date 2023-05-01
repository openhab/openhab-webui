/**
 * supports jsscripting
 */
import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'
import { FieldDatePicker } from './fields/date-field'
import { addDateSupport, addDateComparisonSupportNashorn, addDateComparisonSupportGraalVM, addGetZdtComponent, addChrono } from './utils'

export default function (f7, isGraalJs) {
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
      this.setTooltip('today\'s date for Ephemeris check block')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-date-handling.html#today')
    }
  }

  /*
  * Typed block that can be used with Ephemeris check block
  * Code part
  */
  javascriptGenerator['oh_dayoffset_today'] = function (block) {
    let code = '0'
    return [code, javascriptGenerator.ORDER_NONE]
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
      this.setTooltip('today with a positive or negative day offset for Ephemeris check block')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-date-handling.html#today-x-days')
    }
  }

  /*
  * Typed (DayOffset) block with a day positve or negative offset
  * Code part
  */
  javascriptGenerator['oh_dayoffset'] = function (block) {
    let offsetValue = javascriptGenerator.valueToCode(block, 'offset', javascriptGenerator.ORDER_ATOMIC)
    let code = `${offsetValue}`
    return [code, javascriptGenerator.ORDER_NONE]
  }

  /*
  * Typed (ZonedDateTime) block that returns the current date and time
  * Blockly part
  */
  Blockly.Blocks['oh_zdt_now'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('now')
      this.setOutput(true, 'ZonedDateTime')
      this.setColour(70)
      this.setTooltip('Obtains the current date-time from the system clock in the default time-zone.\nReturns: ZonedDateTime')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-date-handling.html#get-datetime-now')
    }
  }

  /*
  * Typed (DayOffset) block with a day positve or negative offset that can be used with the Ephemeris check block
  * Code part
  */
  javascriptGenerator['oh_zdt_now'] = function (block) {
    const zdt = (isGraalJs) ? 'time.ZonedDateTime' : addDateSupport()[1]
    return [`${zdt}.now()`, javascriptGenerator.ORDER_NONE]
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
      this.setTooltip('Obtains the current date-time from the system clock in the default time-zone with a simple positive or negative offset.\nReturns: ZonedDateTime')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-date-handling.html#get-date-now-with-offset')
    }
  }

  /*
  * Typed (DayOffset) block with a day positve or negative offset that can be used with the Ephemeris check block
  * Code part
  */
  javascriptGenerator['oh_zdt_plusminus'] = function (block) {
    const offsetValue = javascriptGenerator.valueToCode(block, 'offset', javascriptGenerator.ORDER_ATOMIC)
    const plusMinus = block.getFieldValue('plusminus')
    const period = block.getFieldValue('period')

    const zdt = (isGraalJs) ? 'time.ZonedDateTime' : addDateSupport()[1]
    return [`${zdt}.now().${plusMinus}${period}(${offsetValue})`, javascriptGenerator.ORDER_ATOMIC]
  }

  /*
  * Create Typed (ZonedDateTime) block by providing date and time information
  * Blockly part
  */
  Blockly.Blocks['oh_zdt_create'] = {
    init: function () {
      this.updateShape_()
      this.setInputsInline(true)
      this.setOutput(true, 'ZonedDateTime')
      this.setColour(70)
      this.setTooltip('Creates a ZonedDateTime based on the given input for date and time with nanos set to 0 and the system\'s time-zone. The values need to be valid.\nReturns: ZonedDateTime')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-date-handling.html#datetime-with-date-and-time-values')
    },
    updateShape_: function () {
      let year = this.appendValueInput('year')
        .setCheck('Number')
        .appendField('datetime with date')
      let month = this.appendValueInput('month')
        .setCheck('Number')
        .appendField('-')
      let day = this.appendValueInput('day')
        .setCheck('Number')
        .appendField('-')
      let hour = this.appendValueInput('hour')
        .setCheck('Number')
        .appendField('and time')
      let minute = this.appendValueInput('minute')
        .setCheck('Number')
        .appendField(':')
      let second = this.appendValueInput('second')
        .setCheck('Number')
        .appendField(':')
    }
  }

  /*
  * ZonedDateTime block with preset date and time
  * Code part
  */
  javascriptGenerator['oh_zdt_create'] = function (block) {
    const year = javascriptGenerator.valueToCode(block, 'year', javascriptGenerator.ORDER_ATOMIC)
    const month = javascriptGenerator.valueToCode(block, 'month', javascriptGenerator.ORDER_ATOMIC)
    const day = javascriptGenerator.valueToCode(block, 'day', javascriptGenerator.ORDER_ATOMIC)
    const hour = javascriptGenerator.valueToCode(block, 'hour', javascriptGenerator.ORDER_ATOMIC)
    const minute = javascriptGenerator.valueToCode(block, 'minute', javascriptGenerator.ORDER_ATOMIC)
    const second = javascriptGenerator.valueToCode(block, 'second', javascriptGenerator.ORDER_ATOMIC)

    if (isGraalJs) {
      const code = `time.ZonedDateTime.now().withYear(${year}).withMonth(${month}).withDayOfMonth(${day}).withHour(${hour}).withMinute(${minute}).withSecond(${second}).withNano(0)`
      return [code, javascriptGenerator.ORDER_ATOMIC]
    } else {
      let [dtf, zdt, gzdt, czdt] = addDateSupport()
      let stringToParse = `${czdt}(${year}, ${month} ,${day}, ${hour}, ${minute}, ${second}, 0, ${zdt}.now().getOffset().getId(), ${zdt}.now().getZone().getId())`
      let code = `${zdt}.parse(${stringToParse}, ${dtf}.ISO_ZONED_DATE_TIME)`
      return [code, javascriptGenerator.ORDER_ATOMIC]
    }
  }

  /*
  * ZonedDateTime block
  * Allows the selection of a date. The default is the current date
  * Blockly part
  */
  Blockly.Blocks['oh_zdt'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('datetime')
        .appendField(new FieldDatePicker('', null, { f7 }, 'date'), 'day')
      this.setOutput(true, 'ZonedDateTime')
      this.setColour(70)
      this.setTooltip('A ZonedDateTime with time set to zero')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-date-handling.html#date-picker')
    }
  }

  /*
  * Typed (ZonedDateTime) block that can be used with the Ephemeris check block
  * Code part
  */
  javascriptGenerator['oh_zdt'] = function (block) {
    const day = block.getFieldValue('day')
    const getZonedDateTime = (isGraalJs) ? 'time.toZDT' : addDateSupport()[2]
    return [`${getZonedDateTime}('${day}')`, javascriptGenerator.ORDER_NONE]
  }

  /*
  * Typed (ZonedDateTime) block that can be used with the Ephemeris check block
  * Allows input as string in the pattern yyyy-MM-dd or yyyy-MM-dd HH:mm:ss or yyyy-MM-dd HH:mm:ss +HH:mm
  * Blockly part
  */
  Blockly.Blocks['oh_zdt_fromText'] = {
    init: function () {
      this.appendValueInput('day') // cannot be renamed for backward compatibility reasons
        .appendField('datetime')
        .setCheck('String')
      this.setOutput(true, 'ZonedDateTime')
      this.setColour(70)
      let tooltip = 'Parses a text into a ZonedDateTime supporting the following formats detected:\n' +
        'HH:mm\n' +
        'HH:mm:ss\n' +
        'yyyy-MM-dd\n' +
        'yyyy-MM-ddTHH:mm\n' +
        'yyyy-MM-ddTHH:mm:ss\n' +
        'yyyy-MM-ddTHH:mm:ss+02:00\n' +
        'yyyy-MM-ddTHH:mm:ss.SSS\n' +
        'yyyy-MM-ddTHH:mm:ss.SSSSS\n' +
        'yyyy-MM-ddTHH:mm:ss.SSS+02:00\n' +
        'yyyy-MM-ddTHH:mm:ss.SSSSSS+02:00 -> local date time standard output\n' +
        'yyyy-MM-ddTHH:mm:ss.SS+0200 -> OH standard output format\n' +
        'Note: all of the above work with or without the "T" (replaced by a blank) in the given string"\n' +
        'returns ZonedDateTime"\n'

      this.setTooltip(tooltip)
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-date-handling.html#get-date')
    }
  }

  /*
  * Typed (ZonedDateTime) block that can be used with the Ephemeris check block
  * Code part
  */
  javascriptGenerator['oh_zdt_fromText'] = function (block) {
    const day = javascriptGenerator.valueToCode(block, 'day', javascriptGenerator.ORDER_ATOMIC)
    const getZonedDateTime = (isGraalJs) ? 'time.toZDT' : addDateSupport()[2]
    return [`${getZonedDateTime}(${day})`, javascriptGenerator.ORDER_NONE]
  }

  /*
  * Typed (ZonedDateTime) block that can be used with the Ephemeris check block
  * Allows input as string in the format yyyy-MM-dd or yyyy-MM-dd HH:mm:ss or yyyy-MM-dd HH:mm:ss +HH:mm
  * Blockly part
  */
  Blockly.Blocks['oh_zdt_fromItem'] = {
    init: function () {
      this.appendValueInput('itemName')
        .appendField('datetime from item')
        .setCheck(['String', 'oh_item'])
      this.setOutput(true, 'ZonedDateTime')
      this.setColour(70)
      this.setTooltip('ZonedDateTime from a datetime item')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-date-handling.html#datetime-from-item')
    }
  }

  /*
  * Typed (ZonedDateTime) block that can be used with the Ephemeris check block
  * Code part
  */
  javascriptGenerator['oh_zdt_fromItem'] = function (block) {
    const itemName = javascriptGenerator.valueToCode(block, 'itemName', javascriptGenerator.ORDER_ATOMIC)
    if (isGraalJs) {
      return [`time.toZDT(items.getItem(${itemName}))`, javascriptGenerator.ORDER_NONE]
    } else {
      return [`itemRegistry.getItem(${itemName}).getState().getZonedDateTime()`, javascriptGenerator.ORDER_NONE]
    }
  }

  const nextImage =
      'data:image/png;base64,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Jvvsv98H0PRL4b/xZC8+IS4AVKJ9WTwJgND1AJT1AWBej/ptBCCCAkCMG4CdnOTjb5GkOTlO+iKjPSD28djYO7Qfxu8A4Ou2sbHRqrGxr/sn3w+twsn+HgAWSyTgR4z3/Vi3/9RbT/b+3+X47zMYj2Aihn/M/wLr9BzXMb/TFQAAAAlwSFlzAAAWJQAAFiUBSVIk8AAABr5pVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDcuMS1jMDAwIDc5LmIwZjhiZTkwLCAyMDIxLzEyLzE1LTIxOjI1OjE1ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjMuMiAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjItMDMtMjRUMjA6MDE6MzkrMDE6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjItMDMtMjRUMjA6MDg6MzUrMDE6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIyLTAzLTI0VDIwOjA4OjM1KzAxOjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo4MTlmZjRjMi1mZWE4LTRhNzktOGJlOC05M2Q2ZWU3YTQwZGYiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDpjMGY4ZWFmYy1hNzg0LTQwNDAtODc1NS03MWRmYTNlNjFhZmQiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpjYzAxYzdmMy1hNzY3LTQ1YWYtYTRiNC1hMzRhMTA2MmYzNDIiIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJEaXNwbGF5Ij4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpjYzAxYzdmMy1hNzY3LTQ1YWYtYTRiNC1hMzRhMTA2MmYzNDIiIHN0RXZ0OndoZW49IjIwMjItMDMtMjRUMjA6MDE6MzkrMDE6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMy4yIChNYWNpbnRvc2gpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDowZTY3NDhlZC1jMTU5LTRhMjAtYjI2MC0yMzA5NTFmNjA4ZTEiIHN0RXZ0OndoZW49IjIwMjItMDMtMjRUMjA6MDQ6MTgrMDE6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMy4yIChNYWNpbnRvc2gpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo4MTlmZjRjMi1mZWE4LTRhNzktOGJlOC05M2Q2ZWU3YTQwZGYiIHN0RXZ0OndoZW49IjIwMjItMDMtMjRUMjA6MDg6MzUrMDE6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMy4yIChNYWNpbnRvc2gpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNl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'

  /*
  * A temporal unit that can be used to amend a ZonedDateTime
  * Block part
  */
  Blockly.Blocks['oh_zdt_temporal_unit'] = {
    currentBlockType: 0,
    blockTypes: ['year', 'month', 'day', 'hour', 'minute', 'second', 'milli', 'micro', 'nano', 'day of year'],
    maxValue: [9999, 12, 31, 23, 59, 59, 999, 999, 999, 366],
    init: function () {
      this.appendDummyInput()
        .appendField(new Blockly.FieldImage(nextImage, 15, 15, undefined, this.onClick), 'NEXT')
        .appendField(new Blockly.FieldNumber(0), 'value')
        .appendField('day', 'blockType')
      this.setInputsInline(true)
      this.setOutput(true, 'zdtTemporalUnit')
      this.setColour(120)
      this.setTooltip('click arrow to scroll through year, month, day, hour, minute, second, milli, nano, day of year')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-date-handling.html#create-datetime-based-on-a-specific-date-copy-of')
    },
    onClick (nextField) {
      let block = this.getSourceBlock()
      let currentBlockType = block.currentBlockType
      let blockTypes = block.blockTypes
      if (currentBlockType < blockTypes.length - 1) {
        currentBlockType++
      } else {
        currentBlockType = 0
      }
      block.currentBlockType = currentBlockType
      block.setFieldValue(blockTypes[currentBlockType], 'blockType')
      block.getField('value').setMax(block.maxValue[currentBlockType])
    },
    updateType_: function (blockType) {
      this.currentBlockType = blockType
      this.setFieldValue(this.blockTypes[blockType], 'blockType')
    },
    mutationToDom: function () {
      let container = Blockly.utils.xml.createElement('mutation')
      container.setAttribute('blockType', this.currentBlockType)
      return container
    },
    domToMutation: function (xmlElement) {
      this.updateType_(xmlElement.getAttribute('blockType'))
    }
  }

  /*
  * A temporal unit that can be used to amend a ZonedDateTime
  * Code part
  */
  javascriptGenerator['oh_zdt_temporal_unit'] = function (block) {
    const value = block.getFieldValue('value')
    return [`(${value})`, javascriptGenerator.ORDER_NONE]
  }

  /*
  * A temporal unit that can be used to amend a ZonedDateTime
  * Block part
  */
  Blockly.Blocks['oh_zdt_temporal_unit_input'] = {
    numberBlockInput: null,
    currentBlockType: 0,
    blockTypes: ['year', 'month', 'day', 'hour', 'minute', 'second', 'milli', 'micro', 'nano', 'day of year'],
    // TODO: Set min values
    // minValue: [0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
    maxValue: [9999, 12, 31, 23, 59, 59, 999, 999, 999, 366],
    addNumberBlock: function () {
      if (this.workspace.id !== Blockly.getMainWorkspace().id) {
        let parentConnection = this.getInput('value').connection
        let mathNumberBlock = this.workspace.newBlock('math_number')
        mathNumberBlock.initSvg()
        mathNumberBlock.render()
        parentConnection.connect(mathNumberBlock.outputConnection)
      }
    },
    init: function () {
      this.appendDummyInput()
        .appendField(new Blockly.FieldImage(nextImage, 15, 15, undefined, this.onClick), 'NEXT')
      this.appendValueInput('value')
      this.appendDummyInput()
        .appendField('day', 'blockType')

      this.addNumberBlock()
      this.setInputsInline(true)
      this.setOutput(true, 'zdtTemporalUnit')
      this.setColour(120)
      this.setTooltip('click arrow to scroll through year, month, day, hour, minute, second, milli, nano, day of year')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-date-handling.html#create-datetime-based-on-a-specific-date-copy-of')
    },
    onClick (nextField) {
      let block = this.getSourceBlock()
      let currentBlockType = block.currentBlockType
      let blockTypes = block.blockTypes
      if (currentBlockType < blockTypes.length - 1) {
        currentBlockType++
      } else {
        currentBlockType = 0
      }
      block.currentBlockType = currentBlockType
      block.setFieldValue(blockTypes[currentBlockType], 'blockType')
      let numberBlockInput = block.getInput('value').connection
      let numberField = numberBlockInput.targetBlock().getField('NUM')
      // if it is still a math_number, then set the max value
      if (numberField) {
        numberField.setMax(block.maxValue[currentBlockType])
      }
    },
    updateType_: function (blockType) {
      this.currentBlockType = blockType
      this.setFieldValue(this.blockTypes[blockType], 'blockType')
    },
    mutationToDom: function () {
      let container = Blockly.utils.xml.createElement('mutation')
      container.setAttribute('blockType', this.currentBlockType)
      return container
    },
    domToMutation: function (xmlElement) {
      this.updateType_(xmlElement.getAttribute('blockType'))
    }
  }

  /*
  * A temporal unit that can be used to amend a ZonedDateTime
  * Code part
  */
  javascriptGenerator['oh_zdt_temporal_unit_input'] = function (block) {
    const value = javascriptGenerator.valueToCode(block, 'value', javascriptGenerator.ORDER_ATOMIC)
    return [`(${value})`, javascriptGenerator.ORDER_NONE]
  }

  /*
  * Use a ZonedDateTime as a basis to be amended by a temporal unit
  *
  * Three different operations are supported
  * - set (overwrites the particular temporal unit)
  * - add (adds a value to the temporal unit)
  * - subtract (subtracts a value to the temporal unit)
  *
  * Temporal units
  * - temporal units can be added / removed in a flexible way via a dialog which allows the block to the needs of the user
  * - Note that milliseconds are supported indirectly via nanos
  *
  * Blockly part
  */
  Blockly.Blocks['oh_zdt_amend'] = {
    init: function () {
      this.itemCount_ = 0
      this.updateShape_()

      this.setOutput(true, 'ZonedDateTime')
      this.setColour(70)
      this.setInputsInline(true)

      this.setMutator(new Blockly.Mutator(['oh_zdt_amend_item']))
      this.setTooltip('Use a ZonedDateTime as a basis and amend it via particular temporal blocks')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-date-handling.html#create-datetime-based-on-a-specific-date-copy-of')
    },
    mutationToDom: function () {
      let container = Blockly.utils.xml.createElement('mutation')
      container.setAttribute('items', this.itemCount_)
      return container
    },
    domToMutation: function (xmlElement) {
      this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10)
      this.updateShape_()
    },
    decompose: function (workspace) {
      let containerBlock = workspace.newBlock('oh_zdt_amend_container')
      containerBlock.initSvg()
      let connection = containerBlock.getInput('STACK').connection
      for (let i = 0; i < this.itemCount_; i++) {
        let itemBlock = workspace.newBlock('oh_zdt_amend_item')
        itemBlock.initSvg()
        connection.connect(itemBlock.previousConnection)
        connection = itemBlock.nextConnection
      }
      return containerBlock
    },
    compose: function (containerBlock) {
      let itemBlock = containerBlock.getInputTargetBlock('STACK')
      // Count number of inputs.
      let connections = []
      while (itemBlock && !itemBlock.isInsertionMarker()) {
        connections.push(itemBlock.valueConnection_)
        itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock()
      }
      // Disconnect any children that don't belong.
      for (let i = 0; i < this.itemCount_; i++) {
        let input = this.getInput('ADD' + i)
        if (!input) continue
        let connection = input.connection.targetConnection
        if (connection && connections.indexOf(connection) === -1) {
          connection.disconnect()
        }
      }
      this.itemCount_ = connections.length
      this.updateShape_()
      // Reconnect any child blocks.
      for (let i = 0; i < this.itemCount_; i++) {
        Blockly.Mutator.reconnect(connections[i], this, 'ADD' + i)
      }
    },
    saveConnections: function (containerBlock) {
      let itemBlock = containerBlock.getInputTargetBlock('STACK')
      let i = 0
      while (itemBlock) {
        let input = this.getInput('ADD' + i)
        itemBlock.valueConnection_ = input && input.connection.targetConnection
        i++
        itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock()
      }
    },
    updateShape_: function () {
      if (this.itemCount_ && this.getInput('EMPTY')) {
        this.removeInput('EMPTY')
      } else if (!this.itemCount_ && !this.getInput('EMPTY')) {
        if (!this.getInput('baseZdt')) {
          this.appendValueInput('baseZdt')
            .setCheck('ZonedDateTime')
            .appendField('copy of')
        }
        this.appendDummyInput('EMPTY')
          .appendField('add temporal units')
      }
      // Add new inputs.
      let i
      for (i = 0; i < this.itemCount_; i++) {
        if (!this.getInput('ADD' + i)) {
          let input = this.appendValueInput('ADD' + i)
            .setAlign(Blockly.ALIGN_RIGHT)
            .setCheck('zdtTemporalUnit')
          if (i === 0) {
            input.appendField(new Blockly.FieldDropdown([['set', 'with'], ['add', 'plus'], ['subtract', 'minus']]), 'operation')
          }
        }
      }
      // Remove deleted inputs.
      while (this.getInput('ADD' + i)) {
        this.removeInput('ADD' + i)
        i++
      }
    },
    blockTypesMethod:
      {
        'with': ['Year', 'Month', 'DayOfMonth', 'Hour', 'Minute', 'Second', 'Nano', 'Nano', 'Nano', 'DayOfYear'],
        'plus': ['Years', 'Months', 'Days', 'Hours', 'Minutes', 'Seconds', 'Nanos', 'Nanos', 'Nanos', 'undefined'],
        'minus': ['Years', 'Months', 'Days', 'Hours', 'Minutes', 'Seconds', 'Nanos', 'Nanos', 'Nanos', 'undefined']
      }
  }

  javascriptGenerator['oh_zdt_amend'] = function (block) {
    const baseZdt = javascriptGenerator.valueToCode(block, 'baseZdt', javascriptGenerator.ORDER_ATOMIC)
    const operation = block.getFieldValue('operation')

    let code = baseZdt
    let millis = 0
    let micros = 0
    let nanos = 0

    let operationBlock = block.getInput('ADD0')
    if (operationBlock) {
      let i
      for (i = 0; i < this.itemCount_; i++) {
        let temporal = javascriptGenerator.valueToCode(block, 'ADD' + i, javascriptGenerator.ORDER_ATOMIC)
        temporal = temporal.replace(/\(/g, '').replace(/\)/g, '')

        let inputBlock = this.getInputTargetBlock('ADD' + i)
        if (inputBlock) {
          let blockType = inputBlock.currentBlockType

          let operationUnit = this.blockTypesMethod[operation][blockType]
          if (operationUnit !== 'undefined') {
            switch (parseInt(blockType)) {
              case 6:
                millis = parseInt(temporal)
                break
              case 7:
                micros = parseInt(temporal)
                break
              case 8:
                nanos = parseInt(temporal)
                break
              default:
                code += `.${operation}${operationUnit}(${temporal})`
            }
          }
        }
      }
      let totalNanos = 1000000 * millis + 1000 * micros + nanos
      if (totalNanos > 0) {
        let operationUnit = this.blockTypesMethod[operation][8]
        code += `.${operation}${operationUnit}(${totalNanos})`
      }
    }
    return [code, javascriptGenerator.ORDER_ATOMIC]
  }

  Blockly.Blocks['oh_zdt_amend_container'] = {
    init: function () {
      this.setColour(70)
      this.appendDummyInput()
        .appendField('amend datetime by a')
      this.appendStatementInput('STACK')
      this.setTooltip('a group of temporal units')
      this.contextMenu = false
    }
  }

  Blockly.Blocks['oh_zdt_amend_item'] = {
    init: function () {
      this.setColour(120)
      this.appendDummyInput()
        .appendField('temporal unit')
      this.setPreviousStatement(true)
      this.setNextStatement(true)
      this.setTooltip('a temporal unit')
      this.contextMenu = false
    }
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

      let thisBlock = this
      let dropDown = new Blockly.FieldDropdown(
        [['without time', 'without'], ['with time', 'with'], ['as OH-Time', 'asOHTime'], ['with pattern', 'withPattern']],
        function (newMode) {
          thisBlock.updateType_(newMode)
        })
      this.appendDummyInput()
        .appendField(dropDown, 'withtime')

      this.setOutput(true, 'String')
      this.setColour(160)
      this.setTooltip('converts an ZonedDateTime into a date string')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-date-handling.html#get-string-representation-of-date')
    },
    updateType_: function (type) {
      if (type === 'withPattern') {
        this.appendValueInput('pattern')
      } else if (this.getInput('pattern')) {
        this.removeInput('pattern')
      }
    }
  }

  /*
  * Returns a string representation of an ephemeris date
  * Code part
  */
  javascriptGenerator['oh_zdt_toText'] = function (block) {
    const date = javascriptGenerator.valueToCode(block, 'date', javascriptGenerator.ORDER_ATOMIC)
    const withtime = block.getFieldValue('withtime')
    const dtf = (isGraalJs) ? 'time.DateTimeFormatter' : addDateSupport()[0]

    let code = ''
    if (withtime === 'with') {
      code = `${date}.format(${dtf}.ofPattern('yyyy-MM-dd HH:mm:ss'))`
    } else if (withtime === 'without') {
      code = `${date}.format(${dtf}.ofPattern('yyyy-MM-dd'))`
    } else if (withtime === 'withPattern') {
      const pattern = javascriptGenerator.valueToCode(block, 'pattern', javascriptGenerator.ORDER_ATOMIC)
      code = `${date}.format(${dtf}.ofPattern(${pattern}))`
    } else {
      code = `${date}.format(${dtf}.ofPattern('yyyy-MM-dd\\'T\\'HH:mm:ss.SSSZ'))`
    }

    return [code, javascriptGenerator.ORDER_NONE]
  }

  /*
  * Returns a string representation of an ephemeris date
  * Blockly part
  */
  Blockly.Blocks['oh_zdt_compare'] = {
    init: function () {
      this.appendValueInput('zdtOne')
        .setCheck('ZonedDateTime')
        .appendField('is')
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([['before', 'before'], ['equal to', 'equal'], ['after', 'after'], ['before or equal', 'beforeEqual'], ['after or equal', 'afterEqual']]), 'operation')
      this.appendValueInput('zdtTwo')
        .setCheck('ZonedDateTime')
      this.appendDummyInput()
        .appendField('use')
        .appendField(new Blockly.FieldDropdown([['date and time', 'dateandtime'], ['date', 'date'], ['time', 'time']]), 'dateComparison')
      this.appendDummyInput()
        .appendField('with resolution of')
        .appendField(new Blockly.FieldDropdown([['years', 'years'], ['months', 'months'], ['days', 'days'], ['hours', 'hours'], ['minutes', 'minutes'], ['seconds', 'seconds'], ['nanos', 'nanos']]), 'precision')

      this.setOutput(true, 'Boolean')
      this.setInputsInline(true)
      this.setColour('%{BKY_LOGIC_HUE}')
      this.setTooltip('Compares two ZonedDateTimes with each other')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-date-handling.html#date-comparison')
    }
  }

  /*
  * Returns a string representation of an ephemeris date
  * Code part
  */
  javascriptGenerator['oh_zdt_compare'] = function (block) {
    const zdtOne = javascriptGenerator.valueToCode(block, 'zdtOne', javascriptGenerator.ORDER_ATOMIC)
    const zdtTwo = javascriptGenerator.valueToCode(block, 'zdtTwo', javascriptGenerator.ORDER_ATOMIC)
    const operation = block.getFieldValue('operation')
    const precision = block.getFieldValue('precision')
    const dateComparison = block.getFieldValue('dateComparison')

    const zdtCompare = (isGraalJs) ? addDateComparisonSupportGraalVM() : addDateComparisonSupportNashorn()
    return [`${zdtCompare}(${zdtOne}, ${zdtTwo}, '${operation}', '${precision}', '${dateComparison}')`, javascriptGenerator.ORDER_NONE]
  }

  /*
  * Returns a string representation of an ephemeris date
  * Blockly part
  */
  Blockly.Blocks['oh_zdt_between'] = {
    init: function () {
      this.appendValueInput('zdtOne')
        .setCheck('ZonedDateTime')
        .appendField('is')
      this.appendValueInput('zdtTwo')
        .appendField('between')
        .setCheck('ZonedDateTime')
      this.appendValueInput('zdtThree')
        .appendField('and')
        .setCheck('ZonedDateTime')
      this.appendDummyInput()
        .appendField('use')
        .appendField(new Blockly.FieldDropdown([['date and time', 'dateandtime'], ['date', 'date'], ['time', 'time']]), 'dateComparison')

      this.setOutput(true, 'Boolean')
      this.setInputsInline(true)
      this.setColour('%{BKY_LOGIC_HUE}')
      this.setTooltip('Compares two ZonedDateTimes with each other')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-date-handling.html#date-comparison-between')
    }
  }

  /*
  * Returns a string representation of an ephemeris date
  * Code part
  */
  javascriptGenerator['oh_zdt_between'] = function (block) {
    let zdtCompare = addDateComparisonSupportNashorn()
    let zdtOne = javascriptGenerator.valueToCode(block, 'zdtOne', javascriptGenerator.ORDER_ATOMIC)
    let zdtTwo = javascriptGenerator.valueToCode(block, 'zdtTwo', javascriptGenerator.ORDER_ATOMIC)
    let zdtThree = javascriptGenerator.valueToCode(block, 'zdtThree', javascriptGenerator.ORDER_ATOMIC)
    let dateComparison = block.getFieldValue('dateComparison')

    if (isGraalJs) {
      const op = new Map([['dateandtime', 'isBetweenDateTimes'], ['date', 'isBetweenDates'], ['time', 'isBetweenTimes']]).get(dateComparison)
      return [`${zdtOne}.${op}(${zdtTwo}, ${zdtThree})`, javascriptGenerator.ORDER_NONE]
    } else {
      let codeLow = `${zdtCompare}(${zdtTwo}, ${zdtOne}, 'beforeEqual', 'nanos', '${dateComparison}')`
      let codeHigh = `${zdtCompare}(${zdtOne}, ${zdtThree}, 'beforeEqual', 'nanos', '${dateComparison}')`
      let code = `(${codeLow} && ${codeHigh})`
      return [code, javascriptGenerator.ORDER_NONE]
    }
  }

  /*
  * Returns a temporal part of a zoned date time  as a Number
  * Blockly part
  */
  Blockly.Blocks['oh_get_zdt_part'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([['year', 'getYear'], ['month', 'getMonthValue'], ['day of month', 'getDayOfMonth'], ['day of week', 'getDayOfWeek'], ['day of year', 'getDayOfYear'], ['hour', 'getHour'], ['minute', 'getMinute'], ['second', 'getSecond'], ['milli', 'getMilli'], ['micro', 'getMicro'], ['nano', 'getNano']]), 'temporalPart')
        .appendField('of')
      this.appendValueInput('zdt')
        .setCheck('ZonedDateTime')
      this.setInputsInline(true)
      this.setOutput(true, 'Number')
      this.setColour(230)
      this.setTooltip('Returns the selected field as Number.')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-date-handling.html#get-part-of-datetime')
    }
  }

  /*
  * Returns a temporal part of a ZonedDateTime as a Number
  * Code part
  */
  javascriptGenerator['oh_get_zdt_part'] = function (block) {
    const zdt = javascriptGenerator.valueToCode(block, 'zdt', javascriptGenerator.ORDER_ATOMIC)
    let temporalPart = block.getFieldValue('temporalPart')

    if (isGraalJs) {
      const op = new Map([['getYear', 'year'], ['getMonthValue', 'monthValue'], ['getDayOfMonth', 'dayOfMonth'], ['getDayOfWeek', 'dayOfWeek().value'], ['getDayOfYear', 'dayOfYear'], ['getHour', 'hour'], ['getMinute', 'minute'], ['getSecond', 'second'], ['getNano', 'nano']])
      switch (temporalPart) {
        case 'getMilli':
          temporalPart = 'getLong(time.ChronoField.MILLI_OF_SECOND)'
          break
        case 'getMicro':
          temporalPart = 'getLong(time.ChronoField.MICRO_OF_SECOND) % 1000'
          break
        default:
          temporalPart = op.get(temporalPart) + '()'
      }
      return [`${zdt}.${temporalPart}`, javascriptGenerator.ORDER_NONE]
    } else {
      const getZdtComponent = addGetZdtComponent()
      const chrono = addChrono()
      switch (temporalPart) {
        case 'getMilli':
          temporalPart = `getLong(${chrono}.MILLI_OF_SECOND)`
          break
        case 'getMicro':
          temporalPart = `getLong(${chrono}.MICRO_OF_SECOND) % 1000`
          break
        case 'getNano':
          temporalPart = `getLong(${chrono}.NANO_OF_SECOND) % 1000`
          break
        default:
          temporalPart += '()'
      }

      let code = `${getZdtComponent}(${zdt}.${temporalPart})`
      return [code, javascriptGenerator.ORDER_NONE]
    }
  }

  /*
  * Computes the number of temporal unit between two zonedDateTimes
  * Blockly part
  */
  Blockly.Blocks['oh_get_time_between'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([['years', 'YEARS'], ['months', 'MONTHS'], ['weeks', 'WEEKS'], ['days', 'DAYS'], ['hours', 'HOURS'], ['minutes', 'MINUTES'], ['seconds', 'SECONDS'], ['millis', 'MILLIS'], ['micros', 'MICROS'], ['nanos', 'NANOS']]), 'temporalPart')
        .appendField('between')
      this.appendValueInput('zdtOne')
        .setCheck('ZonedDateTime')
      this.appendValueInput('zdtTwo')
        .setCheck('ZonedDateTime')
        .appendField('and')
      this.setInputsInline(true)
      this.setOutput(true, 'Number')
      this.setColour(230)
      this.setTooltip('Returns the selected field as Number.')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-date-handling.html#get-difference-between-datetimes')
    }
  }

  /*
  * Computes the number of temporal units between two zonedDateTimes
  * Code part
  */
  javascriptGenerator['oh_get_time_between'] = function (block) {
    const temporalPart = block.getFieldValue('temporalPart')
    const zdtOne = javascriptGenerator.valueToCode(block, 'zdtOne', javascriptGenerator.ORDER_ATOMIC)
    const zdtTwo = javascriptGenerator.valueToCode(block, 'zdtTwo', javascriptGenerator.ORDER_ATOMIC)

    const chronoUnit = (isGraalJs) ? 'time.ChronoUnit' : javascriptGenerator.provideFunction_(
      'chronoUnit',
      ['var ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("java.time.temporal.ChronoUnit");'])

    let code = `${chronoUnit}.${temporalPart}.between(${zdtOne},${zdtTwo})`
    return [code, javascriptGenerator.ORDER_NONE]
  }
}
