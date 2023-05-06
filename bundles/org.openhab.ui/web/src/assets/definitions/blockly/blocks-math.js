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

  Blockly.Blocks['math_round'] = {
    init: function () {
      const block = this
      const dropDown = new Blockly.FieldDropdown([['round', 'ROUND'], ['round up', 'ROUNDUP'], ['round down', 'ROUNDDOWN'], ['round →', 'toFixed']],
        function (operation) {
          block.updateType(operation)
        })
      this.appendValueInput('NUM')
        .setCheck('Number')
        .appendField(dropDown, 'op')
      this.setColour('%{BKY_MATH_HUE}')
      this.setInputsInline(false)
      this.setTooltip('Round a number up or down')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-math.html#round')
      this.setOutput(true, 'Number')
    },
    updateType: function (type) {
      if (type === 'toFixed') {
        if (this.getInput('DECIMALS')) return
        this.appendValueInput('DECIMALS')
          .setCheck('Number')
          .appendField('by')
          .setShadowDom(Blockly.Xml.textToDom('<shadow type="math_number"><field name="NUM">2</field></shadow>'))
        this.appendDummyInput('declabel')
          .appendField('decimals')
        this.setInputsInline(true)
      } else if (this.getInput('DECIMALS')) {
        this.removeInput('DECIMALS')
        this.removeInput('declabel')
        this.setInputsInline(false)
      }
    }
  }

  javascriptGenerator['math_round'] = function (block) {
    const math_number = javascriptGenerator.valueToCode(block, 'NUM', javascriptGenerator.ORDER_FUNCTION_CALL)
    const decimals = javascriptGenerator.valueToCode(block, 'DECIMALS', javascriptGenerator.ORDER_NONE)
    const operand = block.getFieldValue('op')
    let code = ''
    if (operand !== 'toFixed') {
      let method = ''
      switch (operand) {
        case 'ROUND':
          method = 'Math.round'
          break
        case 'ROUNDUP':
          method = 'Math.ceil'
          break
        case 'ROUNDDOWN':
          method = 'Math.floor'
          break
      }
      code = `${method}(${math_number})`
    } else {
      code = `(${math_number}).toFixed(${decimals})`
    }
    return [code, 0]
  }
}
