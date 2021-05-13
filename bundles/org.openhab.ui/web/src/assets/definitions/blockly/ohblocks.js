import Blockly from 'blockly'
import { FieldItemModelPicker } from './ohitemfield'
import { FieldItemThingPicker } from './ohthingfield'

export default function defineOHBlocks (f7) {
  Blockly.Blocks['oh_item'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('item')
        .appendField(new FieldItemModelPicker('MyItem', null, { f7 }), 'itemName')
      this.setColour(248)
      this.setInputsInline(true)
      this.setTooltip('Pick an item from the Model')
      this.setOutput(true, null)
    }
  }

  Blockly.JavaScript['oh_item'] = function (block) {
    const itemName = block.getFieldValue('itemName')
    let code = '\'' + itemName + '\''
    return [code, 0]
  }

  Blockly.Blocks['oh_thing'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('thing')
        .appendField(new FieldItemThingPicker('MyThing', null, { f7 }), 'itemName')
      this.setColour(248)
      this.setInputsInline(true)
      this.setTooltip('Pick an item from the Thing List')
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
      this.setTooltip('Gets status information of the given thing identified by selected thing')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_getthing_state'] = function (block) {
    const things = Blockly.JavaScript.provideFunction_(
      'things',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.Things");'])
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
      this.setHelpUrl('')
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
    let code = 'itemRegistry.getItem("' + itemName + '")'
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
    let code = 'itemRegistry.getItem("' + itemName + '")'
    return [code, 0]
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

  Blockly.JavaScript['oh_ping'] = function (block) {
    const actions = Blockly.JavaScript.provideFunction_(
      'actions',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.Ping");'])
    let hostname = Blockly.JavaScript.valueToCode(block, 'hostName', Blockly.JavaScript.ORDER_ATOMIC)
    let code = actions + '.checkVitality(' + hostname + ',0,10)'
    return [code, Blockly.JavaScript.ORDER_NONE]
  }
}
