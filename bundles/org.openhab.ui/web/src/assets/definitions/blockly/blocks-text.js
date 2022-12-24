/*
* Adds new blocks to the text section
* supports jsscripting
*/

import Blockly from 'blockly'

export default function (f7, isGraalJs) {
  /*
  * allows adding a CR/LF in string concatenation
  * Block
  */

  Blockly.Blocks['oh_text_crlf'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('CRLF')
      this.setOutput(true, 'String')
      this.setColour('%{BKY_TEXTS_HUE}')
      this.setTooltip('Returns a carriage return line feed (\\r\\n).')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-standard-ext.html#crlf')
    }
  }

  Blockly.JavaScript['oh_text_crlf'] = function (block) {
    return ['\'\\r\\n\'', Blockly.JavaScript.ORDER_NONE]
  }

  /*
  * allows to replace a string
  * Block
  */
  Blockly.Blocks['oh_text_replace'] = {
    init: function () {
      this.appendValueInput('pattern')
        .appendField('replace')
        .setCheck('String')
      this.appendValueInput('replacement')
        .appendField('with')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('String')
      this.appendValueInput('origin')
        .appendField('in')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('String')
      this.setInputsInline(true)
      this.setOutput(true, 'String')
      this.setColour('%{BKY_TEXTS_HUE}')
      this.setTooltip('returns a new string with one, some, or all matches of a pattern replaced by a replacement. The pattern can be a string or a RegEx. If it is a string, all occurences are replaced.')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-standard-ext.html#text-replace')
    }
  }

  Blockly.JavaScript['oh_text_replace'] = function (block) {
    const pattern = Blockly.JavaScript.valueToCode(block, 'pattern', Blockly.JavaScript.ORDER_ATOMIC)
    const replacement = Blockly.JavaScript.valueToCode(block, 'replacement', Blockly.JavaScript.ORDER_ATOMIC)
    const originText = Blockly.JavaScript.valueToCode(block, 'origin', Blockly.JavaScript.ORDER_ATOMIC)
    const code = originText + '.replaceAll(' + pattern + ',' + replacement + ')'
    return [code, 0]
  }
}
