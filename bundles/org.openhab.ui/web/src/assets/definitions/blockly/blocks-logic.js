/*
* Adds new blocks to the logic section
*/

import * as Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'

export default function (f7) {
  /*
* Add a block returning undefined
* Blockly part
*/
  Blockly.Blocks['oh_logic_undefined'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('undefined')
      this.setOutput(true, null)
      this.setColour('%{BKY_LOGIC_HUE}')
      this.setTooltip('returns undefined as value')
    }
  }

  /*
  * returns undefined
  * Code part
  */
  javascriptGenerator.forBlock['oh_logic_undefined'] = function (block) {
    return ['undefined', javascriptGenerator.ORDER_ATOMIC]
  }
}
