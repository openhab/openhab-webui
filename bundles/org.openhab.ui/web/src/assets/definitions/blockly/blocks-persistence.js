/*
* These blocks support the persistence module which stores the data in the database and allows to retrieve historical and statistical data
* supports jsscripting
*/
import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript.js'
import { addDateSupport, blockGetCheckedInputType } from './utils.js'
import ThingGeneralSettings from '@/components/thing/thing-general-settings.vue'

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
          ['historic state average', 'averageSince'], ['future state average', 'averageUntil'], ['state average between', 'averageBetween'],
          ['historic state delta', 'deltaSince'], ['future state delta', 'deltaUntil'], ['state delta between', 'deltaBetween'],
          ['historic state deviation', 'deviationSince'], ['future state deviation', 'deviationUntil'], ['state deviation between', 'deviationBetween'],
          ['historic state variance', 'varianceSince'], ['future state variance', 'varianceUntil'], ['state variance between', 'varianceBetween'],
          ['historic evolution rate', 'evolutionRateSince'], ['future evolution rate', 'evolutionRateUntil'], ['state evolution rate between', 'evolutionRateBetween'],
          ['historic state minimum', 'minimumSince'], ['future state minimum', 'minimumUntil'], ['state minimum between', 'minimumBetween'],
          ['historic state maximum', 'maximumSince'], ['future state maximum', 'maximumUntil'], ['state maximum between', 'maximumBetween'],
          ['historic state sum', 'sumSince'], ['future state sum', 'sumUntil'], ['state sum between', 'sumBetween'],
          ['historic state updates count', 'countSince'], ['future state updates count', 'countUntil'], ['state updates count between', 'countBetween'],
          ['historic state changes count', 'countStateChangesSince'], ['future state changes count', 'countStateChangesUntil'], ['state changes count between', 'countStateChangesBetween'],
          ['previous state value', 'previousState'], ['next state value', 'nextState'],
          ['all states since', 'getAllStatesSince'], ['all states until', 'getAllStatesUntil'], ['all states between', 'getAllStatesBetween'],
          ['previous state numeric value', 'previousNumericState'], ['next state numeric value', 'nextNumericState'],
          ['previous state value time', 'previousStateTime'], ['next state value time', 'nextStateTime']
        ], this.handleTypeSelection.bind(this)
        ), 'methodName')
      this.methodName = this.getFieldValue('methodName')
      this.appendValueInput('itemName')
        .appendField('of item')
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
          'averageSince': 'Gets the average value of the State of the Item since a certain point in time. This method uses a time-weighted average calculation',
          'averageUntil': 'Gets the average value of the State of the Item until a certain point in time. This method uses a time-weighted average calculation',
          'averageBetween': 'Gets the average value of the State of the Item between two points in time. This method uses a time-weighted average calculation',
          'deltaSince': 'Gets the difference in value of the State of the Item since a certain point in time',
          'deltaUntil': 'Gets the difference in value of the State of the Item until a certain point in time',
          'deltaBetween': 'Gets the difference in value of the State of the Item between two points in time',
          'deviationSince': 'Gets the standard deviation of the State of the Item since a certain point in time',
          'deviationUntil': 'Gets the standard deviation of the State of the Item until a certain point in time',
          'deviationBetween': 'Gets the standard deviation of the State of the Item between two points in time',
          'varianceSince': 'Gets the variance of the State of the Item since a certain point in time',
          'varianceUntil': 'Gets the variance of the State of the Item until a certain point in time',
          'varianceBetween': 'Gets the variance of the State of the Item between two points in time',
          'evolutionRateSince': 'Gets the evolution rate of the State of the Item since a certain point in time',
          'evolutionRateUntil': 'Gets the evolution rate of the State of the Item until a certain point in time',
          'evolutionRateBetween': 'Gets the evolution rate of the State of the Item between two points in time',
          'minimumSince': 'Gets the minimum value of the State of the Item since a certain point in time',
          'minimumUntil': 'Gets the minimum value of the State of the Item until a certain point in time',
          'minimumBetween': 'Gets the minimum value of the State of the Item between two points in time',
          'maximumSince': 'Gets the maximum value of the State of the Item since a certain point in time',
          'maximumUntil': 'Gets the maximum value of the State of the Item until a certain point in time',
          'maximumBetween': 'Gets the maximum value of the State of the Item between two points in time',
          'sumSince': 'Gets the sum of the previous States of the Item since a certain point in time',
          'sumUntil': 'Gets the sum of the future States of the Item until a certain point in time',
          'sumBetween': 'Gets the sum of the States of the Item between two points in time',
          'previousState': 'Gets the previous State of the Item, with option to skip to different value as current',
          'nextState': 'Gets the next State of the Item, with option to skip to different value as current',
          'getAllStatesSince': 'Gets Array of objects with timestamp and state fields of persisted items since a certain point in time',
          'getAllStatesUntil': 'Gets Array of objects with timestamp and state fields of persisted items until a certain point in time',
          'getAllStatesBetween': 'Gets Array of objects with timestamp and state fields of persisted items between two points in time',
          'previousNumericState': 'Gets the previous State of the Item without the unit, with option to skip to different value as current',
          'nextNumericState': 'Gets the next State of the Item without the unit, with option to skip to different value as current',
          'previousStateTime': 'Gets the time when previous State of the Item last occurred, with option to skip to different value as current',
          'nextStateTime': 'Gets the time when next State of the Item will occur, with option to skip to different value as current',
          'countSince': 'Gets the number of stored State updates of the Item since a certain point in time',
          'countUntil': 'Gets the number of stored State updates of the Item until a certain point in time',
          'countBetween': 'Gets the number of stored State updates of the Item between two points in time',
          'countStateChangesSince': 'Gets the number of State changes of the Item since a certain point in time',
          'countStateChangesUntil': 'Gets the number of State changes of the Item until a certain point in time',
          'countStateChangesBetween': 'Gets the number of State changes of the Item between two points in time',
          'persistedState': 'Gets the State of the Item at a certain point in time'
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

      // Always remove when switching, so the sequence of the selection list gets updated
      if (this.getInput('returnTypeInput')) {
        this.removeInput('returnTypeInput')
      }
      if (isGraalJs && ![
        'evolutionRateSince', 'evolutionRateUntil', 'evolutionRateBetween',
        'countSince', 'countUntil', 'countBetween',
        'countStateChangesSince', 'countStateChangesUntil', 'countStateChangesBetween',
        'previousNumericState', 'nextNumericState', 'previousStateTime', 'nextStateTime'
      ].includes(this.methodName)) {
        this.appendDummyInput('returnTypeInput')
          .appendField('as')
          .appendField(new Blockly.FieldDropdown(this.returnTypeNames()), 'returnTypeName')
          .setAlign(Blockly.ALIGN_RIGHT)
        this.moveInputBefore('returnTypeInput', 'itemName')
      }

      let hasSinceField = this.methodName.endsWith('Since') || this.methodName.endsWith('Between') || (this.methodName === 'persistedState')
      let hasUntilField = this.methodName.endsWith('Until') || this.methodName.endsWith('Between')

      if (this.getInput('dayInfoSince') && !hasSinceField) {
        this.removeInput('dayInfoSince')
      }
      if (this.getInput('dayInfoUntil') && !hasUntilField) {
        this.removeInput('dayInfoUntil')
      }

      if (['previousState', 'nextState', 'previousNumericState', 'nextNumericState', 'previousStateTime', 'nextStateTime'].includes(this.methodName)) {
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

        const prepositionSince = (this.methodName === 'persistedState') ? 'at' : (this.methodName.endsWith('Since') ? 'since' : 'between')
        const prepositionUntil = this.methodName.endsWith('Until') ? 'until' : 'and'

        if (hasSinceField) {
          if (!this.getInput('dayInfoSince')) {
            this.appendValueInput('dayInfoSince')
              .appendField(prepositionSince, 'prepositionSince')
              .setCheck(['ZonedDateTime'])
            this.getInput('dayInfoSince').setShadowDom(
              Blockly.utils.xml.textToDom(`<shadow type="oh_zdt_plusminus">
                <value name="offset">
                  <shadow type="math_number">
                    <field name="NUM">1</field>
                  </shadow>
                </value>
                <field name="period">Hours</field>
                <field name="plusminus">minus</field>
              </shadow>`))
            if (this.getInput('dayInfoUntil')) {
              this.moveInputBefore('dayInfoSince', 'dayInfoUntil')
            } else {
              this.moveInputBefore('dayInfoSince', 'persistenceName')
            }
          } else {
            const prepositionField = this.getField('prepositionSince')
            if (prepositionField.getText() !== prepositionSince) {
              prepositionField.setValue(prepositionSince)
            }
          }
        }

        if (hasUntilField) {
          if (!this.getInput('dayInfoUntil')) {
            this.appendValueInput('dayInfoUntil')
              .appendField(prepositionUntil, 'prepositionUntil')
              .setCheck(['ZonedDateTime'])
            this.getInput('dayInfoUntil').setShadowDom(
              Blockly.utils.xml.textToDom(`<shadow type="oh_zdt_plusminus">
                <value name="offset">
                  <shadow type="math_number">
                    <field name="NUM">1</field>
                  </shadow>
                </value>
                <field name="period">Hours</field>
                <field name="plusminus">plus</field>
              </shadow>`))
            this.moveInputBefore('dayInfoUntil', 'persistenceName')
          } else {
            const prepositionField = this.getField('prepositionUntil')
            if (prepositionField.getText() !== prepositionUntil) {
              prepositionField.setValue(prepositionUntil)
            }
          }
        }
      }
    },
    returnTypeNames: function () {
      // use different list of return types and sequence to make sure first entry is old behaviour for backward compatibility
      let returnTypes = []
      switch (this.methodName) {
        case 'persistedState':
        case 'previousState':
        case 'nextState':
        case 'maximumSince':
        case 'maximumUntil':
        case 'maximumBetween':
        case 'minimumSince':
        case 'minimumUntil':
        case 'minimumBetween':
          returnTypes = [['String', 'state'],
            ['Quantity', 'quantityState'],
            ['Number', 'numericState'],
            ['Timestamp', 'timestamp']]
          break

        case 'averageSince':
        case 'averageUntil':
        case 'averageBetween':
        case 'deltaSince':
        case 'deltaUntil':
        case 'deltaBetween':
        case 'deviationSince':
        case 'deviationUntil':
        case 'deviationBetween':
        case 'sumSince':
        case 'sumUntil':
        case 'sumBetween':
        case 'varianceSince':
        case 'varianceUntil':
        case 'varianceBetween':
          returnTypes = [['Number', 'numericState'],
            ['Quantity', 'quantityState'],
            ['String', 'state']]
          break

        case 'getAllStatesSince':
        case 'getAllStatesUntil':
        case 'getAllStatesBetween':
          returnTypes = [['String', 'state'],
            ['Quantity', 'quantityState'],
            ['Number', 'numericState']]
          break

        default:
          break
      }
      return returnTypes
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
    const returnTypeName = block.getFieldValue('returnTypeName')
    const persistenceName = javascriptGenerator.valueToCode(block, 'persistenceName', javascriptGenerator.ORDER_NONE)
    const persistence = (isGraalJs) ? null : addPersistence()

    const itemCode = generateItemCode(itemName, inputType)
    let code = ''
    const dayInfoSince = javascriptGenerator.valueToCode(block, 'dayInfoSince', javascriptGenerator.ORDER_NONE)
    const dayInfoUntil = javascriptGenerator.valueToCode(block, 'dayInfoUntil', javascriptGenerator.ORDER_NONE)
    const dayInfo = dayInfoSince + ((dayInfoSince && dayInfoUntil) ? ' ,' : '') + dayInfoUntil
    let skipPrevious = javascriptGenerator.valueToCode(block, 'skipPrevious', javascriptGenerator.ORDER_NONE)
    skipPrevious = ((skipPrevious === 'undefined') ? false : skipPrevious)

    const persistenceExtension = (persistenceName === '\'default\'') ? '' : `, ${persistenceName}`

    switch (methodName) {
      // Returning JS PersistedItem mapped to return type (GraalJS) or org.openhab.core.persistence.HistoricItem
      case 'persistedState':
      case 'maximumSince':
      case 'maximumUntil':
      case 'maximumBetween':
      case 'minimumSince':
      case 'minimumUntil':
      case 'minimumBetween':
        code = (isGraalJs) ? `${itemCode}.persistence.${methodName}(${dayInfo}${persistenceExtension})?.${returnTypeName}` : `${persistence}.${methodName}(${itemCode}, ${dayInfo}${persistenceExtension}).getState()`
        break

      case 'previousState':
      case 'nextState':
        code = (isGraalJs) ? `${itemCode}.persistence.${methodName}(${skipPrevious}${persistenceExtension})?.${returnTypeName}` : `${persistence}.${methodName}(${itemCode}, ${skipPrevious}${persistenceExtension}).getState()`
        break

      case 'previousNumericState':
        code = (isGraalJs) ? `${itemCode}.persistence.previousState(${skipPrevious}${persistenceExtension})?.numericState` : `${persistence}.previousState(${itemCode}, ${skipPrevious}${persistenceExtension}).getNumericState()`
        break
      case 'nextNumericState':
        code = (isGraalJs) ? `${itemCode}.persistence.nextState(${skipPrevious}${persistenceExtension})?.numericState` : `${persistence}.nextState(${itemCode}, ${skipPrevious}${persistenceExtension}).getNumericState()`
        break

      case 'previousStateTime':
        code = (isGraalJs) ? `${itemCode}.persistence.previousState(${skipPrevious}${persistenceExtension})?.timestamp` : `${persistence}.previousState(${itemCode}, ${skipPrevious}${persistenceExtension}).getTimestamp()`
        break
      case 'nextStateTime':
        code = (isGraalJs) ? `${itemCode}.persistence.nextState(${skipPrevious}${persistenceExtension})?.timestamp` : `${persistence}.nextState(${itemCode}, ${skipPrevious}${persistenceExtension}).getTimestamp()`
        break

      // Returning JS PersistedState mapped to return type (GraalJS) or org.openhab.core.types.State cast to float
      case 'averageSince':
      case 'averageUntil':
      case 'averageBetween':
      case 'deltaSince':
      case 'deltaUntil':
      case 'deltaBetween':
      case 'deviationSince':
      case 'deviationUntil':
      case 'deviationBetween':
      case 'sumSince':
      case 'sumUntil':
      case 'sumBetween':
      case 'varianceSince':
      case 'varianceUntil':
      case 'varianceBetween':
        code = (isGraalJs) ? `${itemCode}.persistence.${methodName}(${dayInfo}${persistenceExtension})?.${returnTypeName}` : `parseFloat(${persistence}.${methodName}(${itemCode}, ${dayInfo}${persistenceExtension}).getState())`
        break

      // Returning JS Array of objects with timestamp and state fields, whereby PersistedState is mapped to return type (GraalJS) or org.openhab.core.persistence.HistoricItem
      case 'getAllStatesSince':
      case 'getAllStatesUntil':
      case 'getAllStatesBetween':
        code = (isGraalJs) ? `${itemCode}.persistence.${methodName}(${dayInfo}${persistenceExtension}).map(v => ({'timestamp': v.timestamp, 'state': v.${returnTypeName}}))` : `${persistence}.${methodName}(${itemCode}, ${dayInfo}${persistenceExtension}.map(v => ({'timestamp': v.getTimestamp(), 'state': v.getState()}))`
        break

      default:
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
        .appendField(new Blockly.FieldDropdown([
          ['has changed since', 'changedSince'], ['will have changed until', 'changedUntil'], ['changes between', 'changedBetween'],
          ['has been updated since', 'updatedSince'], ['will have been updated until', 'updatedUntil'], ['is updated between', 'updatedBetween']
        ], this.handleTypeSelection.bind(this)), 'methodName')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck(['ZonedDateTime'])
      this.methodName = this.getFieldValue('methodName')

      this.setInputsInline(false)
      this.setOutput(true, null)
      this.setColour(0)

      let thisBlock = this
      this.setTooltip(function () {
        let methodName = thisBlock.getFieldValue('methodName')
        let TIP = {
          'changedSince': 'Checks if the State of the Item has (ever) changed since a certain point in time',
          'changedUntil': 'Checks if the State of the Item will have (ever) changed until a certain point in time',
          'changedBetween': 'Checks if the State of the Item will have (ever) changed between two points in time',
          'updatedSince': 'Checks if the State of the Item has been updated since a certain point in time',
          'updatedUntil': 'Checks if the State of the Item will have been updated until a certain point in time',
          'updatedBetween': 'Checks if the State of the Item will have been updated between two points in time'
        }
        return TIP[methodName]
      })

      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-persistence.html#check-item-change-update-since-a-point-in-time')
    },
    handleTypeSelection: function (methodName) {
      if (this.methodName !== methodName) {
        this.methodName = methodName
        this.updateShape()
      }
    },
    updateShape: function () {
      if (this.methodName.endsWith('Between')) {
        if (!this.getInput('dayInfo2')) {
          this.appendValueInput('dayInfo2')
            .appendField('and')
            .setCheck(['ZonedDateTime'])
          this.getInput('dayInfo2').setShadowDom(
            Blockly.utils.xml.textToDom(`<shadow type="oh_zdt_plusminus">
              <value name="offset">
                <shadow type="math_number">
                  <field name="NUM">1</field>
                </shadow>
              </value>
              <field name="period">Hours</field>
              <field name="plusminus">plus</field>
            </shadow>`))
        }
      } else if (this.getInput('dayInfo2')) {
        this.removeInput('dayInfo2')
      }
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
    const dayInfo1 = javascriptGenerator.valueToCode(block, 'dayInfo', javascriptGenerator.ORDER_NONE)
    const dayInfo2 = methodName.endsWith('Between') ? javascriptGenerator.valueToCode(block, 'dayInfo2', javascriptGenerator.ORDER_NONE) : undefined
    const dayInfo = dayInfo2 ? `${dayInfo1}, ${dayInfo2}` : dayInfo1
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
