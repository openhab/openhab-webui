/*
* Adds new blocks to the unit of measurement section
* supports jsscripting
*/

import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'
import { blockGetCheckedInputType } from './utils'

const unavailMsg = 'Units of Measurements blocks aren\'t supported in "application/javascript;version=ECMAScript-5.1"'

export default function (f7, isGraalJs) {
  Blockly.Blocks['oh_quantity_ext'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Qty ')
      this.appendValueInput('value')
        .setCheck(['String', 'oh_itemtype', 'oh_item'])
      this.appendValueInput('unit')
        .setCheck('String')
      this.setColour(58)
      this.setInputsInline(true)
      this.setTooltip('Block that wraps Measurements in a Quantity block.\nA Quantity is a Number plus a Unit (of Measurement). \nMake sure you use the right units like 5.75 m, 1 N*m, 1 m/s, 1 m^2/s^2, 1 m^2/s^-2 ... ')
      this.setHelpUrl('https://www.openhab.org/docs/concepts/units-of-measurement.html')
      this.setOutput(true, ['oh_quantity', 'String'])
    }
  }

  javascriptGenerator['oh_quantity_ext'] = function (block) {
    let value = javascriptGenerator.valueToCode(block, 'value', javascriptGenerator.ORDER_NONE)
    const unit = javascriptGenerator.valueToCode(block, 'unit', javascriptGenerator.ORDER_NONE)
    const inputType = blockGetCheckedInputType(block, 'value')

    let quantity = `Quantity(${value}+${unit})`
    if (inputType !== 'String') {
      value = (inputType === 'oh_itemtype') ? value : (inputType === 'oh_item') ? `items.getItem(${value})` : value
      quantity = `(${value}.quantityState !== null) ? ${value}.quantityState.toUnit(${unit}) : (${value}.numericState !== null) ? Quantity(${value}.numericState + ' ' + ${unit}) : '0'`
    }

    if (isGraalJs) {
      return [`${quantity}`, 0]
    } else {
      throw new Error(unavailMsg)
    }
  }

  Blockly.Blocks['oh_quantity'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Qty ')
      this.appendValueInput('quantity')
        .setCheck(['String', 'oh_itemtype', 'oh_item'])
      this.setColour(58)
      this.setInputsInline(true)
      this.setTooltip('Block that wraps Measurements in a Quantity block.\nA Quantity is a Number plus a Unit (of Measurement). \nMake sure you use the right units like 5.75 m, 1 N*m, 1 m/s, 1 m^2/s^2, 1 m^2/s^-2 ... ')
      this.setHelpUrl('https://www.openhab.org/docs/concepts/units-of-measurement.html')
      this.setOutput(true, ['oh_quantity', 'String'])
    }
  }

  javascriptGenerator['oh_quantity'] = function (block) {
    let quantity = javascriptGenerator.valueToCode(block, 'quantity', javascriptGenerator.ORDER_NONE)
    const inputType = blockGetCheckedInputType(block, 'quantity')
    quantity = (inputType === 'oh_itemtype') ? quantity + '.quantityState' : (inputType === 'oh_item') ? `items.getItem(${quantity}).quantityState` : quantity

    if (isGraalJs) {
      return [`Quantity(${quantity})`, 0]
    } else {
      throw new Error(unavailMsg)
    }
  }

  Blockly.Blocks['oh_quantity_arithmetic'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Qty ')
      this.appendValueInput('first')
        .setCheck(['oh_quantity', 'oh_itemtype', 'oh_item'])
      this.appendValueInput('second')
        .setCheck(['oh_quantity', 'Number', 'oh_itemtype', 'oh_item'])
        .appendField(new Blockly.FieldDropdown([
          ['+', 'add'], ['-', 'subtract'],
          ['*', 'multiply'], ['/', 'divide']
        ]), 'operand')

      this.setInputsInline(true)
      this.setOutput(true, 'oh_quantity')
      this.setColour('%{BKY_MATH_HUE}')
      this.setTooltip('Allows computation with Quantity blocks.\nA Quantity is a Number plus a Unit (of Measurement).\nNumbers must only be used with multiplication and division or it will fail.\nMake sure you use the right units like 5.75 m, 1 N*m, 1 m/s, 1 m^2/s^2, 1 m^2/s^-2 ... ')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/')
    }
  }

  javascriptGenerator['oh_quantity_arithmetic'] = function (block) {
    if (isGraalJs) {
      let first = javascriptGenerator.valueToCode(block, 'first', javascriptGenerator.ORDER_NONE)
      let second = javascriptGenerator.valueToCode(block, 'second', javascriptGenerator.ORDER_NONE)
      const operand = block.getFieldValue('operand')

      const inputTypeFirst = blockGetCheckedInputType(block, 'first')
      const inputTypeSecond = blockGetCheckedInputType(block, 'second')

      first = (inputTypeFirst === 'oh_itemtype') ? first + '.quantityState' : (inputTypeFirst === 'oh_item') ? `items.getItem(${first}).quantityState` : first
      second = (inputTypeSecond === 'oh_itemtype') ? second + '.quantityState' : (inputTypeSecond === 'oh_item') ? `items.getItem(${second}).quantityState` : second

      // debugger
      return [`${first}.${operand}(${second})`, javascriptGenerator.ORDER_NONE]
    } else {
      throw new Error(unavailMsg)
    }
  }

  Blockly.Blocks['oh_quantity_compare'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Qty ')
      this.appendValueInput('first')
        .setCheck(['oh_quantity', 'oh_itemtype', 'oh_item', 'String'])
      this.appendValueInput('second')
        .setCheck(['oh_quantity', 'oh_itemtype', 'oh_item', 'String'])
        .appendField(new Blockly.FieldDropdown([
          ['=', 'equal'],
          // ['\u2260', 'NEQ'], // maybe later by adding a not
          ['\u200F<', 'lessThan'],
          ['\u200F\u2264', 'lessThanOrEqual'],
          ['\u200F>', 'greaterThan'],
          ['\u200F\u2265', 'greaterThanOrEqual']
        ]), 'operand')

      this.setInputsInline(true)
      this.setOutput(true, 'Boolean')
      this.setColour('%{BKY_LOGIC_HUE}')
      this.setTooltip('Compares two Quantities with each other.\nMake sure you use the target right units like 5.75 m, 1 N*m, 1 m/s, 1 m^2/s^2, 1 m^2/s^-2 ... ')
      this.setHelpUrl('https://www.openhab.org/docs/concepts/units-of-measurement.html')
    }
  }

  javascriptGenerator['oh_quantity_compare'] = function (block) {
    const itemName = javascriptGenerator.valueToCode(block, 'itemName', javascriptGenerator.ORDER_ATOMIC)
    if (isGraalJs) {
      let first = javascriptGenerator.valueToCode(block, 'first', javascriptGenerator.ORDER_NONE)
      let second = javascriptGenerator.valueToCode(block, 'second', javascriptGenerator.ORDER_NONE)

      const inputTypeFirst = blockGetCheckedInputType(block, 'first')
      const inputTypeSecond = blockGetCheckedInputType(block, 'second')

      first = (inputTypeFirst === 'oh_itemtype') ? first + '.quantityState' : (inputTypeFirst === 'oh_item') ? `items.getItem(${first}).quantityState` : first
      second = (inputTypeSecond === 'oh_itemtype') ? second + '.quantityState' : (inputTypeSecond === 'oh_item') ? `items.getItem(${second}).quantityState` : second

      const operand = block.getFieldValue('operand')
      return [`${first}.${operand}(${second})`, javascriptGenerator.ORDER_NONE]
    } else {
      throw new Error(unavailMsg)
    }
  }

  Blockly.Blocks['oh_quantity_to_unit'] = {
    init: function () {
      this.appendValueInput('quantity')
        .setCheck('oh_quantity')
      this.appendValueInput('unit')
        .appendField('to unit')
        .setCheck('String')
      this.setColour(58)
      this.setInputsInline(true)
      this.setTooltip('Converts a Quantity into another Unit.\nMake sure you use the target right units like 5.75 m, 1 N*m, 1 m/s, 1 m^2/s^2, 1 m^2/s^-2 ... ')
      this.setHelpUrl('https://www.openhab.org/docs/concepts/units-of-measurement.html')
      this.setOutput(true, 'oh_quantity')
    }
  }

  javascriptGenerator['oh_quantity_to_unit'] = function (block) {
    const quantity = javascriptGenerator.valueToCode(block, 'quantity', javascriptGenerator.ORDER_NONE)
    const unit = javascriptGenerator.valueToCode(block, 'unit', javascriptGenerator.ORDER_NONE)
    if (isGraalJs) {
      return [`${quantity}.toUnit(${unit})`, javascriptGenerator.ORDER_NONE]
    } else {
      throw new Error(unavailMsg)
    }
  }
}
