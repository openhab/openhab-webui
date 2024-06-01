import { pt, pb, pi, pn } from '../helpers.js'

export default () => [
  pt('functions', 'Widget Functions', 'Object with key:arrow-function pairs. Functions are available to expressions in all child components via the <code>fn</code> object.'),
  pt('constants', 'Widget Constants', 'Object with key:constant pairs. Constants are available to expressions in all child components via the <code>const</code> object.'),
  pt('variables', 'Widget Variables', 'Object with key:variable default value pairs. Variables are available to expressions in all child components via the <code>vars</code> object and take precedence over variables with the same name from higher contexts.')
]
