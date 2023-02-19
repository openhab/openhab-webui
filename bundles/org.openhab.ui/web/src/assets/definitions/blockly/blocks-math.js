/*
* Adds new bitwise operator blocks to the math section
*/

import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'

export default function (f7, isGraalJs) {
  Blockly.Blocks['oh_bit_not'] = {
    init: function () {
      this.appendValueInput('value')
        .setCheck('Number')
        .appendField('~')
      this.setColour('%{BKY_MATH_HUE}')
      this.setInputsInline(true)
      this.setTooltip('bitwise not operator')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-math.html#not')
      this.setOutput(true, 'Number')
    }
  }

  javascriptGenerator['oh_bit_not'] = function (block) {
    const value = javascriptGenerator.valueToCode(block, 'value', javascriptGenerator.ORDER_BITWISE_NOT)
    return [`~${value}`, 0]
  }

  Blockly.Blocks['oh_bitwise'] = {
    init: function () {
      this.appendValueInput('first')
        .setCheck('Number')
      this.appendValueInput('second')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown([
          ['&', '&'], ['|', '|'], ['^', '^'],
          ['<<', '<<'], ['>>', '>>'], ['>>>', '>>>']
        ]), 'operand')

      this.setInputsInline(true)
      this.setOutput(true, 'Number')
      this.setColour('%{BKY_MATH_HUE}')

      let thisBlock = this
      this.setTooltip(function () {
        const operand = thisBlock.getFieldValue('operand')
        switch (operand) {
          case '&': return 'bitwise and-operator'
          case '|': return 'bitwise or-operator'
          case '^': return 'bitwise xor-operator'
          case '<<': return 'bitwise shift left'
          case '>>': return 'bitwise shift right'
          case '>>>': return 'bitwise unsigned shift right'
        }
      })
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-math.html#bitwise')
    }
  }

  javascriptGenerator['oh_bitwise'] = function (block) {
    const first = javascriptGenerator.valueToCode(block, 'first', javascriptGenerator.ORDER_BITWISE_SHIFT)
    const second = javascriptGenerator.valueToCode(block, 'second', javascriptGenerator.ORDER_NONE)
    const operand = block.getFieldValue('operand')

    let parentheses = 0
    switch (operand) {
      case '<<':
      case '>>':
      case '>>>':
        parentheses = javascriptGenerator.ORDER_BITWISE_SHIFT
        break
      case '&':
        parentheses = javascriptGenerator.ORDER_BITWISE_AND
        break
      case '|':
        parentheses = javascriptGenerator.ORDER_BITWISE_OR
        break
      case '^':
        parentheses = javascriptGenerator.ORDER_BITWISE_XOR
        break
    }
    return [`${first} ${operand} ${second}`, parentheses]
  }
}
