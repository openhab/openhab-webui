import { pb, pi, pt } from '../helpers.ts'

export default () => [
  pi('item', 'Item', 'Item to display or update'),
  pb('readOnly', 'Read Only', 'Prevent editing and command sending'),
  pb('showToolbar', 'Show Toolbar', 'Display the validation summary and action buttons'),
  pb('sendButton', 'Show Save Button', 'Display a button to send the edited JSON as a command to the item'),
  pt('height', 'Editor Height', 'CSS height for the editor area, for example 320px or 40vh').d('320px')
]
