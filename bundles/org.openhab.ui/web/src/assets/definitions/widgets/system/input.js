import { pb, pt } from '../helpers'

export default () => [
  pb('name', 'Name', 'Input name'),
  pt('type', 'Type', 'Type of input (see f7-input docs)'),
  pt('inputmode', 'Input Mode', 'Type of data that might be entered: see <a class="external text-color-blue" target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode">MDN docs</a>'),
  pt('placeholder', 'Placeholder', 'Placeholder text'),
  pb('clearButton', 'Clear button', 'Display input clear button'),
  pb('outline', 'Outline', 'Makes input outline'),
  pb('required', 'Required', 'Display an error message if left empty'),
  pt('item', 'Item', 'Link the input value to the state of this item'),
  pt('value', 'Value', 'Value when not found in item state or variable'),
  pt('variable', 'Variable', 'Name of the variable to set when the input changes')
]
