/*
* These blocks allow to run scripts from the current rule. There are two types of scripts which are supported by different blocks
*  - Script Files that are stored on openHAB's server in the scripts folder
*  - Scripts that have been provided via the openHAB UI
* Additionally there is a block that allows transformations based on the Map-File functionality, regular-expressions and applying JSON-paths
*/
import Blockly from 'blockly'
import { addOSGiService } from './utils'

export default function defineOHBlocks_Scripts (f7, scripts) {
  /*
  * Calls a script that is provided in openHABs scripts folder
  * Blockly part
  */
  Blockly.Blocks['oh_callscriptfile'] = {
    init: function () {
      this.appendValueInput('scriptfile')
        .setCheck('String')
        .appendField('call script file')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('Calls a script file which must be located in the $OPENHAB_CONF/scripts folder')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/actions.html')
    }
  }

  /*
  * Calls a script that is provided in openHABs scripts folder
  * Code part
  */
  Blockly.JavaScript['oh_callscriptfile'] = function (block) {
    const scriptExecution = Blockly.JavaScript.provideFunction_(
      'scriptExecution',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type(\'org.openhab.core.model.script.actions.ScriptExecution\');'])
    let scriptfile = Blockly.JavaScript.valueToCode(block, 'scriptfile', Blockly.JavaScript.ORDER_ATOMIC)
    let code = `${scriptExecution}.callScript(${scriptfile});\n`
    return code
  }

  /*
  * Calls a script that has been provided via the UI.
  * Parameters can be provided with the special parameter block oh_scriptparam
  * Blockly part
  */
  Blockly.Blocks['oh_runrule'] = {
    init: function () {
      this.appendValueInput('ruleUID')
        .setCheck('String')
        .appendField('run rule or script')
      this.appendValueInput('parameters')
        .appendField('with parameters')
        .setCheck('Dictionary')
      this.setInputsInline(false)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('Run a rule or script with a certain UID, and optional parameters')
      // this.setHelpUrl('') // TODO provide a openhab documentation URL
    }
  }

  /*
  * Calls a script that has been provided via the UI.
  * Parameters can be provided with the special parameter block oh_scriptparam
  * Code part
  */
  Blockly.JavaScript['oh_runrule'] = function (block) {
    const ruleManager = addOSGiService('ruleManager', 'org.openhab.core.automation.RuleManager')
    const ruleUID = Blockly.JavaScript.valueToCode(block, 'ruleUID', Blockly.JavaScript.ORDER_ATOMIC)
    const scriptParameters = Blockly.JavaScript.valueToCode(block, 'parameters', Blockly.JavaScript.ORDER_ATOMIC)

    // create a function for the generated code that maps json key-values into a map structure
    const convertDictionaryToHashMap = Blockly.JavaScript.provideFunction_(
      'convertDictionaryToHashMap',
      [
        'function ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' (dict) {',
        '  if (!dict || dict.length === 0) return null;',
        '  var map = new java.util.HashMap();',
        '  Object.keys(dict).forEach(function (key) {',
        '    map.put(key, dict[key]);',
        '  });',
        '  return map;',
        '}'
      ])

    let code = `${ruleManager}.runNow(${ruleUID}, true, ${convertDictionaryToHashMap}(${scriptParameters}));\n`
    return code
  }

  /*
  * Allow transformations via different methods
  * inputs
  *   - value to be transformed
  *   - method Map, Regular Expression, JSON-Path
  *   - transformation method input
  *     - Map: map file found in openHABs transform-folder
  *     - Regex: regex-expression
  *     - JSON-Path: JSON-Path
  * Blockly part
  */
  Blockly.Blocks['oh_transformation'] = {
    init: function () {
      this.appendValueInput('value')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('transform')
      this.appendValueInput('function')
        .appendField('apply')
        .appendField(new Blockly.FieldDropdown([['MAP', 'MAP'], ['REGEX', 'REGEX'], ['JSONPATH', 'JSONPATH']]), 'type')
        .appendField('with')

      this.setInputsInline(false)
      this.setOutput(true, null)
      this.setColour(0)

      let thisBlock = this
      this.setTooltip(function () {
        const type = thisBlock.getFieldValue('type')
        switch (type) {
          case 'MAP':
            return 'transforms an input via a map file. Specify the file as the function'
          case 'REGEX':
            return 'transforms / filters an input by applying the provided regular expression'
          case 'JSONPATH':
            return 'transforms / filters an JSON input by executing the provided JSONPath query'
          default:
            return 'transforms the input with the ' + type + ' transformation'
        }
      })
      this.setHelpUrl(function () {
        const type = thisBlock.getFieldValue('type')
        return 'https://www.openhab.org/addons/transformations/' + type.toLowerCase() + '/'
      })
    }
  }

  /*
  * Allow transformations via different methods
  * Code part
  */
  Blockly.JavaScript['oh_transformation'] = function (block) {
    const transformation = addTransformation()
    const transformationType = block.getFieldValue('type')
    const transformationFunction = Blockly.JavaScript.valueToCode(block, 'function', Blockly.JavaScript.ORDER_ATOMIC)
    const transformationValue = Blockly.JavaScript.valueToCode(block, 'value', Blockly.JavaScript.ORDER_ATOMIC)

    let code = `${transformation}.transform('${transformationType}', ${transformationFunction}, ${transformationValue})`
    return [code, 0]
  }

  /*
  * add transformation class to rule
  */
  function addTransformation () {
    return Blockly.JavaScript.provideFunction_(
      'transformation',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type(\'org.openhab.core.transform.actions.Transformation\');'])
  }
}
