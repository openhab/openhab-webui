// definitions for the map page & markers

import { WidgetDefinition, pt, pi, pg, pd } from '../helpers'
import { actionGroup, actionParams } from '../actions'

const LabelParam = () => pt('label', 'Label', 'The label on the marker')
const ItemParam = () => pi('item', 'Item', 'The Location item this marker will be centered on')
const LocationParam = () => pt('location', 'Fixed location', 'The fixed position of the marker if no item is configured or its coordinates are invalid').c('location')

export const OhMapMarkerDefinition = () => new WidgetDefinition('oh-map-marker', 'Map Marker', 'An icon on a map', 'map_pin')
  .paramGroup(pg('marker', 'Marker', 'General marker settings'), [
    LabelParam(),
    pt('icon', 'Icon', 'Use <code>oh:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://www.openhab.org/docs/configuration/iconsets/classic/">openHAB icon</a>)')
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
