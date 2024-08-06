/*
* Adds HTTP blocks
*/

import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript.js'

export default function (f7, isGraalJs) {
  const timeoutImage = 'data:image/png;base64,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'
  const headerImage = 'data:image/png;base64,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'
  const queryImage = 'data:image/png;base64,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'

  const unavailMsg = 'HTTP blocks aren\'t supported in "application/javascript;version=ECMAScript-5.1"'
  /*
   * Provides block to perform GET, DELETE, POST and PUT requests
   */
  Blockly.Blocks['oh_httprequest'] = {
    init: function () {
      const imageTimeoutField = new Blockly.FieldImage(timeoutImage, 15, 15, undefined, this.onClickTimeout)
      imageTimeoutField.setTooltip('Add a custom timeout to the request. Default = 3000ms')

      const imageHeaderField = new Blockly.FieldImage(headerImage, 15, 15, undefined, this.onClickHeader)
      imageHeaderField.setTooltip('Add headers to the request.')

      const imageQueryField = new Blockly.FieldImage(queryImage, 15, 15, undefined, this.onClickQuery)
      imageQueryField.setTooltip('Add query to the request url.')

      this.appendValueInput('url')
        .setCheck('String')
        .appendField(imageTimeoutField, 'imgTimeout')
        .appendField(imageHeaderField, 'imgHeader')
        .appendField(imageQueryField, 'imgHeader')
        .appendField('send', 'methodField')
        .appendField(new Blockly.FieldDropdown([
          ['HttpGetRequest', 'HttpGetRequest'],
          ['HttpPostRequest', 'HttpPostRequest'],
          ['HttpPutRequest', 'HttpPutRequest'],
          ['HttpDeleteRequest', 'HttpDeleteRequest']
        ], this.handleRequestTypeSelection.bind(this)), 'requestType')
        .appendField('to')

      this.setInputsInline(false)
      this.setOutput(true, null)
      this.setColour(230)
      this.setTooltip('Send HTTP requests')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-http.html#requests')

      this.updateShape(this.hasTimeout, this.hasHeader, this.hasQuery)
    },
    handleRequestTypeSelection: function (requestType) {
      if (this.requestType !== requestType) {
        this.requestType = requestType
        this.updateShape(this.hasTimeout, this.hasHeader, this.hasQuery)
      }
    },
    handleContentTypeSelection: function (contentType) {
      if (this.contentType !== contentType) {
        this.contentType = contentType
        this.updateShape(this.hasTimeout, this.hasHeader, this.hasQuery)
      }
    },
    updateShape: function (hasTimeout, hasHeader, hasQuery) {
      this.hasTimeout = hasTimeout
      this.hasHeader = hasHeader
      this.hasQuery = hasQuery

      let timeoutInput = this.getInput('timeoutInput')
      if (hasTimeout) {
        if (!timeoutInput) {
          timeoutInput = this.appendValueInput('timeoutInput')
            .setCheck('Number')
            .appendField('with Timeout (ms)')
          const blockAfter = this.getInput('requestHeader') ? 'requestHeader' : (this.getInput('query') ? 'query' : (this.getInput('payload') ? 'payload' : undefined))
          if (blockAfter) {
            this.moveInputBefore('timeoutInput', blockAfter)
          }
          timeoutInput.setShadowDom(Blockly.utils.xml.textToDom('<shadow type="math_number"><field name="NUM">3000</field></shadow>'))
        }
      } else if (timeoutInput) {
        timeoutInput.setShadowDom(null)
        this.removeInput('timeoutInput')
      }

      let headerInput = this.getInput('requestHeader')
      if (hasHeader) {
        if (!headerInput) {
          headerInput = this.appendValueInput('requestHeader')
            .setCheck('Dictionary')
            .appendField('with Headers')
          const blockAfter = this.getInput('query') ? 'query' : (this.getInput('payload') ? 'payload' : undefined)
          if (blockAfter) {
            this.moveInputBefore('requestHeader', blockAfter)
          }
          this.addDictShadowBlock(headerInput, 'header')
        }
      } else if (headerInput) {
        headerInput.setShadowDom(null)
        this.removeInput('requestHeader')
      }

      let queryInput = this.getInput('query')
      if (hasQuery) {
        if (!queryInput) {
          queryInput = this.appendValueInput('query')
            .setCheck('Dictionary')
            .appendField('with Query')
          const blockAfter = this.getInput('payload') ? 'payload' : undefined
          if (blockAfter) {
            this.moveInputBefore('query', blockAfter)
          }
          this.addDictShadowBlock(queryInput, 'param')
        }
      } else if (queryInput) {
        queryInput.setShadowDom(null)
        this.removeInput('query')
      }

      if (['HttpPostRequest', 'HttpPutRequest'].includes(this.requestType)) {
        let payloadInput = this.getInput('payload')
        let hasPayload = (this.contentType !== 'none')
        if (!hasPayload && payloadInput && (payloadInput.type === Blockly.inputs.inputTypes.VALUE)) {
          this.removePayloadInput()
          payloadInput = null
        } else if (hasPayload && payloadInput && (payloadInput.type === Blockly.inputs.inputTypes.DUMMY)) {
          this.removePayloadInput()
          payloadInput = null
        }
        if (!payloadInput) {
          if (!hasPayload) {
            payloadInput = this.appendDummyInput('payload')
          } else {
            payloadInput = this.appendValueInput('payload')
          }
          payloadInput.appendField('with Payload')
            .appendField(new Blockly.FieldDropdown([
              ['application/json', 'application/json'],
              ['none', 'none'],
              ['application/javascript', 'application/javascript'],
              ['application/xhtml+xml', 'application/xhtml+xml'],
              ['application/xml', 'application/xml'],
              ['application/x-www-form-urlencoded', 'application/x-www-form-urlencoded'],
              ['text/html', 'text/html'],
              ['text/javascript', 'text/javascript'],
              ['text/plain', 'text/plain'],
              ['text/xml', 'text/xml']], this.handleContentTypeSelection.bind(this)), 'contentType')
          if (this.contentType) {
            this.setFieldValue(this.contentType, 'contentType')
          }
        }
        if (hasPayload) {
          payloadInput.setShadowDom(null)
          if (this.contentType === 'application/x-www-form-urlencoded') {
            payloadInput.setCheck(['Dictionary', 'String'])
            this.addDictShadowBlock(payloadInput, 'param')
          } else {
            if (this.contentType && (this.contentType !== 'application/json')) {
              payloadInput.setCheck('String')
            } else {
              payloadInput.setCheck(null)
            }
            payloadInput.setShadowDom(Blockly.utils.xml.textToDom('<shadow type="text"><field name="TEXT">payload</field></shadow>'))
          }
        }
      } else {
        this.removePayloadInput()
      }
    },
    removePayloadInput () {
      let payloadInput = this.getInput('payload')
      if (payloadInput) {
        if (payloadInput.type === Blockly.inputs.inputTypes.VALUE) {
          payloadInput.setShadowDom(null)
        }
        this.removeInput('payload')
      }
    },
    addDictShadowBlock (input, param) {
      input.setShadowDom(Blockly.utils.xml.textToDom(`<shadow type="dicts_create_with">
          <mutation items="2" />
          <field name="KEY0">${param}1</field>
          <value name="ADD0"><shadow type="text"><field name="TEXT">${param}1</field></shadow></value>
          <field name="KEY1">${param}2</field>
          <value name="ADD1"><shadow type="text"><field name="TEXT">${param}2</field></shadow></value>
        </shadow>`))
    },
    onClickTimeout () {
      let block = this.getSourceBlock()
      block.hasTimeout = !block.hasTimeout
      block.updateShape(block.hasTimeout, block.hasHeader, block.hasQuery)
    },
    onClickHeader () {
      let block = this.getSourceBlock()
      block.hasHeader = !block.hasHeader
      block.updateShape(block.hasTimeout, block.hasHeader, block.hasQuery)
    },
    onClickQuery () {
      let block = this.getSourceBlock()
      block.hasQuery = !block.hasQuery
      block.updateShape(block.hasTimeout, block.hasHeader, block.hasQuery)
    },
    mutationToDom: function () {
      let container = Blockly.utils.xml.createElement('mutation')
      container.setAttribute('hasTimeout', this.hasTimeout)
      container.setAttribute('hasHeader', this.hasHeader)
      container.setAttribute('hasQuery', this.hasQuery)
      return container
    },
    domToMutation: function (xmlElement) {
      let hasTimeout = xmlElement.getAttribute('hasTimeout') === 'true'
      let hasHeader = xmlElement.getAttribute('hasHeader') === 'true'
      let hasQuery = xmlElement.getAttribute('hasQuery') === 'true'
      this.updateShape(hasTimeout, hasHeader, hasQuery)
    }
  }

  /**
   * Implements GET, DELETE, POST and PUT requests
   *
   * @param block
   * @returns {[string,number]}
   */
  javascriptGenerator.forBlock['oh_httprequest'] = function (block, generator) {
    const requestType = block.getFieldValue('requestType')

    let url = javascriptGenerator.valueToCode(block, 'url', javascriptGenerator.ORDER_ATOMIC)

    const query = javascriptGenerator.valueToCode(block, 'query', javascriptGenerator.ORDER_ATOMIC)
    if (query) {
      const queryEncodeFunction = encodeParams(query)
      url = `${url} + '?' + ${queryEncodeFunction}(${query})`
    }

    const contentType = block.getFieldValue('contentType')

    let payload = javascriptGenerator.valueToCode(block, 'payload', javascriptGenerator.ORDER_ATOMIC)
    if (payload) {
      if (contentType === 'application/x-www-form-urlencoded') {
        const payloadEncodeFunction = encodeParams(payload)
        payload = `${payloadEncodeFunction}(${payload})`
      } else if (contentType === 'application/json') {
        const payloadToJSONStringFunction = toJSONString(payload)
        payload = `${payloadToJSONStringFunction}(${payload})`
      }
    }

    const headers = javascriptGenerator.valueToCode(block, 'requestHeader', javascriptGenerator.ORDER_ATOMIC)
    const timeout = javascriptGenerator.valueToCode(block, 'timeoutInput', javascriptGenerator.ORDER_ATOMIC) || 3000

    let code = ''
    if (payload) {
      if (!headers) {
        code = `actions.HTTP.send${requestType}(${url}, '${contentType}', ${payload}, ${timeout})`
      } else {
        code = `actions.HTTP.send${requestType}(${url}, '${contentType}', ${payload}, ${headers}, ${timeout})`
      }
    } else {
      if (!headers) {
        code = `actions.HTTP.send${requestType}(${url}, ${timeout})`
      } else {
        code = `actions.HTTP.send${requestType}(${url}, ${headers}, ${timeout})`
      }
    }
    if (isGraalJs) {
      return [code, javascriptGenerator.ORDER_NONE]
    } else {
      throw new Error(unavailMsg)
    }
  }

  function encodeParams (params) {
    return javascriptGenerator.provideFunction_('encodeParams', [
      'function encodeParams(params) {',
      '    if ((typeof params === \'string\') || (params instanceof String)) return params;',
      '    const encodedParams = Object.entries(params).map(([key, value]) => [key, encodeURIComponent(value)]);',
      '    return encodedParams.map(p => p.join(\'=\')).join(\'&\');',
      '}'
    ])
  }

  function toJSONString (params) {
    return javascriptGenerator.provideFunction_('toJSONString', [
      'function toJSONString(params) {',
      '    if ((typeof params === \'string\') || (params instanceof String)) return params;',
      '    return JSON.stringify(params).replace(/^"+/, \'["\').replace(/"+$/, \'"]\');',
      '}'
    ])
  }
}
