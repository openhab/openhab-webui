/*
* These blocks allow values to be stored as "variables" in this.storedvars[] so they can "survive" when the rule is retriggered.
* Note that the variables are only global to the individual rule not others.
* supports jsscripting
*/

import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'

export default function defineOHBlocks_Variables (f7, isGraalJs) {
  Blockly.Blocks['oh_store_value'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('store value')
      this.appendValueInput('value')
        .setCheck(['Number', 'Boolean', 'String'])
      this.appendDummyInput()
        .appendField('into')
      this.appendValueInput('key')

      if (isGraalJs) {
        this.appendDummyInput()
          .appendField('to ')
          .appendField(new Blockly.FieldDropdown([['private', '.private'], ['shared', '.shared']]), 'cacheType')
          .appendField('cache')
      }
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      if (isGraalJs) {
        this.setTooltip('stores a value with a variable name that can be retrieved on subsequent runs of this rule/script to the private rule or shared global cache')
      } else {
        this.setTooltip('stores a value with a variable name that can be retrieved on subsequent runs of this rule/script')
      }
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-value-storage.html#store-value')
    }
  }

  javascriptGenerator['oh_store_value'] = function (block) {
    let key = javascriptGenerator.valueToCode(block, 'key', javascriptGenerator.ORDER_ATOMIC)
    let value = javascriptGenerator.valueToCode(block, 'value', javascriptGenerator.ORDER_ATOMIC)
    if (isGraalJs) {
      const cacheType = block.getFieldValue('cacheType')
      return `cache${cacheType}.put(${key}, ${value});\n`
    } else {
      addStoredValues()
      return `this.storedValues[${key}] = ${value};\n`
    }
  }

  Blockly.Blocks['oh_get_value'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('stored value')
      this.appendValueInput('key')
      if (isGraalJs) {
        this.appendDummyInput()
          .appendField('from ')
          .appendField(new Blockly.FieldDropdown([['private', '.private'], ['shared', '.shared']]), 'cacheType')
          .appendField('cache')
      }
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour(0)
      if (isGraalJs) {
        this.setTooltip('retrieves the value that was previously stored for that particular script/rule from the private rule or shared global cache')
      } else {
        this.setTooltip('retrieves the value that was previously stored for that particular script/rule')
      }
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-value-storage.html#get-stored-value')
    }
  }

  javascriptGenerator['oh_get_value'] = function (block) {
    let key = javascriptGenerator.valueToCode(block, 'key', javascriptGenerator.ORDER_ATOMIC)
    if (isGraalJs) {
      const cacheType = block.getFieldValue('cacheType')
      return [`cache${cacheType}.get(${key})`, javascriptGenerator.ORDER_NONE]
    } else {
      return [`this.storedValues[${key}]`, javascriptGenerator.ORDER_NONE]
    }
  }

  Blockly.Blocks['oh_check_undefined_value'] = {
    init: function () {
      this.appendValueInput('key')
      this.appendDummyInput()
        .appendField('is undefined')
      if (isGraalJs) {
        this.appendDummyInput()
          .appendField('in ')
          .appendField(new Blockly.FieldDropdown([['private', '.private'], ['shared', '.shared']]), 'cacheType')
          .appendField('cache')
      }
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour(0)
      if (isGraalJs) {
        this.setTooltip('returns whether the given value is undefined in the private rule or shared global cache')
      } else {
        this.setTooltip('returns whether the given value is undefined')
      }
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-value-storage.html#check-if-value-is-undefined')
    }
  }

  javascriptGenerator['oh_check_undefined_value'] = function (block) {
    let key = javascriptGenerator.valueToCode(block, 'key', javascriptGenerator.ORDER_ATOMIC)
    if (isGraalJs) {
      const cacheType = block.getFieldValue('cacheType')
      return [`cache${cacheType}.exists(${key}) === false`, javascriptGenerator.ORDER_NONE]
    } else {
      return [`typeof this.storedValues[${key}] === 'undefined'`, javascriptGenerator.ORDER_NONE]
    }
  }

  function addStoredValues () {
    let storedValues = 'if (typeof this.storedValues === \'undefined\') {\n  this.storedValues = [];\n}'
    javascriptGenerator.provideFunction_('storedValues', [storedValues])
  }
}
