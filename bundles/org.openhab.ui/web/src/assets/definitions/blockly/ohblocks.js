/*
* @author yannick.schaus
* @author stefan.hoehn
*
* General item and thing functionally for blockly
*
*/
import Blockly from 'blockly'
import { FieldItemModelPicker } from './ohitemfield'
import { FieldItemThingPicker } from './ohthingfield'

export default function defineOHBlocks (f7) {
  // this single block can also be used e.g. to log out the chosen item name
  Blockly.Blocks['oh_item'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('item')
        .appendField(new FieldItemModelPicker('MyItem', null, { f7 }), 'itemName')
      this.setColour(248)
      this.setInputsInline(true)
      this.setTooltip('Pick an item from the Model')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/items.html')
      this.setOutput(true, null)
    }
  }

  Blockly.JavaScript['oh_item'] = function (block) {
    const itemName = block.getFieldValue('itemName')
    let code = `'${itemName}'`
    return [code, 0]
  }

  // this single block can also be used e.g. to log out the chosen thing name
  Blockly.Blocks['oh_thing'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('thing')
        .appendField(new FieldItemThingPicker('MyThing', null, { f7 }), 'itemName')
      this.setColour(248)
      this.setInputsInline(true)
      this.setTooltip('Pick an item from the Thing List')
      this.setHelpUrl('https://www.openhab.org/docs/concepts/things.html')
      this.setOutput(true, null)
    }
  }

  Blockly.JavaScript['oh_thing'] = function (block) {
    const itemName = block.getFieldValue('itemName')
    let code = '\'' + itemName + '\''
    return [code, 0]
  }

  Blockly.Blocks['oh_getthing_state'] = {
    init: function () {
      this.appendValueInput('itemName')
        .appendField('get thing state')
        .setCheck('String')
      this.setInputsInline(true)
      this.setOutput(true, 'String')
      this.setColour(0)
      this.setTooltip('Gets status information of the given thing, e.g. if the thing is online')
      this.setHelpUrl('https://www.openhab.org/docs/concepts/things.html#thing-status')
    }
  }

  Blockly.JavaScript['oh_getthing_state'] = function (block) {
    const things = Blockly.JavaScript.provideFunction_(
      'things',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.Things")'])
    const itemName = Blockly.JavaScript.valueToCode(block, 'itemName', Blockly.JavaScript.ORDER_ATOMIC)
    let code = things + '.getThingStatusInfo(' + itemName + ').getStatus()'
    return [code, 0]
  }

  Blockly.Blocks['oh_getitem_state'] = {
    init: function () {
      this.appendValueInput('itemName')
        .appendField('get item state')
        .setCheck('String')
      this.setInputsInline(true)
      this.setOutput(true, 'String')
      this.setColour(0)
      this.setTooltip('Get an item state from the item registry')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/items.html#state')
    }
  }

  Blockly.JavaScript['oh_getitem_state'] = function (block) {
    const itemName = Blockly.JavaScript.valueToCode(block, 'itemName', Blockly.JavaScript.ORDER_ATOMIC)
    let code = 'itemRegistry.getItem(' + itemName + ').getState()'
    return [code, 0]
  }

  Blockly.Blocks['oh_getitem'] = {
    init: function () {
      this.appendValueInput('itemName')
        .appendField('get item')
        .setCheck('String')
      this.setInputsInline(true)
      this.setOutput(true, 'String')
      this.setColour(0)
      this.setTooltip('Get an item from the item registry')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_getitem'] = function (block) {
    const itemName = Blockly.JavaScript.valueToCode(block, 'itemName', Blockly.JavaScript.ORDER_ATOMIC)
    let code = `itemRegistry.getItem(${itemName})`
    return [code, 0]
  }
}
