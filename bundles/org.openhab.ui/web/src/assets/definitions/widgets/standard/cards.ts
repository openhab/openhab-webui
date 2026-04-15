/* Definitions for the standard library's standalone (card) widgets */

import { WidgetDefinition, pb, pt, pi, pn, pg } from '../helpers.ts'
import { actionGroup, actionParams } from '../actions.ts'
import ClockParameters from '../system/clock.ts'

export const CardParameterGroup = () => pg('card', 'Card', 'Parameters of the card')

export const CardParameters = () => [
  pt('title', 'Title', 'Title of the card'),
  pt('footer', 'Footer text', 'Footer of the card'),
  pb('noBorder', 'No Border', 'Do not render the card border').a(),
  pb('noShadow', 'No Shadow', 'Do not render a shadow effect to the card').a(),
  pb('outline', 'Outline', 'Show the card outline').a()
]

// OhCard
export const OhCardDefinition = () =>
  new WidgetDefinition(
    'oh-card',
    'Card',
    'The basic structure of all card widgets, providing title and footer and requiring a content slot',
    undefined,
    true
  )
    .paramGroup(CardParameterGroup(), CardParameters())
    .paramGroup(actionGroup(), actionParams())
    .paramGroup(
      actionGroup('taphold', 'Tap Hold', 'Action performed when tapping and holding card (or calling contextual menu on desktop)'),
      actionParams('taphold'),
      true
    )

// OhLabelCard
import TrendParameters from '../system/trend.ts'
export const OhLabelCardDefinition = () =>
  new WidgetDefinition('oh-label-card', 'Label Card', 'Display the state of an item in a card')
    .paramGroup(CardParameterGroup(), CardParameters())
    .paramGroup(actionGroup(), actionParams())
    .paramGroup(
      actionGroup('taphold', 'Tap Hold', 'Action performed when tapping and holding card (or calling contextual menu on desktop)'),
      actionParams('taphold'),
      true
    )
    .paramGroup(pg('label', 'Label', 'Parameters of the label'), [
      pi('item', 'Item', 'Item to display'),
      pt('label', 'Label', "Display this text (or expression result) instead of the item's state"),
      pt('background', 'Background style', 'Background style (in CSS "background" attribute format)'),
      pt('fontSize', 'Font Size', 'Font size (e.g. "34px")'),
      pt('fontWeight', 'Font Weight', 'Font weight (e.g. "normal" or "bold")'),
      pt(
        'icon',
        'Icon',
        'Use <code>oh:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://www.openhab.org/link/icons">openHAB icon</a>), <code>f7:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://framework7.io/icons/">Framework7 icon</a>), <code>material:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://jossef.github.io/material-design-icons-iconfont/">Material icon</a>) or <code>iconify:iconSet:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://icon-sets.iconify.design">Iconify icon</a>, requires being online if not in cache)'
      ),
      pt('iconColor', 'Icon Color', 'Not applicable to openHAB icons').a(),
      pn('iconSize', 'Icon Size', 'Size of the icon in px').a(),
      pb(
        'iconUseState',
        'Icon depends on state',
        'Use the state of the Item to get a dynamic icon (enabled by default for <code>Contact</code>, <code>Dimmer</code>, <code>Rollershutter</code> & <code>Switch</code> Item types) (for openHAB icons only)'
      ),
      pb('vertical', 'Vertical arrangement', 'Display label below icon')
    ])
    .paramGroup(pg('trend', 'Trend Line', 'Show a trend line in the background'), TrendParameters())

// OhListCard
import ListParameters from '../system/list.ts'
export const OhListCardDefinition = () =>
  new WidgetDefinition('oh-list-card', 'List Card', 'Display a list in a card')
    .paramGroup(CardParameterGroup(), CardParameters())
    .paramGroup(pg('list', 'List'), ListParameters())

// OhInputCard
import InputParameters from '../system/input.ts'
export const OhInputCardDefinition = () =>
  new WidgetDefinition('oh-input-card', 'Input Card', 'Display an input in a card')
    .paramGroup(CardParameterGroup(), CardParameters())
    .paramGroup(pg('input', 'Input'), InputParameters())

// OhColorpickerCard
import ColorPickerParameters from '../system/colorpicker.ts'
export const OhColorpickerCardDefinition = () =>
  new WidgetDefinition('oh-colorpicker-card', 'Color Picker Card', 'Display a color picker in a card')
    .paramGroup(CardParameterGroup(), CardParameters())
    .paramGroup(pg('colorpicker', 'Color picker'), ColorPickerParameters())

// OhPlayerCard
import PlayerParameters from '../system/player.ts'
export const OhPlayerCardDefinition = () =>
  new WidgetDefinition('oh-player-card', 'Player Card', 'Display player controls in a card')
    .paramGroup(CardParameterGroup(), CardParameters())
    .paramGroup(pg('player', 'Player Controls'), PlayerParameters())
    .paramGroup(pg('Current Track Info', 'Currently playing track information'), [
      pi('artistItem', 'Artist Item', 'Item holding the artist name'),
      pi('trackItem', 'Track Item', 'Item holding the track name')
    ])

// OhRollershutterCard
import RollershutterParameters from '../system/rollershutter.ts'
export const OhRollershutterCardDefinition = () =>
  new WidgetDefinition('oh-rollershutter-card', 'Rollershutter Card', 'Display rollershutter controls in a card')
    .paramGroup(CardParameterGroup(), CardParameters())
    .paramGroup(pg('orientation', 'Orientation'), [pb('vertical', 'Vertical', 'Vertical orientation')])
    .paramGroup(pg('controls', 'Rollershutter Controls'), RollershutterParameters())

// OhSliderCard
import SliderParameters from '../system/slider.ts'
export const OhSliderCardDefinition = () =>
  new WidgetDefinition('oh-slider-card', 'Slider Card', 'Display a slider in a card to control an item')
    .paramGroup(CardParameterGroup(), CardParameters())
    .paramGroup(pg('slider', 'Slider'), SliderParameters())

// OhGaugeCard
import GaugeParameters from '../system/gauge.ts'
export const OhGaugeCardDefinition = () =>
  new WidgetDefinition('oh-gauge-card', 'Gauge Card', 'Display a read-only gauge in a card to visualize a quantifiable item')
    .paramGroup(CardParameterGroup(), CardParameters())
    .paramGroup(
      pg(
        'gauge',
        'Gauge',
        'Parameters are passed to the underlying <a target="_blank" class="external text-color-blue" href="https://framework7.io/vue/gauge.html#gauge-properties">gauge</a>'
      ),
      GaugeParameters()
    )
    .paramGroup(actionGroup(undefined, undefined, 'Action to perform when the gauge is clicked'), actionParams())

// OhKnobCard
import KnobParameters from '../system/knob.ts'
export const OhKnobCardDefinition = () =>
  new WidgetDefinition(
    'oh-knob-card',
    'Knob & Rounded Slider Card',
    'Display a knob or a rounded slider in a card to visualize and control a quantifiable item'
  )
    .paramGroup(CardParameterGroup(), CardParameters())
    .paramGroup(
      pg(
        'knob',
        'Knob & Rounded Slider',
        'Parameters are passed to the underlying <a target="_blank" class="external text-color-blue" href="https://github.com/Artem9989/vue-three-round-slider?tab=readme-ov-file#props">round-slider control</a>'
      ),
      KnobParameters()
    )

// OhStepperCard
import StepperParameters from '../system/stepper.ts'
export const OhStepperCardDefinition = () =>
  new WidgetDefinition('oh-stepper-card', 'Stepper Card', 'Display a stepper in a card to control an item')
    .paramGroup(CardParameterGroup(), CardParameters())
    .paramGroup(pg('stepper', 'Stepper'), StepperParameters())

// OhSwiperCard
import SwiperParameters from '../system/swiper.ts'
export const OhSwiperCardDefinition = () =>
  new WidgetDefinition('oh-swiper-card', 'Swiper Card', 'Display a swiper allowing to browse slides, in a card')
    .paramGroup(CardParameterGroup(), CardParameters())
    .paramGroup(pg('swiper', 'Swiper'), SwiperParameters())

// OhToggleCard
import ToggleParameters from '../system/toggle.ts'
export const OhToggleCardDefinition = () =>
  new WidgetDefinition('oh-toggle-card', 'Toggle Card', 'Display a toggle swtich in a card to send ON/OFF commands')
    .paramGroup(CardParameterGroup(), CardParameters())
    .paramGroup(pg('toggle', 'Toggle'), ToggleParameters())

// OhImageCard
import ImageParameters from '../system/image.ts'
export const OhImageCardDefinition = () =>
  new WidgetDefinition('oh-image-card', 'Image Card', 'Display an image (URL or Image item ) in a card')
    .paramGroup(CardParameterGroup(), CardParameters())
    .paramGroup(pg('image', 'Image'), ImageParameters())
    .paramGroup(actionGroup(undefined, undefined, 'Action to perform when the image is clicked'), actionParams())

// OhVideoCard
import VideoParameters from '../system/video.ts'
export const OhVideoCardDefinition = () =>
  new WidgetDefinition('oh-video-card', 'Video Card', 'Display a video (URL or URL from String item) in a card')
    .paramGroup(CardParameterGroup(), CardParameters())
    .paramGroup(pg('video', 'Video'), VideoParameters())

// OhWebFrameCard
import WebFrameParameters from '../system/webframe.ts'
export const OhWebFrameCardDefinition = () =>
  new WidgetDefinition('oh-webframe-card', 'Web Frame Card', 'Display a web page in a card')
    .paramGroup(CardParameterGroup(), [...CardParameters(), pb('borders', 'Borders', 'Show borders around the frame')])
    .paramGroup(pg('webframe', 'Web Frame'), WebFrameParameters())

// OhClockCard
export const OhClockCardDefinition = () =>
  new WidgetDefinition('oh-clock-card', 'Digital Clock Card', 'Display a digital clock in a card')
    .paramGroup(CardParameterGroup(), CardParameters())
    .paramGroup(pg('clock', 'Clock'), [
      ...ClockParameters(),
      pt('timeFontSize', 'Time Font Size', 'Time font size (e.g. "34px")'),
      pt('timeFontWeight', 'Time Font Weight', 'Time font weight (e.g. "normal" or "bold")'),
      pb('showDate', 'Show the date', 'Show the current date in addition to the time'),
      pt('datePos', 'Date Position', 'Where to show the date')
        .o([
          { value: 'above', label: 'Above time' },
          { value: 'below', label: 'Below time' }
        ])
        .v((value, configuration, configDescription, parameters) => {
          return configuration.showDate === true
        }),
      pt('dateFontSize', 'Date Font Size', 'Date font size (e.g. "34px")').v((value, configuration, configDescription, parameters) => {
        return configuration.showDate === true
      }),
      pt('dateFontWeight', 'Date Font Weight', 'Date font weight (e.g. "normal" or "bold")').v(
        (value, configuration, configDescription, parameters) => {
          return configuration.showDate === true
        }
      )
    ])
    .paramGroup(actionGroup(undefined, undefined, 'Action to perform when the clock is clicked'), actionParams())

// OhSIPClientCard
import SIPClientParameters from '../system/sipclient.ts'
export const OhSIPClientCardDefinition = () =>
  new WidgetDefinition('oh-sipclient-card', 'SIP Client Card', 'SIP Client to start and answer SIP calls')
    .paramGroup(CardParameterGroup(), CardParameters())
    .paramGroup(pg('sip', 'SIP Settings'), SIPClientParameters())
