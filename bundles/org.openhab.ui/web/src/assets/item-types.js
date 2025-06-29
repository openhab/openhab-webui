const SharedTypes = ['Call', 'Color', 'Contact', 'DateTime', 'Dimmer', 'Image', 'Location', 'MediaBrowser', 'Number', 'Player', 'Rollershutter', 'String', 'Switch']

export const ItemTypes = SharedTypes.concat(['Group'])
export const GroupTypes = ['None'].concat(SharedTypes)

export const CommonFunctions = [{
  name: '',
  value: 'None'
}]

export const ArithmeticFunctions = [{
  name: 'AVG',
  value: 'AVG'
}, {
  name: 'MEDIAN',
  value: 'MEDIAN'
}, {
  name: 'MAX',
  value: 'MAX'
}, {
  name: 'MIN',
  value: 'MIN'
}, {
  name: 'SUM',
  value: 'SUM'
}, {
  name: 'COUNT',
  value: 'COUNT'
}]

export const LogicalOnOffFunctions = [{
  name: 'AND_ON_OFF',
  value: 'All ON then ON else OFF'
}, {
  name: 'NAND_ON_OFF',
  value: 'All ON then OFF else ON'
}, {
  name: 'AND_OFF_ON',
  value: 'All OFF then OFF else ON'
}, {
  name: 'NAND_OFF_ON',
  value: 'All OFF then ON else OFF'
}, {
  name: 'OR_ON_OFF',
  value: 'One ON then ON else OFF'
}, {
  name: 'NOR_ON_OFF',
  value: 'One ON then OFF else ON'
}, {
  name: 'OR_OFF_ON',
  value: 'One OFF then OFF else ON'
}, {
  name: 'NOR_OFF_ON',
  value: 'One OFF then ON else OFF'
}]

export const LogicalOpenClosedFunctions = [{
  name: 'AND_OPEN_CLOSED',
  value: 'All OPEN then OPEN else CLOSED'
}, {
  name: 'NAND_OPEN_CLOSED',
  value: 'All OPEN then CLOSED else OPEN'
}, {
  name: 'AND_CLOSED_OPEN',
  value: 'All CLOSED then CLOSED else OPEN'
}, {
  name: 'NAND_CLOSED_OPEN',
  value: 'All CLOSED then OPEN else CLOSED'
}, {
  name: 'OR_OPEN_CLOSED',
  value: 'One OPEN then OPEN else CLOSED'
}, {
  name: 'NOR_OPEN_CLOSED',
  value: 'One OPEN then CLOSED else OPEN'
}, {
  name: 'OR_CLOSED_OPEN',
  value: 'One CLOSED then CLOSED else OPEN'
}, {
  name: 'NOR_CLOSED_OPEN',
  value: 'One CLOSED then OPEN else CLOSED'
}]

export const LogicalMediaBrowserFunctions = [{
  name: 'AND_PLAY_PAUSE',
  value: 'All PLAY then PLAY else PAUSE'
}, {
  name: 'AND_PAUSE_PLAY',
  value: 'All PAUSE then PAUSE else PLAY'
}, {
  name: 'OR_PLAY_PAUSE',
  value: 'One PLAY then PLAY else PAUSE'
}, {
  name: 'OR_PAUSE_PLAY',
  value: 'One PAUSE then PAUSE else PLAY'
}]

export const LogicalPlayPauseFunctions = [{
  name: 'AND_PLAY_PAUSE',
  value: 'All PLAY then PLAY else PAUSE'
}, {
  name: 'AND_PAUSE_PLAY',
  value: 'All PAUSE then PAUSE else PLAY'
}, {
  name: 'OR_PLAY_PAUSE',
  value: 'One PLAY then PLAY else PAUSE'
}, {
  name: 'OR_PAUSE_PLAY',
  value: 'One PAUSE then PAUSE else PLAY'
}]

export const DateTimeFunctions = [{
  name: 'EARLIEST',
  value: 'EARLIEST'
}, {
  name: 'LATEST',
  value: 'LATEST'
}]
