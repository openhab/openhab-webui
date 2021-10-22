/*
* This code has been originally provided by https://github.com/bigbasec
* @author stefan.hoehn several changes to make the provided code working
*
*/
import Blockly from 'blockly'
import { FieldItemModelPicker } from './ohitemfield'

export default function defineOHBlocks_Timers (f7) {
  /*
  * Field to enter the timer name
  * Blockly part
  */
  Blockly.Blocks['oh_timer_item'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('timer')
        .appendField(new Blockly.FieldTextInput('MyTimer'), 'timerName')
      this.setColour(0)
      this.setInputsInline(true)
      this.setTooltip('Timer name selection')
      this.setOutput(true, null)
    }
  }

  /*
  * Field to enter the timer name
  * Blockly part
  */
  Blockly.JavaScript['oh_timer_item'] = function (block) {
    const timerName = block.getFieldValue('timerName')
    let code = timerName
    return [code, 0]
  }

  /*
  * sleeps for the number of milliseconds
  * Blockly part
  */
  Blockly.Blocks['oh_sleep'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('thread sleep (ms)')
        .appendField(new Blockly.FieldNumber(1000), 'milliseconds')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('Waits for the specified milliseconds')
    }
  }

  /*
  * sleeps for the number of milliseconds
  * Code part using Thread.sleep
  */
  Blockly.JavaScript['oh_sleep'] = function (block) {
    const voiceName = Blockly.JavaScript.provideFunction_(
      'thread',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type(\'java.lang.Thread\')'])
    let milliseconds = block.getFieldValue('milliseconds')

    let code = `thread.sleep(${milliseconds})\n`
    return code
  }

  /*
  * Simple Timer creation without further control of retriggering, canceling or the like
  * Blockly part
  */
  Blockly.Blocks['oh_timer_simple'] = {
    init: function () {
      this.appendValueInput('delay')
        .setCheck('Number')
        .appendField('after')
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([['seconds', 'plusSeconds'], ['minutes', 'plusMinutes'], ['hours', 'plusHours'], ['days', 'plusDays'], ['weeks', 'plusWeeks'], ['months', 'plusMonths']]), 'delayUnits')
        .appendField('do')
      this.appendStatementInput('timer')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('Simple Timer creation without further control of retriggering, canceling or the like')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/actions.html#timers')
    }
  }

  /*
  * Simple Timer creation without further control of retriggering, canceling or the like
  * Code part
  */
  Blockly.JavaScript['oh_timer_simple'] = function (block) {
    addScriptExecution()
    addZonedDateTime()

    let delay = Blockly.JavaScript.valueToCode(block, 'delay', Blockly.JavaScript.ORDER_ATOMIC)
    let delayUnits = block.getFieldValue('delayUnits')
    let statementsTimer = Blockly.JavaScript.statementToCode(block, 'timer')
    let code = `scriptExecution.createTimer(zonedDateTime.now().${delayUnits}(${delay}), function(){\n`
    code += statementsTimer
    code += '})\n'
    return code
  }

  /*
  * Creates a named timer that starts after the defined delay provided my the number and the unit of time
  * Blockly part
  */
  Blockly.Blocks['oh_timer'] = {
    init: function () {
      this.appendValueInput('delay')
        .setCheck('Number')
        .appendField('after')
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([['seconds', 'plusSeconds'], ['minutes', 'plusMinutes'], ['hours', 'plusHours'], ['days', 'plusDays'], ['weeks', 'plusWeeks'], ['months', 'plusMonths']]), 'delayUnits')
        .appendField('do')
      this.appendValueInput('timerName')
        .setCheck(null)
        .appendField('with')
      this.setColour(0)
      this.appendStatementInput('runMe')
        .setCheck(null)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('Create a named timer')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/actions.html#timers')
    }
  }

  /*
  * Creates a named timer that starts after the defined delay provided my the number and the unit of time
  * Code part
  */
  Blockly.JavaScript['oh_timer'] = function (block) {
    addScriptExecution()
    addZonedDateTime()

    let runme = Blockly.JavaScript.statementToCode(block, 'runMe')
    let delayunits = block.getFieldValue('delayUnits')
    let delay = Blockly.JavaScript.valueToCode(block, 'delay', Blockly.JavaScript.ORDER_ATOMIC)
    let timerName = Blockly.JavaScript.valueToCode(block, 'timerName', Blockly.JavaScript.ORDER_ATOMIC).replace(/'/g, '')
    addGlobalVar(timerName)

    let code = `if (this.timers.${timerName} === null) {\n`
    code += `\tthis.timers.${timerName} = scriptExecution.createTimer(zonedDateTime.now().${delayunits}(${delay}), function(){\n`
    code += '\t' + runme
    code += '\t})\n\n'
    code += '\t} else {\n'
    code += `\t\tthis.timers.${timerName}.reschedule(zonedDateTime.now().${delayunits}(${delay}))\n`
    code += '}\n'
    return code
  }

  /*
  * Checks if the named timer is active
  * Blockly part
  */
  Blockly.Blocks['oh_timer_isactive'] = {
    init: function () {
      this.appendValueInput('timerName')
        .setCheck('String')
        .appendField('isActive')
      this.setOutput(true, null)
      this.setColour(0)
      this.setTooltip('returns true if the timer will be executed as scheduled, i.e. it has not been cancelled or completed')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/actions.html#timers')
    }
  }

  /*
  * Checks if the named timer is active
  * Code part
  */
  Blockly.JavaScript['oh_timer_isactive'] = function (block) {
    let timerName = Blockly.JavaScript.valueToCode(block, 'timerName', Blockly.JavaScript.ORDER_ATOMIC)
    addGlobalVar(timerName)

    let code = `!this.timers.${timerName} || !this.timers.${timerName}.isActive()`
    return [code, Blockly.JavaScript.ORDER_NONE]
  }

  /*
  * Checks if the named timer is running
  * Blockly part
  */
  Blockly.Blocks['oh_timer_isrunning'] = {
    init: function () {
      this.appendValueInput('timerName')
        .setCheck('String')
        .appendField('isRunning')
      this.setOutput(true, null)
      this.setColour(0)
      this.setTooltip('returns true if the code is currently executing (i.e. the timer activated the code but it is not done running)')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/actions.html#timers')
    }
  }

  /*
    * Checks if the named timer is running
    * Code part
    */
  Blockly.JavaScript['oh_timer_isrunning'] = function (block) {
    let timerName = Blockly.JavaScript.valueToCode(block, 'timerName', Blockly.JavaScript.ORDER_ATOMIC)
    addGlobalVar(timerName)
    let code = `this.timers.${timerName}.isRunning()`
    return [code, Blockly.JavaScript.ORDER_NONE]
  }

  /*
  * Checks if the named timer has terminated
  * Blockly part
  */
  Blockly.Blocks['oh_timer_hasterminated'] = {
    init: function () {
      this.appendValueInput('timerName')
        .setCheck('String')
        .appendField('hasTerminated')
      this.setOutput(true, null)
      this.setColour(0)
      this.setTooltip('returns true if the code has run and completed.')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/actions.html#timers')
    }
  }

  /*
  * Checks if the named timer has terminated
  * Code part
  */
  Blockly.JavaScript['oh_timer_hasterminated'] = function (block) {
    let timerName = Blockly.JavaScript.valueToCode(block, 'timerName', Blockly.JavaScript.ORDER_ATOMIC)
    addGlobalVar(timerName)
    let code = `this.timers.${timerName}.hasTerminated()`
    return [code, Blockly.JavaScript.ORDER_NONE]
  }

  /*
  * Allows cancelation of a named timer
  * Blockly part
  */
  Blockly.Blocks['oh_timer_cancel'] = {
    init: function () {
      this.appendValueInput('timerName')
        .setCheck('String')
        .appendField('cancel')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('Cancels a named timer')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/actions.html#timers')
    }
  }

  /*
  * Allows cancelation of a named timer
  * Code part
  */
  Blockly.JavaScript['oh_timer_cancel'] = function (block) {
    let timerName = Blockly.JavaScript.valueToCode(block, 'timerName', Blockly.JavaScript.ORDER_ATOMIC)
    addGlobalVar(timerName)
    let code = `if (this.timers.${timerName} !== null) { this.timers.${timerName}.cancel()}\n`
    return code
  }

  /*
  * Reschedules a timer with the given name
  * Code part
  */
  Blockly.Blocks['oh_timer_reschedule'] = {
    init: function () {
      this.appendValueInput('timerName')
        .setCheck('String')
        .appendField('reschedule')
      this.appendValueInput('delay')
        .setCheck(null)
        .appendField('After')
        .appendField(new Blockly.FieldDropdown([['seconds', 'plusSeconds'], ['minutes', 'plusMinutes'], ['hours', 'plusHours'], ['days', 'plusDays'], ['weeks', 'plusWeeks'], ['months', 'plusMonths']]), 'delayUnits')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('reschedules the timer to execute at the new time. If the Timer has terminated this method does nothing.')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/actions.html#timers')
    }
  }

  /*
  * Reschedules a timer with the given name
  * Blockly part
  */
  Blockly.JavaScript['oh_timer_reschedule'] = function (block) {
    addZonedDateTime()

    let delayUnits = block.getFieldValue('delayUnits')
    let delay = Blockly.JavaScript.valueToCode(block, 'delay', Blockly.JavaScript.ORDER_ATOMIC)
    let timerName = Blockly.JavaScript.valueToCode(block, 'timerName', Blockly.JavaScript.ORDER_ATOMIC)
    addGlobalVar(timerName)

    let code = `this.timers.${timerName}.reschedule(zonedDateTime.now().${delayUnits}(${delay}))\n`
    return code
  }

  function addScriptExecution () {
    Blockly.JavaScript.provideFunction_(
      'scriptExecution',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.ScriptExecution")'])
  }

  function addZonedDateTime () {
    Blockly.JavaScript.provideFunction_(
      'zonedDateTime',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("java.time.ZonedDateTime")'])
  }

  function addGlobalVar (varName) {
    let code1 = 'if(this.timers === undefined){\n\t this.timers = new Object()\n}'
    let code2 = `if(this.timers.${varName} === undefined){\n\t this.timers.${varName} = null\n}`
    Blockly.JavaScript.provideFunction_('code1', [code1])
    Blockly.JavaScript.provideFunction_(`timers${varName}`, [code2])
  }
}
