import { WidgetDefinition, pt, pi, pg, pb, pn, po } from '../helpers.js'
import { actionGroup, actionParams } from '../actions.js'

export const OhHomePageDefinition = () => new WidgetDefinition('oh-home-page', 'Home page')
  .params([
    pt('displayModelCardsTo', 'Display model cards to', 'Restrict who sees the Locations/Equipment/Properties tabs with the model cards')
      .o([
        { value: 'role:administrator', label: 'Administrators' },
        { value: 'role:user', label: 'Users' }
      ]).m(),
    pt('allowChatInputTo', 'Allow chat input box to', 'Restrict who can interact with the chatbot input box on the top of the Overview tab (when available)')
      .o([
        { value: 'role:administrator', label: 'Administrators' },
        { value: 'role:user', label: 'Users' }
      ]).m(),
    pt('hiddenModelTabs', 'Hidden Model Tabs', 'Hide individual model exploring tabs from view')
      .o([
        { value: 'locations', label: 'Locations' },
        { value: 'equipment', label: 'Equipment' },
        { value: 'properties', label: 'Properties' }
      ]).m()
  ])

const ModelCardParameterGroup = () => pg('card', 'Model Card', 'General settings for this card')

const ModelCardParameters = () => [
  pt('title', 'Title', 'Title of the card'),
  pt('subtitle', 'Subtitle', 'Subtitle of the card'),
  pt('backgroundColor', 'Background Color', 'Color of the card\'s background; if unset, choose automatically from built-in defaults for certain semantic classes')
    .o([
      { value: 'red', label: 'Red' },
      { value: 'green', label: 'Green' },
      { value: 'blue', label: 'Blue' },
      { value: 'pink', label: 'Pink' },
      { value: 'yellow', label: 'Yellow' },
      { color: 'orange', label: 'Orange' },
      { value: 'purple', label: 'Purple' },
      { value: 'deeppurple', label: 'Deep Purple' },
      { value: 'lightblue', label: 'Light Blue' },
      { value: 'teal', label: 'Teal' },
      { value: 'lime', label: 'Lime' },
      { value: 'deeporange', label: 'Deep Orange' },
      { value: 'gray', label: 'Gray' },
      { value: 'black', label: 'Black' }
    ]),
  pt('backgroundImage', 'Background Image', 'URL of an image to display in the background'),
  pb('invertText', 'Invert Text', 'Display the text in black (for light backgrounds)')
]

export const OhLocationCardParameters = () => new WidgetDefinition('oh-location-card', 'Location Card', 'A card showing model items in a certain location')
  .paramGroup(ModelCardParameterGroup(), ModelCardParameters())
  .paramGroup(pg('glance', 'Card at-a-glance badges'), [
    pb('disableBadges', 'Disable badges', 'Do not examine items to display badges - can help with performance if you don\'t need them.'),
    pt('badges', 'Enabled badges', 'Select the badges you wish to show in the header of the card. Display all if none are selected.')
      .o([
        { value: 'battery', label: 'Low Battery Warning' },
        { value: 'lights', label: 'Lights On' },
        { value: 'windows', label: 'Open Windows' },
        { value: 'doors', label: 'Open Doors' },
        { value: 'garagedoors', label: 'Open Garage Doors' },
        { value: 'blinds', label: 'Open Blinds' },
        { value: 'presence', label: 'Presence Detected' },
        { value: 'lock', label: 'Locks' },
        { value: 'climate', label: 'Climate Control Powered On' },
        { value: 'screens', label: 'Screens Powered On' },
        { value: 'projectors', label: 'Projectors Powered On' },
        { value: 'speakers', label: 'Speakers/AV Receivers Powered On' },
        { value: 'temperature', label: 'Average Temperature (+ Setpoint)' },
        { value: 'humidity', label: 'Average Humidity' },
        { value: 'luminance', label: 'Average Luminance' }
      ], true, true)
  ])

export const OhEquipmentCardParameters = () => new WidgetDefinition('oh-equipment-card', 'Equipment Class Card', 'A card showing model items belonging to a certain equipment class')
  .paramGroup(ModelCardParameterGroup(), ModelCardParameters())

export const OhPropertyCardParameters = () => new WidgetDefinition('oh-property-card', 'Property Card', 'A card showing model items related to a certain property')
  .paramGroup(ModelCardParameterGroup(), ModelCardParameters())
