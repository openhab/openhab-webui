/*
* @author stefan.hoehn several changes to make the provided code working
*
*/
import Blockly from 'blockly'
import { FieldItemModelPicker } from './ohitemfield'

export default function defineOHBlocks_Timers (f7) {
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

    let code = `thread.sleep(${milliseconds});\n`
    return code
  }

  /*
  * Simple Timer creation with cancel & reschedule on rule retriggering  * Blockly part
  */
  Blockly.Blocks['oh_timer_simple'] = {
    init: function () {
      this.appendValueInput('delay')
        .setCheck('Number')
        .appendField('after')
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([['seconds', 'plusSeconds'], ['minutes', 'plusMinutes'], ['hours', 'plusHours'], ['days', 'plusDays'], ['weeks', 'plusWeeks'], ['months', 'plusMonths']]), 'delayUnits')
        .appendField('do')
      this.appendValueInput('timerName')
        .setCheck('String')
        .appendField('with timer')
      this.appendStatementInput('runMe')
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([['reschedule', 'reschedule'], ['cancel', 'cancel'], ['nothing', 'nothing']]), 'retrigger')
        .appendField('on retrigger')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('Simple Timer creation with control over rule retriggering action')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/actions.html#timers')
    }
  }

  /*
  * Simple Timer creation with cancel & reschedule on rule retriggering
  * Code part
  */
  Blockly.JavaScript['oh_timer_simple'] = function (block) {
    addScriptExecution()
    addZonedDateTime()

    let delay = Blockly.JavaScript.valueToCode(block, 'delay', Blockly.JavaScript.ORDER_ATOMIC)
    let delayUnits = block.getFieldValue('delayUnits')
    let runMe = Blockly.JavaScript.statementToCode(block, 'runMe')
    let timerName = Blockly.JavaScript.valueToCode(block, 'timerName', Blockly.JavaScript.ORDER_ATOMIC)
    let retrigger = block.getFieldValue('retrigger')
    addGlobalTimer()

    let code = `if (typeof this.timers[${timerName}] === 'undefined') {\n`
    code += `\tthis.timers[${timerName}] = scriptExecution.createTimer(zonedDateTime.now().${delayUnits}(${delay}), function(){\n`
    code += '\t' + runMe
    code += `\t  this.timers[${timerName}] = undefined;\n`
    code += '\t})\n\n'
    code += '}else {\n'
    switch (retrigger) {
      case 'reschedule':
        code += `\tthis.timers[${timerName}].reschedule(zonedDateTime.now().${delayUnits}(${delay}));\n`
        break

      case 'cancel':
        code += `\t\tthis.timers[${timerName}].cancel();\n`
        code += `\t\tthis.timers[${timerName}] = undefined;\n`
        break

      case 'nothing':
        break
    }
    code += '}\n'
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
        .appendField('with timer')
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
    let timerName = Blockly.JavaScript.valueToCode(block, 'timerName', Blockly.JavaScript.ORDER_ATOMIC)
    addGlobalTimer()

    let code = `if (typeof this.timers[${timerName}] === 'undefined') {\n`
    code += `\tthis.timers[${timerName}] = scriptExecution.createTimer(zonedDateTime.now().${delayunits}(${delay}), function(){\n`
    code += '\t' + runme
    code += `\t  this.timers[${timerName}] = undefined;\n`
    code += '\t})\n\n'
    code += '}\n'
    return code
  }

  /*
  * Checks if the named timer is active
  * Blockly part
  */
  Blockly.Blocks['oh_timer_isactive'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('timer')
      this.appendValueInput('timerName')
        .setCheck('String')
      this.appendDummyInput()
        .appendField('is active')
      this.setOutput(true, 'Boolean')
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
    addGlobalTimer()

    let code = `typeof this.timers[${timerName}] !== 'undefined' && this.timers[${timerName}].isActive()`
    return [code, Blockly.JavaScript.ORDER_NONE]
  }

  /*
  * Checks if the named timer is running
  * Blockly part
  */
  Blockly.Blocks['oh_timer_isrunning'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('timer')
      this.appendValueInput('timerName')
        .setCheck('String')
      this.appendDummyInput()
        .appendField('is running')
      this.setOutput(true, 'Boolean')
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
    addGlobalTimer()
    let code = `typeof this.timers[${timerName}] !== 'undefined' && this.timers[${timerName}].isRunning()`
    return [code, Blockly.JavaScript.ORDER_NONE]
  }

  /*
  * Checks if the named timer has terminated
  * Blockly part
  */
  Blockly.Blocks['oh_timer_hasterminated'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('timer')
      this.appendValueInput('timerName')
        .setCheck('String')
      this.appendDummyInput()
        .appendField('has terminated')
      this.setOutput(true, 'Boolean')
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
    addGlobalTimer()
    let code = `typeof this.timers[${timerName}] !== 'undefined' && this.timers[${timerName}].hasTerminated()`
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
        .appendField('cancel timer')
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
    addGlobalTimer()
    let code = `if (typeof this.timers[${timerName}] !== 'undefined') {\n`
    code += `\tthis.timers[${timerName}].cancel();\n`
    code += `\tthis.timers[${timerName}] = undefined;\n`
    code += '}\n'

    return code
  }

  /*
  * Reschedules a timer with the given name
  * Code part
  */
  Blockly.Blocks['oh_timer_reschedule'] = {
    init: function () {
      this.appendValueInput('delay')
        .appendField('after')
        .setCheck('Number')
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([['seconds', 'plusSeconds'], ['minutes', 'plusMinutes'], ['hours', 'plusHours'], ['days', 'plusDays'], ['weeks', 'plusWeeks'], ['months', 'plusMonths']]), 'delayUnits')
      this.appendValueInput('timerName')
        .setCheck('String')
        .appendField('reschedule')
      this.setInputsInline(true)
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
    addGlobalTimer()

    let code = `if (typeof this.timers[${timerName}] !== 'undefined') { this.timers[${timerName}].reschedule(zonedDateTime.now().${delayUnits}(${delay})); }\n`
    return code
  }

  function addScriptExecution () {
    Blockly.JavaScript.provideFunction_(
      'scriptExecution',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("org.openhab.core.model.script.actions.ScriptExecution");'])
  }

  function addZonedDateTime () {
    Blockly.JavaScript.provideFunction_(
      'zonedDateTime',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("java.time.ZonedDateTime");'])
  }

  function addGlobalTimer () {
    let globaltimervars = 'if (typeof this.timers === \'undefined\') {\n\t this.timers =[];\n}'
    Blockly.JavaScript.provideFunction_('globaltimervars', [globaltimervars])
  }
}
