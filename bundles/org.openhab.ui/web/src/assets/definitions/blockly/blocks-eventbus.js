/*
 * Interact with the event bus in Blockly
 */

import Blockly from 'blockly'

export default function (f7) {
  Blockly.Blocks['oh_event'] = {
    init: function () {
      this.appendValueInput('value')
        .appendField(new Blockly.FieldDropdown([['send command', 'sendCommand'], ['post update', 'postUpdate']]), 'eventType')
      this.appendValueInput('itemName')
        .appendField('to')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('String')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('Send a command to an item')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/actions.html#event-bus-actions')
    }
  }

  Blockly.JavaScript['oh_event'] = function (block) {
    const eventType = block.getFieldValue('eventType')
    const itemName = Blockly.JavaScript.valueToCode(block, 'itemName', Blockly.JavaScript.ORDER_ATOMIC)
    const value = Blockly.JavaScript.valueToCode(block, 'value', Blockly.JavaScript.ORDER_ATOMIC)
    return 'events.' + eventType + '(' + itemName + ', ' + value + ');\n'
  }

  /*
  * Provides event information that is provided when a rule is triggerd
  * Blockly part
  */
  Blockly.Blocks['oh_event_attribute'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('the')
        .appendField(new Blockly.FieldDropdown([
          ['new State', 'itemState'],
          ['previous state', 'oldItemState'],
          ['triggering item name', 'itemName'],
          ['type', 'type'],
          ['received command', 'itemCommand'],
          ['triggered channel', 'channel']]),
        'eventAttribute')
        .appendField('of event')
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour(0)
      let thisBlock = this
      this.setTooltip(function () {
        const eventAttribute = thisBlock.getFieldValue('eventAttribute')
        const TIP = {
          'itemState': 'the new item state (only use in rules based on change and updated events)',
          'oldItemState': 'the old item state (only use in rules based  on change and updated events)',
          'itemName': 'the item name that caused the event',
          'type': 'the event type name',
          'itemCommand': 'the command name that triggered the event',
          'channel': 'the channel id that triggered the event (only use in rules based on a channel trigger)'
        }
        return TIP[eventAttribute]
      })
      this.setHelpUrl('https://openhab-scripters.github.io/openhab-helper-libraries/Guides/Event%20Object%20Attributes.html')
    }
  }

  /*
  * Provides event information that is provided when a rule is triggerd
  * Blockly part
  */
  Blockly.JavaScript['oh_event_attribute'] = function (block) {
    const eventAttribute = block.getFieldValue('eventAttribute')
    return [`event.${eventAttribute}`, Blockly.JavaScript.ORDER_NONE]
  }
}
