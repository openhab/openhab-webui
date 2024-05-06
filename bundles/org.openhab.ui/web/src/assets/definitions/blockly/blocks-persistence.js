/*
* These blocks support the persistence module which stores the data in the database and allows to retrieve historical and statistical data
* supports jsscripting
*/
import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript.js'
import { addDateSupport, blockGetCheckedInputType } from './utils.js'

export default function defineOHBlocks_Persistence (f7, isGraalJs, persistenceServices) {
  /*
  * Provides a number of different (non-)statistical metrics for an item according to the given date
  * Blockly part
  */
  Blockly.Blocks['oh_get_persistvalue'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('get the')
        .appendField(new Blockly.FieldDropdown([
          ['persisted state', 'persistedState'],
          ['historic state average', 'averageSince'], ['future state average', 'averageUntil'],
          ['historic state delta', 'deltaSince'], ['future state delta', 'deltaUntil'],
          ['historic state deviation', 'deviationSince'], ['future state deviation', 'deviationUntil'],
          ['historic state variance', 'varianceSince'], ['future state variance', 'varianceUntil'],
          ['historic evolution rate', 'evolutionRateSince'], ['future evolution rate', 'evolutionRateUntil'],
          ['historic state minimum', 'minimumSince'], ['future state minimum', 'minimumUntil'],
          ['historic state maximum', 'maximumSince'], ['future state maximum', 'maximumUntil'],
          ['historic state sum', 'sumSince'], ['future state sum', 'sumUntil'],
          ['previous state value', 'previousState'], ['next state value', 'nextState'],
          ['previous state numeric value', 'previousNumericState'], ['next state numeric value', 'nextNumericState'],
          ['previous state value time', 'previousStateTime'], ['next state value time', 'nextStateTime']
        ], this.handleTypeSelection.bind(this)
        ), 'methodName')
      this.methodName = this.getFieldValue('methodName')
      this.appendValueInput('itemName')
        .appendField('of item ')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck(['String', 'oh_item', 'oh_itemtype'])
      this.appendValueInput('persistenceName')
        .appendField('from')
        .setCheck(null)
      this.updateShape()
      this.setInputsInline(false)
      this.setOutput(true, null)
      this.setColour(0)

      this.setTooltip(() => {
        let methodName = this.getFieldValue('methodName')
        let TIP = {
          'averageSince': 'Gets the average value of the State of a persisted Item since a certain point in time. This method uses a time-weighted average calculation',
          'averageUntil': 'Gets the average value of the State of a persisted Item until a certain point in time. This method uses a time-weighted average calculation',
          'deltaSince': 'Gets the difference in value of the State of a given Item since a certain point in time',
          'deltaUntil': 'Gets the difference in value of the State of a given Item until a certain point in time',
          'deviationSince': 'Gets the standard deviation of the state of the given Item since a certain point in time',
          'deviationUntil': 'Gets the standard deviation of the state of the given Item until a certain point in time',
          'varianceSince': 'Gets the variance of the state of the given Item since a certain point in time',
          'varianceUntil': 'Gets the variance of the state of the given Item until a certain point in time',
          'evolutionRateSince': 'Gets the evolution rate of the state of a given Item since a certain point in time',
          'evolutionRateUntil': 'Gets the evolution rate of the state of a given Item until a certain point in time',
          'minimumSince': 'Gets the minimum value of the State of a persisted Item since a certain point in time',
          'minimumUntil': 'Gets the minimum value of the State of a persisted Item until a certain point in time',
          'maximumSince': 'Gets the maximum value of the State of a persisted Item since a certain point in time',
          'maximumUntil': 'Gets the maximum value of the State of a persisted Item until a certain point in time',
          'sumSince': 'Gets the sum of the previous States of a persisted Item since a certain point in time',
          'sumUntil': 'Gets the sum of the previous States of a persisted Item until a certain point in time',
          'previousState': 'Gets the previous state with option to skip to different value as current',
          'nextState': 'Gets the next state with option to skip to different value as current',
          'previousNumericState': 'Gets the previous state without the unit with option to skip to different value as current',
          'nextNumericState': 'Gets the next state without the unit with option to skip to different value as current',
          'previousStateTime': 'Gets the time when previous state last occurred with option to skip to different value as current',
          'nextStateTime': 'Gets the time when next state will occur with option to skip to different value as current',
          'persisted': 'Gets the persisted state at a certain point in time'
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
      const persistenceNameInput = this.getInput('persistenceName')
      if (!persistenceNameInput.getShadowDom()) {
        persistenceNameInput.setShadowDom(Blockly.utils.xml.textToDom('<shadow type="oh_persistence_dropdown" />'))
      }
      if (['previousState', 'nextState', 'previousNumericState', 'nextNumericState', 'previousStateTime', 'nextStateTime'].includes(this.methodName)) {
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

        const preposition = (this.methodName === 'persistedState') ? 'at' : (this.methodName.endsWith('Until') ? 'until' : 'since')

        if (!this.getInput('dayInfo')) {
          this.appendValueInput('dayInfo')
            .appendField(preposition, 'preposition')
            .setCheck(['ZonedDateTime'])
          this.moveInputBefore('dayInfo', 'persistenceName')
        } else {
          const prepositionField = this.getField('preposition')
          if (prepositionField.getText() !== preposition) {
            prepositionField.setValue(preposition)
          }
        }
      }
    }
  }

  /*
  * Provides a number of different (non-)statistical metrics for an item according to the given date
  * Code part
  */
  javascriptGenerator.forBlock['oh_get_persistvalue'] = function (block) {
    const itemName = javascriptGenerator.valueToCode(block, 'itemName', javascriptGenerator.ORDER_ATOMIC)
    const inputType = blockGetCheckedInputType(block, 'itemName')

    const methodName = block.getFieldValue('methodName')
    const persistenceName = javascriptGenerator.valueToCode(block, 'persistenceName', javascriptGenerator.ORDER_NONE)
    const persistence = (isGraalJs) ? null : addPersistence()

    const itemCode = generateItemCode(itemName, inputType)
    let code = ''
    let dayInfo = ''
    let skipPrevious = javascriptGenerator.valueToCode(block, 'skipPrevious', javascriptGenerator.ORDER_NONE)
    skipPrevious = ((skipPrevious === 'undefined') ? false : skipPrevious)

    const persistenceExtension = (persistenceName === '\'default\'') ? '' : `, ${persistenceName}`

    switch (methodName) {
      // Returning JS PersistedItem (GraalJS) or org.openhab.core.persistence.HistoricItem
      case 'maximumSince':
      case 'maximumUntil':
      case 'minimumSince':
      case 'minimumUntil':
      case 'historicState':
      case 'persistedState':
        dayInfo = javascriptGenerator.valueToCode(block, 'dayInfo', javascriptGenerator.ORDER_NONE)
        code = (isGraalJs) ? `${itemCode}.persistence.${methodName}(${dayInfo}${persistenceExtension})?.state` : `${persistence}.${methodName}(${itemCode}, ${dayInfo}${persistenceExtension}).getState()`
        break

      case 'previousState':
      case 'nextState':
        code = (isGraalJs) ? `${itemCode}.persistence.${methodName}(${skipPrevious}${persistenceExtension})?.state` : `${persistence}.${methodName}(${itemCode},${skipPrevious}${persistenceExtension}).getState()`
        break

      case 'previousNumericState':
        code = (isGraalJs) ? `${itemCode}.persistence.previousState(${skipPrevious}${persistenceExtension})?.numericState` : `${persistence}.previousState(${itemCode},${skipPrevious}${persistenceExtension}).getNumericState()`
        break
      case 'nextNumericState':
        code = (isGraalJs) ? `${itemCode}.persistence.nextState(${skipPrevious}${persistenceExtension})?.numericState` : `${persistence}.nextState(${itemCode},${skipPrevious}${persistenceExtension}).getNumericState()`
        break

      case 'previousStateTime':
        code = (isGraalJs) ? `${itemCode}.persistence.previousState(${skipPrevious}${persistenceExtension})?.timestamp` : `${persistence}.previousState(${itemCode},${skipPrevious}${persistenceExtension}).getTimestamp()`
        break
      case 'nextStateTime':
        code = (isGraalJs) ? `${itemCode}.persistence.nextState(${skipPrevious}${persistenceExtension})?.timestamp` : `${persistence}.nextState(${itemCode},${skipPrevious}${persistenceExtension}).getTimestamp()`
        break

      // Returning JS PersistedState (GraalJS) or org.openhab.core.types.State
      case 'averageSince':
      case 'averageUntil':
      case 'deltaSince':
      case 'deltaUntil':
      case 'deviationSince':
      case 'deviationUntil':
      case 'sumSince':
      case 'sumUntil':
      case 'varianceSince':
      case 'varianceUntil':
        dayInfo = javascriptGenerator.valueToCode(block, 'dayInfo', javascriptGenerator.ORDER_NONE)
        code = (isGraalJs) ? `${itemCode}.persistence.${methodName}(${dayInfo}${persistenceExtension})?.numericState` : `parseFloat(${persistence}.${methodName}(${itemCode}, ${dayInfo}${persistenceExtension}).getState())`
        break

      default:
        dayInfo = javascriptGenerator.valueToCode(block, 'dayInfo', javascriptGenerator.ORDER_NONE)
        code = (isGraalJs) ? `${itemCode}.persistence.${methodName}(${dayInfo}${persistenceExtension})` : `${persistence}.${methodName}(${itemCode}, ${dayInfo}${persistenceExtension})`
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
        .setCheck(['String', 'oh_item', 'oh_itemtype'])
      const persistenceNameInput = this.appendValueInput('persistenceName')
        .appendField('from')
        .setCheck(null)
      if (!persistenceNameInput.getShadowDom()) {
        persistenceNameInput.setShadowDom(Blockly.utils.xml.textToDom('<shadow type="oh_persistence_dropdown" />'))
      }
      this.appendValueInput('dayInfo')
        .appendField(new Blockly.FieldDropdown([['has changed since', 'changedSince'], ['will have changed until', 'changedUntil'], ['has been updated since', 'updatedSince'], ['will have been updated until', 'updatedUntil']]), 'methodName')
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
          'changedUntil': 'Checks if the State of the Item will have (ever) changed until a certain point in time',
          'updatedSince': 'Checks if the State of the Item has been updated since a certain point in time',
          'updatedUntil': 'Checks if the State of the Item will have been updated until a certain point in time'
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
  javascriptGenerator.forBlock['oh_persist_changed'] = function (block) {
    const itemName = javascriptGenerator.valueToCode(block, 'itemName', javascriptGenerator.ORDER_ATOMIC)
    const inputType = blockGetCheckedInputType(block, 'itemName')

    const methodName = block.getFieldValue('methodName')
    const dayInfo = javascriptGenerator.valueToCode(block, 'dayInfo', javascriptGenerator.ORDER_NONE)
    const persistenceName = javascriptGenerator.valueToCode(block, 'persistenceName', javascriptGenerator.ORDER_NONE)
    const persistenceExtension = (persistenceName === '\'default\'') ? '' : `, ${persistenceName}`

    let itemCode = generateItemCode(itemName, inputType)

    if (isGraalJs) {
      return [`${itemCode}.persistence.${methodName}(${dayInfo}${persistenceExtension})`, javascriptGenerator.ORDER_NONE]
    } else {
      const { dtf, zdt, getZonedDatetime } = addDateSupport()
      const persistence = addPersistence()
      return [`${persistence}.${methodName}(${itemCode}, ${dayInfo}${persistenceExtension})`, javascriptGenerator.ORDER_NONE]
    }
  }

  /*
  * Returns the state before the current state of that item
  * Blockly part
  */
  Blockly.Blocks['oh_get_persistence_lastupdate'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['last', 'lastUpdate'], ['next', 'nextUpdate']
        ]), 'methodName')
      this.appendDummyInput()
        .appendField(' updated date of')
      this.appendValueInput('itemName')
        .setCheck(['String', 'oh_item', 'oh_itemtype'])
      const persistenceNameInput = this.appendValueInput('persistenceName')
        .appendField('from')
        .setCheck(null)
      if (!persistenceNameInput.getShadowDom()) {
        persistenceNameInput.setShadowDom(Blockly.utils.xml.textToDom('<shadow type="oh_persistence_dropdown" />'))
      }

      this.setInputsInline(true)
      this.setOutput(true, 'ZonedDateTime')
      this.setColour(0)
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-persistence.html#provide-last-updated-date-of-an-item')

      this.setTooltip(() => {
        const methodName = this.getFieldValue('methodName')
        const TIP = {
          'lastUpdate': 'Get the last update time of the provided item',
          'nextUpdate': 'Get the next update time of the provided item'
        }
        return TIP[methodName]
      })
    }
  }

  /*
  * Returns the state before the current state of that item
  * Code part
  */
  javascriptGenerator.forBlock['oh_get_persistence_lastupdate'] = function (block) {
    const methodName = block.getFieldValue('methodName')
    const itemName = javascriptGenerator.valueToCode(block, 'itemName', javascriptGenerator.ORDER_ATOMIC)
    const inputType = blockGetCheckedInputType(block, 'itemName')
    const persistenceName = javascriptGenerator.valueToCode(block, 'persistenceName', javascriptGenerator.ORDER_NONE)
    const persistenceExtension = (persistenceName === '\'default\'') ? '' : ((!isGraalJs) ? ',' : '') + ` ${persistenceName}`

    let itemCode = generateItemCode(itemName, inputType)

    if (isGraalJs) {
      return [`${itemCode}.persistence.${methodName}(${persistenceExtension})`, 0]
    } else {
      const { dtf, zdt, getZonedDatetime } = addDateSupport()
      const persistence = addPersistence()
      let code = `${persistence}.${methodName}(${itemCode}${persistenceExtension})`
      return [code, 0]
    }
  }

  function generateItemCode (itemName, inputType) {
    if (isGraalJs) {
      return (inputType === 'oh_item' || inputType === 'String') ? `items.getItem(${itemName})` : `${itemName}`
    } else {
      return (inputType === 'oh_item' || inputType === 'String') ? `itemRegistry.getItem(${itemName})` : `${itemName}`
    }
  }

  function addPersistence () {
    return javascriptGenerator.provideFunction_(
      'persistence',
      ['var ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + ' = Java.type(\'org.openhab.core.persistence.extensions.PersistenceExtensions\');'])
  }

  /*
    * Provides all available persistence services as a dropdown
    */
  Blockly.Blocks['oh_persistence_dropdown'] = {
    init: function () {
      let input = this.appendDummyInput()
        .appendField('persistence')
        .appendField(new Blockly.FieldDropdown(this.generateOptions), 'persistence')
      this.setOutput(true, null)
    },
    generateOptions: function () {
      let options = []
      options.push(['default', 'default'])
      if (persistenceServices != null && persistenceServices.length > 0) {
        for (let key in persistenceServices) {
          let persistenceOption = persistenceServices[key]
          options.push([persistenceOption.label, persistenceOption.id])
        }
      }
      return options
    }
  }

  javascriptGenerator.forBlock['oh_persistence_dropdown'] = function (block) {
    let persistenceName = block.getFieldValue('persistence')
    return [`'${persistenceName}'`, javascriptGenerator.ORDER_NONE]
  }
}
