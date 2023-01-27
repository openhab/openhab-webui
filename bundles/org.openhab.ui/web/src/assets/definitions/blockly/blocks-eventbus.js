/*
 * Interact with the event bus in Blockly
 * supports jsscripting
 */

import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'
import { addItemName, addItemObject } from './utils'

export default function (f7, isGraalJs) {
  /*
    Send a command or post an update
    itemName: provide the name of the item ('String', 'oh_item') or even directly the item object ('oh_itemtype')
    note: the field name has not been changed from itemName to allow backward compatibility
  */
  Blockly.Blocks['oh_event'] = {
    init: function () {
      this.appendValueInput('value')
        .appendField(new Blockly.FieldDropdown([['send command', 'sendCommand'], ['post update', 'postUpdate']]), 'eventType')
      this.appendValueInput('itemName')
        .appendField('to')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck(['String', 'oh_item', 'oh_itemtype'])
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('Send a command to an item')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-items-things.html#send-command')
    }
  }

  javascriptGenerator['oh_event'] = function (block) {
    const eventType = block.getFieldValue('eventType')
    const itemName = javascriptGenerator.valueToCode(block, 'itemName', javascriptGenerator.ORDER_ATOMIC)
    const value = javascriptGenerator.valueToCode(block, 'value', javascriptGenerator.ORDER_ATOMIC)
    if (isGraalJs) {
      addItemObject(isGraalJs)
      return `_itemObject(${itemName}).${eventType}(${value});\n`
    } else {
      addItemName()
      return `events.${eventType}(_itemName(${itemName}), ${value});\n`
    }
  }
}
