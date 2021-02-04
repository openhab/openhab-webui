import Blockly from 'blockly'
import { FieldItemModelPicker } from './ohitemfield'

export default function defineOHBlocks_Timers(f7) {
  Blockly.Blocks['oh_timer_item'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Timer Name')
        .appendField(new Blockly.FieldTextInput('MyTimer'), 'timerName')
      this.setColour(0)
      this.setInputsInline(true)
      this.setTooltip('Timer name selection')
      this.setOutput(true, null)
    }
  }

  Blockly.JavaScript['oh_timer_item'] = function (block) {
    const timerName = block.getFieldValue('timerName')
    var code = timerName;
    return [code, 0]
  } 

  Blockly.Blocks['oh_sleep'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Thread Sleep')
        .appendField(new Blockly.FieldTextInput('1000'), 'milliseconds')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_sleep'] = function (block) {
    var milliseconds = block.getFieldValue('milliseconds')
    // TODO: Assemble JavaScript into code variable.
    var code = 'java.lang.Thread.sleep(' + milliseconds + ');\n'
    return code
  }

  Blockly.Blocks['oh_simpleTimer'] = {
    init: function () {
      this.appendStatementInput('timer')
        .setCheck(null)
        .appendField('After')
        .appendField(new Blockly.FieldNumber(10), 'delay')
        .appendField(new Blockly.FieldDropdown([['seconds', 'seconds'], ['minutes', 'minutes'], ['hours', 'hours']]), 'time_unit')
        .appendField('do')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_simpleTimer'] = function (block) {
    const scriptExecution = Blockly.JavaScript.provideFunction_(
      'scriptExecution',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.ScriptExecution");'])
    const zonedDateTime = Blockly.JavaScript.provideFunction_(
      'zonedDateTime',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("java.time.ZonedDateTime");'])
    var numberDelay = block.getFieldValue('delay')
    var dropdownTimeUnit = block.getFieldValue('time_unit')
    var statementsTimer = Blockly.JavaScript.statementToCode(block, 'timer')
    var unitsFunction = ''
    switch (dropdownTimeUnit) {
      case 'seconds' :
        unitsFunction = 'plusSeconds'
        break
      case 'minutes' :
        unitsFunction = 'plusMinutes'
        break
      case 'hours' :
        unitsFunction = 'plusHours'
        break
    }
    var code = 'var delayedTimer;\n'
    code += 'this.delayedTimer = ' + scriptExecution + '.createTimer(' + zonedDateTime + '.now().' + unitsFunction + '(' + numberDelay + '), function(){\n'
    code += statementsTimer
    code += '});\n'
    return code
  }

  Blockly.Blocks['oh_persistTimer'] = {
    init: function() {
      this.appendStatementInput('runMe')
        .setCheck(null)
        .appendField('Timer')
        .appendField(new Blockly.FieldDropdown([['simple','simple'], ['persistant','persistant']]), 'timerType')
      this.appendDummyInput()
        .appendField('After')
        .appendField(new Blockly.FieldTextInput('60'), 'delay')
        .appendField(new Blockly.FieldDropdown([['seconds','seconds'], ['minutes','minutes'], ['hours','hours']]), 'delayUnits')
      this.setInputsInline(false)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(230)
      this.setTooltip('')
      this.setHelpUrl('')
    }
  };

  Blockly.JavaScript['oh_persistTimer'] = function(block) {
    const scriptExecution = Blockly.JavaScript.provideFunction_(
      'scriptExecution',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.ScriptExecution");'])
    const zonedDateTime = Blockly.JavaScript.provideFunction_(
      'zonedDateTime',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("java.time.ZonedDateTime");'])
    var timertype = block.getFieldValue('timerType')
    var runme = Blockly.JavaScript.statementToCode(block, 'runMe')
    var numberDelay = block.getFieldValue('delay')
    var dropdownTimeUnit = block.getFieldValue('delayUnits')
    var unitsFunction = ''
    switch (dropdownTimeUnit) {
      case 'seconds' :
        unitsFunction = 'plusSeconds'
        break
      case 'minutes' :
        unitsFunction = 'plusMinutes'
        break
      case 'hours' :
        unitsFunction = 'plusHours'
        break
    }
    var code='';
    if (timertype == 'simple') {
      code = 'var delayedTimer;\n'
      code += 'this.delayedTimer = ' + scriptExecution + '.createTimer(' + zonedDateTime + '.now().' + unitsFunction + '(' + numberDelay + '), function(){\n'
      code += runme
      code += '});\n'
    } else {
      code = 'if (this.delayedTimer == null) {\n'
      code += 'var delayedTimer;\n'
      code += 'this.delayedTimer = scriptExecution.createTimer(' + zonedDateTime + '.now().' + unitsFunction + '(' + numberDelay + '), function(){\n'
      code += runme;
      code += '});\n'
      code += '} else {\n'
      code += 'this.delayedTimer.reschedule(' + zonedDateTime + '.now().' + unitsFunction + '(' + numberDelay + '));\n'
      code += '}\n'
    }
    return code
  }

  Blockly.Blocks['oh_namedTimer'] = {
    init: function() {
      this.appendStatementInput('runMe')
          .setCheck(null)
          .appendField('Run This');
      this.appendValueInput('delay')
          .setCheck(null)
          .appendField('After')
          .appendField(new Blockly.FieldDropdown([['seconds','plusSeconds'], ['minutes','plusMinutes'], ['hours','plusHours'], ['days','plusDays'], ['weeks','plusWeeks'], ['months','plusMonths']]), 'delayUnits');
      this.appendValueInput('timerName')
          .setCheck(null)
          .appendField('with Timer named');
      this.setColour(230);
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('Create a named timer');
      this.setHelpUrl('');
    }
  };

  Blockly.JavaScript['oh_namedTimer'] = function (block) {
    const scriptExecution = Blockly.JavaScript.provideFunction_(
      'scriptExecution',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.ScriptExecution");'])
    const zonedDateTime = Blockly.JavaScript.provideFunction_(
      'zonedDateTime',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("java.time.ZonedDateTime");'])
    var runme = Blockly.JavaScript.statementToCode(block, 'runMe');
    var delayunits = block.getFieldValue('delayUnits');
    var delay = Blockly.JavaScript.valueToCode(block, 'delay', Blockly.JavaScript.ORDER_ATOMIC);
    var timerName = Blockly.JavaScript.valueToCode(block, 'timerName', Blockly.JavaScript.ORDER_ATOMIC).replace(/'/g,'');
    // TODO: Assemble JavaScript into code variable.
    var code = 'if (this.' + timerName + ' == null) {\n'
    code += 'var ' + timerName + ';\n'
    code += 'this.' + timerName + ' = scriptExecution.createTimer(' + zonedDateTime + '.now().' + delayunits + '(' + delay + '), function(){\n'
    code += runme;
    code += '});\n'
    code += '} else {\n'
    code += 'this.' + timerName + '.reschedule(' + zonedDateTime + '.now().' + delayunits + '(' + delay + '));\n'
    code += '}\n'
    return code;
  };

  Blockly.Blocks['oh_timer_isactive'] = {
    init: function() {
      this.appendValueInput('timerName')
        .setCheck('String')
        .appendField('isActive')
      this.setOutput(true, null)
      this.setColour(230)
      this.setTooltip('returns true if the timer will be executed as scheduled, i.e. it has not been cancelled or completed')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_timer_isactive'] = function(block) {
    const scriptExecution = Blockly.JavaScript.provideFunction_(
      'scriptExecution',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.ScriptExecution");'])
    var timerName = Blockly.JavaScript.valueToCode(block, 'timerName', Blockly.JavaScript.ORDER_ATOMIC);
    var code = 'this.' + timerName + '.isActive()'
    return [code, Blockly.JavaScript.ORDER_NONE]
  }

  Blockly.Blocks['oh_timer_isrunning'] = {
    init: function() {
      this.appendValueInput('timerName')
        .setCheck('String')
        .appendField('isRunning')
      this.setOutput(true, null)
      this.setColour(230)
      this.setTooltip('returns true if the code is currently executing (i.e. the timer activated the code but it is not done running)')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_timer_isrunning'] = function(block) {
    const scriptExecution = Blockly.JavaScript.provideFunction_(
      'scriptExecution',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.ScriptExecution");'])
    var timerName = Blockly.JavaScript.valueToCode(block, 'timerName', Blockly.JavaScript.ORDER_ATOMIC);
    var code = 'this.' + timerName + '.isRunning()'
    return [code, Blockly.JavaScript.ORDER_NONE]
  }

  Blockly.Blocks['oh_timer_hasterminated'] = {
    init: function() {
      this.appendValueInput('timerName')
        .setCheck('String')
        .appendField('hasTerminated')
      this.setOutput(true, null)
      this.setColour(230)
      this.setTooltip('returns true if the code is currently executing (i.e. the timer activated the code but it is not done running)')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_timer_hasterminated'] = function(block) {
    const scriptExecution = Blockly.JavaScript.provideFunction_(
      'scriptExecution',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.ScriptExecution");'])
    var timerName = Blockly.JavaScript.valueToCode(block, 'timerName', Blockly.JavaScript.ORDER_ATOMIC);
    var code = 'this.' + timerName + '.hasTerminated()'
    return [code, Blockly.JavaScript.ORDER_NONE]
  }

  Blockly.Blocks['oh_timer_cancel'] = {
    init: function() {
      this.appendValueInput('timerName')
        .setCheck('String')
        .appendField('cancel')
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230)
      this.setTooltip('returns true if the code is currently executing (i.e. the timer activated the code but it is not done running)')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_timer_cancel'] = function(block) {
    const scriptExecution = Blockly.JavaScript.provideFunction_(
      'scriptExecution',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.ScriptExecution");'])
    var timerName = Blockly.JavaScript.valueToCode(block, 'timerName', Blockly.JavaScript.ORDER_ATOMIC);
    var code = 'this.' + timerName + '.cancel()'
    return [code, Blockly.JavaScript.ORDER_NONE]
  }

  Blockly.Blocks['oh_timer_reschedule'] = {
    init: function() {
      this.appendValueInput('timerName')
        .setCheck('String')
        .appendField('reschedule')
      this.appendValueInput('delay')
        .setCheck(null)
        .appendField('After')
        .appendField(new Blockly.FieldDropdown([['seconds','plusSeconds'], ['minutes','plusMinutes'], ['hours','plusHours'], ['days','plusDays'], ['weeks','plusWeeks'], ['months','plusMonths']]), 'delayUnits');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230)
      this.setTooltip('reschedules the timer to execute at the new time. If the Timer has terminated this method does nothing.')
      this.setHelpUrl('')
    }
  }

  Blockly.JavaScript['oh_timer_reschedule'] = function(block) {
    const scriptExecution = Blockly.JavaScript.provideFunction_(
      'scriptExecution',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.ScriptExecution");'])
    const zonedDateTime = Blockly.JavaScript.provideFunction_(
        'zonedDateTime',
        ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("java.time.ZonedDateTime");'])
    var delayunits = block.getFieldValue('delayUnits');
    var delay = Blockly.JavaScript.valueToCode(block, 'delay', Blockly.JavaScript.ORDER_ATOMIC);
    var timerName = Blockly.JavaScript.valueToCode(block, 'timerName', Blockly.JavaScript.ORDER_ATOMIC);
    var code = 'this.' + timerName + '.reschedule(' + zonedDateTime + '.now().' + delayunits + '(' + delay + '))'
    return [code, Blockly.JavaScript.ORDER_NONE]
  }  
}
