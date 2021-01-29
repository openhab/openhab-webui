# oh-rollershutter-item - Rollershutter List Item

Display rollershutter controls in a list

## Configuration


### List Item

General settings of the list item


- `title` <small>TEXT</small> _Title_

  Title of the item

- `subtitle` <small>TEXT</small> _Subtitle_

  Subtitle of the item

- `after` <small>TEXT</small> _After_

  Text to display on the opposite side of the item (set either this or a badge)

- `icon` <small>TEXT</small> _Icon_

  Use <code>oh:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://www.openhab.org/link/icons">openHAB icon</a>) or <code>f7:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://framework7.io/icons/">Framework7 icon</a>)

- `iconColor` <small>TEXT</small> _Icon Color_

  Not applicable to openHAB icons

- `iconUseState` <small>BOOLEAN</small> _Icon depends on state_

  Use the state of the item to get a dynamic icon (for openHAB icons only)

### Orientation


- `vertical` <small>BOOLEAN</small> _Vertical_

  Vertical orientation

### Rollershutter Controls


- `item` <small>TEXT</small> _Item_

  Rollershutter item to control

- `dirIconsStyle` <small>TEXT</small> _Direction Icons Style_

  Icons to use for the UP/DOWN buttons

- `stopIconStyle` <small>TEXT</small> _Stop Icon Style_

  Icons to use for the STOP button

- `stateInCenter` <small>BOOLEAN</small> _State in Center_

  Display state value inside the STOP button instead of icon


