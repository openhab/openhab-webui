/*
 * Adds new blocks to the text section
 * supports jsscripting
 */

import * as Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'
import { valueToCode } from '@/assets/definitions/blockly/utils.js'

export default function (f7) {
  /*
   * allows adding a CR/LF in string concatenation
   * Block
   */
  Blockly.Blocks['oh_text_crlf'] = {
    init: function () {
      this.appendDummyInput().appendField('CRLF')
      this.setOutput(true, 'String')
      this.setColour('%{BKY_TEXTS_HUE}')
      this.setTooltip('Returns a carriage return line feed (\\r\\n).')
      this.setHelpUrl(
        'https://www.openhab.org/docs/configuration/blockly/rules-blockly-standard-ext.html#crlf'
      )
    }
  }

  javascriptGenerator.forBlock['oh_text_crlf'] = function (block) {
    return ["'\\r\\n'", javascriptGenerator.ORDER_NONE]
  }

  /*
   * allows to replace a string
   * Block
   */
  Blockly.Blocks['oh_text_replace'] = {
    init: function () {
      this.appendValueInput('pattern').appendField('replace').setCheck('String')
      this.appendValueInput('replacement')
        .appendField('with')
        .setAlign(Blockly.inputs.Align.RIGHT)
        .setCheck('String')
      this.appendValueInput('origin')
        .appendField('in')
        .setAlign(Blockly.inputs.Align.RIGHT)
        .setCheck('String')
      this.setInputsInline(true)
      this.setOutput(true, 'String')
      this.setColour('%{BKY_TEXTS_HUE}')
      this.setTooltip(
        'returns a new string with one, some, or all matches of a pattern replaced by a replacement. The pattern can be a string or a RegEx. If it is a string, all occurences are replaced.'
      )
      this.setHelpUrl(
        'https://www.openhab.org/docs/configuration/blockly/rules-blockly-standard-ext.html#text-replace'
      )
    }
  }

  javascriptGenerator.forBlock['oh_text_replace'] = function (block) {
    const pattern = valueToCode(block, 'pattern', javascriptGenerator.ORDER_ATOMIC)
    const replacement = valueToCode(block, 'replacement', javascriptGenerator.ORDER_ATOMIC)
    const originText = valueToCode(block, 'origin', javascriptGenerator.ORDER_ATOMIC)
    const code = originText + '.replaceAll(' + pattern + ',' + replacement + ')'
    return [code, 0]
  }
}
