import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript.js'

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

  javascriptGenerator.forBlock['oh_exec'] = function (block) {
    let runCommand = block.getFieldValue('execCommand')
    const itemName = javascriptGenerator.valueToCode(block, 'sendTo', javascriptGenerator.ORDER_ATOMIC)
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

  javascriptGenerator.forBlock['oh_exec2'] = function (block) {
    const exec = javascriptGenerator.provideFunction_(
      'exec',
      ['var ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.Exec");'])
    const duration = javascriptGenerator.provideFunction_(
      'duration',
      ['var ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("java.time.Duration");'])
    let runCommand = block.getFieldValue('cmdExecute').replace(/ /g, '","')
    let timeout = block.getFieldValue('timeout')
    let code = exec + '.executeCommandLine(' + duration + '.ofSeconds(' + timeout + '),"' + runCommand + '")\n'
    return [code, javascriptGenerator.ORDER_NONE]
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

  javascriptGenerator.forBlock['oh_exec3'] = function (block) {
    const exec = javascriptGenerator.provideFunction_(
      'exec',
      ['var ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type(\'org.openhab.core.model.script.actions.Exec\');'])
    const duration = javascriptGenerator.provideFunction_(
      'duration',
      ['var ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type(\'java.time.Duration\');'])
    let runCommand = block.getFieldValue('cmdExecute').replace(/ /g, '","')
    let timeout = block.getFieldValue('timeout')
    let code = exec + '.executeCommandLine(' + duration + '.ofSeconds(' + timeout + '),"' + runCommand + '")\n'
    return [code, javascriptGenerator.ORDER_NONE]
  }
}
