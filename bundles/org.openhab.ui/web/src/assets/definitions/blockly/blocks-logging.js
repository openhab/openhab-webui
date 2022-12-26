/*
* Logging functionality for blockly
*/

import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'

export default function (f7) {
  Blockly.Blocks['oh_print'] = {
    init: function () {
      this.appendValueInput('message')
        .appendField('print')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('Print a message on the console')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-logging.html#print-statement')
    }
  }

  javascriptGenerator['oh_print'] = function (block) {
    const message = javascriptGenerator.valueToCode(block, 'message', javascriptGenerator.ORDER_ATOMIC)
    let code = `print(${message});\n`
    return code
  }

  Blockly.Blocks['oh_log'] = {
    init: function () {
      this.appendValueInput('message')
        .appendField('log')
        .appendField(new Blockly.FieldDropdown([['error', 'error'], ['warn', 'warn'], ['info', 'info'], ['debug', 'debug'], ['trace', 'trace']]), 'severity')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('Write a message in the openHAB log')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-logging.html#log-statement')
    }
  }

  javascriptGenerator['oh_log'] = function (block) {
    const logger = javascriptGenerator.provideFunction_(
      'logger',
      ['var ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type(\'org.slf4j.LoggerFactory\').getLogger(\'org.openhab.rule.\' + ctx.ruleUID);'])
    const message = javascriptGenerator.valueToCode(block, 'message', javascriptGenerator.ORDER_ATOMIC)
    const severity = block.getFieldValue('severity')
    const code = `${logger}.${severity}(${message});\n`
    return code
  }
}
