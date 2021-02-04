import Blockly from 'blockly'
import { FieldItemModelPicker } from './ohitemfield'

export default function defineOHBlocks (f7) {
  Blockly.Blocks['oh_item'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('item')
        .appendField(new FieldItemModelPicker('MyItem', null, { f7 }), 'itemName')
      this.setColour(0)
      this.setInputsInline(true)
      this.setTooltip('Pick an item from the Model')
      this.setOutput(true, null)
    }
  }

  Blockly.JavaScript['oh_item'] = function (block) {
    const itemName = block.getFieldValue('itemName')
    let code = '\'' + itemName + '\''
    return [code, 0]
  }

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
    let code = 'itemRegistry.getItem(' + itemName + ').getState()'
    return [code, 0]
  }

  Blockly.Blocks['oh_exec'] = {
    init: function () {
      this.appendValueInput('sendTo')
        .setCheck(null)
        .appendField('Execute command')
        .appendField(new Blockly.FieldTextInput('/usr/bin/command'), 'execCommand')
        .appendField('output to')
      this.appendDummyInput()
        .appendField('Timeout')
        .appendField(new Blockly.FieldNumber(60), 'timeout')
        .appendField('Seconds')        
      this.setInputsInline(false);
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_exec'] = function (block) {
    var runCommand = block.getFieldValue('execCommand')
    const itemName = Blockly.JavaScript.valueToCode(block, 'sendTo', Blockly.JavaScript.ORDER_ATOMIC)
    // var statements_execute = Blockly.JavaScript.statementToCode(block, 'Execute');
    // TODO: Assemble JavaScript into code variable.
    var code = 'var exec = Java.type("org.openhab.core.model.script.actions.Exec");\n'
    code += 'var duration = Java.type("java.time.Duration");\n'
    code += 'var results = exec.executeCommandLine(duration.ofSeconds(1), "' + runCommand + '", "")\n'
    code += 'events.sendCommand(' + itemName + ', results );\n'
    return code
  }

  Blockly.Blocks['oh_exec2'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Execute command')
        .appendField(new Blockly.FieldTextInput('/usr/bin/command'), 'cmdExecute');
      this.appendDummyInput()
        .appendField('Timeout')
        .appendField(new Blockly.FieldNumber(60), 'timeout')
        .appendField('Seconds')
      this.setOutput(true, null);
      this.setColour(230);
      this.setTooltip('');
      this.setHelpUrl('');
    }
  }

  Blockly.JavaScript['oh_exec2'] = function(block) {
    const exec = Blockly.JavaScript.provideFunction_(
      'exec',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.Exec");'])
    const duration = Blockly.JavaScript.provideFunction_(
      'duration',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("java.time.Duration");'])  
    var runCommand = block.getFieldValue('cmdExecute').replace(/ /g, '","')
    var timeout = block.getFieldValue('timeout')
    var code = exec + '.executeCommandLine(' + duration + '.ofSeconds(' + timeout + '),"' + runCommand + '")\n'
    return [code, Blockly.JavaScript.ORDER_NONE];
  }

  Blockly.Blocks['oh_exec3'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Execute command')
        .appendField(new Blockly.FieldTextInput('/usr/bin/command'), 'cmdExecute');
      this.appendDummyInput()
        .appendField('Timeout')
        .appendField(new Blockly.FieldNumber(60), 'timeout')
        .appendField('Seconds')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230);
      this.setTooltip('');
      this.setHelpUrl('');
    }
  }

  Blockly.JavaScript['oh_exec3'] = function(block) {
    const exec = Blockly.JavaScript.provideFunction_(
      'exec',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.Exec");'])
    const duration = Blockly.JavaScript.provideFunction_(
      'duration',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("java.time.Duration");'])  
    var runCommand = block.getFieldValue('cmdExecute').replace(/ /g, '","')
    var timeout = block.getFieldValue('timeout')
    var code = exec + '.executeCommandLine(' + duration + '.ofSeconds(' + timeout + '),"' + runCommand + '")\n'
    return [code, Blockly.JavaScript.ORDER_NONE];
  }  
  
  Blockly.Blocks['oh_ping'] = {
    init: function() {
      this.appendValueInput('hostName')
        .setCheck('String')
        .appendField('Ping')
      this.setOutput(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_ping'] = function(block) {
    const actions = Blockly.JavaScript.provideFunction_(
      'actions',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.Ping");'])
    var hostname = Blockly.JavaScript.valueToCode(block, 'hostName', Blockly.JavaScript.ORDER_ATOMIC);
    var code = actions + '.checkVitality(' + hostname + ',0,10)'
    return [code, Blockly.JavaScript.ORDER_NONE]
  }
}
