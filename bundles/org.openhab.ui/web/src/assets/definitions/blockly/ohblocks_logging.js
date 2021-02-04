import Blockly from 'blockly'
import { FieldItemModelPicker } from './ohitemfield'

export default function defineOHBlocks_Logging (f7) {
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

  Blockly.Blocks['oh_log'] = {
    init: function () {
      this.appendValueInput('message')
        .setCheck('String')
        .appendField('log')
        .appendField(new Blockly.FieldDropdown([['error', 'error'], ['warn', 'warn'], ['info', 'info'], ['debug', 'debug'], ['trace', 'trace']]), 'severity')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('Write a message in the openHAB log')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_log'] = function (block) {
    const loggerName = Blockly.JavaScript.provideFunction_(
      'logger',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type(\'org.slf4j.LoggerFactory\').getLogger(\'org.openhab.rule.\' + ctx.ruleUID);'])
    const message = Blockly.JavaScript.valueToCode(block, 'message', Blockly.JavaScript.ORDER_ATOMIC)
    const severity = block.getFieldValue('severity')
    const code = loggerName + '.' + severity + '(' + message + ');\n'
    return code
  }
}
