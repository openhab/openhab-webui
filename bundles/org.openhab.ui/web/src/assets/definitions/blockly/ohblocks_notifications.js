import Blockly from 'blockly'

export default function defineOHBlocks_Notifications (f7) {
  Blockly.Blocks['oh_sendNotification'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Send notification to')
        .appendField(new Blockly.FieldTextInput('you@email.com'), 'email')
        .appendField(new Blockly.FieldMultilineInput('Message'), 'message')
        .appendField(new Blockly.FieldDropdown([['info', 'info'], ['warn', 'warn'], ['high', 'high']]), 'severity')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_sendNotification'] = function (block) {
    let email = block.getFieldValue('email')
    let message = block.getFieldValue('message')
    let severity = block.getFieldValue('severity')
    let code = 'sendNotification("' + email + '","' + message + '",icon,' + severity + ');\n'
    return code
  }

  Blockly.Blocks['oh_sendBroadcastNotification'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Send notification to')
        .appendField(new Blockly.FieldMultilineInput('Message'), 'message')
        .appendField(new Blockly.FieldDropdown([['info', 'info'], ['warn', 'warn'], ['high', 'high']]), 'severity')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_sendBroadcastNotification'] = function (block) {
    let message = block.getFieldValue('message')
    let severity = block.getFieldValue('severity')
    let code = 'sendBroadcastNotification(' + message + '",icon,' + severity + ');\n'
    return code
  }

  Blockly.Blocks['oh_sendLogNotification'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Send notification to')
        .appendField(new Blockly.FieldMultilineInput('Message'), 'message')
        .appendField(new Blockly.FieldDropdown([['info', 'info'], ['warn', 'warn'], ['high', 'high']]), 'severity')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_sendLogNotification'] = function (block) {
    let message = block.getFieldValue('message')
    let severity = block.getFieldValue('severity')
    let code = 'sendLogNotification(' + message + '",icon,' + severity + ');\n'
    return code
  }
}
