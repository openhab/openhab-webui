/*
* These blocks allow to run scripts from the current rule. There are two types of scripts which are supported by different blocks
*  - Script Files that are stored on the openHAB server in the "$OPENHAB_CONF/scripts" folder
*  - Scripts that have been provided via the openHAB UI
* Additionally there is a block that allows transformations based on the Map-File functionality, regular-expressions and applying JSON-paths
* supports jsscripting
*/
import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript.js'
import { addOSGiService } from './utils.js'

export default function defineOHBlocks_Scripts (f7, isGraalJs, scripts) {
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
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-run-and-process.html#call-script-file')
    }
  }

  /*
  * Calls a script that is provided in openHABs scripts folder
  * Code part
  */
  javascriptGenerator.forBlock['oh_callscriptfile'] = function (block) {
    let scriptfile = javascriptGenerator.valueToCode(block, 'scriptfile', javascriptGenerator.ORDER_ATOMIC)
    if (isGraalJs) {
      return `actions.ScriptExecution.callScript(${scriptfile});\n`
    } else {
      const scriptExecution = javascriptGenerator.provideFunction_(
        'scriptExecution',
        ['var ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type(\'org.openhab.core.model.script.actions.ScriptExecution\');'])
      return `${scriptExecution}.callScript(${scriptfile});\n`
    }
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
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-run-and-process.html#run-rule-or-script-created-in-ui')
    }
  }

  /*
  * Calls a script that has been provided via the UI.
  * Parameters can be provided with the special parameter block oh_scriptparam
  * Code part
  */
  javascriptGenerator.forBlock['oh_runrule'] = function (block) {
    const ruleUID = javascriptGenerator.valueToCode(block, 'ruleUID', javascriptGenerator.ORDER_ATOMIC)
    const scriptParameters = javascriptGenerator.valueToCode(block, 'parameters', javascriptGenerator.ORDER_ATOMIC)
    if (isGraalJs) {
      return `rules.runRule(${ruleUID}, ${scriptParameters});\n`
    } else {
      const ruleManager = addOSGiService('ruleManager', 'org.openhab.core.automation.RuleManager')
      // create a function for the generated code that maps json key-values into a map structure
      const convertDictionaryToHashMap = javascriptGenerator.provideFunction_(
        'convertDictionaryToHashMap',
        [
          'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + ' (dict) {',
          '  if (!dict || dict.length === 0) return null;',
          '  var map = new java.util.HashMap();',
          '  Object.keys(dict).forEach(function (key) {',
          '    map.put(key, dict[key]);',
          '  });',
          '  return map;',
          '}'
        ])

      return `${ruleManager}.runNow(${ruleUID}, true, ${convertDictionaryToHashMap}(${scriptParameters}));\n`
    }
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
            return 'transforms an input via a map file. Specify the file as the function.\nREGEX and JSONPATH are also valid.'
          case 'REGEX':
            return 'transforms / filters an input by applying the provided regular expression.\nMAP and JSONPATH are also valid.'
          case 'JSONPATH':
            return 'transforms / filters a JSON input by executing the provided JSONPath query.\nMAP and REGEX are also valid.'
          default:
            return 'transforms the input with the ' + type + ' transformation.'
        }
      })
      this.setHelpUrl(function () {
        const type = thisBlock.getFieldValue('type')
        return 'https://www.openhab.org/docs/configuration/blockly/rules-blockly-run-and-process.html#transform-values-via-map-regex-or-jsonpath-and-others' + type.toLowerCase() + '/'
      })
    }
  }

  /*
  * Allow transformations via different methods
  * Code part
  */
  javascriptGenerator.forBlock['oh_transformation'] = function (block) {
    const transformationType = block.getFieldValue('type')
    const transformationFunction = javascriptGenerator.valueToCode(block, 'function', javascriptGenerator.ORDER_ATOMIC)
    const transformationValue = javascriptGenerator.valueToCode(block, 'value', javascriptGenerator.ORDER_ATOMIC)
    if (isGraalJs) {
      return [`actions.Transformation.transform('${transformationType}', ${transformationFunction}, ${transformationValue})`, 0]
    } else {
      const transformation = javascriptGenerator.provideFunction_(
        'transformation',
        ['var ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type(\'org.openhab.core.transform.actions.Transformation\');'])

      return [`${transformation}.transform('${transformationType}', ${transformationFunction}, ${transformationValue})`, 0]
    }
  }

  Blockly.Blocks['oh_context_info'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('contextual info')
        .appendField(new Blockly.FieldDropdown([
          ['rule UID', 'ruleUID'],
          ['event available', 'eventAvailable'],
          ['event type', 'type'],
          ['new state of item', 'itemState'],
          ['previous state of item', 'oldItemState'],
          ['triggering item name', 'itemName'],
          ['received command', 'itemCommand'],
          ['triggered channel', 'channel'],
          ['triggered event', 'event']
        ], this.handleTypeSelection.bind(this)),
        'contextInfo')
      this.contextInfo = this.getFieldValue('contextInfo')
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour(0)
      let thisBlock = this
      this.setTooltip(function () {
        const contextData = thisBlock.getFieldValue('contextInfo')
        const TIP = {
          'ruleUID': 'The current rule\'s UID',
          'eventAvailable': 'check if the event information is available',
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
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-run-and-process.html#retrieve-rule-context-information')
    },
    onchange: function (event) {
      const contextInfo = this.getFieldValue('contextInfo')
      const asType = this.getFieldValue('asType')

      if (this.contextInfo !== contextInfo) {
        this.contextInfo = contextInfo
        if (contextInfo === 'eventAvailable') {
          this.setOutput(true, 'Boolean')
          return
        }
        if (contextInfo === 'itemName') {
          this.setOutput(true, 'oh_item')
        } else {
          this.setOutput(true, 'String')
        }
      }

      if (this.asType !== asType) {
        this.asType = asType
        if (this.methodName === 'itemState' || this.methodName === 'oldItemState' || this.methodName === 'itemCommand') {
          if (asType === 'asNumber') {
            this.setOutput(true, 'Number')
          } else if (asType === 'asQuantity') {
            this.setOutput(true, 'oh_quantity')
          } else {
            this.setOutput(true, 'String')
          }
        }
      }
    },
    handleTypeSelection: function (methodName) {
      if (this.methodName !== methodName) {
        this.methodName = methodName
        this.updateShape()
      }
    },
    mutationToDom: function () {
      let container = Blockly.utils.xml.createElement('mutation')
      container.setAttribute('asType', this.asType)
      container.setAttribute('contextInfo', this.contextInfo)
      return container
    },
    domToMutation: function (xmlElement) {
      this.contextInfo = xmlElement.getAttribute('contextInfo')
      if (this.contextInfo === 'eventAvailable') {
        this.setOutput(true, 'Boolean')
        return
      }
      if (this.contextInfo === 'itemName') {
        this.setOutput(true, 'oh_item')
      } else {
        this.setOutput(true, 'String')
      }
      this.asType = xmlElement.getAttribute('asType')
      if (this.asType === 'asNumber') {
        this.setOutput(true, 'Number')
      } else if (this.asType === 'asQuantity') {
        this.setOutput(true, 'oh_quantity')
      } else {
        this.setOutput(true, 'String')
      }
    },
    updateShape: function () {
      if (this.methodName === 'itemState' || this.methodName === 'oldItemState' || this.methodName === 'itemCommand') {
        if (!this.getInput('asTypeInput')) {
          this.appendDummyInput('asTypeInput').appendField(new Blockly.FieldDropdown([
            ['as String', 'asString'],
            ['as Number', 'asNumber'],
            ['as Quantity', 'asQuantity']
          ]),
          'asType')
        }
      } else {
        if (this.getInput('asTypeInput')) {
          this.removeInput('asTypeInput')
        }
      }
    }
  }

  javascriptGenerator.forBlock['oh_context_info'] = function (block) {
    const contextInfo = block.getFieldValue('contextInfo')
    const type = block.getFieldValue('asType')
    if (contextInfo === 'eventAvailable') return ['(event !== undefined)', javascriptGenerator.ORDER_ATOMIC]
    if (contextInfo === 'ruleUID') return ['ctx.ruleUID', javascriptGenerator.ORDER_ATOMIC]
    if (contextInfo === 'itemState' || contextInfo === 'oldItemState' || contextInfo === 'itemCommand') {
      if (type === 'asNumber') {
        return [`parseFloat(event.${contextInfo}.toString())`, javascriptGenerator.ORDER_ATOMIC]
      } else if (type === 'asQuantity') {
        return [`Quantity(event.${contextInfo}.toString())`, javascriptGenerator.ORDER_ATOMIC]
      } else {
        return [`event.${contextInfo}.toString()`, javascriptGenerator.ORDER_ATOMIC]
      }
    }
    return [`event.${contextInfo}`, javascriptGenerator.ORDER_ATOMIC]
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
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-run-and-process.html#retrieve-context-attribute-from-rule')
      this.setTooltip('Retrieve a specified attribute from the context that could be set from a calling rule or script')
    }
  }

  /*
  * Allows retrieving parameters provided by a rule
  * Code part
  */
  javascriptGenerator.forBlock['oh_context_attribute'] = function (block) {
    const key = javascriptGenerator.valueToCode(block, 'key', javascriptGenerator.ORDER_ATOMIC)
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
      let code = ''
      if (isGraalJs) {
        code = 'for (var i = 0; i < 10; i++) {\n  console.log(i.toString());\n}'
      } else {
        code = 'for (var i = 0; i < 10; i++) {\n  print(i.toString());\n}'
      }
      this.appendDummyInput()
        .appendField(new Blockly.FieldMultilineInput(code), 'inlineScript')
      this.setInputsInline(false)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-run-and-process.html#inline-script')
      this.setTooltip('Allows inlining arbitrary script code which has to be syntactically correct')
    }
  }

  /*
  * Allows inlining arbitrary code
  * Code part
  */
  javascriptGenerator.forBlock['oh_script_inline'] = function (block) {
    const code = block.getFieldValue('inlineScript') + '\n'
    return code
  }
}
