/*
* General Thing functionality for blockly
* supports jsscripting
*/

import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript.js'
import { FieldThingPicker } from './fields/thing-field.js'

export default function defineOHBlocks (f7, isGraalJs) {
  // this data was copy/pasted from https://icon-sets.iconify.design/f7/lightbulb/ -> CSS:URL
  // to match MainUI's icon for Things menu
  const thingImage =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 56 56"%3E%3Cpath fill="%23000" d="M19.504 43.152h16.969c.797 0 1.289-.492 1.289-1.289v-3.75c0-5.672 8.25-9.328 8.25-19.453C46.012 7.996 38.793.871 27.988.871c-10.804 0-18 7.125-18 17.79c0 10.124 8.227 13.78 8.227 19.452v3.75c0 .797.515 1.29 1.289 1.29m2.203-4.992c0-6.89-8.18-10.57-8.18-19.476c0-8.579 5.79-14.274 14.461-14.274c8.672 0 14.485 5.695 14.485 14.274c0 8.906-8.203 12.586-8.203 19.476v1.453H21.707Zm-1.336 11.32h15.235c1.195 0 2.156-.984 2.156-2.203c0-1.218-.961-2.203-2.157-2.203H20.371c-1.195 0-2.156.985-2.156 2.203c0 1.22.96 2.203 2.156 2.203m7.617 5.649c3.235 0 5.508-1.477 5.742-3.75H22.246c.211 2.273 2.484 3.75 5.742 3.75"/%3E%3C/svg%3E'

  Blockly.Blocks['oh_thing'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(new Blockly.FieldImage(thingImage, 15, 15))
        .appendField(new FieldThingPicker('MyThing', null, { f7 }), 'thingUid')
      this.setColour(0)
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
