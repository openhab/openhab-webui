/*
 * Logging functionality for blockly
 * supports jsscripting
 */

import * as Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'
import { valueToCode } from '@/assets/definitions/blockly/utils.js'

export default function (f7) {
  Blockly.Blocks['oh_print'] = {
    init: function () {
      this.appendValueInput('message').appendField('print')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('Print a message on the console')
      this.setHelpUrl(
        'https://www.openhab.org/docs/configuration/blockly/rules-blockly-logging.html#print-statement'
      )
    }
  }

  javascriptGenerator.forBlock['oh_print'] = function (block) {
    const message = valueToCode(block, 'message', javascriptGenerator.ORDER_ATOMIC)
    return `console.log(${message});\n`
  }

  Blockly.Blocks['oh_log'] = {
    init: function () {
      this.appendValueInput('message')
        .appendField('log')
        .appendField(
          new Blockly.FieldDropdown([
            ['info', 'info'],
            ['error', 'error'],
            ['warn', 'warn'],
            ['debug', 'debug'],
            ['trace', 'trace']
          ]),
          'severity'
        )
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('Write a message in the openHAB log with the severity level')
      this.setHelpUrl(
        'https://www.openhab.org/docs/configuration/blockly/rules-blockly-logging.html#log-statement'
      )
    }
  }

  javascriptGenerator.forBlock['oh_log'] = function (block) {
    const message = valueToCode(block, 'message', javascriptGenerator.ORDER_ATOMIC)
    const severity = block.getFieldValue('severity')
    return `console.${severity}(${message});\n`
  }
}
