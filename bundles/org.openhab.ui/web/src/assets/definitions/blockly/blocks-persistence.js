/*
* These blocks support the persistence module which stores the data in the database and allows to retrieve historical and statistical data
*/
import Blockly from 'blockly'

export default function defineOHBlocks_Persistence (f7) {
  /*
  * Checks if an item has changed or has been updated since some given date
  * Blockly part
  */
  Blockly.Blocks['oh_persist_changed'] = {
    init: function () {
      this.appendValueInput('itemName')
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([['has changed since', 'changedSince'], ['has been updated since', 'updatedSince']]), 'methodName')
      this.appendValueInput('dayInfo')
        .setCheck(['EphemerisDay', 'EphemerisDate'])
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour(0)

      let thisBlock = this
      this.setTooltip(function () {
        let methodName = thisBlock.getFieldValue('methodName')
        let TIP = {
          'changedSince': 'Checks if the State of the Item has (ever) changed since a certain point in time',
          'updatedSince': 'Checks if the State of the Item has been updated since a certain point in time'
        }
        return TIP[methodName]
      })

      this.setHelpUrl('https://www.openhab.org/docs/configuration/persistence.html')
    }
  }

  /*
  * Checks if an item has changed or has been updated since some given date
  * Code part
  */
  Blockly.JavaScript['oh_persist_changed'] = function (block) {
    addPersistence()
    addDateSupport()
    const itemName = Blockly.JavaScript.valueToCode(block, 'itemName', Blockly.JavaScript.ORDER_ATOMIC)
    const methodName = block.getFieldValue('methodName')
    const dayInfo = Blockly.JavaScript.valueToCode(block, 'dayInfo', Blockly.JavaScript.ORDER_ATOMIC)
    let code = `persistence.${methodName}(itemRegistry.getItem(${itemName}),${dayInfo})`
    return [code, Blockly.JavaScript.ORDER_NONE]
  }

  /*
  * Provides a number of different (non-)statistical metrics for an item according to the given date
  * Blockly part
  */
  Blockly.Blocks['oh_get_persistvalue'] = {
    init: function () {
      this.appendValueInput('itemName')
        .appendField('get')
        .appendField(new Blockly.FieldDropdown([
          ['average value', 'averageSince'], ['delta value', 'deltaSince'],
          ['deviation value', 'deviationSince'], ['variance value', 'varianceSince'], ['evolution rate value', 'evolutionRate'],
          ['minimum value', 'minimumSince'], ['maximum value', 'maximumSince'],
          ['summed up value', 'sumSince'], ['previous value', 'previousState']
        ]
        ), 'methodName')
        .appendField('of item')
        .setCheck('oh_itemtype')
      this.appendValueInput('dayInfo')
        .appendField('since')
        .setCheck(['EphemerisDay', 'EphemerisDate'])
      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour(0)
      let thisBlock = this
      this.setTooltip(function () {
        let methodName = thisBlock.getFieldValue('methodName')
        let TIP = {
          'averageSince': 'Gets the average value of the State of a persisted Item since a certain point in time. This method uses a time-weighted average calculation',
          'deltaSince': 'Gets the difference in value of the State of a given Item since a certain point in time',
          'deviationSince': 'Gets the standard deviation of the state of the given Item since a certain point in time',
          'varianceSince': 'Gets the variance of the state of the given Item since a certain point in time',
          'evolutionRate': 'Gets the evolution rate of the state of a given Item since a certain point in time',
          'minimumSince': 'Gets the minimum value of the State of a persisted Item since a certain point in time',
          'maximumSince': 'Gets the maximum value of the State of a persisted Item since a certain point in time',
          'sumSince': 'Gets the sum of the previous States of a persisted Item since a certain point in time',
          'previousState': 'Gets the previous value of the State of a persisted Item'
        }
        return TIP[methodName]
      })
      this.setHelpUrl('https://www.openhab.org/docs/configuration/persistence.html')
    }
  }

  /*
  * Provides a number of different (non-)statistical metrics for an item according to the given date
  * Code part
  */
  Blockly.JavaScript['oh_get_persistvalue'] = function (block) {
    addPersistence()
    addDateSupport()
    const itemName = Blockly.JavaScript.valueToCode(block, 'itemName', Blockly.JavaScript.ORDER_ATOMIC)
    const methodName = block.getFieldValue('methodName')
    const dayInfo = Blockly.JavaScript.valueToCode(block, 'dayInfo', Blockly.JavaScript.ORDER_ATOMIC)
    let code = ''
    if (methodName === 'maximumSince' || methodName === 'minimumSince') {
      code = `persistence.${methodName}(itemRegistry.getItem(${itemName}),${dayInfo}).getState()`
    } else if (methodName === 'previousState') {
      code = `persistence.${methodName}(itemRegistry.getItem(${itemName}))`
    } else {
      code = `persistence.${methodName}(itemRegistry.getItem(${itemName}),${dayInfo})`
    }

    return [code, Blockly.JavaScript.ORDER_NONE]
  }

  /*
  * Returns the state before the current state of that item
  * Blockly part
  */
  Blockly.Blocks['oh_get_persistence_lastupdate'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('last updated date of')
      this.appendValueInput('itemName')
      this.setInputsInline(true)
      this.setOutput(true, 'EphemerisDate')
      this.setColour(0)

      let thisBlock = this
      this.setTooltip(function () {
        let methodName = thisBlock.getFieldValue('methodName')
        let TIP = {
          'changedSince': 'Checks if the State of the Item has (ever) changed since a certain point in time',
          'updatedSince': 'Checks if the State of the Item has been updated since a certain point in time'
        }
        return TIP[methodName]
      })

      this.setHelpUrl('https://www.openhab.org/docs/configuration/persistence.html')
    }
  }

  /*
  * Returns the state before the current state of that item
  * Code part
  */
  Blockly.JavaScript['oh_get_persistence_lastupdate'] = function (block) {
    addPersistence()
    addDateSupport()
    const itemName = Blockly.JavaScript.valueToCode(block, 'itemName', Blockly.JavaScript.ORDER_ATOMIC)
    let code = `persistence.lastUpdate(itemRegistry.getItem(${itemName}))`
    return [code, 0]
  }

  function addPersistence () {
    Blockly.JavaScript.provideFunction_(
      'persistence',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type(\'org.openhab.core.persistence.extensions.PersistenceExtensions\');'])
  }

  function addDateSupport () {
    Blockly.JavaScript.provideFunction_(
      'dtf',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("java.time.format.DateTimeFormatter");'])
    Blockly.JavaScript.provideFunction_(
      'zdt',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type("java.time.ZonedDateTime");'])
  }
}
