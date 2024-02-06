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
          ['state average', 'averageSince'], ['state delta', 'deltaSince'],
          ['state deviation', 'deviationSince'], ['state variance', 'varianceSince'], ['evolution rate', 'evolutionRateSince'],
          ['state minimum', 'minimumSince'], ['state maximum', 'maximumSince'], ['state sum', 'sumSince'],
          ['previous state value', 'previousState'], ['previous state numeric value', 'previousNumericState'], ['previous state value time', 'previousStateTime'],
          ['historic state', 'historicState']
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
      let thisBlock = this

      this.setTooltip(function () {
        let methodName = thisBlock.getFieldValue('methodName')
        let TIP = {
          'averageSince': 'Gets the average value of the State of a persisted Item since a certain point in time. This method uses a time-weighted average calculation',
          'deltaSince': 'Gets the difference in value of the State of a given Item since a certain point in time',
          'deviationSince': 'Gets the standard deviation of the state of the given Item since a certain point in time',
          'varianceSince': 'Gets the variance of the state of the given Item since a certain point in time',
          'evolutionRateSince': 'Gets the evolution rate of the state of a given Item since a certain point in time',
          'minimumSince': 'Gets the minimum value of the State of a persisted Item since a certain point in time',
          'maximumSince': 'Gets the maximum value of the State of a persisted Item since a certain point in time',
          'sumSince': 'Gets the sum of the previous States of a persisted Item since a certain point in time',
          'previousState': 'Gets the previous state with option to skip to different value as current',
          'previousNumericState': 'Gets the previous state without the unit with option to skip to different value as current',
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
      const persistenceNameInput = this.getInput('persistenceName')
      if (!persistenceNameInput.getShadowDom()) {
        persistenceNameInput.setShadowDom(Blockly.utils.xml.textToDom('<shadow type="oh_persistence_dropdown" />'))
      }
      if (this.methodName === 'previousState' || this.methodName === 'previousNumericState' || this.methodName === 'previousStateTime') {
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

        const preposition = (this.methodName === 'historicState') ? 'at' : 'since'

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
      case 'maximumSince':
      case 'minimumSince':
      case 'historicState':
        dayInfo = javascriptGenerator.valueToCode(block, 'dayInfo', javascriptGenerator.ORDER_NONE)
        code = (isGraalJs) ? `${itemCode}.history.${methodName}(${dayInfo}${persistenceExtension})?.state` : `${persistence}.${methodName}(${itemCode}, ${dayInfo}${persistenceExtension}).getState()`
        break

      case 'previousState':
        code = (isGraalJs) ? `${itemCode}.history.previousState(${skipPrevious}${persistenceExtension})?.state` : `${persistence}.previousState(${itemCode},${skipPrevious}${persistenceExtension}).getState()`
        break

      case 'previousNumericState':
        code = (isGraalJs) ? `${itemCode}.history.previousState(${skipPrevious}${persistenceExtension})?.numericState` : `${persistence}.previousState(${itemCode},${skipPrevious}${persistenceExtension}).getNumericState()`
        break

      case 'previousStateTime':
        code = (isGraalJs) ? `${itemCode}.history.previousState(${skipPrevious}${persistenceExtension})?.timestamp` : `${persistence}.previousState(${itemCode},${skipPrevious}${persistenceExtension}).getTimestamp()`
        break

      default:
        dayInfo = javascriptGenerator.valueToCode(block, 'dayInfo', javascriptGenerator.ORDER_NONE)
        code = (isGraalJs) ? `${itemCode}.history.${methodName}(${dayInfo}${persistenceExtension})` : `${persistence}.${methodName}(${itemCode}, ${dayInfo}${persistenceExtension})`
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
  javascriptGenerator.forBlock['oh_persist_changed'] = function (block) {
    const itemName = javascriptGenerator.valueToCode(block, 'itemName', javascriptGenerator.ORDER_ATOMIC)

    const inputType = blockGetCheckedInputType(block, 'itemName')

    let itemCode = generateItemCode(itemName, inputType)

    const methodName = block.getFieldValue('methodName')
    const dayInfo = javascriptGenerator.valueToCode(block, 'dayInfo', javascriptGenerator.ORDER_NONE)

    const persistenceName = javascriptGenerator.valueToCode(block, 'persistenceName', javascriptGenerator.ORDER_NONE)
    const persistenceExtension = (persistenceName === '\'default\'') ? '' : `, ${persistenceName}`

    if (isGraalJs) {
      return [`${itemCode}.history.${methodName}(${dayInfo}${persistenceExtension})`, javascriptGenerator.ORDER_NONE]
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
        .appendField('last updated date of')
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
      this.setTooltip('Get the last update time of the provided item')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-persistence.html#provide-last-updated-date-of-an-item')
    }
  }

  /*
  * Returns the state before the current state of that item
  * Code part
  */
  javascriptGenerator.forBlock['oh_get_persistence_lastupdate'] = function (block) {
    const itemName = javascriptGenerator.valueToCode(block, 'itemName', javascriptGenerator.ORDER_ATOMIC)
    const inputType = blockGetCheckedInputType(block, 'itemName')
    const persistenceName = javascriptGenerator.valueToCode(block, 'persistenceName', javascriptGenerator.ORDER_NONE)
    const persistenceExtension = (persistenceName === '\'default\'') ? '' : ((!isGraalJs) ? ',' : '') + ` ${persistenceName}`

    let itemCode = generateItemCode(itemName, inputType)

    if (isGraalJs) {
      return [`${itemCode}.history.lastUpdate(${persistenceExtension})`, 0]
    } else {
      const { dtf, zdt, getZonedDatetime } = addDateSupport()
      const persistence = addPersistence()
      let code = `${persistence}.lastUpdate(${itemCode}${persistenceExtension})`
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
