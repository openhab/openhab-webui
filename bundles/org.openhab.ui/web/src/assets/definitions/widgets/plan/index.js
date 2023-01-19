// definitions for the plan page & markers

import { WidgetDefinition, pt, pi, pg, pb, pn, po, pd } from '../helpers.js'
import { actionGroup, actionParams } from '../actions.js'

export const OhPlanPageDefinition = () => new WidgetDefinition('oh-plan-page', 'Floor plan', 'Displays markers on an image overlay')
  .params([
    pt('imageUrl', 'Image URL', 'The URL of the image to display as background').c('url'),
    pn('imageWidth', 'Image Width', 'The width of the image (by default 1000 pixels). Please specify if the image is not square to compute the aspect ratio'),
    pn('imageHeight', 'Image Height', 'The height of the image (by default 1000 pixels). Please specify if the image is not square to compute the aspect ratio'),
    pb('noZoomOrDrag', 'Disable Zooming & Dragging', 'Disable the ability to zoom and drag'),
    pb('noZoomAnimation', 'No Zoom Animation', 'Change zoom levels without animation, can also avoid graphic glitches with persistent tooltips'),
    pb('noMarkerZoomAnimation', 'Hide Markers during Zoom Animation').a(),
    po('backgroundColor', 'Background Color', 'Color outside the bounds of the image. "Black or White" means it will be black in dark mode and white in light mode', [
      { value: '', label: 'Default' },
      { value: 'white', label: 'Always White' },
      { value: 'black', label: 'Always Black' },
      { value: 'blackwhite', label: 'Black or White' }
    ]),
    pb('darkModeInvert', 'Invert Image in Dark Mode', 'Apply an invert filter to the image in dark mode - use with images in black & white or grayscale for best results'),
    po('tooltipColor', 'Tooltip Color', 'Color of the tooltip. "Black or White" means it will be black in dark mode and white in light mode', [
      { value: 'white', label: 'White' },
      { value: 'black', label: 'Black' },
      { value: 'blackwhite', label: 'Black or White' }
    ])
  ])

export const OhPlanMarkerDefinition = () => new WidgetDefinition('oh-plan-marker', 'Floor Plan Marker', 'A marker on a floor plan', 'map_pin')
  .paramGroup(pg('marker', 'Marker Settings'), [
    pt('name', 'Name', 'The name of the marker (for identification)'),
    pt('coords', 'Coordinates', 'The coordinates of this marker in the floor plan Coordinate Reference System; usually set by dragging the marker at design time').a(),
    pi('item', 'Item', 'The item whose state to display on this marker')
  ])
  .paramGroup(pg('icon', 'Icon', 'You can customize the styles further with CSS attributes in the <code>iconStyle</code> parameter (in YAML only)'), [
    pt('icon', 'Icon', 'Use <code>oh:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://www.openhab.org/link/icons">openHAB icon</a>), <code>f7:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://framework7.io/icons/">Framework7 icon</a>), <code>material:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://jossef.github.io/material-design-icons-iconfont/">Material icon</a>) or <code>iconify:iconSet:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://icon-sets.iconify.design">Iconify icon</a>, requires being online if not in cache)'),
    pb('iconUseState', 'Icon depends on state', 'Use the state of the item to get a dynamic icon (for openHAB icons only)'),
    pn('iconSize', 'Icon Size', 'Size of the icon in pixels (40 by default)'),
    pn('iconWidth', 'Icon Width', 'Width of the icon in pixels (for openHAB icons only, 40 by default)').a(),
    pn('iconHeight', 'Icon Height', 'Height of the icon in pixels (for openHAB icons only, 40 by default)').a(),
    pt('iconVisibility', 'Icon Visibility', 'Enter an expression to hide the icon conditionally or false to never display it'),
    pt('iconColor', 'Icon Color', 'Color of the icon (for Framework7/Material/certain Iconify icons); use expression for dynamic colors'),
    pn('iconRotation', 'Icon Rotation', 'Rotation of the icon in degrees')
  ])
  .paramGroup(pg('tooltip', 'Tooltip', 'You can customize the styles further with CSS attributes in the <code>tooltipStyle</code> parameter (in YAML only)'), [
    pt('tooltip', 'Tooltip Text', 'The tooltip text - leave blank to display the state of the item'),
    pb('tooltipPermanent', 'Always display the tooltip'),
    pb('useTooltipAsLabel', 'Use Tooltip as Label', 'Put the tooltip text directly over the plan instead of displaying an icon'),
    pt('tooltipFontSize', 'Tooltip Font Size', 'Font size of the tooltip text'),
    pt('tooltipColor', 'Tooltip color', 'Color of the tooltip'),
    po('tooltipDirection', 'Tooltip Direction', 'The direction of the tooltip', [
      { value: 'top', label: 'Top' },
      { value: 'bottom', label: 'Bottom' },
      { value: 'left', label: 'Left' },
      { value: 'right', label: 'Right' },
      { value: 'center', label: 'Center' },
      { value: 'auto', label: 'Auto' }
    ]),
    pn('tooltipOffsetX', 'Tooltip Offset X', 'The X offset of the tooltip from the marker in pixels').a(),
    pn('tooltipOffsetY', 'Tooltip Offset Y', 'The Y offset of the tooltip from the marker in pixels').a(),
    pd('tooltipOpacity', 'Tooltip Opacity', 'The opacity of the tooltip (0-1)').a()
  ])
  .paramGroup(pg('zoomVisibility', 'Zoom Visibility', 'Hide this marker outside certain zoom labels'), [
    pn('zoomVisibilityMin', 'Zoom Visibility Minimum', 'Visible only when zoomed to above this level (no limit if empty)').a(),
    pn('zoomVisibilityMax', 'Zoom Visibility Maximum', 'Visible only when zoomed to below this level (no limit if empty)').a()
  ])
  .paramGroup(actionGroup(null, 'Action to perform when the marker is clicked'), actionParams())
