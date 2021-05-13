import Blockly from 'blockly'
import { FieldSlider } from '@blockly/field-slider'

export default function defineOHBlocks_Audio (f7, sinks) {
  Blockly.Blocks['audioSlider'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(new FieldSlider(50), 'FIELDNAME')
      this.setColour(0)
      this.setInputsInline(true)
      this.setOutput(true, null)
    }
  }

  Blockly.JavaScript['audioSlider'] = function (block) {
    const itemName = block.getFieldValue('FIELDNAME')
    let code = '\'' + itemName + '\''
    return [code, 0]
  }

  Blockly.Blocks['oh_mediaadjust'] = {
    init: function () {
      this.appendValueInput('floatValue')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown([['setMasterVolume', 'setMasterVolume'], ['increaseMasterVolume', 'increaseMasterVolume'], ['decreaseMasterVolume', 'decreaseMasterVolume']]), 'functionSelect')
        .appendField('%')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_mediaadjust'] = function (block) {
    const audio = Blockly.JavaScript.provideFunction_(
      'audio',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.Audio");'])
    let functionSelect = block.getFieldValue('functionSelect')
    let floatvalue = Blockly.JavaScript.valueToCode(block, 'floatValue', Blockly.JavaScript.ORDER_ATOMIC)
    let code
    switch (functionSelect) {
      case 'setMasterVolume' :
        code = audio + '.setMasterVolume(' + floatvalue + ');'
        break
      case 'increaseMasterVolume' :
        code = audio + '.increaseMasterVolume(' + floatvalue + ');'
        break
      case 'decreaseMasterVolume' :
        code = audio + '.decreaseMasterVolume(' + floatvalue + ');'
        break
    }
    return code
  }

  Blockly.Blocks['oh_playmedia'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Play')
        .appendField(new Blockly.FieldTextInput('<audio file>'), 'fileName')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('plays a sound from the sounds folder to the default sink')
    }
  }

  Blockly.JavaScript['oh_playmedia'] = function (block) {
    const audio = Blockly.JavaScript.provideFunction_(
      'audio',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.Audio");'])
    let fileName = block.getFieldValue('fileName')
    let code = audio + '.playSound("' + fileName + '");\n'
    return code
  }

  Blockly.Blocks['oh_playmedia_volume'] = {
    init: function () {
      this.appendValueInput('volume')
        .setCheck(null)
        .appendField('Play')
        .appendField(new Blockly.FieldTextInput('filename'), 'fileName')
        .appendField('at volume')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_playmedia_volume'] = function (block) {
    const audio = Blockly.JavaScript.provideFunction_(
      'audio',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.Audio");'])
    let fileName = block.getFieldValue('fileName')
    let volume = block.getFieldValue('volume').replace(/'/g, '')
    let code = audio + '.playSound("' + fileName + '", new PercentType(' + volume + '));\n'
    return code
  }

  Blockly.Blocks['oh_playmedia_sink'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Play')
        .appendField(new Blockly.FieldTextInput('<audio file>'), 'fileName')
      this.appendValueInput('sinkName')
        .setCheck(null)
        .appendField('on')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('plays a sound from the sounds folder to the given sink')
    }
  }

  Blockly.JavaScript['oh_playmedia_sink'] = function (block) {
    const audio = Blockly.JavaScript.provideFunction_(
      'audio',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.Audio");'])
    let fileName = block.getFieldValue('fileName')
    let sinkName = Blockly.JavaScript.valueToCode(block, 'sinkName', Blockly.JavaScript.ORDER_ATOMIC)
    // TODO : handle multiple sinks
    let code = audio + '.playSound("' + sinkName + '","' + fileName + '");\n'
    return code
  }

  Blockly.Blocks['oh_playmedia_sink_volume'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Play audio')
        .appendField(new Blockly.FieldTextInput('filename'), 'fileName')
      this.appendValueInput('sinkName')
        .setCheck(null)
        .appendField('on')
      this.appendValueInput('volume')
        .setCheck(null)
        .appendField('at Voume')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_playmedia_sink_volume'] = function (block) {
    const audio = Blockly.JavaScript.provideFunction_(
      'audio',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.Audio");'])
    let fileName = block.getFieldValue('fileName')
    let sinkName = Blockly.JavaScript.valueToCode(block, 'sinkName', Blockly.JavaScript.ORDER_ATOMIC)
    let volume = Blockly.JavaScript.valueToCode(block, 'volume', Blockly.JavaScript.ORDER_ATOMIC).replace(/'/g, '')
    // TODO : handle multiple sinks
    let code = audio + '.playSound("' + sinkName + '","' + fileName + '",new PercentType(' + volume + '));\n'
    return code
  }

  Blockly.Blocks['oh_playstream'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Play stream')
        .appendField(new Blockly.FieldTextInput('<URL>'), 'url')
        .appendField('on default sink')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('plays an audio stream from an url to the default sink (set url to null if streaming should be stopped)')
    }
  }

  Blockly.JavaScript['oh_playstream'] = function (block) {
    const audio = Blockly.JavaScript.provideFunction_(
      'audio',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.Audio");'])
    let url = block.getFieldValue('url')
    let code = audio + '.playStream("' + url + '");\n'
    return code
  }

  Blockly.Blocks['oh_playstream_sink'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Play stream')
        .appendField(new Blockly.FieldTextInput('<URL>'), 'url')
      this.appendValueInput('sinkName')
        .setCheck(null)
        .appendField('on')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('plays an audio stream from an url to the given sink(s) (set url to null if streaming should be stopped)')
    }
  }

  Blockly.JavaScript['oh_playstream_sink'] = function (block) {
    const audio = Blockly.JavaScript.provideFunction_(
      'audio',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.Audio");'])
    // TODO : handle multiple sinks
    let url = block.getFieldValue('url')
    let sinkName = Blockly.JavaScript.valueToCode(block, 'sinkName', Blockly.JavaScript.ORDER_ATOMIC)
    let code = audio + '.playStream("' + sinkName + '","' + url + '");\n'
    return code
  }

  Blockly.Blocks['oh_getmastervolume'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Get Master Volume')
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_audio_getmastervolume'] = function (block) {
    const audio = Blockly.JavaScript.provideFunction_(
      'audio',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.Audio");'])
    let code = audio + '.getMasterVolume()'
    return [code, Blockly.JavaScript.ORDER_NONE]
  }

  Blockly.Blocks['oh_audiosink_dropdown'] = {
    init: function () {
      let input = this.appendDummyInput()
        .appendField('audio sink')
        .appendField(new Blockly.FieldDropdown(this.generateOptions), 'sinks')
      this.setOutput(true, null)
    },
    generateOptions: function () {
      let options = []
      if (sinks != null) {
        for (let key in sinks) {
          let tmp1 = sinks[key]
          options.push([tmp1.label, tmp1.id])
        }
      }
      return options
    }
  }

  Blockly.JavaScript['oh_audiosink_dropdown'] = function (block) {
    let sinkName = block.getFieldValue('sinks')
    let code = sinkName
    return [code, Blockly.JavaScript.ORDER_NONE]
  }
}
