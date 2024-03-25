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
      this.setHelpUrl('https://v34.openhab.org/docs/configuration/blockly/rules-blockly-run-and-process.html#call-script-file')
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
        .appendField('with context')
        .setCheck('Dictionary')
      this.setInputsInline(false)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('Run a rule or script with a certain UID, and optional parameters')
      this.setHelpUrl('https://v34.openhab.org/docs/configuration/blockly/rules-blockly-run-and-process.html#run-rule-or-script-created-in-ui')
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
  * Blockly part
  */
  Blockly.Blocks['oh_transformation'] = {
    init: function () {
      this.appendValueInput('value')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('transform')
      this.appendValueInput('function')
        .appendField('apply')
        .appendField(new Blockly.FieldTextInput('MAP'), 'type')
        .appendField('with')

      this.setInputsInline(false)
      this.setOutput(true, null)
      this.setColour(0)

      let thisBlock = this
      this.setTooltip(function () {
        const type = thisBlock.getFieldValue('type')
        switch (type) {
          case 'MAP':
            return 'transforms an input via a map file. Specify the file as the function.\nREGEX und JSONPATH are also valid.'
          case 'REGEX':
            return 'transforms / filters an input by applying the provided regular expression.\nMAP und JSONPATH are also valid.'
          case 'JSONPATH':
            return 'transforms / filters an JSON input by executing the provided JSONPath query.\nMAP und REGEX are also valid.'
          default:
            return 'transforms the input with the ' + type + ' transformation.'
        }
      })
      this.setHelpUrl(function () {
        const type = thisBlock.getFieldValue('type')
        return 'https://v34.openhab.org/docs/configuration/blockly/rules-blockly-run-and-process.html#transform-values-via-map-regex-or-jsonpath-and-others' + type.toLowerCase() + '/'
      })
    }
  }

  /*
  * Allow transformations via different methods
  * Code part
  */
  Blockly.JavaScript['oh_transformation'] = function (block) {
    const transformation = Blockly.JavaScript.provideFunction_(
      'transformation',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type(\'org.openhab.core.transform.actions.Transformation\');'])
    const transformationType = block.getFieldValue('type')
    const transformationFunction = Blockly.JavaScript.valueToCode(block, 'function', Blockly.JavaScript.ORDER_ATOMIC)
    const transformationValue = Blockly.JavaScript.valueToCode(block, 'value', Blockly.JavaScript.ORDER_ATOMIC)

    let code = `${transformation}.transform('${transformationType}', ${transformationFunction}, ${transformationValue})`
    return [code, 0]
  }

  Blockly.Blocks['oh_context_info'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('contextual info')
        .appendField(new Blockly.FieldDropdown([
          ['rule UID', 'ruleUID'],
          ['event type', 'type'],
          ['new state of item', 'itemState'],
          ['previous state of item', 'oldItemState'],
          ['triggering item name', 'itemName'],
          ['received command', 'itemCommand'],
          ['triggered channel', 'channel'],
          ['triggered event', 'event']
        ]),
        'contextInfo')
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour(0)
      let thisBlock = this
      this.setTooltip(function () {
        const contextData = thisBlock.getFieldValue('contextInfo')
        const TIP = {
          'ruleUID': 'The current rule\'s UID',
          'type': 'the event type name',
          'itemState': 'the new item state (only applicable for rules with triggers related to changed and updated items)',
          'oldItemState': 'the old item state (only applicable for rules with triggers related to changed and updated items)',
          'itemName': 'the item name that caused the event (if relevant)',
          'itemCommand': 'the command name that triggered the event',
          'channel': 'the channel UID that triggered the event (only applicable for rules including a "trigger channel fired" event)',
          'event': 'the channel event type that triggered the event (only applicable for rules including a "trigger channel fired" event)'
        }
        return TIP[contextData]
      })
      this.setHelpUrl('https://v34.openhab.org/docs/configuration/blockly/rules-blockly-run-and-process.html#retrieve-rule-context-information')
    }
  }

  Blockly.JavaScript['oh_context_info'] = function (block) {
    const contextInfo = block.getFieldValue('contextInfo')
    if (contextInfo === 'ruleUID') return ['ctx.ruleUID', Blockly.JavaScript.ORDER_ATOMIC]
    return [`event.${contextInfo}`, Blockly.JavaScript.ORDER_ATOMIC]
  }

  /*
  * Allows retrieving parameters provided by a rule
  * Blockly part
  */
  Blockly.Blocks['oh_context_attribute'] = {
    init: function () {
      this.appendValueInput('key')
        .appendField('get context attribute')
        .setCheck('String')
      this.setInputsInline(false)
      this.setOutput(true, 'any')
      this.setColour(0)
      this.setHelpUrl('https://v34.openhab.org/docs/configuration/blockly/rules-blockly-run-and-process.html#retrieve-context-attribute-from-rule')
      this.setTooltip('Retrieve a specified attribute from the context that could be set from a calling rule or script')
    }
  }

  /*
  * Allows retrieving parameters provided by a rule
  * Code part
  */
  Blockly.JavaScript['oh_context_attribute'] = function (block) {
    const key = Blockly.JavaScript.valueToCode(block, 'key', Blockly.JavaScript.ORDER_ATOMIC)
    let code = `ctx[${key}]`
    return [code, 0]
  }

  /*
  * Allows inlining arbitrary code
  * Blockly part
  */
  Blockly.Blocks['oh_script_inline'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('inline script (advanced)')
      this.appendDummyInput()
        .appendField(new Blockly.FieldMultilineInput('for (var i = 0; i < 10; i++) {\n  print(i.toString());\n}'), 'inlineScript')
      this.setInputsInline(false)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setHelpUrl('https://v34.openhab.org/docs/configuration/blockly/rules-blockly-run-and-process.html#inline-script')
      this.setTooltip('Allows inlining arbitrary script code which has to be syntactically correct')
    }
  }

  /*
  * Allows inlining arbitrary code
  * Code part
  */
  Blockly.JavaScript['oh_script_inline'] = function (block) {
    const code = block.getFieldValue('inlineScript') + '\n'
    return code
  }
}
