import { pi, pt } from '../helpers.js'

export default () => [
  pi('item', 'Item', 'Item to control'),
  pt(
    'color',
    'Color',
    'Color of the control (supported values: red, green, blue, pink, yellow, orange, purple, deeppurple, lightblue, teal, lime, deeporange, gray, white, black)'
  )
]
