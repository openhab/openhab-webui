/*
 * Blockly blocks to create timers & delays
 * supports jsscripting
 */

import Blockly from 'blockly'

export default function defineOHBlocks_Timers (f7, isGraalJs) {
  /*
  * Sleeps for the number of milliseconds
  *
  * Block type definition
  */
  Blockly.Blocks['oh_sleep'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('wait for')
        .appendField(new Blockly.FieldNumber(1000), 'milliseconds')
        .appendField('ms')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-timers-and-delays.html#wait-for')
      this.setTooltip('Waits for the specified milliseconds')
    }
  }

  /*
  * Sleeps for the number of milliseconds
  *
  * Code generation
  */
  Blockly.JavaScript['oh_sleep'] = function (block) {
    const thread = Blockly.JavaScript.provideFunction_(
      'thread',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type(\'java.lang.Thread\')'])
    let milliseconds = block.getFieldValue('milliseconds')

    let code = `${thread}.sleep(${milliseconds});\n`
    return code
  }

  /*
  * Creates a named timer that starts after the defined delay provided my the number and the unit of time
  *
  * Block type definition
  */
  Blockly.Blocks['oh_timer'] = {
    init: function () {
      this.appendValueInput('delay')
        .setCheck('Number')
        .appendField('after')
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([['seconds', 'plusSeconds'], ['minutes', 'plusMinutes'], ['hours', 'plusHours'], ['days', 'plusDays'], ['weeks', 'plusWeeks'], ['months', 'plusMonths']]), 'delayUnits')
      this.appendValueInput('timerName')
        .setCheck(null)
        .appendField('do with timer')
      this.setColour(0)
      this.appendStatementInput('timerCode')
        .setCheck(null)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('Create a named timer')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-timers-and-delays.html#after-period-of-time-do-with-timer')
    }
  }

  /*
  * Creates a named timer that starts after the defined delay provided my the number and the unit of time
  *
  * Code generation
  */
  Blockly.JavaScript['oh_timer'] = function (block) {
    const delayUnits = block.getFieldValue('delayUnits')
    const delay = Blockly.JavaScript.valueToCode(block, 'delay', Blockly.JavaScript.ORDER_ATOMIC)
    const timerName = Blockly.JavaScript.valueToCode(block, 'timerName', Blockly.JavaScript.ORDER_ATOMIC)
    const timerCode = Blockly.JavaScript.statementToCode(block, 'timerCode')

    if (isGraalJs) {
      let code = `if (cache.private.exists(${timerName}) === false || cache.private.get(${timerName}).hasTerminated()) {\n`
      code += `  cache.private.put(${timerName}, actions.ScriptExecution.createTimer(${timerName}, time.ZonedDateTime.now().${delayUnits}(${delay}), function () {\n`
      code += timerCode.replace(/^/gm, '  ')
      code += `  cache.private.remove(${timerName});\n`
      code += '  }));\n'
      code += '};\n'
      return code
    } else {
      addGlobalTimer()
      const scriptExecution = addScriptExecution()
      const zdt = addZonedDateTime()
      let code = `if (typeof this.timers[${timerName}] === 'undefined' || this.timers[${timerName}].hasTerminated()) {\n`
      code += `  this.timers[${timerName}] = ${scriptExecution}.createTimer(${zdt}.now().${delayUnits}(${delay}), function () {\n`
      code += timerCode.replace(/^/gm, '  ')
      code += '  })\n'
      code += '}\n'
      return code
    }
  }

  /*
  * Simple Timer creation with cancel & reschedule on rule retriggering
  *
  * Block type definition
  */
  Blockly.Blocks['oh_timer_ext'] = {
    init: function () {
      this.appendValueInput('delay')
        .setCheck('Number')
        .appendField('after')
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([['seconds', 'plusSeconds'], ['minutes', 'plusMinutes'], ['hours', 'plusHours'], ['days', 'plusDays'], ['weeks', 'plusWeeks'], ['months', 'plusMonths']]), 'delayUnits')
      this.appendValueInput('timerName')
        .setCheck('String')
        .appendField('do with timer')
      this.appendStatementInput('timerCode')
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([['reschedule', 'reschedule'], ['cancel', 'cancel'], ['do nothing', 'nothing']]), 'retrigger')
        .appendField('if retriggered')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('Simple Timer creation with control over rule retriggering action')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-timers-and-delays.html#after-period-of-time-do-with-timer-with-options-on-retriggering-rule')
    }
  }

  /*
  * Simple Timer creation with cancel & reschedule on rule retriggering
  *
  * Code generation
  */
  Blockly.JavaScript['oh_timer_ext'] = function (block) {
    const delayUnits = block.getFieldValue('delayUnits')
    const delay = Blockly.JavaScript.valueToCode(block, 'delay', Blockly.JavaScript.ORDER_ATOMIC)
    const timerName = Blockly.JavaScript.valueToCode(block, 'timerName', Blockly.JavaScript.ORDER_ATOMIC)
    const timerCode = Blockly.JavaScript.statementToCode(block, 'timerCode')
    const retrigger = block.getFieldValue('retrigger')

    if (isGraalJs) {
      let code = `if (cache.private.exists(${timerName}) === false || cache.private.get(${timerName}).hasTerminated()) {\n`
      code += `  cache.private.put(${timerName}, actions.ScriptExecution.createTimer(${timerName}, time.ZonedDateTime.now().${delayUnits}(${delay}), function () {\n`
      code += timerCode.replace(/^/gm, '  ')
      code += `  cache.private.remove(${timerName});\n`
      code += '  }));\n'
      code += '} else {\n'
      switch (retrigger) {
        case 'reschedule':
          code += `  cache.private.get(${timerName}).reschedule(time.ZonedDateTime.now().${delayUnits}(${delay}));\n`
          break

        case 'cancel':
          code += `  cache.private.remove(${timerName}).cancel();\n`
          break

        case 'nothing':
          code += '  // do nothing\n'
          break
      }
      code += '};\n'
      return code
    } else {
      addGlobalTimer()
      const scriptExecution = addScriptExecution()
      const zdt = addZonedDateTime()
      let code = `if (typeof this.timers[${timerName}] === 'undefined' || this.timers[${timerName}].hasTerminated()) {\n`
      code += `  this.timers[${timerName}] = ${scriptExecution}.createTimer(${zdt}.now().${delayUnits}(${delay}), function () {\n`
      code += timerCode.replace(/^/gm, '  ')
      code += '  })\n'
      code += '} else {\n'
      switch (retrigger) {
        case 'reschedule':
          code += `  this.timers[${timerName}].reschedule(${zdt}.now().${delayUnits}(${delay}));\n`
          break

        case 'cancel':
          code += `  this.timers[${timerName}].cancel();\n`
          code += `  this.timers[${timerName}] = undefined;\n`
          break

        case 'nothing':
          code += '  // do nothing\n'
          break
      }
      code += '}\n'
      return code
    }
  }

  /*
  * Checks if the named timer is active
  *
  * Block type definition
  */
  Blockly.Blocks['oh_timer_isActive'] = {
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
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-timers-and-delays.html#timer-is-active')
    }
  }

  /*
  * Checks if the named timer is active
  *
  * Code generation
  */
  Blockly.JavaScript['oh_timer_isActive'] = function (block) {
    const timerName = Blockly.JavaScript.valueToCode(block, 'timerName', Blockly.JavaScript.ORDER_ATOMIC)
    if (isGraalJs) {
      return [`cache.private.exists(${timerName}) && cache.private.get(${timerName}).isActive()`, Blockly.JavaScript.ORDER_NONE]
    } else {
      addGlobalTimer()

      let code = `typeof this.timers[${timerName}] !== 'undefined' && this.timers[${timerName}].isActive()`
      return [code, Blockly.JavaScript.ORDER_NONE]
    }
  }

  /*
  * Checks if the named timer is running
  *
  * Block type definition
  */
  Blockly.Blocks['oh_timer_isRunning'] = {
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
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-timers-and-delays.html#timer-is-running')
    }
  }

  /*
  * Checks if the named timer is running
  *
  * Code generation
  */
  Blockly.JavaScript['oh_timer_isRunning'] = function (block) {
    const timerName = Blockly.JavaScript.valueToCode(block, 'timerName', Blockly.JavaScript.ORDER_ATOMIC)
    if (isGraalJs) {
      // Keep the isRunning block although it doesn't make sense because in GraalJS access to the context is synchronized and therefore it is not possible to run some code the same time a timer is running
      return [`cache.private.exists(${timerName}) && cache.private.get(${timerName}).isRunning()`, Blockly.JavaScript.ORDER_NONE]
    } else {
      addGlobalTimer()

      let code = `typeof this.timers[${timerName}] !== 'undefined' && this.timers[${timerName}].isRunning()`
      return [code, Blockly.JavaScript.ORDER_NONE]
    }
  }

  /*
  * Checks if the named timer has terminated
  *
  * Block type definition
  */
  Blockly.Blocks['oh_timer_hasTerminated'] = {
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
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-timers-and-delays.html#timer-has-terminated')
    }
  }

  /*
  * Checks if the named timer has terminated
  *
  * Code generation
  */
  Blockly.JavaScript['oh_timer_hasTerminated'] = function (block) {
    const timerName = Blockly.JavaScript.valueToCode(block, 'timerName', Blockly.JavaScript.ORDER_ATOMIC)
    if (isGraalJs) {
      return [`cache.private.exists(${timerName}) && cache.private.get(${timerName}).hasTerminated()`, Blockly.JavaScript.ORDER_NONE]
    } else {
      addGlobalTimer()

      let code = `typeof this.timers[${timerName}] !== 'undefined' && this.timers[${timerName}].hasTerminated()`
      return [code, Blockly.JavaScript.ORDER_NONE]
    }
  }

  /*
  * Allows cancelation of a named timer
  *
  * Block type definition
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
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-timers-and-delays.html#cancel-timer')
    }
  }

  /*
  * Allows cancelation of a named timer
  *
  * Code generation
  */
  Blockly.JavaScript['oh_timer_cancel'] = function (block) {
    const timerName = Blockly.JavaScript.valueToCode(block, 'timerName', Blockly.JavaScript.ORDER_ATOMIC)
    if (isGraalJs) {
      return `if (cache.private.exists(${timerName})) { cache.private.remove(${timerName}).cancel(); };\n`
    } else {
      addGlobalTimer()
      let code = `if (typeof this.timers[${timerName}] !== 'undefined') {\n`
      code += `  this.timers[${timerName}].cancel();\n`
      code += `  this.timers[${timerName}] = undefined;\n`
      code += '}\n'
      return code
    }
  }

  /*
  * Reschedules a timer with the given name
  *
  * Block type definition
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
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-timers-and-delays.html#reschedule-timer')
    }
  }

  /*
  * Reschedules a timer with the given name
  *
  * Code generation
  */
  Blockly.JavaScript['oh_timer_reschedule'] = function (block) {
    const delayUnits = block.getFieldValue('delayUnits')
    const delay = Blockly.JavaScript.valueToCode(block, 'delay', Blockly.JavaScript.ORDER_ATOMIC)
    const timerName = Blockly.JavaScript.valueToCode(block, 'timerName', Blockly.JavaScript.ORDER_ATOMIC)
    if (isGraalJs) {
      return `if (cache.private.exists(${timerName})) { cache.private.get(${timerName}).reschedule(time.ZonedDateTime.now().${delayUnits}(${delay})); };\n`
    } else {
      const zdt = addZonedDateTime()
      addGlobalTimer()

      let code = `if (typeof this.timers[${timerName}] !== 'undefined') { this.timers[${timerName}].reschedule(${zdt}.now().${delayUnits}(${delay})); }\n`
      return code
    }
  }

  function addScriptExecution () {
    return Blockly.JavaScript.provideFunction_(
      'scriptExecution',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type(\'org.openhab.core.model.script.actions.ScriptExecution\');'])
  }

  function addZonedDateTime () {
    return Blockly.JavaScript.provideFunction_(
      'zdt',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type(\'java.time.ZonedDateTime\');'])
  }

  function addGlobalTimer () {
    let globaltimervars = 'if (typeof this.timers === \'undefined\') {\n  this.timers = [];\n}'
    Blockly.JavaScript.provideFunction_('globaltimervars', [globaltimervars])
  }
}
