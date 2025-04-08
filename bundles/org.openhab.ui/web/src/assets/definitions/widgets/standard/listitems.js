/* Definitions for the standard library's standalone (Item) widgets */

import { WidgetDefinition, pb, pt, pi, pg } from '../helpers.js'
import { actionGroup, actionParams } from '../actions.js'

export const ListItemParameterGroup = () => pg('listitem', 'List Item', 'General settings of the list item')

export const ListItemParameters = () => [
  pt('title', 'Title', 'Title of the item'),
  pt('subtitle', 'Subtitle', 'Subtitle of the item'),
  pt('after', 'After', 'Text to display on the opposite side of the item (set either this or a badge)').a(),
  pt('icon', 'Icon', 'Use <code>oh:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://www.openhab.org/link/icons">openHAB icon</a>), <code>f7:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://framework7.io/icons/">Framework7 icon</a>), <code>material:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://jossef.github.io/material-design-icons-iconfont/">Material icon</a>) or <code>iconify:iconSet:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://icon-sets.iconify.design">Iconify icon</a>, requires being online if not in cache)'),
  pt('iconColor', 'Icon Color', 'Not applicable to openHAB icons').a(),
  pb('iconUseState', 'Icon depends on state', 'Use the state of the Item to get a dynamic icon (enabled by default for <code>Contact</code>, <code>Dimmer</code>, <code>Rollershutter</code> & <code>Switch</code> Item types) (for openHAB icons only)')
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

// OhInputItem
import InputParameters from '../system/input.js'
export const OhInputItemDefinition = () => new WidgetDefinition('oh-input-item', 'Input List Item', 'Display an input field in a list')
  .paramGroup(ListItemParameterGroup(), ListItemParameters())
  .paramGroup(pg('input', 'Input'), InputParameters())

// OhColorpickerItem
import ColorPickerParameters from '../system/colorpicker.js'
export const OhColorpickerItemDefinition = () => new WidgetDefinition('oh-colorpicker-item', 'Color Picker List Item', 'Display a color picker in a list')
  .paramGroup(ListItemParameterGroup(), ListItemParameters())
  .paramGroup(pg('colorpicker', 'Color picker'), ColorPickerParameters())

// OhMediaBrowserItem
import MediaBrowserParameters from '../system/mediabrowser.js'
export const OhMediaBrowserItemDefinition = () => new WidgetDefinition('oh-media-browser-item', 'Media Browser List Item', 'Display media browser controls in a list')
  .paramGroup(ListItemParameterGroup(), ListItemParameters())
  .paramGroup(pg('media-browser', 'MediaBrowser Controls'), MediaBrowserParameters())
  .paramGroup(pg('Current Track Info', 'Currently playing track information'), [
    pi('artistItem', 'Artist Item', 'Item holding the artist name'),
    pi('trackItem', 'Track Item', 'Item holding the track name')
  ])

    
// OhPlayerItem
import PlayerParameters from '../system/player.js'
export const OhPlayerItemDefinition = () => new WidgetDefinition('oh-player-item', 'Player List Item', 'Display player controls in a list')
  .paramGroup(ListItemParameterGroup(), ListItemParameters())
  .paramGroup(pg('player', 'Player Controls'), PlayerParameters())
  .paramGroup(pg('Current Track Info', 'Currently playing track information'), [
    pi('artistItem', 'Artist Item', 'Item holding the artist name'),
    pi('trackItem', 'Track Item', 'Item holding the track name')
  ])

// OhRollershutterItem
import RollershutterParameters from '../system/rollershutter.js'
export const OhRollershutterItemDefinition = () => new WidgetDefinition('oh-rollershutter-item', 'Rollershutter List Item', 'Display rollershutter controls in a list')
  .paramGroup(ListItemParameterGroup(), ListItemParameters())
  .paramGroup(pg('orientation', 'Orientation'), [
    pb('vertical', 'Vertical', 'Vertical orientation')
  ])
  .paramGroup(pg('controls', 'Rollershutter Controls'), RollershutterParameters())

// OhSliderItem
import SliderParameters from '../system/slider.js'
export const OhSliderItemDefinition = () => new WidgetDefinition('oh-slider-item', 'Slider List Item', 'Display a slider control in a list')
  .paramGroup(ListItemParameterGroup(), ListItemParameters())
  .paramGroup(pg('slider', 'Slider'), SliderParameters())

// OhStepperItem
import StepperParameters from '../system/stepper.js'
export const OhStepperItemDefinition = () => new WidgetDefinition('oh-stepper-item', 'Stepper List Item', 'Display a stepper control in a list')
  .paramGroup(ListItemParameterGroup(), ListItemParameters())
  .paramGroup(pg('stepper', 'Stepper'), StepperParameters())

// OhToggleItem
import ToggleParameters from '../system/toggle.js'
export const OhToggleItemDefinition = () => new WidgetDefinition('oh-toggle-item', 'Toggle List Item', 'Display a toggle switch in a list')
  .paramGroup(ListItemParameterGroup(), ListItemParameters())
  .paramGroup(pg('toggle', 'Toggle'), ToggleParameters())
