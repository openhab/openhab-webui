/*
* These blocks allow values to be stored as "variables" in this.storedvars[] so they can "survive" when the rule is retriggered.
* Note that the variables are only global to the individual rule not others.
* supports jsscripting
*/

import Blockly from 'blockly'

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

      if (this.workspace && this.workspace.isGraalJs) {
        this.appendDummyInput()
          .appendField('to ')
          .appendField(new Blockly.FieldDropdown([['private', '.private'], ['shared', '.shared']]), 'cacheType')
          .appendField('cache')
      }
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      if (this.workspace && this.workspace.isGraalJs) {
        this.setTooltip('stores a value with a variable name that can be retrieved on subsequent runs of this rule/script to the private rule or shared global cache')
      } else {
        this.setTooltip('stores a value with a variable name that can be retrieved on subsequent runs of this rule/script')
      }
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-value-storage.html#store-value')
    }
  }

  Blockly.JavaScript['oh_store_value'] = function (block) {
    let key = Blockly.JavaScript.valueToCode(block, 'key', Blockly.JavaScript.ORDER_ATOMIC)
    let value = Blockly.JavaScript.valueToCode(block, 'value', Blockly.JavaScript.ORDER_ATOMIC)
    if (this.workspace && this.workspace.isGraalJs) {
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
      if (this.workspace && this.workspace.isGraalJs) {
        this.appendDummyInput()
          .appendField('from ')
          .appendField(new Blockly.FieldDropdown([['private', '.private'], ['shared', '.shared']]), 'cacheType')
          .appendField('cache')
      }
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour(0)
      if (this.workspace && this.workspace.isGraalJs) {
        this.setTooltip('retrieves the value that was previously stored for that particular script/rule from the private rule or shared global cache')
      } else {
        this.setTooltip('retrieves the value that was previously stored for that particular script/rule')
      }
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-value-storage.html#get-stored-value')
    }
  }

  Blockly.JavaScript['oh_get_value'] = function (block) {
    let key = Blockly.JavaScript.valueToCode(block, 'key', Blockly.JavaScript.ORDER_ATOMIC)
    if (this.workspace && this.workspace.isGraalJs) {
      const cacheType = block.getFieldValue('cacheType')
      return [`cache${cacheType}.get(${key})`, Blockly.JavaScript.ORDER_NONE]
    } else {
      return [`this.storedValues[${key}]`, Blockly.JavaScript.ORDER_NONE]
    }
  }

  Blockly.Blocks['oh_check_undefined_value'] = {
    init: function () {
      this.appendValueInput('key')
      this.appendDummyInput()
        .appendField('is undefined')
      if (this.workspace && this.workspace.isGraalJs) {
        this.appendDummyInput()
          .appendField('in ')
          .appendField(new Blockly.FieldDropdown([['private', '.private'], ['shared', '.shared']]), 'cacheType')
          .appendField('cache')
      }
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour(0)
      if (this.workspace && this.workspace.isGraalJs) {
        this.setTooltip('returns whether the given value is undefined in the private rule or shared global cache')
      } else {
        this.setTooltip('returns whether the given value is undefined')
      }
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-value-storage.html#check-if-value-is-undefined')
    }
  }

  Blockly.JavaScript['oh_check_undefined_value'] = function (block) {
    let key = Blockly.JavaScript.valueToCode(block, 'key', Blockly.JavaScript.ORDER_ATOMIC)
    if (this.workspace && this.workspace.isGraalJs) {
      const cacheType = block.getFieldValue('cacheType')
      return [`cache${cacheType}.exists(${key}) === false`, Blockly.JavaScript.ORDER_NONE]
    } else {
      return [`typeof this.storedValues[${key}] === 'undefined'`, Blockly.JavaScript.ORDER_NONE]
    }
  }

  function addStoredValues () {
    let storedValues = 'if (typeof this.storedValues === \'undefined\') {\n  this.storedValues = [];\n}'
    Blockly.JavaScript.provideFunction_('storedValues', [storedValues])
  }
}
