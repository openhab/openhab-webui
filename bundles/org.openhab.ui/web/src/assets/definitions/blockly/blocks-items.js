/*
* General Item functionality for blockly
* supports jsscripting
*/

import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'
import { FieldItemModelPicker } from './fields/item-field'
import { FieldThingPicker } from './fields/thing-field'

export default function (f7, isGraalJs) {
  /* Helper block to allow selecting an item */
  Blockly.Blocks['oh_item'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('item')
        .appendField(new FieldItemModelPicker('MyItem', null, { f7 }), 'itemName')
      this.setColour(160)
      this.setInputsInline(true)
      this.setTooltip('Pick an item from the Model')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-items-things.html#item')
      this.setOutput(true, 'oh_item')
    }
  }

  javascriptGenerator['oh_item'] = function (block) {
    const itemName = block.getFieldValue('itemName')
    return [`'${itemName}'`, 0]
  }

  /* retrieve members of a group */
  Blockly.Blocks['oh_groupmembers'] = {
    init: function () {
      this.appendValueInput('groupName')
        .appendField('get members of group')
        .setCheck(['String', 'oh_item'])
      this.setInputsInline(false)
      this.setOutput(true, 'Array')
      this.setColour(0)
      this.setTooltip('Retrieve the members of a group')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-items-things.html#get-members-of-group')
      this.setOutput(true, null)
    }
  }

  javascriptGenerator['oh_groupmembers'] = function (block) {
    const groupName = javascriptGenerator.valueToCode(block, 'groupName', javascriptGenerator.ORDER_ATOMIC)

    if (isGraalJs) {
      return [`items.getItem(${groupName}).members`, 0]
    } else {
      return [`Java.from(itemRegistry.getItem(${groupName}).members)`, 0]
    }
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
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-items-things.html#get-items-with-tag')
      this.setOutput(true, null)
    }
  }

  javascriptGenerator['oh_taggeditems'] = function (block) {
    let tagNames = javascriptGenerator.valueToCode(block, 'tagName', javascriptGenerator.ORDER_ATOMIC)
    tagNames = tagNames.split(',')
    let tags = ''
    for (let i = 0; i < tagNames.length; i++) {
      if (i > 0) {
        tags += '\',\''
      }
      tags += tagNames[i]
    }

    if (isGraalJs) {
      return [`items.getItemsByTag(${tags})`, 0]
    } else {
      return [`Java.from(itemRegistry.getItemsByTag(${tags}))`, 0]
    }
  }

  Blockly.Blocks['oh_getitem'] = {
    init: function () {
      this.appendValueInput('itemName')
        .appendField('get item')
        .setCheck(['String', 'oh_item'])
      this.setInputsInline(false)
      this.setOutput(true, 'oh_itemtype')
      this.setColour(0)
      this.setTooltip('Get an item from the item registry')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-items-things.html#get-item')
    }
  }

  javascriptGenerator['oh_getitem'] = function (block) {
    const itemName = javascriptGenerator.valueToCode(block, 'itemName', javascriptGenerator.ORDER_ATOMIC)
    if (isGraalJs) {
      return [`items.getItem(${itemName})`, 0]
    } else {
      return [`itemRegistry.getItem(${itemName})`, 0]
    }
  }

  /* get info from items */
  Blockly.Blocks['oh_getitem_state'] = {
    init: function () {
      this.appendValueInput('itemName')
        .appendField('get state of item')
        .setCheck(['String', 'oh_item'])
      this.setInputsInline(false)
      this.setOutput(true, 'String')
      this.setColour(0)
      this.setTooltip('Get an item state from the item registry')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-items-things.html#get-state-of-item')
    }
  }

  javascriptGenerator['oh_getitem_state'] = function (block) {
    const itemName = javascriptGenerator.valueToCode(block, 'itemName', javascriptGenerator.ORDER_ATOMIC)
    if (isGraalJs) {
      return [`items.getItem(${itemName}).state`, 0]
    } else {
      return [`itemRegistry.getItem(${itemName}).getState()`, 0]
    }
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
        .setCheck('oh_itemtype')
        .appendField('get ')
        .appendField(dropdown, 'attributeName')
        .appendField('of item')

      this.setInputsInline(false)
      this.setOutput(true, 'String')
      this.setColour(0)
      this.setTooltip('Retrieve a specific attribute from the item. Note that groups and tags return a list and should be used with the loops-block \'for each item ... in list\'. ')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-items-things.html#get-particular-attributes-of-an-item')
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
  javascriptGenerator['oh_getitem_attribute'] = function (block) {
    const theItem = javascriptGenerator.valueToCode(block, 'item', javascriptGenerator.ORDER_ATOMIC)
    let attributeName = block.getFieldValue('attributeName')

    if (isGraalJs) {
      attributeName = attributeName.charAt(0).toLowerCase() + attributeName.slice(1)
      return [`${theItem}.${attributeName}`, 0]
    } else {
      if (attributeName === 'Tags' || attributeName === 'GroupNames') {
        return [`Java.from(${theItem}.get${attributeName}())`, 0]
      } else {
        return [`${theItem}.get${attributeName}()`, 0]
      }
    }
  }
}
