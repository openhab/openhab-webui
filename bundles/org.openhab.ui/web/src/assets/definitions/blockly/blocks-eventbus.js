/*
 * Interact with the event bus in Blockly
 * supports jsscripting
 */

import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript.js'
import { blockGetCheckedInputType } from './utils.js'

export default function (f7) {
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

  javascriptGenerator.forBlock['oh_event'] = function (block) {
    const eventType = block.getFieldValue('eventType')
    const itemName = javascriptGenerator.valueToCode(block, 'itemName', javascriptGenerator.ORDER_ATOMIC)
    const value = javascriptGenerator.valueToCode(block, 'value', javascriptGenerator.ORDER_ATOMIC)

    const inputType = blockGetCheckedInputType(block, 'itemName')

    // Expect oh_itemtype as default because oh_groupmembers & oh_taggeditems return them
    return (inputType === 'oh_item' || inputType === 'String') ? `items.getItem(${itemName}).${eventType}(${value});\n` : `${itemName}.${eventType}(${value});\n`
  }
}
