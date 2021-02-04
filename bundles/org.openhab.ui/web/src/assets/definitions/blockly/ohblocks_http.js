import Blockly from 'blockly'
import { FieldItemModelPicker } from './ohitemfield'

export default function defineOHBlocks_HTTP (f7) {
  Blockly.Blocks['oh_callscript'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Call Script')
        .appendField(new Blockly.FieldTextInput('<script name>'), 'script')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_callscript'] = function (block) {
    var text_script = block.getFieldValue('script')

    var code = '...;\n'
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
}
