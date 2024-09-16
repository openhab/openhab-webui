/*
 * Blockly blocks to create timers & delays
 * supports jsscripting
 */

import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript.js'

export default function defineOHBlocks_Timers (f7) {
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
  javascriptGenerator.forBlock['oh_sleep'] = function (block) {
    const thread = javascriptGenerator.provideFunction_(
      'thread',
      ['var ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type(\'java.lang.Thread\')'])
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
        .appendField('do with')
        .appendField(new Blockly.FieldDropdown([['private', 'private'], ['shared', 'shared']]), 'cache')
        .appendField('timer')
      this.appendValueInput('context')
        .appendField('with context')
      this.getInput('context').setShadowDom(
        Blockly.utils.xml.textToDom(`<shadow type="oh_logic_undefined">
        </shadow>`))
      this.setColour(0)
      this.appendStatementInput('timerCode')
        .setCheck(null)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setTooltip('Create a named timer.\nUse the timer-context block to access the provided context.')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-timers-and-delays.html#after-period-of-time-do-with-timer')
    }
  }

  /*
  * Creates a named timer that starts after the defined delay provided my the number and the unit of time
  *
  * Code generation
  */
  javascriptGenerator.forBlock['oh_timer'] = function (block) {
    const delayUnits = block.getFieldValue('delayUnits')
    const delay = javascriptGenerator.valueToCode(block, 'delay', javascriptGenerator.ORDER_ATOMIC)
    const timerName = javascriptGenerator.valueToCode(block, 'timerName', javascriptGenerator.ORDER_ATOMIC)
    const timerCode = javascriptGenerator.statementToCode(block, 'timerCode')
    const context = javascriptGenerator.valueToCode(block, 'context', javascriptGenerator.ORDER_ATOMIC)
    const cacheType = getCacheType(this)

    let code = `if (cache.${cacheType}.exists(${timerName}) === false || cache.${cacheType}.get(${timerName}).hasTerminated()) {\n`
    code += `  cache.${cacheType}.put(${timerName}, actions.ScriptExecution.createTimer(${timerName}, time.ZonedDateTime.now().${delayUnits}(${delay}), function (timer_context) {\n`
    code += timerCode.replace(/^/gm, '  ')
    code += `  }, ${context}));\n`
    code += '};\n'
    return code
  }

  /*
  * Provided timer-context
  * Blockly part
  */
  Blockly.Blocks['oh_timer_context'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('timer context')
      this.setOutput(true)
      this.setColour(0)
      this.setTooltip('Returns the provided context of the timer to be used within the timer statement block.')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-timers-and-delays.html#timer-context')
    }
  }

  /*
  * Provided timer-context
  * Code part
  */
  javascriptGenerator.forBlock['oh_timer_context'] = function (block) {
    return ['timer_context', javascriptGenerator.ORDER_NONE]
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
        .setCheck(null)
        .appendField('do with')
        .appendField(new Blockly.FieldDropdown([['private', 'private'], ['shared', 'shared']]), 'cache')
        .appendField('timer')
      this.appendValueInput('context')
        .appendField('with context')
      this.getInput('context').setShadowDom(
        Blockly.utils.xml.textToDom(`<shadow type="oh_logic_undefined">
        </shadow>`))
      this.appendStatementInput('timerCode')
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([['reschedule', 'reschedule'], ['cancel', 'cancel'], ['do nothing', 'nothing']]), 'retrigger')
        .appendField('if retriggered')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('Simple Timer creation with control over rule retriggering action.\nUse the timer-context block to access the provided context.')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-timers-and-delays.html#after-period-of-time-do-with-timer-with-options-on-retriggering-rule')
    }
  }

  /*
  * Simple Timer creation with cancel & reschedule on rule retriggering
  *
  * Code generation
  */
  javascriptGenerator.forBlock['oh_timer_ext'] = function (block) {
    const delayUnits = block.getFieldValue('delayUnits')
    const delay = javascriptGenerator.valueToCode(block, 'delay', javascriptGenerator.ORDER_ATOMIC)
    const timerName = javascriptGenerator.valueToCode(block, 'timerName', javascriptGenerator.ORDER_ATOMIC)
    const timerCode = javascriptGenerator.statementToCode(block, 'timerCode')
    const retrigger = block.getFieldValue('retrigger')
    const context = javascriptGenerator.valueToCode(block, 'context', javascriptGenerator.ORDER_ATOMIC)
    const cacheType = getCacheType(this)

    let code = `if (cache.${cacheType}.exists(${timerName}) === false || cache.${cacheType}.get(${timerName}).hasTerminated()) {\n`
    code += `  cache.${cacheType}.put(${timerName}, actions.ScriptExecution.createTimer(${timerName}, time.ZonedDateTime.now().${delayUnits}(${delay}), function (timer_context) {\n`
    code += timerCode.replace(/^/gm, '  ')
    code += `  }, ${context}));\n`
    code += '} else {\n'
    switch (retrigger) {
      case 'reschedule':
        code += `  cache.${cacheType}.get(${timerName}).reschedule(time.ZonedDateTime.now().${delayUnits}(${delay}));\n`
        break

      case 'cancel':
        code += `  cache.${cacheType}.remove(${timerName}).cancel();\n`
        break

      case 'nothing':
        code += '  // do nothing\n'
        break
    }
    code += '};\n'
    return code
  }

  /*
  * Checks if the named timer is active
  *
  * Block type definition
  */
  Blockly.Blocks['oh_timer_isActive'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([['private', 'private'], ['shared', 'shared']]), 'cache')
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
  javascriptGenerator.forBlock['oh_timer_isActive'] = function (block) {
    const timerName = javascriptGenerator.valueToCode(block, 'timerName', javascriptGenerator.ORDER_ATOMIC)
    const cacheType = getCacheType(this)
    return [`cache.${cacheType}.exists(${timerName}) && cache.${cacheType}.get(${timerName}).isActive()`, javascriptGenerator.ORDER_NONE]
  }

  /*
  * Checks if the named timer is running
  *
  * Block type definition
  */
  Blockly.Blocks['oh_timer_isRunning'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([['private', 'private'], ['shared', 'shared']]), 'cache')
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
  javascriptGenerator.forBlock['oh_timer_isRunning'] = function (block) {
    // Keep the isRunning block although it doesn't make sense because in GraalJS access to the context is synchronized and therefore it is not possible to run some code the same time a timer is running
    const timerName = javascriptGenerator.valueToCode(block, 'timerName', javascriptGenerator.ORDER_ATOMIC)
    const cacheType = getCacheType(this)
    return [`cache.${cacheType}.exists(${timerName}) && cache.${cacheType}.get(${timerName}).isRunning()`, javascriptGenerator.ORDER_NONE]
  }

  /*
  * Checks if the named timer has terminated
  *
  * Block type definition
  */
  Blockly.Blocks['oh_timer_hasTerminated'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([['private', 'private'], ['shared', 'shared']]), 'cache')
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
  javascriptGenerator.forBlock['oh_timer_hasTerminated'] = function (block) {
    const timerName = javascriptGenerator.valueToCode(block, 'timerName', javascriptGenerator.ORDER_ATOMIC)
    const cacheType = getCacheType(this)
    return [`cache.${cacheType}.exists(${timerName}) && cache.${cacheType}.get(${timerName}).hasTerminated()`, javascriptGenerator.ORDER_NONE]
  }

  /*
  * Cancels a named timer
  *
  * Block type definition
  */
  Blockly.Blocks['oh_timer_cancel'] = {
    init: function () {
      this.appendValueInput('timerName')
        .setCheck('String')
        .appendField('cancel')
        .appendField(new Blockly.FieldDropdown([['private', 'private'], ['shared', 'shared']]), 'cache')
        .appendField('timer')
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip('Cancels a named timer')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-timers-and-delays.html#cancel-timer')
    }
  }

  /*
  * Cancels a named timer
  *
  * Code generation
  */
  javascriptGenerator.forBlock['oh_timer_cancel'] = function (block) {
    const timerName = javascriptGenerator.valueToCode(block, 'timerName', javascriptGenerator.ORDER_ATOMIC)
    const cacheType = getCacheType(this)
    return `if (cache.${cacheType}.exists(${timerName})) { cache.${cacheType}.remove(${timerName}).cancel(); };\n`
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
        .appendField(new Blockly.FieldDropdown([['private', 'private'], ['shared', 'shared']]), 'cache')
        .appendField('timer')

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
  javascriptGenerator.forBlock['oh_timer_reschedule'] = function (block) {
    const delayUnits = block.getFieldValue('delayUnits')
    const delay = javascriptGenerator.valueToCode(block, 'delay', javascriptGenerator.ORDER_ATOMIC)
    const timerName = javascriptGenerator.valueToCode(block, 'timerName', javascriptGenerator.ORDER_ATOMIC)
    const cacheType = getCacheType(this)
    return `if (cache.${cacheType}.exists(${timerName})) { cache.${cacheType}.get(${timerName}).reschedule(time.ZonedDateTime.now().${delayUnits}(${delay})); };\n`
  }

  function getCacheType (block) {
    return (block.getField('cache')) ? block.getFieldValue('cache') : 'private'
  }
}
