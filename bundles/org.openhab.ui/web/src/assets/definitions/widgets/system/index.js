import { WidgetDefinition, pt, pb } from '../helpers.js'
import { actionGroup, actionParams } from '../actions.js'

const VariableParameter = pt('variable', 'Variable', 'Name of the variable to set on input change')
const ClearVariableParameter = pb('clearVariable', 'Clear Variable After Action', 'Name of the variable to clear after performing the action')

import ButtonParameters from './button.js'
export const OhButtonDefinition = () => new WidgetDefinition('oh-button', 'Button', 'Button performing an action')
  .paramGroup(actionGroup(), actionParams())
  .paramGroup(actionGroup('Tap Hold', 'Action performed when tapping and holding card (or calling contextual menu on desktop)', 'taphold'), actionParams(null, 'taphold'), true)
  .params([...ButtonParameters(), VariableParameter, ClearVariableParameter])

import ChartParameters from './chart.js'
export const OhChartDefinition = () => new WidgetDefinition('oh-chart', 'Chart', 'Visualize series of data')
  .params(ChartParameters())

import ColorpickerParameters from './colorpicker.js'
export const OhColorpickerDefinition = () => new WidgetDefinition('oh-colorpicker', 'Colorpicker', 'Control to pick a color')
  .params(ColorpickerParameters())

import GaugeParameters from './gauge.js'
export const OhGaugeDefinition = () => new WidgetDefinition('oh-gauge', 'Gauge', 'Circular or semi-circular read-only gauge')
  .params(GaugeParameters())

import IconParameters from './icon.js'
export const OhIconDefinition = () => new WidgetDefinition('oh-icon', 'Icon', 'Display an openHAB icon')
  .paramGroup(actionGroup(), actionParams())
  .params(IconParameters())

import ImageParameters from './image.js'
export const OhImageDefinition = () => new WidgetDefinition('oh-image', 'Image', 'Displays an image from a URL or an item')
  .paramGroup(actionGroup(), actionParams())
  .params(ImageParameters())

import VideoParameters from './video.js'
export const OhVideoDefinition = () => new WidgetDefinition('oh-video', 'Video', 'Displays a video player from a URL or an item')
  .paramGroup(actionGroup(), actionParams())
  .params(VideoParameters())

import InputParameters from './input.js'
export const OhInputDefinition = () => new WidgetDefinition('oh-input', 'Input', 'Displays an input field, used to set a variable')
  .params(InputParameters())

import KnobParameters from './knob.js'
export const OhKnobDefinition = () => new WidgetDefinition('oh-knob', 'Knob', 'Knob control, allow to change a number value on a circular track')
  .params([...KnobParameters(), VariableParameter])

import LinkParameters from './link.js'
export const OhLinkDefinition = () => new WidgetDefinition('oh-link', 'Link', 'Link performing an action')
  .paramGroup(actionGroup(), actionParams())
  .params([...LinkParameters(), VariableParameter, ClearVariableParameter])

import ListParameters from './list.js'
export const OhListDefinition = () => new WidgetDefinition('oh-list', 'List', 'List control, hosts list items')
  .params(ListParameters())

import PlayerParameters from './player.js'
export const OhPlayerDefinition = () => new WidgetDefinition('oh-player', 'Media player', 'Media player controls, with previous track/pause/play/next buttons')
  .params(PlayerParameters())

import RollershutterParameters from './rollershutter.js'
export const OhRollershutterDefinition = () => new WidgetDefinition('oh-rollershutter', 'Rollershutter', 'Rollershutter control, with up/down/stop buttons')
  .params(RollershutterParameters())

import SliderParameters from './slider.js'
export const OhSliderDefinition = () => new WidgetDefinition('oh-slider', 'Slider', 'Slider control, allows to pick a number value on a scale')
  .params([...SliderParameters(), VariableParameter])

import StepperParameters from './stepper.js'
export const OhStepperDefinition = () => new WidgetDefinition('oh-stepper', 'Stepper', 'Stepper control, allows to input a number or decrement/increment it using buttons')
  .params([...StepperParameters(), VariableParameter])

import SwiperParameters from './swiper.js'
export const OhSwiperDefinition = () => new WidgetDefinition('oh-swiper', 'Swiper', 'Swiper control, allows to display multiple swipeable slides')
  .params(SwiperParameters())

import ToggleParameters from './toggle.js'
export const OhToggleDefinition = () => new WidgetDefinition('oh-toggle', 'Toggle', 'Toggle control, allows to switch on or off')
  .params([...ToggleParameters(), VariableParameter])

import TrendParameters from './trend.js'
export const OhTrendDefinition = () => new WidgetDefinition('oh-trend', 'Trend line', 'Trend line to display the overall recent evoluation of an item')
  .params(TrendParameters())

import WebFrameParameters from './webframe.js'
export const OhWebFrameDefinition = () => new WidgetDefinition('oh-webframe', 'Web frame', 'Displays a web page in a frame')
  .params(WebFrameParameters())

import RepeaterParameters from './repeater.js'
export const OhRepeaterDefinition = () => new WidgetDefinition('oh-repeater', 'Repeater', 'Iterate over an array and repeat the children components in the default slot')
  .params(RepeaterParameters())

import ClockParameters from './clock.js'
export const OhClockDefinition = () => new WidgetDefinition('oh-clock', 'Digital Clock', 'Display a digital clock')
  .params(ClockParameters())
