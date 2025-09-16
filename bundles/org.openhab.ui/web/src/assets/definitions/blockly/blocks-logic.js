/*
* Adds new blocks to the logic section
*/

import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript.js'

export default function (f7) {
  /*
* Add a block returning undefined
* Blockly part
*/
  Blockly.Blocks['oh_logic_undefined'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('undefined')
      this.setOutput(true, null)
      this.setColour('%{BKY_LOGIC_HUE}')
      this.setTooltip('returns undefined as value')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-standard-ext.html#logic')
    }
  }

  /*
  * returns undefined
  * Code part
  */
  javascriptGenerator.forBlock['oh_logic_undefined'] = function (block) {
    return ['undefined', javascriptGenerator.ORDER_ATOMIC]
  }

  /**
   * Basic block for AND / OR with mutator to add more operands
   * based on an idea and code pasted by Adrian Buzea in the Blockly forum at https://groups.google.com/g/blockly/c/aIlJVdVyRDk/m/ks6YZP7pAAAJ
   *
   * Blockly part
   */
  Blockly.Blocks['oh_logic_multiple'] = {
    init: function () {
      this.appendDummyInput().appendField(new Blockly.FieldDropdown([
        ['AND', 'AND'], ['OR', 'OR']
      ]), 'operand')
      this.appendValueInput('OPER1').setCheck('Boolean')
      this.appendValueInput('OPER2').setCheck('Boolean')
      this.setInputsInline(false)
      this.setOutput(true, 'Boolean')
      this.setColour('%{BKY_LOGIC_HUE}')
      this.setTooltip('Logical AND / OR with multiple operands')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-standard-ext.html#logic')
      this.setMutator(new Blockly.icons.MutatorIcon(['oh_logic_multiple_condition_block'], this))
      this.numberOfChildren = 2
    },
    mutationToDom: function () {
      if (!this.numberOfChildren) {
        return null
      }
      let container = document.createElement('mutation')
      if (this.numberOfChildren) {
        container.setAttribute('children', this.numberOfChildren)
      }
      return container
    },
    domToMutation: function (xmlElement) {
      this.numberOfChildren = parseInt(xmlElement.getAttribute('children'), 10) || 0
      for (let i = 3; i <= this.numberOfChildren; i++) {
        this.appendValueInput('OPER' + i)
          .setCheck('Boolean')
      }
    },
    decompose: function (workspace) {
      let containerBlock = workspace.newBlock('oh_logic_multiple_container_block')
      containerBlock.initSvg()
      let connection = containerBlock.getInput('STACK').connection
      for (let i = 1; i <= this.numberOfChildren; i++) {
        let conditionBlock = workspace.newBlock('oh_logic_multiple_condition_block')
        conditionBlock.initSvg()
        connection.connect(conditionBlock.previousConnection)
        connection = conditionBlock.nextConnection
      }
      return containerBlock
    },
    compose: function (containerBlock) {
      for (let i = this.numberOfChildren; i > 0; i--) {
        this.removeInput('OPER' + i)
      }
      this.numberOfChildren = 0
      let clauseBlock = containerBlock.getInputTargetBlock('STACK')
      while (clauseBlock) {
        this.numberOfChildren++
        let operatorInput = this.appendValueInput('OPER' + this.numberOfChildren)
          .setCheck('Boolean')
        if (clauseBlock.valueConnection_) {
          operatorInput.connection.connect(clauseBlock.valueConnection_)
        }
        clauseBlock = clauseBlock.nextConnection && clauseBlock.nextConnection.targetBlock()
      }
    },
    saveConnections: function (containerBlock) {
      let clauseBlock = containerBlock.getInputTargetBlock('STACK')
      let i = 1
      while (clauseBlock) {
        let operatorInput = this.getInput('OPER' + i)
        clauseBlock.valueConnection_ = operatorInput && operatorInput.connection.targetConnection
        i++
        clauseBlock = clauseBlock.nextConnection && clauseBlock.nextConnection.targetBlock()
      }
    }
  }

  /*
  * Generates the JS code for the AND / OR block
  * Code part
  */
  javascriptGenerator.forBlock['oh_logic_multiple'] = function (block) {
    let operator = block.getFieldValue('operand') === 'AND' ? '&&' : '||'
    let code = ''
    for (let i = 1; i <= block.numberOfChildren; i++) {
      if (i > 1) {
        code += ' ' + operator + ' '
      }
      let input = javascriptGenerator.valueToCode(block, 'OPER' + i, javascriptGenerator.ORDER_ATOMIC) || 'false'
      code += '(' + input + ')'
    }
    return [code, javascriptGenerator.ORDER_ATOMIC]
  }

  /*
  * Block for the mutator container that holds the condition blocks
  */
  Blockly.Blocks['oh_logic_multiple_container_block'] =
    {
      init: function () {
        this.setColour('%{BKY_LOGIC_HUE}')
        this.appendDummyInput()
          .appendField('Operation AND/OR')
        this.appendStatementInput('STACK')
        this.setTooltip('multiple and control')
        this.contextMenu = false
      }
    }

  /*
  * Block for the condition operands in the mutator
  */
  Blockly.Blocks['oh_logic_multiple_condition_block'] =
    {
      init: function () {
        this.setColour('%{BKY_LOGIC_HUE}')
        this.appendDummyInput()
          .appendField('condition')
        this.setPreviousStatement(true)
        this.setNextStatement(true)
        this.setTooltip('conditionalStatement')
        this.contextMenu = false
      }
    }
}
