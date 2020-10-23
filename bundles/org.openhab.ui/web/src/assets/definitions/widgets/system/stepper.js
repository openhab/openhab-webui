import { pi, pb, pn, pd } from '../helpers'

export default () => [
  pi('item', 'Item', 'Item to control'),
  pd('min', 'Min', 'Minimum value'),
  pd('max', 'Max', 'Maximum value'),
  pd('step', 'Step', 'Minimum interval between values'),
  pb('buttonsOnly', 'Buttons Only', 'Display the buttons without the value in the middle'),
  pb('small', 'Small', 'Smaller size'),
  pb('large', 'Large', 'Larger size'),
  pb('fill', 'Fill', 'Fill the buttons with the primary color'),
  pb('raised', 'Raised', 'Display the buttons with a raised style'),
  pb('round', 'Round', 'Display the buttons with a rounded style'),
  pb('autorepeat', 'Auto-repeat', 'Continue to increase/decrease the value while the buttons keep being pressed'),
  pb('autorepeatDynamic', 'Dynamic Auto-repeat', 'Speed up the increase/decrease over time while the buttons keep being pressed')
]
