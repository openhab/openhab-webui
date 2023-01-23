/*
* Adds new blocks for metadata support
* Note that the blocks are only support for GraalVM together with the JSScripting library
*/

import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'
import { addGetItemMetaConfigValue } from './utils'

export default function (f7, isGraalJs) {
  Blockly.Blocks['oh_get_meta_value'] = {
    init: function () {
      this.appendValueInput('itemName')
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
    const itemName = javascriptGenerator.valueToCode(block, 'itemName', javascriptGenerator.ORDER_ATOMIC)
    const namespace = javascriptGenerator.valueToCode(block, 'namespace', javascriptGenerator.ORDER_ATOMIC)

    if (isGraalJs) {
      return [`(items.metadata.getMetadata(${itemName}, ${namespace}) !== null) ? (items.metadata.getMetadata(${itemName}, ${namespace}).value) : 'undefined'`, javascriptGenerator.ORDER_CONDITIONAL]
    } else {
      return ['\'no implementation available for Nashorn\'', 0]
    }
  }

  Blockly.Blocks['oh_get_meta_config'] = {
    init: function () {
      this.appendValueInput('configKey')
        .appendField('get metadata config')
        .setCheck('String')
      this.appendValueInput('itemName')
        .appendField('of item')
        .setCheck(['String', 'oh_item'])
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
    const itemName = javascriptGenerator.valueToCode(block, 'itemName', javascriptGenerator.ORDER_ATOMIC)
    const namespace = javascriptGenerator.valueToCode(block, 'namespace', javascriptGenerator.ORDER_ATOMIC)
    addGetItemMetaConfigValue()

    if (isGraalJs) {
      return [`getItemMetaConfigValue(${itemName}, ${namespace}, ${configKey})`, javascriptGenerator.ORDER_CONDITIONAL]
    } else {
      return ['\'no implementation available for Nashorn\'', 0]
    }
  }

  Blockly.Blocks['oh_store_meta_value'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('store')
      this.appendValueInput('value')
        .setCheck(['Number', 'Boolean', 'String'])
      this.appendValueInput('namespace')
        .appendField('to value into namespace')
      this.appendValueInput('itemName')
        .appendField('of item')
        .setCheck(['String', 'oh_item'])

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
    const itemName = javascriptGenerator.valueToCode(block, 'itemName', javascriptGenerator.ORDER_ATOMIC)
    const namespace = javascriptGenerator.valueToCode(block, 'namespace', javascriptGenerator.ORDER_ATOMIC)

    let itemMeta = addItemMeta()
    let code = `${itemMeta} = items.metadata.getMetadata(_itemName(${itemName}), ${namespace})\n`
    code += `${itemMeta}.value = ${value}\n`
    code += `items.metadata.replaceMetadata(${itemName}, ${namespace}, ${itemMeta}.value, ${itemMeta}.configuration);\n`
    if (isGraalJs) {
      return code
    } else {
      return '// no implementation available for Nashorn\n'
    }
  }

  Blockly.Blocks['oh_store_meta_config'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('store ')
      this.appendValueInput('value')
        .setCheck(['Number', 'Boolean', 'String'])
      this.appendValueInput('configName')
        .appendField('to config')
      this.appendValueInput('namespace')
        .appendField('into namespace')
      this.appendValueInput('itemName')
        .appendField('of item')
        .setCheck(['String', 'oh_item'])

      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('stores the value into a config property of the given metadata namespace. Use .-notation for easy access of hierachic properties, ie. level1.level2.myConfig = 123.\nProperties have to exist and are not created.')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/https://www.openhab.org/docs/configuration/blockly/rules-blockly-metadata.html#store_meta_value')
    }
  }

  javascriptGenerator['oh_store_meta_config'] = function (block) {
    const value = javascriptGenerator.valueToCode(block, 'value', javascriptGenerator.ORDER_ATOMIC)
    const configName = javascriptGenerator.valueToCode(block, 'configName', javascriptGenerator.ORDER_ATOMIC).replaceAll('\'', '')
    const itemName = javascriptGenerator.valueToCode(block, 'itemName', javascriptGenerator.ORDER_ATOMIC)
    const namespace = javascriptGenerator.valueToCode(block, 'namespace', javascriptGenerator.ORDER_ATOMIC)

    let itemMeta = addItemMeta()
    let code = `${itemMeta} = items.metadata.getMetadata(${itemName}, ${namespace})\n`
    code += `if(${itemMeta} !== null) {\n`
    code += `  ${itemMeta}.configuration.${configName} = ${value}\n`
    code += `  items.metadata.replaceMetadata(${itemName}, ${namespace}, ${itemMeta}.value, ${itemMeta}.configuration);\n`
    code += '};\n'
    if (isGraalJs) {
      return code
    } else {
      return '// no implementation available for Nashorn\n'
    }
  }

  function addItemMeta () {
    if (isGraalJs) {
      return javascriptGenerator.provideFunction_(
        'itemMetadata',
        ['var ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + ';'])
    } else {
      return '// no implementation available for Nashorn\n'
    }
  }
}
