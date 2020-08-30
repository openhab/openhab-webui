/* Definitions for the standard library's standalone (Item) widgets */

import { WidgetDefinition, pb, pt, pi, pg } from '../helpers'
import { actionGroup, actionParams } from '../actions'

export const CellParameterGroup = () => pg('cell', 'Cell', 'General settings of the cell')

export const CellParameters = () => [
  pt('header', 'Header', 'Header of the cell'),
  pt('text', 'Text', 'Text in the cell'),
  pt('icon', 'Icon', 'Use <code>oh:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://www.openhab.org/docs/configuration/iconsets/classic/">openHAB icon</a>) or <code>f7:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://framework7.io/icons/">Framework7 icon</a>)'),
]

// OhListItem
export const OhCellDefinition = () => new WidgetDefinition('oh-cell', 'Cell', 'A regular or expandable cell')
  .paramGroup(CellParameterGroup(), CellParameters())
  .paramGroup(actionGroup(), actionParams())
