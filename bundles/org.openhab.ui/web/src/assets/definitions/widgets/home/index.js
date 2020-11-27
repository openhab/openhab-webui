import { WidgetDefinition, pt, pi, pg, pb, pn, po } from '../helpers'
import { actionGroup, actionParams } from '../actions'

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

export const OhEquipmentCardParameters = () => new WidgetDefinition('oh-equipment-card', 'Equipment Class Card', 'A card showing model items belonging to a certain equipment class')
  .paramGroup(ModelCardParameterGroup(), ModelCardParameters())

export const OhPropertyCardParameters = () => new WidgetDefinition('oh-property-card', 'Property Card', 'A card showing model items related to a certain property')
  .paramGroup(ModelCardParameterGroup(), ModelCardParameters())
