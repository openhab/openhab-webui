/*
* General Thing functionality for blockly
* supports jsscripting
*/

import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript.js'
import { FieldThingPicker } from './fields/thing-field.js'

export default function defineOHBlocks (f7, isGraalJs) {
  Blockly.Blocks['oh_thing'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('thing')
        .appendField(new FieldThingPicker('MyThing', null, { f7 }), 'thingUid')
      this.setColour(160)
      this.setInputsInline(true)
      this.setTooltip('Pick a thing from the Thing List')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-items-things.html#thing')
      this.setOutput(true, null)
    }
  }

  javascriptGenerator.forBlock['oh_thing'] = function (block) {
    const thingUid = block.getFieldValue('thingUid')
    let code = `'${thingUid}'`
    return [code, 0]
  }

  Blockly.Blocks['oh_getthing_state'] = {
    init: function () {
      this.appendValueInput('thingUid')
        .appendField('get thing status')
        .setCheck(['String', 'oh_thing'])
      this.setInputsInline(false)
      this.setOutput(true, 'String')
      this.setColour(0)
      this.setTooltip('Gets status information of the given thing, e.g. if the thing is online')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-items-things.html#get-thing-status')
    }
  }

  javascriptGenerator.forBlock['oh_getthing_state'] = function (block) {
    const thingUid = javascriptGenerator.valueToCode(block, 'thingUid', javascriptGenerator.ORDER_ATOMIC)
    if (isGraalJs) {
      return [`things.getThing(${thingUid}).status`, 0]
    } else {
      const things = javascriptGenerator.provideFunction_(
        'things',
        ['var ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.Things")'])
      return [`things.getThingStatusInfo(${thingUid}).getStatus()`, 0]
    }
  }
}
