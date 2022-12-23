/*
* Logging functionality for blockly
* supports jsscripting
*/

import Blockly from 'blockly'

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

  Blockly.JavaScript['oh_print'] = function (block) {
    const message = Blockly.JavaScript.valueToCode(block, 'message', Blockly.JavaScript.ORDER_ATOMIC)
    if (this.workspace && this.workspace.isGraalJs) {
      return `console.log(${message});\n`
    } else {
      return `print(${message});\n`
    }
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

  Blockly.JavaScript['oh_log'] = function (block) {
    const message = Blockly.JavaScript.valueToCode(block, 'message', Blockly.JavaScript.ORDER_ATOMIC)
    const severity = block.getFieldValue('severity')
    if (this.workspace && this.workspace.isGraalJs) {
      return `console.${severity}(${message});\n`
    } else {
      const logger = Blockly.JavaScript.provideFunction_(
        'logger',
        ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type(\'org.slf4j.LoggerFactory\').getLogger(\'org.openhab.rule.\' + ctx.ruleUID);'])
      return `${logger}.${severity}(${message});\n`
    }
  }
}
