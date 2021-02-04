import Blockly from 'blockly'
import { FieldItemModelPicker } from './ohitemfield'

export default function defineOHBlocks_Notifications (f7) {
  Blockly.Blocks['oh_sendNotification'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Send notification to')
        .appendField(new Blockly.FieldTextInput('you@email.com'), 'email')
        .appendField(new Blockly.FieldTextInput('Message'), 'message')
        .appendField(new Blockly.FieldDropdown([['info','info'], ['warn','warn'], ['high','high']]), 'severity');
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_sendNotification'] = function(block) {
    var email = block.getFieldValue('email')
    var message = block.getFieldValue('message')
    var severity = block.getFieldValue('severity')
    var code = 'sendNotification("'+email+'","'+message+'",icon,'+severity+');\n'
    return code
  }

  Blockly.Blocks['oh_sendBroadcastNotification'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Send notification to')
        .appendField(new Blockly.FieldTextInput('Message'), 'message')
        .appendField(new Blockly.FieldDropdown([['info', 'info'], ['warn', 'warn'], ['high', 'high']]), 'severity')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_sendBroadcastNotification'] = function(block) {
    var message = block.getFieldValue('message')
    var severity = block.getFieldValue('severity')
    var code = 'sendBroadcastNotification('+message+'",icon,'+severity+');\n'
    return code
  }  

  Blockly.Blocks['oh_sendLogNotification'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Send notification to')
        .appendField(new Blockly.FieldTextInput('Message'), 'message')
        .appendField(new Blockly.FieldDropdown([['info', 'info'], ['warn', 'warn'], ['high', 'high']]), 'severity')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_sendLogNotification'] = function(block) {
    var message = block.getFieldValue('message')
    var severity = block.getFieldValue('severity')
    var code = 'sendLogNotification('+message+'",icon,'+severity+');\n'
    return code
  }      
}