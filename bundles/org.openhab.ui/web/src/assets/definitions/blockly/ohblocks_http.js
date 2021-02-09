import Blockly from 'blockly'
import { FieldItemModelPicker } from './ohitemfield'

export default function defineOHBlocks_HTTP(f7, scripts) {
  Blockly.Blocks['oh_callscript'] = {
    init: function () {
      this.appendValueInput('script')
        .setCheck(null)
        .appendField('Call Script')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_callscript'] = function (block) {
    const scriptExecution = Blockly.JavaScript.provideFunction_(
      'scriptExecution',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.ScriptExecution");'])
    var script = Blockly.JavaScript.valueToCode(block, 'script', Blockly.JavaScript.ORDER_ATOMIC)
    var code = scriptExecution + '.callScript(' + script + ');\n'
    return code
  }

  Blockly.Blocks['oh_httprequest'] = {
    init: function() {
      this.appendValueInput('url')
        .setCheck('String')
        .appendField('Method')
        .appendField(new Blockly.FieldDropdown([['sendHttpGetRequest','sendHttpGetRequest'], ['sendHttpPutRequest','sendHttpPutRequest'], ['sendHttpPostRequest','sendHttpPostRequest'], ['sendHttpDeleteRequest','sendHttpDeleteRequest']]), 'requestType')
        .appendField('Content Type')
        .appendField(new Blockly.FieldDropdown([['none' ,'none'],['application/javascript' ,'application/javascript'], ['application/xhtml+xml ' ,'application/xhtml+xml '], ['application/json' ,'application/json'], ['application/xml ' ,'application/xml '], ['application/x-www-form-urlencoded ' ,'application/x-www-form-urlencoded '], ['text/html' ,'text/html'], ['text/javascript' ,'text/javascript'], ['text/plain' ,'text/plain'], ['text/xml', 'text/xml']]), 'contentType')
        .appendField('URL')
      this.appendValueInput('payload')
        .setCheck(null)
        .appendField('Payload')
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_httprequest'] = function(block) {
    const http = Blockly.JavaScript.provideFunction_(
      'http',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.HTTP");'])
    var requesttype = block.getFieldValue('requestType')
    var contenttype = block.getFieldValue('contentType')
    var url = Blockly.JavaScript.valueToCode(block, 'url', Blockly.JavaScript.ORDER_ATOMIC)
    var payload = Blockly.JavaScript.valueToCode(block, 'payload', Blockly.JavaScript.ORDER_ATOMIC)
    var code = ''
    if (contenttype === 'none') {
      code = http + '.' + requesttype + '("' + url + '",60)'
    } else {
      code = http + '.' + requesttype + '(' + url + ',"' + contenttype + '","' + payload + '")'
    }
    return [code, Blockly.JavaScript.ORDER_NONE]
  }

  Blockly.Blocks['oh_script_dropdown'] = {
    init: function () {
      var input = this.appendDummyInput()
        .appendField('script')
        .appendField(new Blockly.FieldDropdown(this.generateOptions), 'script')
      this.setOutput(true, null)
    },
    generateOptions: function () {
      var options = []
      if (scripts != null) {
        for (var key in scripts) {
          var tmp1 = scripts[key]
          options.push([tmp1.name, tmp1.uid])
        }
      }
      return options
    }
  }

  Blockly.JavaScript['oh_script_dropdown'] = function (block) {
    var scriptName = block.getFieldValue('script')
    var code = scriptName
    return [code, Blockly.JavaScript.ORDER_NONE]
  }
}
