import Blockly from 'blockly'
import { FieldItemModelPicker } from './ohitemfield'

export default function defineOHBlocks_Exec (f7) {
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
      this.setInputsInline(false)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_exec'] = function (block) {
    let runCommand = block.getFieldValue('execCommand')
    const itemName = Blockly.JavaScript.valueToCode(block, 'sendTo', Blockly.JavaScript.ORDER_ATOMIC)
    let code = 'var exec = Java.type("org.openhab.core.model.script.actions.Exec");\n'
    code += 'var duration = Java.type("java.time.Duration");\n'
    code += 'var results = exec.executeCommandLine(duration.ofSeconds(1), "' + runCommand + '", "")\n'
    code += 'events.sendCommand(' + itemName + ', results );\n'
    return code
  }

  Blockly.Blocks['oh_exec2'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Execute command')
        .appendField(new Blockly.FieldTextInput('/usr/bin/command'), 'cmdExecute')
      this.appendDummyInput()
        .appendField('Timeout')
        .appendField(new Blockly.FieldNumber(60), 'timeout')
        .appendField('Seconds')
      this.setOutput(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_exec2'] = function (block) {
    const exec = Blockly.JavaScript.provideFunction_(
      'exec',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.Exec");'])
    const duration = Blockly.JavaScript.provideFunction_(
      'duration',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("java.time.Duration");'])
    let runCommand = block.getFieldValue('cmdExecute').replace(/ /g, '","')
    let timeout = block.getFieldValue('timeout')
    let code = exec + '.executeCommandLine(' + duration + '.ofSeconds(' + timeout + '),"' + runCommand + '")\n'
    return [code, Blockly.JavaScript.ORDER_NONE]
  }

  Blockly.Blocks['oh_exec3'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Execute command')
        .appendField(new Blockly.FieldTextInput('/usr/bin/command'), 'cmdExecute')
      this.appendDummyInput()
        .appendField('Timeout')
        .appendField(new Blockly.FieldNumber(60), 'timeout')
        .appendField('Seconds')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_exec3'] = function (block) {
    const exec = Blockly.JavaScript.provideFunction_(
      'exec',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.Exec");'])
    const duration = Blockly.JavaScript.provideFunction_(
      'duration',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("java.time.Duration");'])
    let runCommand = block.getFieldValue('cmdExecute').replace(/ /g, '","')
    let timeout = block.getFieldValue('timeout')
    let code = exec + '.executeCommandLine(' + duration + '.ofSeconds(' + timeout + '),"' + runCommand + '")\n'
    return [code, Blockly.JavaScript.ORDER_NONE]
  }
}
