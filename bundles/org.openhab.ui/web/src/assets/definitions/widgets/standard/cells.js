/* Definitions for the standard library's standalone (Item) widgets */

import { WidgetDefinition, pb, pt, pi, pg } from '../helpers.js'
import { actionGroup, actionParams } from '../actions.js'

export const CellParameterGroup = () => pg('cell', 'Cell', 'General settings of the cell')
export const TrendLineParameterGroup = () => pg('trend', 'Trend Line', 'Trend Line Background Options')

export const CellParameters = () => [
  pt('header', 'Header', 'Header of the cell'),
  pt('title', 'Title', 'Title of the cell'),
  pt('subtitle', 'Subtitle', 'Subtitle of the cell'),
  pt('footer', 'Footer', 'Footer of the cell'),
  pt('icon', 'Icon', 'Use <code>oh:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://www.openhab.org/link/icons">openHAB icon</a>), <code>f7:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://framework7.io/icons/">Framework7 icon</a>), <code>material:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://jossef.github.io/material-design-icons-iconfont/">Material icon</a>) or <code>iconify:iconSet:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://icon-sets.iconify.design">Iconify icon</a>, requires being online if not in cache)'),
  pt('color', 'Highlight Color', 'Color to use when highlighted'),
  pt('on', '"On" expression', 'Expression to determine when the card should be highlighted. If blank, determine automatically from the primary bound item if applicable.').a()
]

import TrendLineParameters from '../system/trend.js'

// OhCell
export const OhCellDefinition = () => new WidgetDefinition('oh-cell', 'Cell', 'A regular or expandable cell')
  .paramGroup(CellParameterGroup(), CellParameters())
  .paramGroup(actionGroup(), actionParams())
  .paramGroup(TrendLineParameterGroup(), TrendLineParameters())

// OhLabelCell
export const OhLabelCellDefinition = () => new WidgetDefinition('oh-label-cell', 'Label Cell', 'A cell with a big label to show a short item state value')
  .paramGroup(CellParameterGroup(), CellParameters())
  .paramGroup(pg('label', 'Label'), [
    pi('item', 'Item', 'Item to display'),
    pt('label', 'Label', 'Display this text (or expression result) instead of the item\'s state')
  ])
  .paramGroup(actionGroup(), actionParams())
  .paramGroup(TrendLineParameterGroup(), TrendLineParameters())

// OhSliderCell
import SliderParameters from '../system/slider.js'
export const OhSliderCellDefinition = () => new WidgetDefinition('oh-slider-cell', 'Slider Cell', 'A cell expanding to a big vertical slider')
  .paramGroup(CellParameterGroup(), CellParameters())
  .paramGroup(pg('slider', 'Slider'), SliderParameters())
  .paramGroup(actionGroup(), actionParams())

// OhKnobCell
import KnobParameters from '../system/knob.js'
export const OhKnobCellDefinition = () => new WidgetDefinition('oh-knob-cell', 'Knob & Rounded Slider Cell', 'A cell expanding to a knob or rounded slider control')
  .paramGroup(CellParameterGroup(), CellParameters())
  .paramGroup(pg('knob', 'Knob'), KnobParameters())
  .paramGroup(actionGroup(), actionParams())

// OhColorpickerCell
import ColorpickerParameters from '../system/colorpicker.js'
export const OhColorpickerCellDefinition = () => new WidgetDefinition('oh-colorpicker-cell', 'Colorpicker Cell', 'A cell expanding to a color picker')
  .paramGroup(CellParameterGroup(), CellParameters())
  .paramGroup(pg('colorpicker', 'Color Picker'), ColorpickerParameters())
  .paramGroup(actionGroup(), actionParams())

// OhRollershutterCell
import RollershutterParameters from '../system/rollershutter.js'
export const OhRollershutterCellDefinition = () => new WidgetDefinition('oh-rollershutter-cell', 'Rollershutter Cell', 'A cell expanding to rollershutter controls')
  .paramGroup(CellParameterGroup(), CellParameters())
  .paramGroup(pg('rollershutter', 'Roller Shutter'), RollershutterParameters())
  .paramGroup(actionGroup(), actionParams())
