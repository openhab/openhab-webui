import Blockly from 'blockly'
import { FieldItemModelPicker } from './ohitemfield'

export default function defineOHBlocks_Subsystem (f7, scripts) {
  Blockly.Blocks['oh_callscript'] = {
    init: function () {
      this.appendValueInput('script')
        .setCheck(null)
        .appendField('Call Script')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('Calls a script which must be located in the $OPENHAB_CONF/scripts folder')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/actions.html')
    }
  }

  Blockly.JavaScript['oh_callscript'] = function (block) {
    const scriptExecution = Blockly.JavaScript.provideFunction_(
      'scriptExecution',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type(\'org.openhab.core.model.script.actions.ScriptExecution\');'])
    let script = Blockly.JavaScript.valueToCode(block, 'script', Blockly.JavaScript.ORDER_ATOMIC)
    let code = scriptExecution + '.callScript(' + script + ');\n'
    return code
  }
}
