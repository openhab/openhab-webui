/*
* These blocks allow to run scripts from the current rule. There are two types of scripts which are supported by different blocks
*  - Script Files that are stored on openHAB's server in the scripts folder
*  - Scripts that have been provided via the openHAB UI
* Additionally there is a block that allows transformations based on the Map-File functionality, regular-expressions and applying JSON-paths
*/
import Blockly from 'blockly'

export default function defineOHBlocks_Scripts (f7, scripts) {
  /*
  * Calls a script that is provided in openHABs scripts folder
  * Blockly part
  */
  Blockly.Blocks['oh_callscriptfile'] = {
    init: function () {
      this.appendValueInput('scriptfile')
        .setCheck('String')
        .appendField('Call Script File')
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
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER + ' = Java.type("org.openhab.core.model.script.actions.ScriptExecution");'])
    let scriptfile = Blockly.JavaScript.valueToCode(block, 'scriptfile', Blockly.JavaScript.ORDER_ATOMIC)
    let code = `scriptExecution.callScript(${scriptfile});\n`
    return code
  }

  /*
  * Calls a script that has been provided via the UI.
  * Parameters can be provided with the special parameter block oh_scriptparam
  * Blockly part
  */
  Blockly.Blocks['oh_callscript'] = {
    init: function () {
      this.appendValueInput('scriptname')
        .setCheck('String')
        .appendField('Call Script')
      this.appendValueInput('parameters')
        .setCheck('Dictionary')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('Calls a script provided via the openhab ui scripts section')
      this.setHelpUrl('') // TODO provide a openhab documentation URL
    }
  }

  /*
  * Calls a script that has been provided via the UI.
  * Parameters can be provided with the special parameter block oh_scriptparam
  * Code part
  */
  Blockly.JavaScript['oh_callscript'] = function (block) {
    let callCode = 'var FrameworkUtil = Java.type(\'org.osgi.framework.FrameworkUtil\');\n'
    callCode += 'var _bundle = FrameworkUtil.getBundle(scriptExtension.class);\n'
    callCode += 'var bundle_context = _bundle.getBundleContext()\n'
    callCode += 'var ruleManager_Ref = bundle_context.getServiceReference(\'org.openhab.core.automation.RuleManager\');\n'
    callCode += 'var ruleManager = bundle_context.getService(ruleManager_Ref);\n'

    let scriptParameters = Blockly.JavaScript.valueToCode(block, 'parameters', Blockly.JavaScript.ORDER_ATOMIC)

    Blockly.JavaScript.provideFunction_('callCode', [callCode])
    let scriptname = Blockly.JavaScript.valueToCode(block, 'scriptname', Blockly.JavaScript.ORDER_ATOMIC)
    const stringParametersMap = JSON.parse(scriptParameters.replace(/'/g, '"'))

    let paramMapName = Blockly.JavaScript.provideFunction_('scriptParamsMap', ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = new java.util.HashMap();'])

    let code = `  ${paramMapName}.clear();\n`
    Object.keys(stringParametersMap).forEach(function (key) {
      code += `  ${paramMapName}.put('${key}', ${stringParametersMap[key]})\n`
    })

    code += `ruleManager.runNow(${scriptname}, true, ${paramMapName});\n`
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
        .appendField('transform')
      this.appendValueInput('input')
        .appendField('with method')
        .appendField(new Blockly.FieldDropdown([['map', 'MAP'], ['regex', 'REGEX'], ['jsonpath', 'JSONPATH']]), 'type')
        .appendField('based on')

      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour(0)

      let thisBlock = this
      this.setTooltip(function () {
        let type = thisBlock.getFieldValue('type')
        let TIP = {
          'MAP': 'transforms an input via a map-file config',
          'REGEX': 'transforms / filters an input by applying a regular expression',
          'JSONPATH': 'transforms / filters an input, e.g. a json item state, by applying a json path'
        }
        return TIP[type]
      })
      this.setHelpUrl(function () {
        let type = thisBlock.getFieldValue('type')
        let URL = {
          'MAP': 'https://www.openhab.org/addons/transformations/map/',
          'REGEX': 'https://www.openhab.org/addons/transformations/regex/',
          'JSONPATH': 'https://www.openhab.org/addons/transformations/jsonpath/'
        }
        return URL[type]
      })
    }
  }

  /*
  * Allow transformations via different methods
  * Code part
  */
  Blockly.JavaScript['oh_transformation'] = function (block) {
    addTransformation()
    const value = Blockly.JavaScript.valueToCode(block, 'value', Blockly.JavaScript.ORDER_ATOMIC)
    let input = Blockly.JavaScript.valueToCode(block, 'input', Blockly.JavaScript.ORDER_ATOMIC)
    const type = block.getFieldValue('type')

    let code = `transformation.transform('${type}', ${input}, ${value})`
    return [code, 0]
  }

  /*
  * add transformation class to rule
  */
  function addTransformation () {
    Blockly.JavaScript.provideFunction_(
      'transformation',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type(\'org.openhab.core.transform.actions.Transformation\');'])
  }
}
