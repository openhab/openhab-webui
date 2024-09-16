/*
* Adds new blocks to the unit of measurement section
* supports jsscripting
*/

import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript.js'
import { blockGetCheckedInputType } from './utils.js'

export default function (f7) {
  Blockly.Blocks['oh_quantity_ext'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Qty ')
      this.appendValueInput('value')
        .setCheck(['String', 'Number', 'oh_itemtype', 'oh_item'])
      this.appendValueInput('unit')
        .setCheck('String')
      this.setColour(58)
      this.setInputsInline(true)
      this.setTooltip('Block that wraps Measurements in a Quantity block.\nA Quantity is a Number plus a Unit (of Measurement). \nMake sure you use the right units like 5.75 m, 1 N*m, 1 m/s, 1 m^2/s^2, 1 m^2/s^-2 ... ')
      this.setHelpUrl('https://www.openhab.org/docs/concepts/units-of-measurement.html')
      this.setOutput(true, ['oh_quantity', 'String'])
    }
  }

  javascriptGenerator.forBlock['oh_quantity_ext'] = function (block) {
    let value = javascriptGenerator.valueToCode(block, 'value', javascriptGenerator.ORDER_NONE)

    const unit = javascriptGenerator.valueToCode(block, 'unit', javascriptGenerator.ORDER_NONE)
    const inputType = blockGetCheckedInputType(block, 'value')

    let code
    switch (inputType) {
      case 'String':
      case 'Number':
        code = `Quantity(${value} + ${unit})`
        break
      case 'oh_itemtype':
        code = `(${value}.quantityState !== null) ? ${value}.quantityState.toUnit(${unit}) : Quantity(${value}.numericState + ${unit})`
        break
      case 'oh_item':
        value = `items.getItem(${value})`
        code = `(${value}.quantityState !== null) ? ${value}.quantityState.toUnit(${unit}) : Quantity(${value}.numericState + ${unit})`
        break
      default:
        code = `Quantity(${value} + ${unit})`
        break
    }
    return [code, 0]
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

  javascriptGenerator.forBlock['oh_quantity'] = function (block) {
    return [generateQuantityCode(block, 'quantity'), 0]
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

  javascriptGenerator.forBlock['oh_quantity_arithmetic'] = function (block) {
    const operand = block.getFieldValue('operand')
    const first = generateQuantityCode(block, 'first')
    const second = (blockGetCheckedInputType(block, 'second') !== 'Number')
      ? generateQuantityCode(block, 'second')
      : javascriptGenerator.valueToCode(block, 'second', javascriptGenerator.ORDER_NONE)
    return [`${first}.${operand}(${second})`, javascriptGenerator.ORDER_NONE]
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

  javascriptGenerator.forBlock['oh_quantity_compare'] = function (block) {
    const operand = block.getFieldValue('operand')
    const first = generateQuantityCode(block, 'first')
    const second = generateQuantityCode(block, 'second')
    return [`${first}.${operand}(${second})`, javascriptGenerator.ORDER_NONE]
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

  javascriptGenerator.forBlock['oh_quantity_to_unit'] = function (block) {
    const quantity = javascriptGenerator.valueToCode(block, 'quantity', javascriptGenerator.ORDER_NONE)
    const unit = javascriptGenerator.valueToCode(block, 'unit', javascriptGenerator.ORDER_NONE)
    return [`${quantity}.toUnit(${unit})`, javascriptGenerator.ORDER_NONE]
  }
}

/**
 * Generates the Quantity code for a given input of a Block.
 * Supported input types: `oh_quantity`, `String`, `oh_itemtype`, `oh_item`
 *
 * @param {Blockly.Block} block
 * @param {string} inputName name of the input
 * @returns {string} generated Quantity code
 */
function generateQuantityCode (block, inputName) {
  const input = javascriptGenerator.valueToCode(block, inputName, javascriptGenerator.ORDER_NONE)
  const inputType = blockGetCheckedInputType(block, inputName)

  let code = ''
  switch (inputType) {
    case 'oh_quantity':
      code = input
      break
    case 'String':
      code = `Quantity(${input})`
      break
    case 'oh_itemtype':
    case '': // vars are expected to contain an item object or the state itself
      code = `Quantity(${input})`
      break
    case 'oh_item':
      code = `items.getItem(${input}).quantityState`
      break
  }
  return code
}
