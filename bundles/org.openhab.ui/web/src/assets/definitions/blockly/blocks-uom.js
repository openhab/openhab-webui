/*
* Adds new blocks to the colour section
* supports jsscripting
*/

import Blockly from 'blockly'

export default function (f7) {
  Blockly.Blocks['oh_uom_add'] = {
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
      this.setTooltip('Add units of measure')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/')
    }
  }
  Blockly.JavaScript['oh_uom_add'] = function (block) {
    const itemName = Blockly.JavaScript.valueToCode(block, 'itemName', Blockly.JavaScript.ORDER_ATOMIC)
    if (this.workspace && this.workspace.jsScriptingAvailable) {
      // return [`items.getItem(${itemName})`, 0]
      const first = Blockly.JavaScript.valueToCode(block, 'first', Blockly.JavaScript.ORDER_NONE)
      const second = Blockly.JavaScript.valueToCode(block, 'second', Blockly.JavaScript.ORDER_NONE)
      const operand = block.getFieldValue('operand')
      return [`Quantity(${first}).${operand}(Quantity(${second}))`, Blockly.JavaScript.ORDER_NONE]
    } else {
      console.warn('function unit of measurent only support with jsscripting')
    }
  }
}
