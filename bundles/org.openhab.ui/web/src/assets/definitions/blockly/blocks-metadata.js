/*
* Adds new blocks for metadata support
* Note that the blocks are only support for GraalVM together with the JSScripting library
*/

import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript.js'
import { addGetItemMetaConfigValue } from './utils.js'

const unavailMsg = 'Metadata blocks aren\'t supported in "application/javascript;version=ECMAScript-5.1"'

export default function (f7, isGraalJs) {
  /*
   Get the main value from the metadata namespace
   item: either the item name string or the item object
   namespace: string
  */
  Blockly.Blocks['oh_get_meta_value'] = {
    init: function () {
      this.appendValueInput('theItem')
        .appendField('get metadata value of item')
        .setCheck(['String', 'oh_item', 'oh_itemtype'])
      this.appendValueInput('namespace')
        .appendField('from namespace')
      this.setInputsInline(true)
      this.setOutput(true, 'String')
      this.setColour(0)
      this.setTooltip('get the main metadata value of item from that particular configuration namespace')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-metadata.html#get_meta_value')
    }
  }

  javascriptGenerator['oh_get_meta_value'] = function (block) {
    const theItem = javascriptGenerator.valueToCode(block, 'theItem', javascriptGenerator.ORDER_ATOMIC)
    const namespace = javascriptGenerator.valueToCode(block, 'namespace', javascriptGenerator.ORDER_ATOMIC)

    if (isGraalJs) {
      return [`(items.metadata.getMetadata(${theItem}, ${namespace}) !== null) ? (items.metadata.getMetadata(${theItem}, ${namespace}).value) : 'undefined'`, javascriptGenerator.ORDER_CONDITIONAL]
    } else {
      throw new Error(unavailMsg)
    }
  }

  /*
   Get a config value from the metadata namespace
   configKey: the name of the property. Hierarchies can be address via dot notation like level1.level2.mykey
   item: either the item name string or the item object
   namespace: string
  */
  Blockly.Blocks['oh_get_meta_config'] = {
    init: function () {
      this.appendValueInput('configKey')
        .appendField('get metadata config')
        .setCheck('String')
      this.appendValueInput('theItem')
        .appendField('of item')
        .setCheck(['String', 'oh_item', 'oh_itemtype'])
      this.appendValueInput('namespace')
        .appendField('from namespace')
      this.setInputsInline(true)
      this.setOutput(true, 'String')
      this.setColour(0)
      this.setTooltip('get meta config of item from that particular configuration namespace.\nUse .-notation for easy access of hierachic properties, ie. level1.level2.myConfig = 123')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-metadata.html#get_meta_config')
    }
  }

  javascriptGenerator['oh_get_meta_config'] = function (block) {
    const configKey = javascriptGenerator.valueToCode(block, 'configKey', javascriptGenerator.ORDER_ATOMIC)
    const theItem = javascriptGenerator.valueToCode(block, 'theItem', javascriptGenerator.ORDER_ATOMIC)
    const namespace = javascriptGenerator.valueToCode(block, 'namespace', javascriptGenerator.ORDER_ATOMIC)
    addGetItemMetaConfigValue()

    if (isGraalJs) {
      return [`getItemMetaConfigValue(${theItem}, ${namespace}, ${configKey})`, javascriptGenerator.ORDER_CONDITIONAL]
    } else {
      throw new Error(unavailMsg)
    }
  }

  /*
   Store a value into the main metadata value of the namespace
   value: Number, boolean or String
   item: either the item name string or the item object
   namespace: string
  */
  Blockly.Blocks['oh_store_meta_value'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('store')
      this.appendValueInput('value')
        .setCheck(['Number', 'Boolean', 'String'])
      this.appendValueInput('namespace')
        .appendField('to value into namespace')
      this.appendValueInput('theItem')
        .appendField('of item')
        .setCheck(['String', 'oh_item', 'oh_itemtype'])

      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('stores the value into the main value of the given metadata namespace')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/https://www.openhab.org/docs/configuration/blockly/rules-blockly-metadata.html#store_meta_value')
    }
  }

  javascriptGenerator['oh_store_meta_value'] = function (block) {
    const value = javascriptGenerator.valueToCode(block, 'value', javascriptGenerator.ORDER_ATOMIC)
    const theItem = javascriptGenerator.valueToCode(block, 'theItem', javascriptGenerator.ORDER_ATOMIC)
    const namespace = javascriptGenerator.valueToCode(block, 'namespace', javascriptGenerator.ORDER_ATOMIC)

    let itemMeta = addItemMeta()
    let code = `${itemMeta} = items.metadata.getMetadata(${theItem}, ${namespace});\n`
    code += `${itemMeta} = (${itemMeta} === null) ? { value: '', configuration: {} } : ${itemMeta};\n`
    code += `${itemMeta}.value = ${value};\n`
    code += `items.metadata.replaceMetadata(${theItem}, ${namespace}, ${itemMeta}.value, ${itemMeta}.configuration);\n`
    if (isGraalJs) {
      return code
    } else {
      throw new Error(unavailMsg)
    }
  }

  /*
   Store a value into a config property namespace's metadata
   value: Number, boolean or String
   configKey: the name of the property. Hierarchies can be address via dot notation like level1.level2.mykey
   item: either the item name string or the item object
   namespace: string
  */
  Blockly.Blocks['oh_store_meta_config'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('store ')
      this.appendValueInput('value')
        .setCheck(['Number', 'Boolean', 'String'])
      this.appendValueInput('configKey')
        .appendField('to config')
      this.appendValueInput('namespace')
        .appendField('into namespace')
      this.appendValueInput('theItem')
        .appendField('of item')
        .setCheck(['String', 'oh_item', 'oh_itemtype'])

      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('stores the value into a config property of the given metadata namespace. Use .-notation for easy access of hierarchic properties, ie. level1.level2.myConfig = 123.\nProperties have to exist and are not created.')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/https://www.openhab.org/docs/configuration/blockly/rules-blockly-metadata.html#store_meta_value')
    }
  }

  javascriptGenerator['oh_store_meta_config'] = function (block) {
    const value = javascriptGenerator.valueToCode(block, 'value', javascriptGenerator.ORDER_ATOMIC)
    const configKey = javascriptGenerator.valueToCode(block, 'configKey', javascriptGenerator.ORDER_ATOMIC).replaceAll('\'', '')
    const theItem = javascriptGenerator.valueToCode(block, 'theItem', javascriptGenerator.ORDER_ATOMIC)
    const namespace = javascriptGenerator.valueToCode(block, 'namespace', javascriptGenerator.ORDER_ATOMIC)

    let itemMeta = addItemMeta()
    let code = `${itemMeta} = items.metadata.getMetadata(${theItem}, ${namespace});\n`
    code += `${itemMeta} = (${itemMeta} === null) ? { value: '', configuration: {} } : ${itemMeta};\n`
    code += `${itemMeta}.configuration.${configKey} = ${value};\n`
    code += `items.metadata.replaceMetadata(${theItem}, ${namespace}, ${itemMeta}.value, ${itemMeta}.configuration);\n`
    if (isGraalJs) {
      return code
    } else {
      throw new Error(unavailMsg)
    }
  }

  function addItemMeta () {
    if (isGraalJs) {
      return javascriptGenerator.provideFunction_(
        'itemMetadata',
        ['var ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + ';'])
    } else {
      throw new Error(unavailMsg)
    }
  }
}
