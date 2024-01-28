/*
* General Item functionality for blockly
* supports jsscripting
*/

import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript.js'
import { FieldItemModelPicker } from './fields/item-field.js'
import { blockGetCheckedInputType, generateItemCode } from './utils.js'

import api from '@/js/openhab/api'

export default function (f7, isGraalJs) {
  // this data was copy/pasted from https://icon-sets.iconify.design/f7/square-on-circle/ -> CSS:URL
  // to match MainUI's icon for Items menu
  const itemImage =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 56 56"%3E%3Cpath fill="%23000" d="M22.516 54.66h25.031c4.898 0 7.36-2.437 7.36-7.265V22.48c0-4.804-2.462-7.242-7.36-7.242h-8.602C36.601 7.246 29.148 1.34 20.406 1.34c-10.594 0-19.312 8.719-19.312 19.312c0 8.766 5.976 16.243 14.062 18.563v8.18c0 4.828 2.461 7.265 7.36 7.265M4.96 20.652c0-8.648 6.726-15.632 15.445-15.632c6.797 0 12.399 4.265 14.531 10.218h-12.42c-4.899 0-7.36 2.414-7.36 7.243v12.867C9.133 33.215 4.961 27.449 4.961 20.652m17.625 30.235c-2.344 0-3.656-1.266-3.656-3.703V22.69c0-2.437 1.312-3.68 3.656-3.68H47.5c2.297 0 3.633 1.243 3.633 3.68v24.516c0 2.414-1.336 3.68-3.633 3.68Z"/%3E%3C/svg%3E'

  /* Helper block to allow selecting an item */
  Blockly.Blocks['oh_item'] = {
    fieldPicker: null,
    init: function () {
      this.fieldPicker = new FieldItemModelPicker('MyItem', null, { f7 })
      this.appendDummyInput()
        .appendField(new Blockly.FieldImage(itemImage, 15, 15))
        .appendField(this.fieldPicker, 'itemName')
      this.setColour(0)
      this.setInputsInline(true)

      this.setTooltip(() => {
        let tooltip = 'Pick an Item from the Model'
        const itemData = this.fieldPicker.data
        if (itemData[0] !== itemData[1]) {
          tooltip = itemData[0]
        }
        return tooltip
      })
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-items-things.html#item')
      this.setOutput(true, 'oh_item')
    },
    _updateFieldPicker: function (name, label) {
      this.fieldPicker.data = [name, label]
    },
    mutationToDom: function () {
      const container = Blockly.utils.xml.createElement('mutation')

      if (!this.fieldPicker.data) { // "migrate" old storage
        this.fieldPicker.data = [this.fieldPicker.value_, this.fieldPicker.value_]
        if (this.fieldPicker.value_ && this.fieldPicker.value_ !== 'MyItem') {
          api.get(`/rest/items/${this.fieldPicker.value_}?metadata=^$`).then((data) => {
            this.fieldPicker.data = [this.fieldPicker.value_, data.label]
          }).catch()
        }
      }
      this.fieldPicker.value_ = (this.workspace.showLabels) ? this.fieldPicker.data[1] : this.fieldPicker.data[0]

      container.setAttribute('itemName', this.fieldPicker.data[0])
      container.setAttribute('itemLabel', this.fieldPicker.data[1])
      return container
    },
    domToMutation: function (xmlElement) {
      this._updateFieldPicker(xmlElement.getAttribute('itemName'), xmlElement.getAttribute('itemLabel'))
    }
  }

  javascriptGenerator.forBlock['oh_item'] = function (block) {
    const itemName = block.fieldPicker.data[0]
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
      this.setOutput(true, null) // Array of Item objects
    }
  }

  javascriptGenerator.forBlock['oh_groupmembers'] = function (block) {
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
      this.setOutput(true, null) // Array of Item objects
    }
  }

  javascriptGenerator.forBlock['oh_taggeditems'] = function (block) {
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

  javascriptGenerator.forBlock['oh_getitem'] = function (block) {
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
      this.appendValueInput('item')
        .appendField('get state of')
        .setCheck(['String', 'oh_item', 'oh_itemtype'])
      this.setInputsInline(false)
      this.setOutput(true, 'String')
      this.setColour(0)
      this.setTooltip('Get an item state from the item registry')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-items-things.html#get-state-of-item')
    }
  }

  javascriptGenerator.forBlock['oh_getitem_state'] = function (block) {
    const item = javascriptGenerator.valueToCode(block, 'item', javascriptGenerator.ORDER_ATOMIC)
    const itemType = blockGetCheckedInputType(block, 'item')
    const itemCode = generateItemCode(item, itemType, isGraalJs)

    return [`${itemCode}.state`, 0]
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
      const block = this
      const choices = [['name', 'Name'], ['label', 'Label'], ['state', 'State'], ['category', 'Category'], ['tags', 'Tags'], ['groups', 'GroupNames'], ['type', 'Type']]
      if (isGraalJs) {
        choices.splice(3, 0, ['numeric state', 'NumericState'])
        choices.splice(4, 0, ['quantity state', 'QuantityState'])
      }
      const dropdown = new Blockly.FieldDropdown(
        choices,
        function (newMode) {
          block._updateType(newMode)
        })
      this.appendValueInput('item')
        .setCheck(['String', 'oh_item', 'oh_itemtype'])
        .appendField('get')
        .appendField(dropdown, 'attributeName')
        .appendField('of')
      this.setInputsInline(false)

      this.setOutput(true, 'String')
      this.setColour(0)
      this.setTooltip('Retrieve a specific attribute from the item. Note that groups and tags return a list and should be used with the loops-block \'for each item ... in list\'. ')
      this.setTooltip(function () {
        const attributeName = block.getFieldValue('attributeName')
        let TIP = {
          'Name': 'name of the Item (string)',
          'Label': 'label of the Item (string)',
          'State': 'state of the Item (string)',
          'Category': 'category of the Item (string)',
          'Tags': 'tags of the Item (list of strings -> should be used with the loops-block \'for each item ... in list\')',
          'GroupNames': 'groups of the Item (list of strings -> should be used with the loops-block \'for each item ... in list\')',
          'Type': 'type of the Item (string)',
          'NumericState': 'numeric state of the Item (number)',
          'QuantityState': 'Unit of Measurement / quantity state of Item (Quantity)'
        }
        return TIP[attributeName] + ' \n Note: make sure to use "get item xxx"-Block for the connected block when working with Variables, not "item xxx"-Block'
      })
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-items-things.html#get-particular-attributes-of-an-item')
    },
    /**
     * Modify this block to have the correct output type based on the attribute.
     */
    _updateType: function (newAttributeName) {
      if (newAttributeName === 'Tags' || newAttributeName === 'GroupNames') {
        this.outputConnection.setCheck('Array')
      } else if (['Name', 'Label', 'State', 'Category', 'Type'].includes(newAttributeName)) {
        this.outputConnection.setCheck('String')
      } else if (newAttributeName === 'NumericState') {
        this.outputConnection.setCheck('Number')
      } else if (newAttributeName === 'QuantityState') {
        this.outputConnection.setCheck('oh_quantity')
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
      this._updateType(xmlElement.getAttribute('attributeName'))
    }
  }

  /*
  * Provides all attributes from an item
  * Code part
  */
  javascriptGenerator.forBlock['oh_getitem_attribute'] = function (block) {
    const item = javascriptGenerator.valueToCode(block, 'item', javascriptGenerator.ORDER_ATOMIC)
    const itemType = blockGetCheckedInputType(block, 'item')
    const itemCode = generateItemCode(item, itemType, isGraalJs)
    let attributeName = block.getFieldValue('attributeName')

    let code
    if (isGraalJs) {
      attributeName = attributeName.charAt(0).toLowerCase() + attributeName.slice(1)
      code = `${itemCode}.${attributeName}`
    } else {
      code = `${itemCode}.get${attributeName}()`
      if (attributeName === 'Tags' || attributeName === 'GroupNames') {
        code = `Java.from(${code}())`
      }
    }
    return [code, 0]
  }
}
