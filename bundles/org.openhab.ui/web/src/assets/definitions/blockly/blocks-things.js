/*
* General Thing functionality for blockly
* supports jsscripting
*/

import Blockly from 'blockly'
import { FieldItemModelPicker } from './fields/item-field'
import { FieldThingPicker } from './fields/thing-field'

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

  Blockly.JavaScript['oh_thing'] = function (block) {
    const thingUid = block.getFieldValue('thingUid')
    let code = `'${thingUid}'`
    return [code, 0]
  }

  Blockly.Blocks['oh_getthing_state'] = {
    init: function () {
      this.appendValueInput('thingUid')
        .appendField('get thing status')
        .setCheck('String')
      this.setInputsInline(false)
      this.setOutput(true, 'String')
      this.setColour(0)
      this.setTooltip('Gets status information of the given thing, e.g. if the thing is online')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-items-things.html#get-thing-status')
    }
  }

  Blockly.JavaScript['oh_getthing_state'] = function (block) {
    const thingUid = Blockly.JavaScript.valueToCode(block, 'thingUid', Blockly.JavaScript.ORDER_ATOMIC)
    if (isGraalJs) {
      return [`things.getThing(${thingUid}).status`, 0]
    } else {
      const things = Blockly.JavaScript.provideFunction_(
        'things',
        ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.Things")'])
      return [`things.getThingStatusInfo(${thingUid}).getStatus()`, 0]
    }
  }
}
