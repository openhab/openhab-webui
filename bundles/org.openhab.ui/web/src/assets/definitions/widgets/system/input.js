import { pi, pb, pt } from '../helpers'

export default () => [
  pt('name', 'Name', 'Input name'),
  pt('type', 'Type', 'Type of input (see f7-input docs)'),
  pt('inputmode', 'Input Mode', 'Type of data that might be entered: see <a class="external text-color-blue" target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode">MDN docs</a>'),
  pt('placeholder', 'Placeholder', 'Placeholder text'),
  pb('sendButton', 'Send button', 'Display Send button to update the state with a command (needs a configured item)'),
  pb('clearButton', 'Clear button', 'Display input clear button when applicable'),
  pb('outline', 'Outline', 'Makes input outline'),
  pb('required', 'Required', 'Display an error message if left empty'),
  pb('validate', 'Validate', 'When enabled, input value will be validated based on input type'),
  pb('validate-on-blur', 'Validate on blur', 'Only validate when focus moves away from input field'),
  pi('item', 'Item', 'Link the input value to the state of this item'),
  pt('defaultValue', 'Default value', 'Default value when not found in item state or variable'),
  pt('variable', 'Variable', 'Name of the variable to set when the input changes')
]
