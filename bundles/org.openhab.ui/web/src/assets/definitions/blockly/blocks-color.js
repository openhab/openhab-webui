/*
* Adds new blocks to the colour section
* supports jsscripting
*/

import Blockly from 'blockly'
import { javascriptGenerator } from 'blockly/javascript.js'
import { blockGetCheckedInputType, generateItemCode } from '@/assets/definitions/blockly/utils.js'

export default function (f7, isGraalJs) {
  /*
  * converts a hex color string in to an openHAB hue-saturation-brightness string
  * Block
  */
  Blockly.Blocks['oh_color_to_hsb'] = {
    init: function () {
      this.appendValueInput('hexColor')
        .appendField('hsb of')
        .setCheck('Colour')
      this.setInputsInline(false)
      this.setOutput(true, 'String')
      this.setColour('%{BKY_COLOUR_HUE}')
      this.setTooltip('converts a colour\'s hex rgb representation to openHAB\'s hue-saturation-brightness string')
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-standard-ext.html#create-hsb-color-from-rgb-color-openhabblocks-color.js')
    }
  }

  /*
  * converts a hex color string in to an openHAB hue-saturation-brightness string
  * Code generation
  */
  javascriptGenerator.forBlock['oh_color_to_hsb'] = function (block) {
    let conversionFunction = addConvertColourHexToHSB()
    const hexColor = javascriptGenerator.valueToCode(block, 'hexColor', javascriptGenerator.ORDER_ATOMIC)
    let code = `${conversionFunction}(${hexColor})`
    return [code, 0]
  }

  Blockly.Blocks['oh_color_item'] = {
    init: function () {
      const dropDown = new Blockly.FieldDropdown([
        ['hue', 'Hue'],
        ['saturation', 'Saturation'],
        ['brightness', 'Brightness']
      ])
      this.appendValueInput('item')
        .setCheck(['String', 'oh_itemtype', 'oh_item'])
        .appendField(dropDown, 'attributeName')
        .appendField('of item')

      this.setInputsInline(false)
      let thisBlock = this
      this.setTooltip(function () {
        const operand = thisBlock.getFieldValue('attributeName')
        switch (operand) {
          case 'Hue': return 'Return Hue of the color item'
          case 'Saturation': return 'Return Saturation of a color item'
          case 'Brightness': return 'Return Brightness of a color item'
        }
      })
      this.setHelpUrl('https://www.openhab.org/docs/configuration/blockly/rules-blockly-standard-ext.html#item-color')
      this.setOutput(true, 'Number')
      this.setColour('%{BKY_COLOUR_HUE}')
    }
  }

  javascriptGenerator.forBlock['oh_color_item'] = function (block) {
    const item = javascriptGenerator.valueToCode(block, 'item', javascriptGenerator.ORDER_ATOMIC)
    const itemType = blockGetCheckedInputType(block, 'item')
    const itemCode = generateItemCode(item, itemType, isGraalJs)
    const attributeName = block.getFieldValue('attributeName')

    if (isGraalJs) {
      return [`${itemCode}.rawState.get${attributeName}()`, 0]
    } else {
      return [`${itemCode}.getRawState().get${attributeName}()`, 0]
    }
  }

  /*
  * converts rgb to hsb (thanks to https://www.30secondsofcode.org/js/s/rgb-to-hsb)
  */
  function addConvertColourHexToHSB () {
    const hsbConversion = javascriptGenerator.provideFunction_(
      'colorHexToHSB',
      [
        'function ' + javascriptGenerator.FUNCTION_NAME_PLACEHOLDER_ + ' (hexColor) {',
        '  var rgb = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hexColor);',
        '  if (!rgb) return \'\';',
        '  var r = parseInt(rgb[1], 16) / 255, g = parseInt(rgb[2], 16) / 255, b = parseInt(rgb[3], 16) / 255;',
        '  var v = Math.max(r, g, b), n = v - Math.min(r, g, b);',
        '  var h = n === 0 ? 0 : n && v === r ? (g - b) / n : v === g ? 2 + (b - r) / n : 4 + (r - g) / n;',
        '  return [60 * (h < 0 ? h + 6 : h), v && (n / v) * 100, v * 100].join(\',\');',
        '}'
      ])
    return hsbConversion
  }
}
