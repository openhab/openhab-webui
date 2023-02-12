// definitions for the map page & markers

import { WidgetDefinition, pt, pb, pi, pg, pd } from '../helpers.js'
import { actionGroup, actionParams } from '../actions.js'

const LabelParam = () => pt('label', 'Label', 'The label on the marker')
const ItemParam = () => pi('item', 'Item', 'The Location item this marker will be centered on')
const LocationParam = () => pt('location', 'Fixed location', 'The fixed position of the marker if no item is configured or its coordinates are invalid').c('location')

export const OhMapPageDefinition = () => new WidgetDefinition('oh-map-page', 'Map page', 'Displays markers on a map')
  .params([
    pt('initialCenter', 'Initial Center', 'The center to use when no markers are present or have valid positions').c('location'),
    pt('initialZoom', 'Initial Zoom Level', 'The zoom level to use when no markers are present or have valid positions'),
    pb('noZoomOrDrag', 'Disable Zooming & Dragging', 'Disable the ability to zoom and drag'),
    pb('noZoomAnimation', 'No Zoom Animation', 'Change zoom levels without animation, can also avoid graphic glitches with persistent tooltips'),
    pb('noMarkerZoomAnimation', 'Hide Markers during Zoom Animation').a(),
    pt('tileLayerProvider', 'Provider for the background tiles', 'The provider of tiles to use for the background of the map. ' +
      'Use one from <a class="external text-color-blue" target="_blank" href="https://leaflet-extras.github.io/leaflet-providers/preview/">Leaflet Providers</a>, ' +
      'Some providers will not work until you set options, like access tokens, in the <code>tileLayerProviderOptions</code> parameter (in Code view). ' +
      'See <a class="external text-color-blue" target="_blank" href="https://github.com/leaflet-extras/leaflet-providers#providers-requiring-registration">here</a> for more info. ' +
      'The default is CartoDB, the variant depending on the dark mode setting.'),
    pt('overlayTileLayerProvider', 'Provider for the overlay tiles', 'The provider of tiles to use for the overlay layer above the background of the map. ' +
      'Use one from <a class="external text-color-blue" target="_blank" href="https://leaflet-extras.github.io/leaflet-providers/preview/">Leaflet Providers</a>, ' +
      'Some providers will not work until you set options, like access tokens, in the <code>overlayTileLayerProviderOptions</code> parameter (in Code view). ' +
      'See <a class="external text-color-blue" target="_blank" href="https://github.com/leaflet-extras/leaflet-providers#providers-requiring-registration">here</a> for more info. ')
  ])

export const OhMapMarkerDefinition = () => new WidgetDefinition('oh-map-marker', 'Map Marker', 'An icon on a map', 'map_pin')
  .paramGroup(pg('marker', 'Marker', 'General marker settings'), [
    LabelParam(),
    pt('icon', 'Icon', 'Use <code>oh:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://www.openhab.org/link/icons">openHAB icon</a>)')
  ])
  .paramGroup(pg('position', 'Position', 'Position'), [
    ItemParam(),
    LocationParam()
  ])
  .paramGroup(actionGroup(null, 'Action to perform when the marker is clicked'), actionParams())

export const OhMapCircleMarkerDefinition = () => new WidgetDefinition('oh-map-circle-marker', 'Circle Marker', 'A circle on a map, to represent a radius', 'map_pin_ellipse')
  .paramGroup(pg('marker', 'Marker', 'General marker settings'), [
    LabelParam(),
    pt('color', 'Circle color', 'The color of the circle (e.g. "blue", "red", "yellow"...)')
  ])
  .paramGroup(pg('position', 'Center Position'), [
    ItemParam(),
    LocationParam()
  ])
  .paramGroup(pg('radius', 'Radius', 'Radius of the circle'), [
    pi('radiusItem', 'Radius Item', 'The item whose state holds the radius of the circle, in meters'),
    pd('radius', 'Fixed radius', 'The fixed radius of the circle in meters if no item is configured or its state is invalid')
  ])
  .paramGroup(actionGroup(null, 'Action to perform when the circle is clicked'), actionParams())
