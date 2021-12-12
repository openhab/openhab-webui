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

  Blockly.Blocks['oh_context_info'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('contextual info')
        .appendField(new Blockly.FieldDropdown([
          ['rule UID', 'ruleUID'],
          ['event type', 'type'],
          ['new state of item', 'itemState'],
          ['previous state of item', 'oldItemState'],
          ['triggering item name', 'itemName'],
          ['received command', 'itemCommand'],
          ['triggered channel', 'channel']]),
        'contextInfo')
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour(0)
      let thisBlock = this
      this.setTooltip(function () {
        const contextData = thisBlock.getFieldValue('contextInfo')
        const TIP = {
          'ruleUID': 'The current rule\'s UID',
          'type': 'the event type name',
          'itemState': 'the new item state (only applicable for rules with triggers related to changed and updated items)',
          'oldItemState': 'the old item state (only applicable for rules with triggers related to changed and updated items)',
          'itemName': 'the item name that caused the event (if relevant)',
          'itemCommand': 'the command name that triggered the event',
          'channel': 'the channel UID that triggered the event (only applicable for rules including a "trigger channel fired" event)'
        }
        return TIP[contextData]
      })
      this.setHelpUrl('https://www.openhab.org/docs/developer/utils/events.html')
    }
  }

  Blockly.JavaScript['oh_context_info'] = function (block) {
    const contextInfo = block.getFieldValue('contextInfo')
    if (contextInfo === 'ruleUID') return ['ctx.ruleUID', Blockly.JavaScript.ORDER_ATOMIC]
    return [`event.${contextInfo}`, Blockly.JavaScript.ORDER_ATOMIC]
  }
}
