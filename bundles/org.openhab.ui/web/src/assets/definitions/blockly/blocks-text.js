/*
* Adds new blocks to the text section
*/

import Blockly from 'blockly'

export default function (f7) {
  /*
  * allows adding a CR/LF in string concatenation
  * Block
  */

  Blockly.Blocks['oh_text_crlf'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('CRLF')
      this.setOutput(true, 'String')
      this.setColour(160)
      this.setTooltip('returns a \r\n (carriage return line feed)')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/')
    }
  }

  Blockly.JavaScript['oh_text_crlf'] = function (block) {
    let code = '\'\\r\\n\''
    return [code, Blockly.JavaScript.ORDER_NONE]
  }
}
