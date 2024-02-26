/*
* Adds new bitwise operator blocks to the math section
*/

import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript.js'

export default function (f7, isGraalJs) {
  const timeoutImage = 'data:image/png;base64,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'
  const headerImage = 'data:image/png;base64,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'

  /*
   * Provides block to do GET, DELETE, POST and PUT requests
   */
  Blockly.Blocks['oh_httprequest'] = {
    init: function () {
      const imageTimeoutField = new Blockly.FieldImage(timeoutImage, 15, 15, undefined, this.onClickTimeout)
      imageTimeoutField.setTooltip('Add a custom timeout to the request. Default = 3000ms')

      const imageHeaderField = new Blockly.FieldImage(headerImage, 15, 15, undefined, this.onClickHeader)
      imageHeaderField.setTooltip('Add headers to the request.')

      this.appendValueInput('url')
        .setCheck('String')
        .appendField(imageTimeoutField, 'imgTimeout')
        .appendField(imageHeaderField, 'imgHeader')
        .appendField('send', 'methodField')
        .appendField(new Blockly.FieldDropdown([
          ['HttpGetRequest', 'HttpGetRequest'],
          ['HttpPostRequest', 'HttpPostRequest'],
          ['HttpPutRequest', 'HttpPutRequest'],
          ['HttpDeleteRequest', 'HttpDeleteRequest']
        ], this.handleRequestTypeSelection.bind(this)), 'requestType')
        .appendField('to')

      this.updateShape(this.hasTimeout, true, this.hasHeader)
      this.handleRequestTypeSelection(this.getFieldValue('requestType'))

      this.setInputsInline(false)
      this.setOutput(true, null)
      this.setColour(230)
      this.setTooltip('Send HTTP requests')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-http.html#requests')
    },
    handleRequestTypeSelection: function (requestType) {
      if (this.requestType !== requestType) {
        this.requestType = requestType
        const getOrDelete = (requestType === 'HttpGetRequest' || requestType === 'HttpDeleteRequest')
        if (!getOrDelete) {
          if (!this.getInput('payload')) {
            this.appendValueInput('payload')
              .setCheck(null)
              .appendField('with Payload')
              .appendField(new Blockly.FieldDropdown([
                ['application/json', 'application/json'],
                ['none', 'none'],
                ['application/javascript', 'application/javascript'],
                ['application/xhtml+xml ', 'application/xhtml+xml '],
                ['application/xml ', 'application/xml '],
                ['application/x-www-form-urlencoded ', 'application/x-www-form-urlencoded '],
                ['text/html', 'text/html'],
                ['text/javascript', 'text/javascript'],
                ['text/plain', 'text/plain'],
                ['text/xml', 'text/xml']]), 'contentType')
          }
        } else {
          if (this.getInput('payload')) {
            this.removeInput('payload')
          }
        }
        this.updateShape(this.hasTimeout, true, this.hasHeader)
      }
    },
    updateShape: function (hasTimeout, addNumBlock, hasHeader) {
      this.hasTimeout = hasTimeout
      this.hasHeader = hasHeader
      if (hasTimeout) {
        if (!this.getInput('timeoutInput')) {
          const timeoutInput = this.appendValueInput('timeoutInput')
            .setCheck('Number')
            .appendField('with Timeout (ms)')

          const blockAfter = (this.getInput('requestHeader')) ? 'requestHeader' : (this.getInput('payload')) ? 'payload' : undefined

          if (blockAfter) {
            this.moveInputBefore('timeoutInput', blockAfter)
          }
          if (addNumBlock) {
            const parentConnection = timeoutInput.connection
            const mathNumberBlock = this.workspace.newBlock('math_number')
            mathNumberBlock.setFieldValue('3000', 'NUM')
            mathNumberBlock.initSvg()
            mathNumberBlock.render()
            parentConnection.connect(mathNumberBlock.outputConnection)
          }
        }
      } else {
        if (this.getInput('timeoutInput')) {
          const parentConnection = this.getInput('timeoutInput').connection
          const targetBlock = parentConnection.targetBlock()
          if (targetBlock) {
            targetBlock.unplug(true)
            targetBlock.dispose(true)
          }
          this.removeInput('timeoutInput')
        }
      }
      if (hasHeader) {
        if (!this.getInput('requestHeader')) {
          const headerInput = this.appendValueInput('requestHeader')
            .setCheck('Dictionary')
            .appendField('with Headers')
          const blockAfter = (this.getInput('payload')) ? 'payload' : undefined

          if (blockAfter) {
            this.moveInputBefore('requestHeader', blockAfter)
          }
        }
      } else {
        if (this.getInput('requestHeader')) {
          this.removeInput('requestHeader')
        }
      }
    },
    onClickTimeout () {
      let block = this.getSourceBlock()
      block.hasTimeout = !block.hasTimeout
      block.updateShape(block.hasTimeout, true, block.hasHeader)
    },
    onClickHeader () {
      let block = this.getSourceBlock()
      block.hasHeader = !block.hasHeader
      block.updateShape(block.hasTimeout, true, block.hasHeader)
    },
    mutationToDom: function () {
      let container = Blockly.utils.xml.createElement('mutation')
      container.setAttribute('hasTimeout', this.hasTimeout)
      container.setAttribute('hasHeader', this.hasHeader)
      return container
    },
    domToMutation: function (xmlElement) {
      let hasTimeout = xmlElement.getAttribute('hasTimeout') === 'true'
      let hasHeader = xmlElement.getAttribute('hasHeader') === 'true'
      this.updateShape(hasTimeout, false, hasHeader)
    }
  }

  /**
   * Implements GET, DELETE, POST and PUT requests
   *
   * @param block
   * @returns {[string,number]}
   */
  javascriptGenerator.forBlock['oh_httprequest'] = function (block) {
    const requestType = block.getFieldValue('requestType')
    const contentType = block.getFieldValue('contentType')
    const headers = javascriptGenerator.valueToCode(block, 'requestHeader', javascriptGenerator.ORDER_ATOMIC)

    let timeout = javascriptGenerator.valueToCode(block, 'timeoutInput', javascriptGenerator.ORDER_ATOMIC)
    if (!timeout) {
      timeout = 3000
    }

    let url = javascriptGenerator.valueToCode(block, 'url', javascriptGenerator.ORDER_ATOMIC)
    let payload = javascriptGenerator.valueToCode(block, 'payload', javascriptGenerator.ORDER_ATOMIC)

    const hasContent = (requestType !== 'HttpGetRequest' && requestType !== 'HttpDeleteRequest')
    let code = ''
    if (hasContent) {
      if (!headers) {
        code = `actions.HTTP.send${requestType}(${url},'${contentType}',${payload},${timeout})`
      } else {
        code = `actions.HTTP.send${requestType}(${url},'${contentType}',${payload},${headers},${timeout})`
      }
    } else {
      if (!headers) {
        code = `actions.HTTP.send${requestType}(${url},${timeout})`
      } else {
        code = `actions.HTTP.send${requestType}(${url},${headers},${timeout})`
      }
    }
    return [code, javascriptGenerator.ORDER_NONE]
  }
}
