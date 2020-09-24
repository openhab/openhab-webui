/* Definitions for the standard library's standalone (Item) widgets */

import { WidgetDefinition, pb, pt, pi, pg } from '../helpers'
import { actionGroup, actionParams } from '../actions'

export const ListItemParameterGroup = () => pg('listitem', 'List Item', 'General settings of the list item')

export const ListItemParameters = () => [
  pt('title', 'Title', 'Title of the item'),
  pt('subtitle', 'Subtitle', 'Subtitle of the item'),
  pt('after', 'After', 'Text to display on the opposite side of the item (set either this or a badge)').a(),
  pt('icon', 'Icon', 'Use <code>oh:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://www.openhab.org/docs/configuration/iconsets/classic/">openHAB icon</a>) or <code>f7:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://framework7.io/icons/">Framework7 icon</a>)'),
  pt('iconColor', 'Icon Color', 'Not applicable to openHAB icons').a()
]

// OhListItem
export const OhListItemDefinition = () => new WidgetDefinition('oh-list-item', 'List Item', 'A list item')
  .paramGroup(ListItemParameterGroup(), ListItemParameters())
  .paramGroup(actionGroup(), actionParams())
  .paramGroup(pg('badge', 'Badge'), [
    pt('badge', 'Badge', 'Text to display in a badge on the opposite side of the item (set either this or "after")').a(),
    pt('badgeColor', 'Badge color', 'Color of the badge').a()
  ])
  .paramGroup(pg('listButton', 'List Button Settings'), [
    pb('listButton', 'List Button', 'This item will be styled as a list button (clickable link). All other options except title and color will be ignored.'),
    pt('listButtonColor', 'List Button Color', 'Color (for list buttons)')
      .v((value, configuration, configDescription, parameters) => {
        return configuration.listButton === true
      })
  ])

// OhLabelItem
export const OhLabelItemDefinition = () => new WidgetDefinition('oh-label-item', 'Label List Item', 'Display the state of an item in a list')
  .paramGroup(ListItemParameterGroup(), ListItemParameters())
  .paramGroup(actionGroup(), actionParams())
  .params([
    pi('item', 'Item', 'Item to display')
  ])

// OhColorpickerItem
import ColorPickerParameters from '../system/colorpicker'
export const OhColorpickerItemDefinition = () => new WidgetDefinition('oh-colorpicker-item', 'Color Picker List Item', 'Display a color picker in a list')
  .paramGroup(ListItemParameterGroup(), ListItemParameters())
  .paramGroup(pg('colorpicker', 'Color picker'), ColorPickerParameters())

// OhPlayerItem
import PlayerParameters from '../system/player'
export const OhPlayerItemDefinition = () => new WidgetDefinition('oh-player-item', 'Player List Item', 'Display player controls in a list')
  .paramGroup(ListItemParameterGroup(), ListItemParameters())
  .paramGroup(pg('player', 'Player Controls'), PlayerParameters())
  .paramGroup(pg('Current Track Info', 'Currently playing track information'), [
    pi('artistItem', 'Artist Item', 'Item holding the artist name'),
    pi('trackItem', 'Track Item', 'Item holding the track name')
  ])

// OhRollershutterItem
import RollershutterParameters from '../system/rollershutter'
export const OhRollershutterItemDefinition = () => new WidgetDefinition('oh-rollershutter-item', 'Rollershutter List Item', 'Display rollershutter controls in a list')
  .paramGroup(ListItemParameterGroup(), ListItemParameters())
  .paramGroup(pg('orientation', 'Orientation'), [
    pb('vertical', 'Vertical', 'Vertical orientation')
  ])
  .paramGroup(pg('controls', 'Rollershutter Controls'), RollershutterParameters())

// OhSliderItem
import SliderParameters from '../system/slider'
export const OhSliderItemDefinition = () => new WidgetDefinition('oh-slider-item', 'Slider List Item', 'Display a slider in a Item to control an list')
  .paramGroup(ListItemParameterGroup(), ListItemParameters())
  .paramGroup(pg('slider', 'Slider'), SliderParameters())

// OhStepperItem
import StepperParameters from '../system/stepper'
export const OhStepperItemDefinition = () => new WidgetDefinition('oh-stepper-item', 'Stepper List Item', 'Display a stepper control in a list')
  .paramGroup(ListItemParameterGroup(), ListItemParameters())
  .paramGroup(pg('stepper', 'Stepper'), StepperParameters())

// OhToggleItem
import ToggleParameters from '../system/toggle'
export const OhToggleItemDefinition = () => new WidgetDefinition('oh-toggle-item', 'Toggle List Item', 'Display a toggle switch in a list item')
  .paramGroup(ListItemParameterGroup(), ListItemParameters())
  .paramGroup(pg('toggle', 'Toggle'), ToggleParameters())
