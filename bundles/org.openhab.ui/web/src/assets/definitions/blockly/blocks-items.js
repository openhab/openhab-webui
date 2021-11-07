/*
* General item and thing functionally for blockly
*/

import Blockly from 'blockly'
import { FieldItemModelPicker } from './fields/item-field'
import { FieldThingPicker } from './fields/thing-field'

export default function (f7) {
  /* Helper block to allow selecting an item */
  Blockly.Blocks['oh_item'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('item')
        .appendField(new FieldItemModelPicker('MyItem', null, { f7 }), 'itemName')
      this.setColour(160)
      this.setInputsInline(true)
      this.setTooltip('Pick an item from the Model')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/items.html')
      this.setOutput(true, null)
    }
  }

  Blockly.JavaScript['oh_item'] = function (block) {
    const itemName = block.getFieldValue('itemName')
    let code = `'${itemName}'`
    return [code, 0]
  }

  /* get item structures */
  Blockly.Blocks['oh_groupmembers'] = {
    init: function () {
      this.appendValueInput('groupName')
        .appendField('get members of group')
        .setCheck('String')
      this.setInputsInline(false)
      this.setOutput(true, 'Array')
      this.setColour(0)
      this.setTooltip('Retrieve the members of a group')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/items.html')
      this.setOutput(true, null)
    }
  }

  Blockly.JavaScript['oh_groupmembers'] = function (block) {
    const groupName = Blockly.JavaScript.valueToCode(block, 'groupName', Blockly.JavaScript.ORDER_ATOMIC)
    let code = `Java.from(itemRegistry.getItem(${groupName}).members)`
    return [code, 0]
  }

  Blockly.Blocks['oh_getitem'] = {
    init: function () {
      this.appendValueInput('itemName')
        .appendField('get item')
        .setCheck('String')
      this.setInputsInline(false)
      this.setOutput(true, 'oh_itemtype')
      this.setColour(0)
      this.setTooltip('Get an item from the item registry')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/items.html')
    }
  }

  Blockly.JavaScript['oh_getitem'] = function (block) {
    const itemName = Blockly.JavaScript.valueToCode(block, 'itemName', Blockly.JavaScript.ORDER_ATOMIC)
    let code = `itemRegistry.getItem(${itemName})`
    return [code, 0]
  }

  /* get info from items */
  Blockly.Blocks['oh_getitem_state'] = {
    init: function () {
      this.appendValueInput('itemName')
        .appendField('get state of item')
        .setCheck('String')
      this.setInputsInline(false)
      this.setOutput(true, 'String')
      this.setColour(0)
      this.setTooltip('Get an item state from the item registry')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/items.html#state')
    }
  }

  Blockly.JavaScript['oh_getitem_state'] = function (block) {
    const itemName = Blockly.JavaScript.valueToCode(block, 'itemName', Blockly.JavaScript.ORDER_ATOMIC)
    let code = `itemRegistry.getItem(${itemName}).getState()`
    return [code, 0]
  }

  Blockly.Blocks['oh_getitem_attribute'] = {
    init: function () {
      this.appendValueInput('item')
        .appendField('get ')
        .appendField(new Blockly.FieldDropdown([['name', 'Name'], ['label', 'Label'], ['state', 'State'], ['category', 'Category'], ['tags', 'Tags'], ['groups', 'GroupNames'], ['type', 'Type']]), 'attributeName')
        .appendField('of item')
        .setCheck('oh_itemtype')
      this.setInputsInline(false)
      this.setOutput(true, 'any')
      this.setColour(0)
      this.setTooltip('Retrieve a specific attribute from the item')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/items.html')
    }
  }

  Blockly.JavaScript['oh_getitem_attribute'] = function (block) {
    const theItem = Blockly.JavaScript.valueToCode(block, 'item', Blockly.JavaScript.ORDER_ATOMIC)
    const attributeName = block.getFieldValue('attributeName')
    let code = `${theItem}.get${attributeName}()`
    return [code, 0]
  }
}
