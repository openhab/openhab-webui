/*
* Adds new blocks to the colour section
* supports jsscripting
*/

import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'

export default function (f7, isGraalJs) {
  Blockly.Blocks['oh_quantity'] = {
    init: function () {
      this.appendValueInput('quantity')
        .setCheck('String')
      this.setColour(58)
      this.setInputsInline(true)
      this.setTooltip('Block that wraps Measurements in a Quantity block.\nA Quantity is a Number plus a Unit (of Measurement). \nMake sure you use the right units like 5.75 m, 1 N*m, 1 m/s, 1 m^2/s^2, 1 m^2/s^-2 ... ')
      this.setHelpUrl('https://www.openhab.org/docs/concepts/units-of-measurement.html')
      this.setOutput(true, ['oh_quantity', 'String'])
    }
  }

  javascriptGenerator['oh_quantity'] = function (block) {
    const quantity = javascriptGenerator.valueToCode(block, 'quantity', javascriptGenerator.ORDER_NONE)
    return [`Quantity(${quantity})`, 0]
  }

  Blockly.Blocks['oh_quantity_arithmetic'] = {
    init: function () {
      this.appendValueInput('first')
        .setCheck('oh_quantity')
      this.appendValueInput('second')
        .setCheck(['oh_quantity', 'Number'])
        .appendField(new Blockly.FieldDropdown([
          ['+', 'add'], ['-', 'subtract'],
          ['*', 'multiply'], ['/', 'divide']
        ]), 'operand')

      this.setInputsInline(true)
      this.setOutput(true, 'oh_quantity')
      this.setColour('%{BKY_MATH_HUE}')
      this.setTooltip('Allows computation with Quantity blocks.\nA Quantity is a Number plus a Unit (of Measurement). \nMake sure you use the right units like 5.75 m, 1 N*m, 1 m/s, 1 m^2/s^2, 1 m^2/s^-2 ... ')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/')
    }
  }

  javascriptGenerator['oh_quantity_arithmetic'] = function (block) {
    if (isGraalJs) {
      const first = javascriptGenerator.valueToCode(block, 'first', javascriptGenerator.ORDER_NONE)
      const second = javascriptGenerator.valueToCode(block, 'second', javascriptGenerator.ORDER_NONE)
      const operand = block.getFieldValue('operand')
      return [`${first}.${operand}(${second})`, javascriptGenerator.ORDER_NONE]
    } else {
      console.warn('arithmetic function unit of measurement only supported with jsscripting')
    }
  }

  Blockly.Blocks['oh_quantity_compare'] = {
    init: function () {
      this.appendValueInput('first')
        .setCheck('oh_quantity')
      this.appendValueInput('second')
        .setCheck('oh_quantity')
        .appendField(new Blockly.FieldDropdown([
          ['=', 'equal'],
          // ['\u2260', 'NEQ'], // maybe later by adding a not
          ['\u200F<', 'smallerThan'],
          ['\u200F\u2264', 'smallerThanOrEqual'],
          ['\u200F>', 'largerThan'],
          ['\u200F\u2265', 'largerThanOrEqual']
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
      const first = javascriptGenerator.valueToCode(block, 'first', javascriptGenerator.ORDER_NONE)
      const second = javascriptGenerator.valueToCode(block, 'second', javascriptGenerator.ORDER_NONE)
      const operand = block.getFieldValue('operand')
      return [`${first}.${operand}(${second})`, javascriptGenerator.ORDER_NONE]
    } else {
      console.warn('compare function unit of measurement only supported with jsscripting')
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
    return [`${quantity}.toUnit(${unit})`, javascriptGenerator.ORDER_NONE]
  }
}
