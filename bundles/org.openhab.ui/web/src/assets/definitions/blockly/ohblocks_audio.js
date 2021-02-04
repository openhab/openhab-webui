import Blockly from 'blockly'
import { FieldAudiosinkPicker } from './oh_audiosinkfield'
import { FieldSlider } from '@blockly/field-slider'

export default function defineOHBlocks_Audio(f7) {
  Blockly.Blocks["audioSlider"] = {
    init: function () {
      this.appendDummyInput()
        .appendField(new FieldSlider(50), "FIELDNAME")
      this.setColour(0)
      this.setInputsInline(true)
      this.setOutput(true, null)
    }
  };
  
  Blockly.Blocks['oh_audiosink'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('audiosink')
        .appendField(new FieldAudiosinkPicker('MyAudioSink', null, { f7 }), 'sinkName')
      this.setColour(0)
      this.setInputsInline(true)
      this.setTooltip('Pick an audio sink')
      this.setOutput(true, null)
    }
  }

  Blockly.JavaScript['oh_audiosink'] = function (block) {
    const itemName = block.getFieldValue('sinkName')
    var code = '\'' + itemName + '\''
    return [code, 0]
  }

  Blockly.Blocks['oh_mediaadjust'] = {
    init: function () {
      this.appendValueInput('floatValue')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown([['setMasterVolume', 'setMasterVolume'], ['increaseMasterVolume', 'increaseMasterVolume'], ['decreaseMasterVolume', 'decreaseMasterVolume']]), 'functionSelect')
        .appendField('%');
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
    var functionSelect = block.getFieldValue('functionSelect')
    var floatvalue = Blockly.JavaScript.valueToCode(block, 'floatValue', Blockly.JavaScript.ORDER_ATOMIC)
    var code
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
    init: function() {
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
    var fileName = block.getFieldValue('fileName')
    var code = audio + '.playSound("' + fileName + '");\n'
    return code
  };

  Blockly.Blocks['oh_playmedia_volume'] = {
    init: function() {
      this.appendValueInput('volume')
          .setCheck(null)
          .appendField('Play')
          .appendField(new Blockly.FieldTextInput('filename'), 'fileName')
          .appendField('at volume');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip('');
      this.setHelpUrl('');
    }
  }

  Blockly.JavaScript['oh_playmedia_volume'] = function (block) {
    const audio = Blockly.JavaScript.provideFunction_(
      'audio',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.Audio");'])
    var fileName = block.getFieldValue('fileName')
    var volume = block.getFieldValue('volume')
    var code = audio + '.playSound("' + fileName + '", new PercentType(' + volume + '));\n'
    return code
  };  

  Blockly.Blocks['oh_playmedia_sink'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Play')
        .appendField(new Blockly.FieldTextInput('<audio file>'), 'fileName')
        .appendField('on')
        .appendField(new FieldAudiosinkPicker('AudioSink', null, { f7 }), 'itemName')
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
    var fileName = block.getFieldValue('fileName')
    var sinkName = block.getFieldValue('itemName')
    // TODO : handle multiple sinks
    var code = audio + '.playSound("' + sinkName + '","' + fileName + '");\n'
    return code
  };

  Blockly.Blocks['oh_playmedia_sink_volume'] = {
    init: function() {
      this.appendValueInput('volume')
        .setCheck(null)
        .appendField('Play')
        .appendField(new Blockly.FieldTextInput('filename'), 'fileName')
        .appendField('on')
        .appendField(new FieldAudiosinkPicker('AudioSink', null, { f7 }), 'sinkName')
        .appendField('at volume')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('plays a sound from the sounds folder to the given sink')
    }
  }

  Blockly.JavaScript['oh_playmedia_sink_volume'] = function (block) {
    const audio = Blockly.JavaScript.provideFunction_(
      'audio',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.Audio");'])
    var fileName = block.getFieldValue('fileName')
    var sinkName = block.getFieldValue('sinkName')
    var volume = block.getFieldValue('volume')
    // TODO : handle multiple sinks
    var code = audio + '.playSound("' + sinkName + '","' + fileName + '",new PercentType(' + volume + '));\n'
    return code
  };  

  Blockly.Blocks['oh_playstream'] = {
    init: function() {
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
    var url = block.getFieldValue('url')
    var code = audio + '.playStream("' + url + '");\n'
    return code;
  };  

  Blockly.Blocks['oh_playstream_sink'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('Play stream')
        .appendField(new Blockly.FieldTextInput('<URL>'), 'url')
        .appendField('on')
        .appendField(new FieldAudiosinkPicker('AudioSink', null, { f7 }), 'sinkName')
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
    var url = block.getFieldValue('url')
    var sinkName = block.getFieldValue('sinkName')
    var code = audio + '.playStream("' + sinkName + '","' + url + '");\n'
    return code
  }

  Blockly.Blocks['oh_getmastervolume'] = {
    init: function() {
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
    var code = audio + '.getMasterVolume()'
    return [code, Blockly.JavaScript.ORDER_NONE]
  }
  //TODO : Handle Voice stuff
}