/*
* These blocks allow values to be stored as "variables" in this.storedvars[] so they can "survive" when the rule is retriggered.
* Note that the variables are only global to the individual rule not others.
* supports jsscripting
*/

import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript.js'

export default function defineOHBlocks_Variables (f7) {
  Blockly.Blocks['oh_store_value'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('store value')
      this.appendValueInput('value')
        .setCheck(['Number', 'Boolean', 'String'])
      this.appendDummyInput()
        .appendField('into')
      this.appendValueInput('key')
      this.appendDummyInput()
        .appendField('to ')
        .appendField(new Blockly.FieldDropdown([['private', '.private'], ['shared', '.shared']]), 'cacheType')
        .appendField('cache')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('stores a value with a variable name that can be retrieved on subsequent runs of this rule/script to the private rule or shared global cache')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-value-storage.html#store-value')
    }
  }

  javascriptGenerator.forBlock['oh_store_value'] = function (block) {
    const key = javascriptGenerator.valueToCode(block, 'key', javascriptGenerator.ORDER_ATOMIC)
    const value = javascriptGenerator.valueToCode(block, 'value', javascriptGenerator.ORDER_ATOMIC)
    const cacheType = block.getFieldValue('cacheType')
    return `cache${cacheType}.put(${key}, ${value});\n`
  }

  Blockly.Blocks['oh_get_value'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('stored value')
      this.appendValueInput('key')
      this.appendDummyInput()
        .appendField('from ')
        .appendField(new Blockly.FieldDropdown([['private', '.private'], ['shared', '.shared']]), 'cacheType')
        .appendField('cache')
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour(0)
      this.setTooltip('retrieves the value that was previously stored for that particular script/rule from the private rule or shared global cache')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-value-storage.html#get-stored-value')
    }
  }

  javascriptGenerator.forBlock['oh_get_value'] = function (block) {
    const key = javascriptGenerator.valueToCode(block, 'key', javascriptGenerator.ORDER_ATOMIC)
    const cacheType = block.getFieldValue('cacheType')
    return [`cache${cacheType}.get(${key})`, javascriptGenerator.ORDER_NONE]
  }

  Blockly.Blocks['oh_check_undefined_value'] = {
    init: function () {
      this.appendValueInput('key')
      this.appendDummyInput()
        .appendField('is undefined')
      this.appendDummyInput()
        .appendField('in ')
        .appendField(new Blockly.FieldDropdown([['private', '.private'], ['shared', '.shared']]), 'cacheType')
        .appendField('cache')
      this.setInputsInline(true)
      this.setOutput(true, 'Boolean')
      this.setColour(0)
      this.setTooltip('returns whether the given value is undefined in the private rule or shared global cache')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-value-storage.html#check-if-value-is-undefined')
    }
  }

  javascriptGenerator.forBlock['oh_check_undefined_value'] = function (block) {
    const key = javascriptGenerator.valueToCode(block, 'key', javascriptGenerator.ORDER_ATOMIC)
    const cacheType = block.getFieldValue('cacheType')
    return [`cache${cacheType}.exists(${key}) === false`, javascriptGenerator.ORDER_NONE]
  }
}
