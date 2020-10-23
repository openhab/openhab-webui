/* Definitions for the standard library's standalone (card) widgets */

import { WidgetDefinition, pb, pt, pi, pn, pg } from '../helpers'
import { actionGroup, actionParams } from '../actions'

export const CardParameterGroup = () => pg('card', 'Card', 'Parameters of the card')

export const CardParameters = () => [
  pt('title', 'Title', 'Title of the card'),
  pt('footer', 'Footer text', 'Footer of the card'),
  pb('noBorder', 'No Border', 'Do not render the card border').a(),
  pb('noShadow', 'No Shadow', 'Do not render a shadow effect to the card').a(),
  pb('outline', 'Outline', 'Show the card outline').a()
]

// OhLabelCard
import TrendParameters from '../system/trend'
export const OhLabelCardDefinition = () => new WidgetDefinition('oh-label-card', 'Label Card', 'Display the state of an item in a card')
  .paramGroup(CardParameterGroup(), CardParameters())
  .paramGroup(actionGroup(), actionParams())
  .paramGroup(pg('label', 'Label', 'Parameters of the label'), [
    pi('item', 'Item', 'Item to display'),
    pt('label', 'Label', 'Display this text (or expression result) instead of the item\'s state'),
    pt('background', 'Background style', 'Background style (in CSS "background" attribute format)'),
    pt('fontSize', 'Font Size', 'Font size (e.g. "34px")'),
    pt('fontWeight', 'Font Weight', 'Font weight (e.g. "normal" or "bold")'),
    pt('icon', 'Icon', 'Use <code>oh:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://www.openhab.org/docs/configuration/iconsets/classic/">openHAB icon</a>) or <code>f7:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://framework7.io/icons/">Framework7 icon</a>)'),
    pt('iconColor', 'Icon Color', 'Not applicable to openHAB icons'),
    pn('iconSize', 'Icon Size', 'Size of the icon in px'),
    pb('vertical', 'Vertical arrangement', 'Display label below icon')
  ])
  .paramGroup(pg('trend', 'Trend Line', 'Show a trend line in the background'), TrendParameters())

// OhListCard
import ListParameters from '../system/list'
export const OhListCardDefinition = () => new WidgetDefinition('oh-list-card', 'List Card', 'Display a list in a card')
  .paramGroup(CardParameterGroup(), CardParameters())
  .paramGroup(pg('list', 'List'), ListParameters())

// OhInputCard
import InputParameters from '../system/input'
export const OhInputCardDefinition = () => new WidgetDefinition('oh-input-card', 'Input Card', 'Display an input in a card')
  .paramGroup(CardParameterGroup(), CardParameters())
  .paramGroup(pg('input', 'Input'), InputParameters())

// OhColorpickerCard
import ColorPickerParameters from '../system/colorpicker'
export const OhColorpickerCardDefinition = () => new WidgetDefinition('oh-colorpicker-card', 'Color Picker Card', 'Display a color picker in a card')
  .paramGroup(CardParameterGroup(), CardParameters())
  .paramGroup(pg('colorpicker', 'Color picker'), ColorPickerParameters())

// OhPlayerCard
import PlayerParameters from '../system/player'
export const OhPlayerCardDefinition = () => new WidgetDefinition('oh-player-card', 'Player Card', 'Display player controls in a card')
  .paramGroup(CardParameterGroup(), CardParameters())
  .paramGroup(pg('player', 'Player Controls'), PlayerParameters())
  .paramGroup(pg('Current Track Info', 'Currently playing track information'), [
    pi('artistItem', 'Artist Item', 'Item holding the artist name'),
    pi('trackItem', 'Track Item', 'Item holding the track name')
  ])

// OhRollershutterCard
import RollershutterParameters from '../system/rollershutter'
export const OhRollershutterCardDefinition = () => new WidgetDefinition('oh-rollershutter-card', 'Rollershutter Card', 'Display rollershutter controls in a card')
  .paramGroup(CardParameterGroup(), CardParameters())
  .paramGroup(pg('orientation', 'Orientation'), [
    pb('vertical', 'Vertical', 'Vertical orientation')
  ])
  .paramGroup(pg('controls', 'Rollershutter Controls'), RollershutterParameters())

// OhSliderCard
import SliderParameters from '../system/slider'
export const OhSliderCardDefinition = () => new WidgetDefinition('oh-slider-card', 'Slider Card', 'Display a slider in a card to control an item')
  .paramGroup(CardParameterGroup(), CardParameters())
  .paramGroup(pg('slider', 'Slider'), SliderParameters())

// OhGaugeCard
import GaugeParameters from '../system/gauge'
export const OhGaugeCardDefinition = () => new WidgetDefinition('oh-gauge-card', 'Gauge Card', 'Display a read-only gauge in a card to visualize a quantifiable item')
  .paramGroup(CardParameterGroup(), CardParameters())
  .paramGroup(pg('gauge', 'Gauge', 'Parameters are passed to the underlying <a target="_blank" class="external text-color-blue" href="https://framework7.io/vue/gauge.html#gauge-properties">Gauge control</a>'), GaugeParameters())

// OhKnobCard
import KnobParameters from '../system/knob'
export const OhKnobCardDefinition = () => new WidgetDefinition('oh-knob-card', 'Knob Card', 'Display a knob in a card to visualize and control a quantifiable item')
  .paramGroup(CardParameterGroup(), CardParameters())
  .paramGroup(pg('knob', 'Knob', 'Parameters are passed to the underlying <a target="_blank" class="external text-color-blue" href="https://github.com/kramer99/vue-knob-control#properties">Knob control</a>'), KnobParameters())

// OhStepperCard
import StepperParameters from '../system/stepper'
export const OhStepperCardDefinition = () => new WidgetDefinition('oh-stepper-card', 'Stepper Card', 'Display a stepper in a card to control an item')
  .paramGroup(CardParameterGroup(), CardParameters())
  .paramGroup(pg('stepper', 'Stepper'), StepperParameters())

// OhSwiperCard
import SwiperParameters from '../system/swiper'
export const OhSwiperCardDefinition = () => new WidgetDefinition('oh-swiper-card', 'Swiper Card', 'Display a swiper allowing to browse slides, in a card')
  .paramGroup(CardParameterGroup(), CardParameters())
  .paramGroup(pg('swiper', 'Swiper'), SwiperParameters())

// OhToggleCard
import ToggleParameters from '../system/toggle'
export const OhToggleCardDefinition = () => new WidgetDefinition('oh-toggle-card', 'Toggle Card', 'Display a toggle swtich in a card to send ON/OFF commands')
  .paramGroup(CardParameterGroup(), CardParameters())
  .paramGroup(pg('toggle', 'Toggle'), ToggleParameters())

// OhImageCard
import ImageParameters from '../system/image'
export const OhImageCardDefinition = () => new WidgetDefinition('oh-image-card', 'Image Card', 'Display an image (URL or Image item ) in a card')
  .paramGroup(CardParameterGroup(), CardParameters())
  .paramGroup(pg('image', 'Image'), ImageParameters())
  .paramGroup(actionGroup(null, 'Action to perform when the image is clicked'), actionParams())
