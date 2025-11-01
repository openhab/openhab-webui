import { pi, pb, pt, pd } from '../helpers.js'

export const ptType = pt('type', 'HTML Input Type',
  'HTML input type for different OpenHAB Item types.\
  <li><b>String:</b> text, textarea, texteditor, password, email, tel, url</li>\
  <li><b>DateTime:</b> date, datepicker, datetime-local</li>\
  <li><b>Number:</b> number</li>')

export default () => [
  pt('name', 'Name', 'Input name'),
  ptType,
  pt('inputmode', 'Input Mode', 'Type of data that might be entered (see <a class="external text-color-blue" target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode">MDN docs</a>)'),
  pt('placeholder', 'Placeholder', 'Placeholder text'),
  pb('sendButton', 'Send button', 'Display Send button to update the state with a command (needs a configured item)'),
  pb('clearButton', 'Clear button', 'Display input clear button when applicable'),
  pb('outline', 'Outline', 'Makes input outline'),
  pb('required', 'Required', 'Display an error message if left empty'),
  pb('validate', 'Validate', 'When enabled, input value will be validated based on input type'),
  pb('validate-on-blur', 'Validate on blur', 'Only validate when focus moves away from input field'),
  pi('item', 'Item', 'Link the input value to the state of this item'),
  pb('useDisplayState', 'Use Display State', 'Use the formatted state as the value for the input control'),
  pd('min', 'Minimum', 'Minimum allowed value when type set to number'),
  pd('max', 'Maximum', 'Maximum allowed value when type set to number'),
  pd('step', 'Step', 'Step value when type set to number, any if left empty'),
  pb('showTime', 'Show time', 'Display time when type set to datepicker'),
  pt('defaultValue', 'Default value', 'Default value when not found in item state or variable'),
  pt('variable', 'Variable', 'Name of the variable to set when the input changes'),
  pt('variableKey', 'Variable Key', 'Consider the variable value is an object and set the corresponding deep property within that object using a key syntax. Examples: <code>user.name</code>, <code>user[0].address[1].street</code>, <code>[0]</code>, <code>[0].label</code>. The inner property and its parent hierarchy will be created if missing.').a()
]
