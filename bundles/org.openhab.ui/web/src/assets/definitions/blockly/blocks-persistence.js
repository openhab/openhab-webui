/*
* These blocks support the persistence module which stores the data in the database and allows to retrieve historical and statistical data
*/
import Blockly from 'blockly'
import { addDateSupport } from './utils'

export default function defineOHBlocks_Persistence (f7) {
  /*
  * Provides a number of different (non-)statistical metrics for an item according to the given date
  * Blockly part
  */
  Blockly.Blocks['oh_get_persistvalue'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('get the')
        .appendField(new Blockly.FieldDropdown([
          ['average', 'averageSince'], ['delta', 'deltaSince'],
          ['deviation', 'deviationSince'], ['variance', 'varianceSince'], ['evolution rate', 'evolutionRate'],
          ['minimum', 'minimumSince'], ['maximum', 'maximumSince'], ['sum', 'sumSince'], ['previous', 'previousState']
        ]
        ), 'methodName')
      this.appendValueInput('itemName')
        .appendField('of the state of item')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('oh_itemtype')
      this.appendValueInput('dayInfo')
        .appendField('since')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck(['ZonedDateTime'])
      this.setInputsInline(false)
      this.setOutput(true, null)
      this.setColour(0)
      this.getField('methodName').setValidator(function (option) {
        this.getSourceBlock().updateShape_((option === 'previousState'))
      })
      let thisBlock = this
      this.setTooltip(function () {
        const methodName = thisBlock.getFieldValue('methodName')
        const TIP = {
          'averageSince': 'Gets the average value of the State of a persisted Item since a certain point in time. This method uses a time-weighted average calculation',
          'deltaSince': 'Gets the difference in value of the State of a given Item since a certain point in time',
          'deviationSince': 'Gets the standard deviation of the state of the given Item since a certain point in time',
          'varianceSince': 'Gets the variance of the state of the given Item since a certain point in time',
          'evolutionRate': 'Gets the evolution rate of the state of a given Item since a certain point in time',
          'minimumSince': 'Gets the minimum value of the State of a persisted Item since a certain point in time',
          'maximumSince': 'Gets the maximum value of the State of a persisted Item since a certain point in time',
          'sumSince': 'Gets the sum of the previous States of a persisted Item since a certain point in time'
        }
        return TIP[methodName]
      })
      this.setHelpUrl('https://www.openhab.org/docs/configuration/persistence.html')
    },
    updateShape_: function (previous) {
      if (!previous && !this.getInput('dayInfo')) {
        const input = this.appendValueInput('dayInfo')
          .appendField('since')
          .setCheck(['EphemerisDay', 'EphemerisDate'])
      } else if (previous && this.getInput('dayInfo')) {
        this.removeInput('dayInfo')
      }
    }
  }

  /*
  * Provides a number of different (non-)statistical metrics for an item according to the given date
  * Code part
  */
  Blockly.JavaScript['oh_get_persistvalue'] = function (block) {
    const { dtf, zdt, getZonedDatetime } = addDateSupport()
    const persistence = addPersistence()

    const itemName = Blockly.JavaScript.valueToCode(block, 'itemName', Blockly.JavaScript.ORDER_ATOMIC)
    const methodName = block.getFieldValue('methodName')
    const dayInfo = Blockly.JavaScript.valueToCode(block, 'dayInfo', Blockly.JavaScript.ORDER_NONE)
    let code = ''
    if (methodName === 'maximumSince' || methodName === 'minimumSince') {
      code = `${persistence}.${methodName}(itemRegistry.getItem(${itemName}), ${dayInfo}).getState()`
    } else {
      code = `${persistence}.${methodName}(itemRegistry.getItem(${itemName}), ${dayInfo})`
    }

    return [code, Blockly.JavaScript.ORDER_NONE]
  }

  /*
  * Checks if an item has changed or has been updated since some given date
  * Blockly part
  */
  Blockly.Blocks['oh_persist_changed'] = {
    init: function () {
      this.appendValueInput('itemName')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('the state of')
      this.appendValueInput('dayInfo')
        .appendField(new Blockly.FieldDropdown([['has changed since', 'changedSince'], ['has been updated since', 'updatedSince']]), 'methodName')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck(['ZonedDateTime'])
      this.setInputsInline(false)
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
    const { dtf, zdt, getZonedDatetime } = addDateSupport()
    const persistence = addPersistence()

    const itemName = Blockly.JavaScript.valueToCode(block, 'itemName', Blockly.JavaScript.ORDER_ATOMIC)
    const methodName = block.getFieldValue('methodName')
    const dayInfo = Blockly.JavaScript.valueToCode(block, 'dayInfo', Blockly.JavaScript.ORDER_NONE)
    let code = `${persistence}.${methodName}(itemRegistry.getItem(${itemName}), ${dayInfo})`
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
      this.setOutput(true, 'ZonedDateTime')
      this.setColour(0)
      this.setTooltip('Get the last update time of the provided item')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/persistence.html')
    }
  }

  /*
  * Returns the state before the current state of that item
  * Code part
  */
  Blockly.JavaScript['oh_get_persistence_lastupdate'] = function (block) {
    const { dtf, zdt, getZonedDatetime } = addDateSupport()
    const persistence = addPersistence()
    const itemName = Blockly.JavaScript.valueToCode(block, 'itemName', Blockly.JavaScript.ORDER_ATOMIC)
    let code = `${persistence}.lastUpdate(itemRegistry.getItem(${itemName}))`
    return [code, 0]
  }

  function addPersistence () {
    return Blockly.JavaScript.provideFunction_(
      'persistence',
      ['var ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type(\'org.openhab.core.persistence.extensions.PersistenceExtensions\');'])
  }
}
