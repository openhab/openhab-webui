import { pt, pi } from '../helpers.js'

export default () => [
  pi('item', 'Item', 'Item to control'),
  pt('modules', 'Modules', 'Modules to display').o([
    { value: 'wheel', label: 'Color wheel' }
  ], true, true)
]
