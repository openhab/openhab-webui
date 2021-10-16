/*
* This code has been originally provided by https://github.com/bigbasec
* @author stefan.hoehn
*
* Notes:
* - Timer functionality has been taken out for now because of issues. Will come soon...
* - Also there will be another sleep that allows a variable for the sleep time
*/
import Blockly from 'blockly'
import { FieldItemModelPicker } from './ohitemfield'

export default function defineOHBlocks_Timers (f7) {

  Blockly.Blocks['oh_sleep'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Thread Sleep')
        .appendField(new Blockly.FieldTextInput('1000'), 'milliseconds')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('Waits for the specified milliseconds')
    }
  }

  Blockly.JavaScript['oh_sleep'] = function (block) {
   const voiceName = Blockly.JavaScript.provideFunction_(
          'thread',
          ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type(\'java.lang.Thread\');'])
    let milliseconds = block.getFieldValue('milliseconds')

    let code = `thread.sleep(${milliseconds});\n`
    return code
  }
}
