/*
 * Interact with the event bus in Blockly
 * supports jsscripting
 */

import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'

export default function (f7, isGraalJs) {
  Blockly.Blocks['oh_event'] = {
    init: function () {
      this.appendValueInput('value')
        .appendField(new Blockly.FieldDropdown([['send command', 'sendCommand'], ['post update', 'postUpdate']]), 'eventType')
      this.appendValueInput('itemName')
        .appendField('to')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck(['String', 'oh_item'])
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
      return `items.getItem(${itemName}).${eventType}(${value});\n`
    } else {
      return `events.${eventType}(${itemName}, ${value});\n`
    }
  }
}
