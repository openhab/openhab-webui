/*
* General Thing functionality for blockly
* supports jsscripting
*/

import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript.js'
import { FieldThingPicker } from './fields/thing-field.js'
import { blockGetCheckedInputType } from './utils.js'

export default function defineOHBlocks (f7) {
  Blockly.Blocks['oh_thing'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('thing')
        .appendField(new FieldThingPicker('MyThing', null, { f7 }), 'thingUid')
      this.setColour(160)
      this.setInputsInline(true)
      this.setTooltip('Pick a thing from the Thing List')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-items-things.html#thing')
      this.setOutput(true, 'oh_thing')
    }
  }

  javascriptGenerator.forBlock['oh_thing'] = function (block) {
    const thingUid = block.getFieldValue('thingUid')
    let code = `'${thingUid}'`
    return [code, 0]
  }

  Blockly.Blocks['oh_getthing'] = {
    init: function () {
      this.appendValueInput('thingUid')
        .appendField('get thing')
        .setCheck(['String', 'oh_thing'])
      this.setInputsInline(false)
      this.setOutput(true, 'oh_thingtype')
      this.setColour(0)
      this.setTooltip('Get a thing from the thing registry')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-items-things.html#get-thing')
    }
  }

  javascriptGenerator.forBlock['oh_getthing'] = function (block) {
    const thingUid = javascriptGenerator.valueToCode(block, 'thingUid', javascriptGenerator.ORDER_ATOMIC)
    return [`things.getThing(${thingUid})`, 0]
  }

  Blockly.Blocks['oh_getthing_state'] = {
    init: function () {
      this.appendValueInput('thingUid')
        .appendField('get thing status')
        .setCheck(['String', 'oh_thing', 'oh_thingtype'])
      this.setInputsInline(false)
      this.setOutput(true, 'String')
      this.setColour(0)
      this.setTooltip('Gets status information of the given thing, e.g. if the thing is online')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-items-things.html#get-thing-status')
    }
  }

  javascriptGenerator.forBlock['oh_getthing_state'] = function (block) {
    const thingUid = javascriptGenerator.valueToCode(block, 'thingUid', javascriptGenerator.ORDER_ATOMIC)
    const inputType = blockGetCheckedInputType(block, 'thingUid')
    const code = (inputType === 'oh_thingtype') ? `${thingUid}.status` : `things.getThing(${thingUid}).status`
    return [code, 0]
  }

  Blockly.Blocks['oh_getthings'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('get things')
      this.setInputsInline(false)
      this.setOutput(true, 'Array')
      this.setColour(0)
      this.setTooltip('Retrieve all things')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-items-things.html#get-things')
      this.setOutput(true, null) // Array of Thing objects
    }
  }

  javascriptGenerator.forBlock['oh_getthings'] = function (block) {
    return ['things.getThings()', 0]
  }

  Blockly.Blocks['oh_getthing'] = {
    init: function () {
      this.appendValueInput('thingUid')
        .appendField('get thing')
        .setCheck(['String', 'oh_thing'])
      this.setInputsInline(false)
      this.setOutput(true, 'oh_thingtype')
      this.setColour(0)
      this.setTooltip('Get a thing from the thing registry')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-items-things.html#get-thing')
    }
  }

  javascriptGenerator.forBlock['oh_getthing'] = function (block) {
    const thingUid = javascriptGenerator.valueToCode(block, 'thingUid', javascriptGenerator.ORDER_ATOMIC)
    return [`things.getThing(${thingUid})`, 0]
  }

  Blockly.Blocks['oh_getthing_attribute'] = {
    init: function () {
      const block = this
      const dropdown = new Blockly.FieldDropdown(
        [['UID', 'uid'], ['label', 'label'], ['status', 'status'], ['status info', 'statusInfo'], ['location', 'location'], ['is enabled', 'isEnabled'], ['thing type UID', 'thingTypeUID'], ['bridge UID', 'bridgeUID']],
        function (newMode) {
          block._updateType(newMode)
        })
      this.appendValueInput('thing')
        .setCheck(['oh_thingtype', 'oh_thing'])
        .appendField('get ')
        .appendField(dropdown, 'attributeName')
        .appendField('of thing')
      this.setInputsInline(false)

      this.setOutput(true, 'String')
      this.setColour(0)
      this.setTooltip('Retrieve a specific attribute from the thing. Note that groups and tags return a list and should be used with the loops-block \'for each item ... in list\'. ')
      this.setTooltip(function () {
        const attributeName = block.getFieldValue('attributeName')
        let TIP = {
          'uid': 'unique id of the Thing (string)',
          'label': 'label of the Thing (string)',
          'status': 'status of the Thing (string)',
          'statusInfo': 'detailed status of the Thing (string)',
          'location': 'location of the Thing (string)',
          'enabled': 'is the thing enabled (boolean)',
          'thingTypeUID': 'unique id of the Thing\'s type (string)',
          'bridgeUID': 'unique id of the Thing\'s bridge (string)'
        }
        return TIP[attributeName] + ' \n Note: make sure to use "get thing xxx"-Block for the connected block when working with Variables, not "thing xxx"-Block'
      })
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-items-things.html#get-particular-attributes-of-a-thing')
    },
    /**
     * Modify this block to have the correct output type based on the attribute.
     */
    _updateType: function (newAttributeName) {
      if (['uid', 'status', 'statusInfo', 'location', 'thingTypeUID', 'bridgeUID'].includes(newAttributeName)) {
        this.outputConnection.setCheck('String')
      } else if (newAttributeName === 'enabled') {
        this.outputConnection.setCheck('Boolean')
      } else {
        this.outputConnection.setCheck('String')
      }
    },
    /**
     * Create XML to represent the input and output types.
     * @return {!Element} XML storage element.
     * @this {Blockly.Block}
     */
    mutationToDom: function () {
      let container = Blockly.utils.xml.createElement('mutation')
      container.setAttribute('attributeName', this.getFieldValue('attributeName'))
      return container
    },
    /**
     * Parse XML to restore the input and output types.
     * @param {!Element} xmlElement XML storage element.
     * @this {Blockly.Block}
     */
    domToMutation: function (xmlElement) {
      this._updateType(xmlElement.getAttribute('attributeName'))
    }
  }

  /*
* Provides all attributes from a Thing
* Code part
*/
  javascriptGenerator.forBlock['oh_getthing_attribute'] = function (block) {
    const thing = javascriptGenerator.valueToCode(block, 'thing', javascriptGenerator.ORDER_ATOMIC)
    const inputType = blockGetCheckedInputType(block, 'thing')
    const attributeName = block.getFieldValue('attributeName')
    const code = (inputType === 'oh_thing') ? `things.getThing(${thing}).${attributeName}` : `${thing}.${attributeName}`
    return [code, 0]
  }
}
