/*
 * Interact with the event bus in Blockly
 * supports jsscripting
 */

import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript.js'
import { blockGetCheckedInputType, generateItemCode } from './utils.js'

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
      this.appendValueInput('item')
        .appendField('to')
        .setCheck(['String', 'oh_item', 'oh_itemtype'])
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('Send a command to an item')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-items-things.html#send-command')
    }
  }

  javascriptGenerator.forBlock['oh_event'] = function (block) {
    const eventType = block.getFieldValue('eventType')

    const item = javascriptGenerator.valueToCode(block, 'item', javascriptGenerator.ORDER_ATOMIC)
    const itemType = blockGetCheckedInputType(block, 'item')
    const itemCode = generateItemCode(item, itemType, isGraalJs)

    const value = javascriptGenerator.valueToCode(block, 'value', javascriptGenerator.ORDER_ATOMIC)

    // Expect oh_itemtype as default because oh_groupmembers & oh_taggeditems return them
    if (isGraalJs) {
      return `${itemCode}.${eventType}(${value});\n`
    } else {
      const itemName = (itemType === 'oh_item' || itemType === 'String') ? item : `${item}.getName()`
      return `events.${eventType}(${itemName}, ${value});\n`
    }
  }
}
