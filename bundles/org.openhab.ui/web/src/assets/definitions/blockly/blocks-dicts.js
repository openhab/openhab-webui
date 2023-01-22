/**
 * supports jsscripting
 */

import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'

export default function (f7, isGraalJs) {
  Blockly.Blocks['dicts_create_with'] = {
    /**
     * Block for creating a list with any number of elements of any type.
     * @this {Blockly.Block}
     */
    init: function () {
      this.setStyle('list_blocks')
      this.itemCount_ = 3
      this.updateShape_()
      this.setOutput(true, 'Dictionary')
      this.setMutator(new Blockly.Mutator(['dicts_create_with_item']))
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-standard-ext.html#dictionary-for-managing-key-value-pairs')
      this.setTooltip('Create a key/value dictionary')
    },
    /**
     * Create XML to represent list inputs.
     * @return {!Element} XML storage element.
     * @this {Blockly.Block}
     */
    mutationToDom: function () {
      let container = Blockly.utils.xml.createElement('mutation')
      container.setAttribute('items', this.itemCount_)
      return container
    },
    /**
     * Parse XML to restore the list inputs.
     * @param {!Element} xmlElement XML storage element.
     * @this {Blockly.Block}
     */
    domToMutation: function (xmlElement) {
      this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10)
      this.updateShape_()
    },
    /**
     * Populate the mutator's dialog with this block's components.
     * @param {!Blockly.Workspace} workspace Mutator's workspace.
     * @return {!Blockly.Block} Root block in mutator.
     * @this {Blockly.Block}
     */
    decompose: function (workspace) {
      let containerBlock = workspace.newBlock('dicts_create_with_container')
      containerBlock.initSvg()
      let connection = containerBlock.getInput('STACK').connection
      for (let i = 0; i < this.itemCount_; i++) {
        let itemBlock = workspace.newBlock('dicts_create_with_item')
        itemBlock.initSvg()
        connection.connect(itemBlock.previousConnection)
        connection = itemBlock.nextConnection
      }
      return containerBlock
    },
    /**
     * Reconfigure this block based on the mutator dialog's components.
     * @param {!Blockly.Block} containerBlock Root block in mutator.
     * @this {Blockly.Block}
     */
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
    /**
     * Store pointers to any connected child blocks.
     * @param {!Blockly.Block} containerBlock Root block in mutator.
     * @this {Blockly.Block}
     */
    saveConnections: function (containerBlock) {
      let itemBlock = containerBlock.getInputTargetBlock('STACK')
      let i = 0
      while (itemBlock) {
        let input = this.getInput('ADD' + i)
        itemBlock.valueConnection_ = input && input.connection.targetConnection
        i++
        itemBlock = itemBlock.nextConnection &&
            itemBlock.nextConnection.targetBlock()
      }
    },
    /**
     * Modify this block to have the correct number of inputs.
     * @private
     * @this {Blockly.Block}
     */
    updateShape_: function () {
      if (this.itemCount_ && this.getInput('EMPTY')) {
        this.removeInput('EMPTY')
      } else if (!this.itemCount_ && !this.getInput('EMPTY')) {
        this.appendDummyInput('EMPTY')
          .appendField('create empty dictionary')
      }
      // Add new inputs.
      let i
      for (i = 0; i < this.itemCount_; i++) {
        if (!this.getInput('ADD' + i)) {
          let input = this.appendValueInput('ADD' + i)
            .setAlign(Blockly.ALIGN_RIGHT)
          if (i === 0) {
            input.appendField('dictionary of')
          }
          input.appendField(new Blockly.FieldTextInput('key' + i), 'KEY' + i)
        }
      }
      // Remove deleted inputs.
      while (this.getInput('ADD' + i)) {
        this.removeInput('ADD' + i)
        i++
      }
    }
  }

  Blockly.Blocks['dicts_create_with_container'] = {
    /**
     * Mutator block for list container.
     * @this {Blockly.Block}
     */
    init: function () {
      this.setStyle('list_blocks')
      this.appendDummyInput()
        .appendField('key/values')
      this.appendStatementInput('STACK')
      this.setTooltip('Initialize a Dictionary')
      this.contextMenu = false
    }
  }

  Blockly.Blocks['dicts_create_with_item'] = {
    /**
     * Mutator block for adding items.
     * @this {Blockly.Block}
     */
    init: function () {
      this.setStyle('list_blocks')
      this.appendDummyInput()
        .appendField('key')
      this.setPreviousStatement(true)
      this.setNextStatement(true)
      this.setTooltip('add a key/value to the dictionary')
      this.contextMenu = false
    }
  }

  javascriptGenerator['dicts_create_with'] = function (block) {
    // Create an object with any number of elements of any type.
    let elements = new Array(block.itemCount_)
    for (let i = 0; i < block.itemCount_; i++) {
      elements[i] = '\'' + block.getFieldValue('KEY' + i) + '\': '
      elements[i] += javascriptGenerator.valueToCode(block, 'ADD' + i,
        javascriptGenerator.ORDER_NONE) || 'null'
    }
    let code = '{' + elements.join(', ') + '}'
    return [code, javascriptGenerator.ORDER_ATOMIC]
  }

  /*
  * Allows retrieving parameters provided by a rule
  * Blockly part
  */
  Blockly.Blocks['dicts_get'] = {
    init: function () {
      this.setStyle('list_blocks')
      this.appendValueInput('key')
        .appendField('get')
        .setCheck('String')
      this.appendValueInput('varName')
        .appendField('from dictionary')
        .setCheck('String')
      this.setInputsInline(true)
      this.setOutput(true, 'String')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-standard-ext.html#get-value-of-key-from-dictionary')
      this.setTooltip('Retrieve a specified attribute from the context that could be set from a calling rule or script')
    }
  }

  /*
  * Allows retrieving parameters provided by a rule
  * Code part
  */
  javascriptGenerator['dicts_get'] = function (block) {
    const key = javascriptGenerator.valueToCode(block, 'key', javascriptGenerator.ORDER_ATOMIC)
    const varName = javascriptGenerator.valueToCode(block, 'varName', javascriptGenerator.ORDER_ATOMIC).replace(/'/g, '')
    let code = `${varName}[${key}]`
    return [code, 0]
  }
}
