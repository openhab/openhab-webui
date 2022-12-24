/*
* Adds new blocks to the list section
* supports jsscripting
*/
import Blockly from 'blockly'
export default function (f7, isGraalJs) {
  /*
  * allows to concatenate a list into a new list
  * Block
  */
  Blockly.Blocks['oh_list_concatenate'] = {
    init: function () {
      this.appendValueInput('list1')
        .appendField('concatenate')
        .setCheck('Array')
      this.appendValueInput('list2')
        .appendField('to')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('Array')
      this.setInputsInline(true)
      this.setOutput(true, 'Array')
      this.setColour('%{BKY_LISTS_HUE}')
      this.setTooltip('concatenate two arrays returning a new array')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-standard-ext.html#concatenate-list')
    }
  }

  Blockly.JavaScript['oh_list_concatenate'] = function (block) {
    const list1 = Blockly.JavaScript.valueToCode(block, 'list1', Blockly.JavaScript.ORDER_ATOMIC)
    const list2 = Blockly.JavaScript.valueToCode(block, 'list2', Blockly.JavaScript.ORDER_ATOMIC)
    const code = list1 + '.concat(' + list2 + ');\n'
    return [code, 0]
  }
}
