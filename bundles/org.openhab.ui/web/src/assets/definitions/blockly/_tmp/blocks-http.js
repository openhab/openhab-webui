import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'
import { FieldItemModelPicker } from './ohitemfield'

export default function defineOHBlocks_HTTP (f7, scripts) {
  Blockly.Blocks['oh_httprequest'] = {
    init: function () {
      this.appendValueInput('url')
        .setCheck('String')
        .appendField('Method')
        .appendField(new Blockly.FieldDropdown([['sendHttpGetRequest', 'sendHttpGetRequest'], ['sendHttpPutRequest', 'sendHttpPutRequest'], ['sendHttpPostRequest', 'sendHttpPostRequest'], ['sendHttpDeleteRequest', 'sendHttpDeleteRequest']]), 'requestType')
        .appendField('Content Type')
        .appendField(new Blockly.FieldDropdown([['none', 'none'], ['application/javascript', 'application/javascript'], ['application/xhtml+xml ', 'application/xhtml+xml '], ['application/json', 'application/json'], ['application/xml ', 'application/xml '], ['application/x-www-form-urlencoded ', 'application/x-www-form-urlencoded '], ['text/html', 'text/html'], ['text/javascript', 'text/javascript'], ['text/plain', 'text/plain'], ['text/xml', 'text/xml']]), 'contentType')
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

  javascriptGenerator['oh_httprequest'] = function (block) {
    const http = javascriptGenerator.provideFunction_(
      'http',
      ['var ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type(\'org.openhab.core.model.script.actions.HTTP\');'])
    let requesttype = block.getFieldValue('requestType')
    let contenttype = block.getFieldValue('contentType')
    let url = javascriptGenerator.valueToCode(block, 'url', javascriptGenerator.ORDER_ATOMIC)
    let payload = javascriptGenerator.valueToCode(block, 'payload', javascriptGenerator.ORDER_ATOMIC)
    let code = ''
    if (contenttype === 'none') {
      code = http + '.' + requesttype + '("' + url + '",60)'
    } else {
      code = http + '.' + requesttype + '(' + url + ',"' + contenttype + '","' + payload + '")'
    }
    return [code, javascriptGenerator.ORDER_NONE]
  }

  Blockly.Blocks['oh_script_dropdown'] = {
    init: function () {
      let input = this.appendDummyInput()
        .appendField('script')
        .appendField(new Blockly.FieldDropdown(this.generateOptions), 'script')
      this.setOutput(true, null)
    },
    generateOptions: function () {
      let options = []
      if (scripts != null) {
        for (let key in scripts) {
          let tmp1 = scripts[key]
          options.push([tmp1.name, tmp1.uid])
        }
      }
      return options
    }
  }

  javascriptGenerator['oh_script_dropdown'] = function (block) {
    let scriptName = block.getFieldValue('script')
    let code = scriptName
    return [code, javascriptGenerator.ORDER_NONE]
  }

  Blockly.Blocks['oh_ping'] = {
    init: function () {
      this.appendValueInput('hostName')
        .setCheck('String')
        .appendField('Ping')
      this.setOutput(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  javascriptGenerator['oh_ping'] = function (block) {
    const actions = javascriptGenerator.provideFunction_(
      'actions',
      ['var ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.Ping");'])
    let hostname = javascriptGenerator.valueToCode(block, 'hostName', javascriptGenerator.ORDER_ATOMIC)
    let code = actions + '.checkVitality(' + hostname + ',0,10)'
    return [code, javascriptGenerator.ORDER_NONE]
  }
}
