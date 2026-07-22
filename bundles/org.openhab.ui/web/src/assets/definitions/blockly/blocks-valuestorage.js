/*
 * These blocks allow values to be stored as "variables" in this.storedvars[] so they can "survive" when the rule is retriggered.
 * Note that the variables are only global to the individual rule not others.
 * supports jsscripting
 */

import * as Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'
import { valueToCode } from '@/assets/definitions/blockly/utils.js'

export default function defineOHBlocks_Variables(f7) {
  Blockly.Blocks['oh_store_value'] = {
    init: function () {
      this.appendDummyInput().appendField('store value')
      this.appendValueInput('value').setCheck(['Number', 'Boolean', 'String'])
      this.appendDummyInput().appendField('into')
      this.appendValueInput('key')
      this.appendDummyInput()
        .appendField('to ')
        .appendField(
          new Blockly.FieldDropdown([
            ['private', '.private'],
            ['shared', '.shared']
          ]),
          'cacheType'
        )
        .appendField('cache')
      this.setInputsInline(true)
      this.setPreviousStatement(true, null)
      this.setNextStatement(true, null)
      this.setColour(0)
      this.setTooltip(
        'stores a value with a variable name that can be retrieved on subsequent runs of this rule/script to the private rule or shared global cache. Vales stored in the shared cache will automatically have `javaify()` applied.'
      )
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-value-storage.html#store-value')
    }
  }

  javascriptGenerator.forBlock['oh_store_value'] = function (block) {
    const key = valueToCode(block, 'key', javascriptGenerator.ORDER_ATOMIC)
    const value = valueToCode(block, 'value', javascriptGenerator.ORDER_ATOMIC)
    const cacheType = block.getFieldValue('cacheType')
    return `cache${cacheType}.put(${key}, ${value});\n`
  }

  Blockly.Blocks['oh_get_value'] = {
    init: function () {
      this.appendDummyInput().appendField('stored value')
      this.appendValueInput('key')

      const cacheDropdown = new Blockly.FieldDropdown(
        [
          ['private', '.private'],
          ['shared', '.shared']
        ],
        this.validate.bind(this)
      )

      this.appendDummyInput('cacheInput').appendField('from ').appendField(cacheDropdown, 'cacheType').appendField('cache')

      this.setInputsInline(true)
      this.setOutput(true, null)
      this.setColour(0)
      this.setTooltip(
        'Retrieves the value that was previously stored for that particular script/rule from the private rule or shared global cache.'
      )
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-value-storage.html#get-stored-value')
    },
    validate: function (newValue) {
      const cacheInput = this.getInput('cacheInput')
      if (!cacheInput) return

      const hasJsify = this.getField('jsifyOpt')

      if (newValue === '.shared') {
        if (!hasJsify) {
          cacheInput.appendField(' ', 'jsifySpace')

          const jsifyTooltip =
            'Automatically converts retrieved Java objects from the shared cache back into standard JavaScript objects for ease of use.'
          const checkbox = new Blockly.FieldCheckbox('TRUE')
          checkbox.setTooltip(jsifyTooltip)
          cacheInput.appendField(checkbox, 'jsifyOpt')

          const label = new Blockly.FieldLabel('jsify value')
          label.setTooltip(jsifyTooltip)
          cacheInput.appendField(label, 'jsifyLabel')
        }
      } else {
        if (hasJsify) {
          cacheInput.removeField('jsifySpace')
          cacheInput.removeField('jsifyOpt')
          cacheInput.removeField('jsifyLabel')
        }
      }
    }
  }

  /*
   * Retrieves the value from private or shared cache.
   * Code part
   */
  javascriptGenerator.forBlock['oh_get_value'] = function (block) {
    const key = valueToCode(block, 'key', javascriptGenerator.ORDER_ATOMIC)
    const cacheType = block.getFieldValue('cacheType')
    const jsifyOpt = block.getField('jsifyOpt') ? block.getFieldValue('jsifyOpt') === 'TRUE' : true

    let code
    // To maintain backwards compatibility, we only specify the extra argument if it's different from the default
    if (cacheType === '.shared' && !jsifyOpt) {
      code = `cache.shared.get(${key}, null, false)`
    } else {
      code = `cache${cacheType}.get(${key})`
    }

    return [code, javascriptGenerator.ORDER_NONE]
  }

  Blockly.Blocks['oh_check_undefined_value'] = {
    init: function () {
      this.appendValueInput('key')
      this.appendDummyInput().appendField('is undefined')
      this.appendDummyInput()
        .appendField('in ')
        .appendField(
          new Blockly.FieldDropdown([
            ['private', '.private'],
            ['shared', '.shared']
          ]),
          'cacheType'
        )
        .appendField('cache')
      this.setInputsInline(true)
      this.setOutput(true, 'Boolean')
      this.setColour(0)
      this.setTooltip('returns whether the given value is undefined in the private rule or shared global cache')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-value-storage.html#check-if-value-is-undefined')
    }
  }

  javascriptGenerator.forBlock['oh_check_undefined_value'] = function (block) {
    const key = valueToCode(block, 'key', javascriptGenerator.ORDER_ATOMIC)
    const cacheType = block.getFieldValue('cacheType')
    return [`cache${cacheType}.exists(${key}) === false`, javascriptGenerator.ORDER_NONE]
  }
}
