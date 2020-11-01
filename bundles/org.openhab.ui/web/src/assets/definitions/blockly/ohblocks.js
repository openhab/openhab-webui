import Blockly from 'blockly'

export default function defineOHBlocks () {
  Blockly.Blocks['oh_getitem_state'] = {
    init: function () {
      this.appendValueInput('itemName')
        .appendField('get item state')
        .setCheck('String')
      this.setInputsInline(true)
      this.setOutput(true, 'String')
      this.setColour(0)
      this.setTooltip('Get an item state from the item registry')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_getitem_state'] = function (block) {
    const itemName = Blockly.JavaScript.valueToCode(block, 'itemName', Blockly.JavaScript.ORDER_ATOMIC)
    var code = 'itemRegistry.getItem(' + itemName + ').getState()'
    return [code, 0]
  }

  Blockly.Blocks['oh_sendcommand'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('send command')
      this.appendValueInput('command')
        // .setCheck('String')
      this.appendDummyInput()
        .appendField('to')
      this.appendValueInput('itemName')
        // .setCheck('String')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('Send a command to an item')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_sendcommand'] = function (block) {
    const itemName = Blockly.JavaScript.valueToCode(block, 'itemName', Blockly.JavaScript.ORDER_ATOMIC)
    const command = Blockly.JavaScript.valueToCode(block, 'command', Blockly.JavaScript.ORDER_ATOMIC)
    var code = 'events.sendCommand(' + itemName + ', ' + command + ');\n'
    return code
  }

  Blockly.Blocks['oh_print'] = {
    init: function () {
      this.appendValueInput('message')
        // .setCheck('String')
        .appendField('print')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('Print a message on the console')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_print'] = function (block) {
    const message = Blockly.JavaScript.valueToCode(block, 'message', Blockly.JavaScript.ORDER_ATOMIC)
    var code = 'print(' + message + ');\n'
    return code
  }
}
