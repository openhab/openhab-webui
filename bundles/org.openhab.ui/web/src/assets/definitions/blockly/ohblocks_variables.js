/*
* @author stefan.hoehn
*
* These blocks allow values to be stored as "variables" in this.storedvars[] so they can "survive" when the rule is retriggered.
* Note that the variables are only global to the individual rule not others.
*/
import Blockly from 'blockly'

export default function defineOHBlocks_Variables (f7) {
  Blockly.Blocks['oh_store_value'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('store')
      this.appendValueInput('value')
        .setCheck(['Number', 'Boolean', 'String'])
      this.appendDummyInput()
        .appendField('into')
      this.appendValueInput('varName')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('stores a value into variable that can be reused if the particular rule is retriggered')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_store_value'] = function (block) {
    let varName = Blockly.JavaScript.valueToCode(block, 'varName', Blockly.JavaScript.ORDER_ATOMIC)
    let value = Blockly.JavaScript.valueToCode(block, 'value', Blockly.JavaScript.ORDER_ATOMIC)
    addStoredVars()

    let code = `this.storedvars[${varName}] = ${value};\n`
    return code
  }

  Blockly.Blocks['oh_get_value'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('stored value from')
      this.appendValueInput('varName')
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour(0)
      this.setTooltip('retrieves the value that was stored for that particular rule.')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_get_value'] = function (block) {
    let varName = Blockly.JavaScript.valueToCode(block, 'varName', Blockly.JavaScript.ORDER_ATOMIC)
    let code = `this.storedvars [${varName}]`
    return [code, Blockly.JavaScript.ORDER_NONE]
  }

  function addStoredVars () {
    let storedvars = 'if (typeof this.storedvars === \'undefined\') {\n\t this.storedvars =[];\n}'
    Blockly.JavaScript.provideFunction_('storedvars', [storedvars])
  }
}
