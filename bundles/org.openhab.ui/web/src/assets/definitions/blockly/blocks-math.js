/*
* Adds new bitwise operator blocks to the math section
*/

import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'
import { blockGetCheckedInputType } from './utils'

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
      const dropDown = new Blockly.FieldDropdown([['round', 'ROUND'], ['round up', 'ROUNDUP'], ['round down', 'ROUNDDOWN'], ['round (by decimals)', 'toFixed']],
        function (operation) {
          block.updateType(operation)
        })
      this.appendValueInput('NUM')
        .setCheck(['Number', 'oh_quantity'])
        .appendField(dropDown, 'op')

      this.setColour('%{BKY_MATH_HUE}')
      this.setInputsInline(false)
      this.setTooltip('Round a number up or down')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-math.html#round')
      this.setOutput(true, null)
    },
    updateShape_: function () {
      if (this.getInput('NUM')) {
        let type = blockGetCheckedInputType(this, 'NUM')
        if (type) {
          this.setOutput(true, type)
        }
      }
    },
    onchange: function () {
      this.updateShape_()
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
      this.updateShape_()
    }
  }

  javascriptGenerator['math_round'] = function (block) {
    const inputType = blockGetCheckedInputType(block, 'NUM')
    const math_number_input = javascriptGenerator.valueToCode(block, 'NUM', javascriptGenerator.ORDER_FUNCTION_CALL)
    let math_number = math_number_input
    if (inputType === 'oh_quantity') {
      math_number = math_number_input + '.float'
    }
    const decimals = javascriptGenerator.valueToCode(block, 'DECIMALS', javascriptGenerator.ORDER_NONE)
    const operand = block.getFieldValue('op')

    let code
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

    if (inputType === 'oh_quantity') {
      code = `Quantity((${code}).toString() + ' ' + ${math_number_input}.symbol)`
    }
    return [code, 0]
  }

  Blockly.Blocks['math_single'] = {
    init: function () {
      const dropDown = new Blockly.FieldDropdown([
        ['square root', 'ROOT'],
        ['absolute', 'ABS'],
        ['-', 'NEG'],
        ['n', 'LN'],
        ['log10', 'LOG10'],
        ['e^', 'EXP'],
        ['10^', 'POW10']
      ])
      this.appendValueInput('NUM')
        .setCheck(['Number', 'oh_quantity'])
        .appendField(dropDown, 'OP')

      this.setColour('%{BKY_MATH_HUE}')
      this.setInputsInline(false)
      let thisBlock = this
      this.setTooltip(function () {
        const operand = thisBlock.getFieldValue('OP')
        switch (operand) {
          case 'ROOT': return 'Return the square root of the input'
          case 'ABS': return 'Return the absolute value of the input'
          case 'NEG': return 'Return the negation of the input'
          case 'LN': return 'Return the logarithm of the input'
          case 'LOG10': return 'Return the 10 logarithm of the input'
          case 'EXP': return 'Return e to the power of the input'
          case 'POW10': return 'Return 10 to the power of the input'
        }
      })
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-math.html#functions')
      this.setOutput(true, null)
    }
  }

  javascriptGenerator['math_single'] = function (block) {
    const inputType = blockGetCheckedInputType(block, 'NUM')
    const math_number_input = javascriptGenerator.valueToCode(block, 'NUM', javascriptGenerator.ORDER_FUNCTION_CALL)
    let math_number = math_number_input
    if (inputType === 'oh_quantity') {
      math_number = math_number_input + '.float'
    }
    const operand = block.getFieldValue('OP')

    let method = ''
    switch (operand) {
      case 'ROOT':
        method = `Math.sqrt(${math_number})`
        break
      case 'ABS':
        method = `Math.abs(${math_number})`
        break
      case 'NEG':
        method = `-${math_number}`
        break
      case 'LN':
        method = `Math.log(${math_number})`
        break
      case 'LOG10':
        method = `Math.log(${math_number}) / Math.log(10)`
        break
      case 'EXP':
        method = `Math.exp(${math_number})`
        break
      case 'POW10':
        method = `Math.pow(10,${math_number})`
        break
    }

    let code = `${method}`

    if (inputType === 'oh_quantity') {
      code = `Quantity((${code}).toString() + ' ' + ${math_number_input}.symbol)`
    }
    return [code, javascriptGenerator.ORDER_FUNCTION_CALL]
  }

  Blockly.Blocks['oh_math_minmax'] = {
    init: function () {
      const dropDown = new Blockly.FieldDropdown([
        ['minimum of', 'min'],
        ['maximum of', 'max']
      ])
      this.appendDummyInput()
        .appendField(dropDown, 'OP')
      this.appendValueInput('NUM1')
        .setCheck(['Number', 'oh_quantity'])
      this.appendValueInput('NUM2')
        .appendField(' and ')
        .setCheck(['Number', 'oh_quantity'])

      this.setColour('%{BKY_MATH_HUE}')
      this.setInputsInline(true)
      let thisBlock = this
      this.setTooltip(function () {
        const operand = thisBlock.getFieldValue('OP')
        switch (operand) {
          case 'min': return 'Return the mimimum of both inputs'
          case 'max': return 'Return the maximum of both inputs'
        }
      })
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-math.html#minmax')
      this.setOutput(true, null)
    }
  }

  javascriptGenerator['oh_math_minmax'] = function (block) {
    const inputType1 = blockGetCheckedInputType(block, 'NUM1')
    const inputType2 = blockGetCheckedInputType(block, 'NUM2')
    let math_number_input1 = javascriptGenerator.valueToCode(block, 'NUM1', javascriptGenerator.ORDER_FUNCTION_CALL)
    let math_number_input2 = javascriptGenerator.valueToCode(block, 'NUM2', javascriptGenerator.ORDER_FUNCTION_CALL)

    const operand = block.getFieldValue('OP')

    if (inputType1 !== inputType2) {
      throw new Error(`both operand types need to be equal for  ${operand.toUpperCase()}-block (${math_number_input1} -> ${inputType1},${math_number_input2} -> ${inputType2})`)
    }

    let code = ''
    switch (operand) {
      case 'min':
        code = `Math.min(${math_number_input1},${math_number_input2})`
        if (inputType1 === 'oh_quantity' && inputType2 === 'oh_quantity') {
          code = `(${math_number_input1}.lessThan(${math_number_input2})) ? ${math_number_input1} : ${math_number_input2}`
        }
        break

      case 'max':
        code = `Math.max(${math_number_input1},${math_number_input2})`
        if (inputType1 === 'oh_quantity' && inputType2 === 'oh_quantity') {
          code = `(${math_number_input1}.greaterThan(${math_number_input2})) ? ${math_number_input1} : ${math_number_input2}`
        }
        break
    }

    return [code, javascriptGenerator.ORDER_FUNCTION_CALL]
  }
}
