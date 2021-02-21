import Blockly from 'blockly'
import { FieldItemModelPicker } from './ohitemfield'

export default function defineOHBlocks_Persistance(f7) {
  Blockly.Blocks['oh_setpersist'] = {
    init: function () {
      this.appendValueInput('value')
        .setCheck(['Number', 'Boolean', 'String'])
        .appendField('Set persist variable')
        .appendField(new Blockly.FieldTextInput('<variable>'), 'varName')
        .appendField('to')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_setpersist'] = function (block) {
    var varname = block.getFieldValue('varName')
    var value = Blockly.JavaScript.valueToCode(block, 'value', Blockly.JavaScript.ORDER_ATOMIC)
    // TODO: Assemble JavaScript into code variable.
    var code = 'this.' + varname + ' = (this.' + varname + ' === undefined) ? ' + value + ' : this.' + varname + ';\n'
    // TODO: Change ORDER_NONE to the correct strength.
    return code
  }

  Blockly.Blocks['oh_getpersist'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Get Persist Variable')
        .appendField(new Blockly.FieldTextInput('default'), 'varName');
      this.setInputsInline(true);
      this.setOutput(true, null);
      this.setColour(230);
      this.setTooltip('');
      this.setHelpUrl('');
    }
  }

  Blockly.JavaScript['oh_getpersist'] = function(block) {
    var varName = block.getFieldValue('varName');
    var code = 'this.' + varName;
    return [code, Blockly.JavaScript.ORDER_NONE];
  }

  Blockly.Blocks['oh_persistanceLastUpdate'] = {
    init: function () {
      this.appendValueInput('itemName')
        .appendField('lastUpdate')
        .setCheck('String')
      this.setInputsInline(true)
      this.setOutput(true, 'String')
      this.setColour(0)
      this.setTooltip('Queries for the last update timestamp of a given Item')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_persistanceLastUpdate'] = function (block) {
    const persistenceExtensions = Blockly.JavaScript.provideFunction_(
      'persistenceExtensions',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.persistence.extensions.PersistenceExtensions");'])
    const itemName = Blockly.JavaScript.valueToCode(block, 'itemName', Blockly.JavaScript.ORDER_ATOMIC)
    // TODO: Assemble JavaScript into code variable.
    var code = persistenceExtensions + '.previousState(itemRegistry.getItem(' + itemName + '), true, "rrd4j")'
    return [code, 0]
  }
}
