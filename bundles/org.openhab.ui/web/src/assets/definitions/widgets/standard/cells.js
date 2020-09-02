/* Definitions for the standard library's standalone (Item) widgets */

import { WidgetDefinition, pb, pt, pi, pg } from '../helpers'
import { actionGroup, actionParams } from '../actions'

export const CellParameterGroup = () => pg('cell', 'Cell', 'General settings of the cell')

export const CellParameters = () => [
  pt('header', 'Header', 'Header of the cell'),
  pt('title', 'Title', 'Title of the cell'),
  pt('subtitle', 'Subtitle', 'Subtitle of the cell'),
  pt('footer', 'Footer', 'Footer of the cell'),
  pt('icon', 'Icon', 'Use <code>oh:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://www.openhab.org/docs/configuration/iconsets/classic/">openHAB icon</a>) or <code>f7:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://framework7.io/icons/">Framework7 icon</a>)'),
]

// OhCell
export const OhCellDefinition = () => new WidgetDefinition('oh-cell', 'Cell', 'A regular or expandable cell')
  .paramGroup(CellParameterGroup(), CellParameters())
  .paramGroup(actionGroup(), actionParams())

// OhSliderCell
export const OhSliderCellDefinition = () => new WidgetDefinition('oh-slider-cell', 'Slider Cell', 'A cell expanding to a big vertical slider')
  .paramGroup(CellParameterGroup(), CellParameters())
  .paramGroup(actionGroup(), actionParams())

// OhKnobCell
export const OhKnobCellDefinition = () => new WidgetDefinition('oh-knob-cell', 'Knob Cell', 'A cell expanding to a knob control')
  .paramGroup(CellParameterGroup(), CellParameters())
  .paramGroup(actionGroup(), actionParams())

// OhColorpickerCell
export const OhColorpickerCellDefinition = () => new WidgetDefinition('oh-colorpicker-cell', 'Colorpicker Cell', 'A cell expanding to a color picker')
  .paramGroup(CellParameterGroup(), CellParameters())
  .paramGroup(actionGroup(), actionParams())

// OhRollershutterCell
export const OhRollershutterCellDefinition = () => new WidgetDefinition('oh-rollershutter-cell', 'Rollershutter Cell', 'A cell expanding to rollershutter controls')
  .paramGroup(CellParameterGroup(), CellParameters())
  .paramGroup(actionGroup(), actionParams())
