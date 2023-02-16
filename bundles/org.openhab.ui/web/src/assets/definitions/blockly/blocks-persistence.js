/*
* These blocks support the persistence module which stores the data in the database and allows to retrieve historical and statistical data
* supports jsscripting
*/
import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'
import { addDateSupport } from './utils'

export default function defineOHBlocks_Persistence (f7, isGraalJs) {
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
          ['minimum', 'minimumSince'], ['maximum', 'maximumSince'], ['sum', 'sumSince'],
          ['previous state value', 'previousState'], ['previous state value time', 'previousStateTime'],
          ['historic state', 'historicState']
        ], this.handleTypeSelection.bind(this)
        ), 'methodName')
      this.methodName = this.getFieldValue('methodName')
      this.appendValueInput('itemName')
        .appendField('of the state of item named ')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck(['String', 'oh_item'])
      this.updateShape()
      this.setInputsInline(false)
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
          'previousState': 'Gets the previous state with option to skip to different value as current',
          'previousStateTime': 'Gets the time when previous state last occurred with option to skip to different value as current',
          'historicState': 'Gets the historic state at a certain point in time'
        }
        return TIP[methodName]
      })
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-persistence.html#get-statistical-value-of-an-item')
    },
    handleTypeSelection: function (methodName) {
      if (this.methodName !== methodName) {
        this.methodName = methodName
        this.updateShape()
      }
    },
    updateShape: function () {
      if (this.methodName === 'previousState' || this.methodName === 'previousStateTime') {
        if (this.getInput('dayInfo')) {
          this.removeInput('dayInfo')
        }
        if (!this.getInput('skipPrevious')) {
          this.appendValueInput('skipPrevious')
            .appendField('skip same ')
            .setAlign(Blockly.ALIGN_RIGHT)
            .setCheck(['Boolean'])
        }
      } else {
        if (this.getInput('skipPrevious')) {
          this.removeInput('skipPrevious')
        }
        if (this.getInput('dayInfo')) {
          this.removeInput('dayInfo')
        }
        const preposition = (this.methodName === 'historicState') ? 'at' : 'since'
        console.log(this.methodName + '->' + preposition)
        this.appendValueInput('dayInfo')
          .appendField(preposition)
          .setAlign(Blockly.ALIGN_RIGHT)
          .setCheck(['ZonedDateTime'])
      }
    }
  }

  /*
  * Provides a number of different (non-)statistical metrics for an item according to the given date
  * Code part
  */
  javascriptGenerator['oh_get_persistvalue'] = function (block) {
    const itemName = javascriptGenerator.valueToCode(block, 'itemName', javascriptGenerator.ORDER_ATOMIC)
    const methodName = block.getFieldValue('methodName')

    const persistence = (isGraalJs) ? null : addPersistence()

    let code = ''
    let dayInfo = ''
    let skipPrevious = javascriptGenerator.valueToCode(block, 'skipPrevious', javascriptGenerator.ORDER_NONE)
    skipPrevious = ((skipPrevious === 'undefined') ? false : skipPrevious)

    let itemCode = (isGraalJs) ? `items.getItem(${itemName})` : `itemRegistry.getItem(${itemName})`
    switch (methodName) {
      case 'maximumSince':
      case 'minimumSince':
      case 'historicState':
        dayInfo = javascriptGenerator.valueToCode(block, 'dayInfo', javascriptGenerator.ORDER_NONE)
        code = (isGraalJs) ? `${itemCode}.history.${methodName}(${dayInfo})?.state` : `${persistence}.${methodName}(${itemCode}, ${dayInfo}).getState()`
        break

      case 'previousState':
        code = (isGraalJs) ? `${itemCode}.history.previousState(${skipPrevious})?.state` : `${persistence}.previousState(${itemCode},${skipPrevious}).getState()`
        break

      case 'previousStateTime':
        code = (isGraalJs) ? `${itemCode}.history.previousState(${skipPrevious})?.timestamp` : `${persistence}.previousState(${itemCode},${skipPrevious}).getTimestamp()`
        break

      default:
        dayInfo = javascriptGenerator.valueToCode(block, 'dayInfo', javascriptGenerator.ORDER_NONE)
        code = (isGraalJs) ? `${itemCode}.history.${methodName}(${dayInfo})` : `${persistence}.${methodName}(${itemCode}, ${dayInfo})`
        break
    }

    return [code, javascriptGenerator.ORDER_CONDITIONAL]
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

      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-persistence.html#check-item-change-update-since-a-point-in-time')
    }
  }

  /*
  * Checks if an item has changed or has been updated since some given date
  * Code part
  */
  javascriptGenerator['oh_persist_changed'] = function (block) {
    const itemName = javascriptGenerator.valueToCode(block, 'itemName', javascriptGenerator.ORDER_ATOMIC)
    const methodName = block.getFieldValue('methodName')
    const dayInfo = javascriptGenerator.valueToCode(block, 'dayInfo', javascriptGenerator.ORDER_NONE)

    if (isGraalJs) {
      return [`items.getItem(${itemName}).history.${methodName}(${dayInfo})`, javascriptGenerator.ORDER_NONE]
    } else {
      const { dtf, zdt, getZonedDatetime } = addDateSupport()
      const persistence = addPersistence()
      return [`${persistence}.${methodName}(itemRegistry.getItem(${itemName}), ${dayInfo})`, javascriptGenerator.ORDER_NONE]
    }
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
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-persistence.html#provide-last-updated-date-of-an-item')
    }
  }

  /*
  * Returns the state before the current state of that item
  * Code part
  */
  javascriptGenerator['oh_get_persistence_lastupdate'] = function (block) {
    const itemName = javascriptGenerator.valueToCode(block, 'itemName', javascriptGenerator.ORDER_ATOMIC)

    if (isGraalJs) {
      return [`items.getItem(${itemName}).history.lastUpdate()`, 0]
    } else {
      const { dtf, zdt, getZonedDatetime } = addDateSupport()
      const persistence = addPersistence()
      let code = `${persistence}.lastUpdate(itemRegistry.getItem(${itemName}))`
      return [code, 0]
    }
  }

  function addPersistence () {
    return javascriptGenerator.provideFunction_(
      'persistence',
      ['var ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type(\'org.openhab.core.persistence.extensions.PersistenceExtensions\');'])
  }
}
