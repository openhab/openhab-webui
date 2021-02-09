import { convertJavaLocale } from '@/js/i18n'
import Blockly from 'blockly'

export default function defineOHBlocks_BusEvents(f7) {
  Blockly.Blocks['oh_event'] = {
    init: function () {
      this.appendValueInput('value')
        .appendField(new Blockly.FieldDropdown([['send command', 'sendCommand'], ['post update', 'postUpdate']]), 'eventType')
        // .appendField('send command')
      this.appendValueInput('itemName')
        .appendField('to')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('String')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('Send a command to an item')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_event'] = function (block) {
    const eventType = block.getFieldValue('eventType')
    const itemName = Blockly.JavaScript.valueToCode(block, 'itemName', Blockly.JavaScript.ORDER_ATOMIC)
    const value = Blockly.JavaScript.valueToCode(block, 'value', Blockly.JavaScript.ORDER_ATOMIC)
    var code = 'events.' + eventType + '(' + itemName + ', ' + value + ');\n'
    return code
  }

  Blockly.Blocks['oh_storestates'] = {
    init: function () {
      this.appendValueInput('itemName')
        .setCheck(null)
        .appendField('Store item state')
      this.appendValueInput('variableName')
        .setCheck(null)
        .appendField('in variable named')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_storestates'] = function (block) {
    var item = Blockly.JavaScript.valueToCode(block, 'itemName', Blockly.JavaScript.ORDER_ATOMIC).replace(/'/g,'')
    var variableName = Blockly.JavaScript.valueToCode(block, 'variableName', Blockly.JavaScript.ORDER_ATOMIC).replace(/'/g, '')
    if (item.indexOf(',') > -1) { // We're handling a list of items
      item = item.replace(/\[/g, '').replace(/]/g, '')
    } 
    var code = 'var ' + variableName + ' = events.storeStates(' + item + ');\n'
    return code
  }

  Blockly.Blocks['oh_restorestates'] = {
    init: function () {
      this.appendValueInput('variableName')
        .setCheck(null)
        .appendField('Restore item states from variable')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  };

  Blockly.JavaScript['oh_restorestates'] = function (block) {
    var variableName = Blockly.JavaScript.valueToCode(block, 'variableName', Blockly.JavaScript.ORDER_ATOMIC).replace(/'/g,'')
    var code = 'events.restoreStates(' + variableName + ');\n'
    return code
  }
}