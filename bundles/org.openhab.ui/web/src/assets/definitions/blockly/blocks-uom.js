/*
* Adds new blocks to the colour section
* supports jsscripting
*/

import Blockly from 'blockly'

export default function (f7) {
  Blockly.Blocks['oh_uom_arithmetic'] = {
    init: function () {
      this.appendValueInput('first')
        .setCheck('String')
      this.appendValueInput('second')
        .setCheck('String')
        .appendField(new Blockly.FieldDropdown([
          ['+', 'add'], ['-', 'sub'],
          ['*', 'mul'], ['/', 'div'],
          ['to', 'to']
        ]), 'operand')

      this.setInputsInline(true)
      this.setOutput(true, 'String')
      this.setColour('%{BKY_MATH_HUE}')
      // TODO operand related tooltip
      this.setTooltip('math with units of measure')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/')
    }
  }

  Blockly.JavaScript['oh_uom_arithmetic'] = function (block) {
    const itemName = Blockly.JavaScript.valueToCode(block, 'itemName', Blockly.JavaScript.ORDER_ATOMIC)
    if (this.workspace && this.workspace.jsScriptingAvailable) {
      const first = Blockly.JavaScript.valueToCode(block, 'first', Blockly.JavaScript.ORDER_NONE)
      const second = Blockly.JavaScript.valueToCode(block, 'second', Blockly.JavaScript.ORDER_NONE)
      const operand = block.getFieldValue('operand')
      return [`Quantity(${first}).${operand}(Quantity(${second}))`, Blockly.JavaScript.ORDER_NONE]
    } else {
      console.warn('arithmetic function unit of measurement only supported with jsscripting')
    }
  }

  Blockly.Blocks['oh_uom_compare'] = {
    init: function () {
      this.appendValueInput('first')
        .setCheck('String')
      this.appendValueInput('second')
        .setCheck('String')
        .appendField(new Blockly.FieldDropdown([
          ['=', 'eq'],
          ['==', 'same'],
          // ['\u2260', 'NEQ'], // maybe later by adding a not
          ['\u200F<', 'lt'],
          ['\u200F\u2264', 'lte'],
          ['\u200F>', 'gt'],
          ['\u200F\u2265', 'gte']
        ]), 'operand')

      this.setInputsInline(true)
      this.setOutput(true, 'Boolean')
      this.setColour('%{BKY_LOGIC_HUE}')
      // TODO operand related tooltip
      this.setTooltip('compare units of measure')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/')
    }
  }

  Blockly.JavaScript['oh_uom_compare'] = function (block) {
    const itemName = Blockly.JavaScript.valueToCode(block, 'itemName', Blockly.JavaScript.ORDER_ATOMIC)
    if (this.workspace && this.workspace.jsScriptingAvailable) {
      const first = Blockly.JavaScript.valueToCode(block, 'first', Blockly.JavaScript.ORDER_NONE)
      const second = Blockly.JavaScript.valueToCode(block, 'second', Blockly.JavaScript.ORDER_NONE)
      const operand = block.getFieldValue('operand')
      return [`Quantity(${first}).${operand}(Quantity(${second}))`, Blockly.JavaScript.ORDER_NONE]
    } else {
      console.warn('compare function unit of measurement only supported with jsscripting')
    }
  }
}
