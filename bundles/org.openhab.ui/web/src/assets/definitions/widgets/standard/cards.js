/* Definitions for the standard library's standalone (card) widgets */

import { WidgetDefinition, pb, pt, pi, pn, pg } from '../helpers.js'
import { actionGroup, actionParams } from '../actions.js'

export const CardParameterGroup = () => pg('card', 'Card', 'Parameters of the card')

export const CardParameters = () => [
  pt('title', 'Title', 'Title of the card'),
  pt('footer', 'Footer text', 'Footer of the card'),
  pb('noBorder', 'No Border', 'Do not render the card border').a(),
  pb('noShadow', 'No Shadow', 'Do not render a shadow effect to the card').a(),
  pb('outline', 'Outline', 'Show the card outline').a()
]

// OhLabelCard
import TrendParameters from '../system/trend.js'
export const OhLabelCardDefinition = () => new WidgetDefinition('oh-label-card', 'Label Card', 'Display the state of an item in a card')
  .paramGroup(CardParameterGroup(), CardParameters())
  .paramGroup(actionGroup(), actionParams())
  .paramGroup(actionGroup('Tap Hold', 'Action performed when tapping and holding card (or calling contextual menu on desktop)', 'taphold'), actionParams(null, 'taphold'), true)
  .paramGroup(pg('label', 'Label', 'Parameters of the label'), [
    pi('item', 'Item', 'Item to display'),
    pt('label', 'Label', 'Display this text (or expression result) instead of the item\'s state'),
    pt('background', 'Background style', 'Background style (in CSS "background" attribute format)'),
    pt('fontSize', 'Font Size', 'Font size (e.g. "34px")'),
    pt('fontWeight', 'Font Weight', 'Font weight (e.g. "normal" or "bold")'),
    pt('icon', 'Icon', 'Use <code>oh:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://www.openhab.org/link/icons">openHAB icon</a>), <code>f7:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://framework7.io/icons/">Framework7 icon</a>), <code>material:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://jossef.github.io/material-design-icons-iconfont/">Material icon</a>) or <code>iconify:iconSet:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://icon-sets.iconify.design">Iconify icon</a>, requires being online if not in cache)'),
    pt('iconColor', 'Icon Color', 'Not applicable to openHAB icons').a(),
    pn('iconSize', 'Icon Size', 'Size of the icon in px').a(),
    pb('iconUseState', 'Icon depends on state', 'Use the state of the Item to get a dynamic icon (enabled by default for all Item types except <code>Call</code>, <code>Image</code> & <code>Location</code>) (for openHAB icons only)').a(),
    pb('vertical', 'Vertical arrangement', 'Display label below icon')
  ])
  .paramGroup(pg('trend', 'Trend Line', 'Show a trend line in the background'), TrendParameters())

// OhListCard
import ListParameters from '../system/list.js'
export const OhListCardDefinition = () => new WidgetDefinition('oh-list-card', 'List Card', 'Display a list in a card')
  .paramGroup(CardParameterGroup(), CardParameters())
  .paramGroup(pg('list', 'List'), ListParameters())

// OhInputCard
import InputParameters from '../system/input.js'
export const OhInputCardDefinition = () => new WidgetDefinition('oh-input-card', 'Input Card', 'Display an input in a card')
  .paramGroup(CardParameterGroup(), CardParameters())
  .paramGroup(pg('input', 'Input'), InputParameters())

// OhColorpickerCard
import ColorPickerParameters from '../system/colorpicker.js'
export const OhColorpickerCardDefinition = () => new WidgetDefinition('oh-colorpicker-card', 'Color Picker Card', 'Display a color picker in a card')
  .paramGroup(CardParameterGroup(), CardParameters())
  .paramGroup(pg('colorpicker', 'Color picker'), ColorPickerParameters())

// OhPlayerCard
import PlayerParameters from '../system/player.js'
export const OhPlayerCardDefinition = () => new WidgetDefinition('oh-player-card', 'Player Card', 'Display player controls in a card')
  .paramGroup(CardParameterGroup(), CardParameters())
  .paramGroup(pg('player', 'Player Controls'), PlayerParameters())
  .paramGroup(pg('Current Track Info', 'Currently playing track information'), [
    pi('artistItem', 'Artist Item', 'Item holding the artist name'),
    pi('trackItem', 'Track Item', 'Item holding the track name')
  ])

// OhRollershutterCard
import RollershutterParameters from '../system/rollershutter.js'
export const OhRollershutterCardDefinition = () => new WidgetDefinition('oh-rollershutter-card', 'Rollershutter Card', 'Display rollershutter controls in a card')
  .paramGroup(CardParameterGroup(), CardParameters())
  .paramGroup(pg('orientation', 'Orientation'), [
    pb('vertical', 'Vertical', 'Vertical orientation')
  ])
  .paramGroup(pg('controls', 'Rollershutter Controls'), RollershutterParameters())

// OhSliderCard
import SliderParameters from '../system/slider.js'
export const OhSliderCardDefinition = () => new WidgetDefinition('oh-slider-card', 'Slider Card', 'Display a slider in a card to control an item')
  .paramGroup(CardParameterGroup(), CardParameters())
  .paramGroup(pg('slider', 'Slider'), SliderParameters())

// OhGaugeCard
import GaugeParameters from '../system/gauge.js'
export const OhGaugeCardDefinition = () => new WidgetDefinition('oh-gauge-card', 'Gauge Card', 'Display a read-only gauge in a card to visualize a quantifiable item')
  .paramGroup(CardParameterGroup(), CardParameters())
  .paramGroup(pg('gauge', 'Gauge', 'Parameters are passed to the underlying <a target="_blank" class="external text-color-blue" href="https://framework7.io/vue/gauge.html#gauge-properties">gauge</a>'), GaugeParameters())
  .paramGroup(actionGroup(null, 'Action to perform when the gauge is clicked'), actionParams())

// OhKnobCard
import KnobParameters from '../system/knob.js'
export const OhKnobCardDefinition = () => new WidgetDefinition('oh-knob-card', 'Knob & Rounded Slider Card', 'Display a knob or a rounded slider in a card to visualize and control a quantifiable item')
  .paramGroup(CardParameterGroup(), CardParameters())
  .paramGroup(pg('knob', 'Knob & Rounded Slider', 'Parameters are passed to the underlying <a target="_blank" class="external text-color-blue" href="https://github.com/soundar24/vue-round-slider#props">round-slider control</a>'), KnobParameters())

// OhStepperCard
import StepperParameters from '../system/stepper.js'
export const OhStepperCardDefinition = () => new WidgetDefinition('oh-stepper-card', 'Stepper Card', 'Display a stepper in a card to control an item')
  .paramGroup(CardParameterGroup(), CardParameters())
  .paramGroup(pg('stepper', 'Stepper'), StepperParameters())

// OhSwiperCard
import SwiperParameters from '../system/swiper.js'
export const OhSwiperCardDefinition = () => new WidgetDefinition('oh-swiper-card', 'Swiper Card', 'Display a swiper allowing to browse slides, in a card')
  .paramGroup(CardParameterGroup(), CardParameters())
  .paramGroup(pg('swiper', 'Swiper'), SwiperParameters())

// OhToggleCard
import ToggleParameters from '../system/toggle.js'
export const OhToggleCardDefinition = () => new WidgetDefinition('oh-toggle-card', 'Toggle Card', 'Display a toggle swtich in a card to send ON/OFF commands')
  .paramGroup(CardParameterGroup(), CardParameters())
  .paramGroup(pg('toggle', 'Toggle'), ToggleParameters())

// OhImageCard
import ImageParameters from '../system/image.js'
export const OhImageCardDefinition = () => new WidgetDefinition('oh-image-card', 'Image Card', 'Display an image (URL or Image item ) in a card')
  .paramGroup(CardParameterGroup(), CardParameters())
  .paramGroup(pg('image', 'Image'), ImageParameters())
  .paramGroup(actionGroup(null, 'Action to perform when the image is clicked'), actionParams())

// OhVideoCard
import VideoParameters from '../system/video.js'
export const OhVideoCardDefinition = () => new WidgetDefinition('oh-video-card', 'Video Card', 'Display a video (URL or URL from String item) in a card')
  .paramGroup(CardParameterGroup(), CardParameters())
  .paramGroup(pg('video', 'Video'), VideoParameters())

// OhWebFrameCard
import WebFrameParameters from '../system/webframe.js'
export const OhWebFrameCardDefinition = () => new WidgetDefinition('oh-webframe-card', 'Web Frame Card', 'Display a web page in a card')
  .paramGroup(CardParameterGroup(), [...CardParameters(),
    pb('borders', 'Borders', 'Show borders around the frame')
  ])
  .paramGroup(pg('webframe', 'Web Frame'), WebFrameParameters())

// OhClockCard
export const OhClockCardDefinition = () => new WidgetDefinition('oh-clock-card', 'Digital Clock Card', 'Display a digital clock in a card')
  .paramGroup(CardParameterGroup(), CardParameters())
  .paramGroup(pg('clock', 'Clock'), [
    pt('timeFormat', 'Time Format', 'Time format, see <a class="external text-color-blue" target="_blank" href="https://day.js.org/docs/en/display/format">dayjs docs</a>').o([
      { value: 'LTS', label: 'Localized time including seconds (\'LTS\', e.g. \'8:02:18 PM\')' },
      { value: 'LT', label: 'Localized time (\'LT\'. e.g. \'8:02 PM\')' },
      { value: 'HH:mm:ss', label: 'Current time (\'HH:mm:ss\')' }
    ], false),
    pt('background', 'Background style', 'Background style (in CSS "background" attribute format)'),
    pt('timeFontSize', 'Time Font Size', 'Time font size (e.g. "34px")'),
    pt('timeFontWeight', 'Time Font Weight', 'Time font weight (e.g. "normal" or "bold")'),
    pb('showDate', 'Show the date', 'Show the current date in addition to the time'),
    pt('dateFormat', 'Date Format', 'Date format, see <a class="external text-color-blue" target="_blank" href="https://day.js.org/docs/en/display/format">dayjs docs</a>').o([
      { value: 'LL', label: 'Localized long date (\'LL\', e.g. \'August 16, 2018\')' },
      { value: 'L', label: 'Localized short date (\'L\', e.g. \'08/16/2018\')' },
      { value: 'MM/DD/YYYY', label: 'Current date (\'MM/DD/YYYY\')' }
    ], false).v((value, configuration, configDescription, parameters) => {
      return configuration.showDate === true
    }),
    pt('datePos', 'Date Position', 'Where to show the date').o([
      { value: 'above', label: 'Above time' },
      { value: 'below', label: 'Below time' }
    ]).v((value, configuration, configDescription, parameters) => {
      return configuration.showDate === true
    }),
    pt('dateFontSize', 'Date Font Size', 'Date font size (e.g. "34px")')
      .v((value, configuration, configDescription, parameters) => {
        return configuration.showDate === true
      }),
    pt('dateFontWeight', 'Date Font Weight', 'Date font weight (e.g. "normal" or "bold")')
      .v((value, configuration, configDescription, parameters) => {
        return configuration.showDate === true
      })
  ])
  .paramGroup(actionGroup(null, 'Action to perform when the clock is clicked'), actionParams())

// OhSIPClientCard
import SIPClientParameters from '../system/sipclient.js'
export const OhSIPClientCardDefinition = () => new WidgetDefinition('oh-sipclient-card', 'SIP Client Card', 'SIP Client to start and answer SIP calls')
  .paramGroup(CardParameterGroup(), CardParameters())
  .paramGroup(pg('sip', 'SIP Settings'), SIPClientParameters())
