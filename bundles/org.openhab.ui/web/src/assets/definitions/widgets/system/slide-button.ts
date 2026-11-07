import { pi, pt, pb, pn, po } from '../helpers.ts'

export default () => [
  pt('text', 'Text', 'Label displayed on the slide button'),
  po('orientation', 'Orientation', 'Direction of activation', [
    { value: 'right', label: 'Right' },
    { value: 'left', label: 'Left' },
    { value: 'up', label: 'Up' },
    { value: 'down', label: 'Down' }
  ]).d('right'),
  pn('thumbAspectRatio', 'Thumb Aspect Ratio', 'Ratio of thumb length to thickness (1 = circle, 1.5 = capsule)').d('1.5'),
  pb('latch', 'Latch', 'Enable bidirectional operation with a persistent thumb position'),
  pb('resetAction', 'Execute Reset Action', 'Execute the alternate action on automatic reset in momentary mode without state feedback'),
  pi('stateItem', 'State Item', 'Item providing state feedback'),
  pt('stateVariable', 'State Variable', 'Variable name providing state feedback (takes precedence over State Item)'),
  pt('stateOn', 'Active State', 'Item state representing the active position').d('ON'),
  pt('stateOff', 'Inactive State', 'Item state representing the inactive position').d('OFF'),
  pn('threshold', 'Threshold', 'Percentage of travel required to activate').d('80'),
  pn('resetDelay', 'Reset Delay', 'Time in milliseconds to wait for confirmation or reset in momentary mode').d('500'),
  pn('stateTimeout', 'State Timeout', 'Maximum time in milliseconds to wait for state confirmation (latching mode)').d('2000'),
  pt('actionVariableValueAlt', 'Alternate Variable Value', 'Variable value assigned when sliding to the inactive position'),
  pt('color', 'Color', 'Color of the control in the active state'),
  pt('colorOff', 'Off Color', 'Color of the control in the inactive state'),
  pt('colorDragging', 'Dragging Color', 'Color of the control while sliding'),
  pt('colorUnknown', 'Unknown Color', 'Color when the state is unknown')
]
