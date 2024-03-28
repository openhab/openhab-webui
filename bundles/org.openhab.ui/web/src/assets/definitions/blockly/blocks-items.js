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
      this.setHelpUrl('https://v34.openhab.org/docs/configuration/blockly/rules-blockly-items-things.html#item')
      this.setOutput(true, null)
    }
  }

  Blockly.JavaScript['oh_item'] = function (block) {
    const itemName = block.getFieldValue('itemName')
    let code = `'${itemName}'`
    return [code, 0]
  }

  /* retrieve members of a group */
  Blockly.Blocks['oh_groupmembers'] = {
    init: function () {
      this.appendValueInput('groupName')
        .appendField('get members of group')
        .setCheck('String')
      this.setInputsInline(false)
      this.setOutput(true, 'Array')
      this.setColour(0)
      this.setTooltip('Retrieve the members of a group')
      this.setHelpUrl('https://v34.openhab.org/docs/configuration/blockly/rules-blockly-items-things.html#get-members-of-group')
      this.setOutput(true, null)
    }
  }

  Blockly.JavaScript['oh_groupmembers'] = function (block) {
    const groupName = Blockly.JavaScript.valueToCode(block, 'groupName', Blockly.JavaScript.ORDER_ATOMIC)
    let code = `Java.from(itemRegistry.getItem(${groupName}).members)`
    return [code, 0]
  }

  /* retrieve items via their tags */
  Blockly.Blocks['oh_taggeditems'] = {
    init: function () {
      this.appendValueInput('tagName')
        .appendField('get items with tag')
        .setCheck('String')
      this.setInputsInline(false)
      this.setOutput(true, 'Array')
      this.setColour(0)
      this.setTooltip('Retrieve the items that have all the given tags')
      this.setHelpUrl('https://v34.openhab.org/docs/configuration/blockly/rules-blockly-items-things.html#get-items-with-tag')
      this.setOutput(true, null)
    }
  }

  Blockly.JavaScript['oh_taggeditems'] = function (block) {
    let tagNames = Blockly.JavaScript.valueToCode(block, 'tagName', Blockly.JavaScript.ORDER_ATOMIC)
    tagNames = tagNames.split(',')
    let tags = ''
    for (let i = 0; i < tagNames.length; i++) {
      if (i > 0) {
        tags += '\',\''
      }
      tags += tagNames[i]
    }
    let code = `Java.from(itemRegistry.getItemsByTag(${tags}))`
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
      this.setHelpUrl('https://v34.openhab.org/docs/configuration/blockly/rules-blockly-items-things.html#get-item')
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
      this.setHelpUrl('https://v34.openhab.org/docs/configuration/blockly/rules-blockly-items-things.html#get-state-of-item')
    }
  }

  Blockly.JavaScript['oh_getitem_state'] = function (block) {
    const itemName = Blockly.JavaScript.valueToCode(block, 'itemName', Blockly.JavaScript.ORDER_ATOMIC)
    let code = `itemRegistry.getItem(${itemName}).getState()`
    return [code, 0]
  }

  /*
  * Provides all attributes from an item
  * - name: String
  * - label: String
  * - state: State
  * - category: String
  * - tags: Array
  * - groups: Array
  * - type: String
  * Blockly part
  */
  Blockly.Blocks['oh_getitem_attribute'] = {
    init: function () {
      let thisBlock = this
      let dropdown = new Blockly.FieldDropdown(
        [['name', 'Name'], ['label', 'Label'], ['state', 'State'], ['category', 'Category'], ['tags', 'Tags'], ['groups', 'GroupNames'], ['type', 'Type']],
        function (newMode) {
          thisBlock.updateType_(newMode)
        })
      this.appendValueInput('item')
        .appendField('get ')
        .appendField(dropdown, 'attributeName')
        .appendField('of item')
        .setCheck('oh_itemtype')
      this.setInputsInline(false)
      this.setOutput(true, 'String')
      this.setColour(0)
      this.setTooltip('Retrieve a specific attribute from the item. Note that groups and tags return a list and should be used with the loops-block \'for each item ... in list\'. ')
      this.setHelpUrl('https://v34.openhab.org/docs/configuration/blockly/rules-blockly-items-things.html#get-particular-attributes-of-an-item')
    },
    /**
    * Modify this block to have the correct output type based on the attribute.
    */
    updateType_: function (newAttributeName) {
      let attributeName = this.getFieldValue('attributeName')
      if (newAttributeName === 'Tags' || newAttributeName === 'GroupNames') {
        this.outputConnection.setCheck('Array')
      } else {
        this.outputConnection.setCheck('String')
      }
    },
    /**
    * Create XML to represent the input and output types.
    * @return {!Element} XML storage element.
    * @this {Blockly.Block}
    */
    mutationToDom: function () {
      let container = Blockly.utils.xml.createElement('mutation')
      container.setAttribute('attributeName', this.getFieldValue('attributeName'))
      return container
    },
    /**
    * Parse XML to restore the input and output types.
    * @param {!Element} xmlElement XML storage element.
    * @this {Blockly.Block}
    */
    domToMutation: function (xmlElement) {
      this.updateType_(xmlElement.getAttribute('attributeName'))
    }
  }

  /*
  * Provides all attributes from an item
  * Code part
  */
  Blockly.JavaScript['oh_getitem_attribute'] = function (block) {
    const theItem = Blockly.JavaScript.valueToCode(block, 'item', Blockly.JavaScript.ORDER_ATOMIC)
    const attributeName = block.getFieldValue('attributeName')
    let code = ''
    if (attributeName === 'Tags' || attributeName === 'GroupNames') {
      code = `Java.from(${theItem}.get${attributeName}())`
    } else {
      code = `${theItem}.get${attributeName}()`
    }
    return [code, 0]
  }
}
