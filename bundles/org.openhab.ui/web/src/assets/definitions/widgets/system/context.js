import { pt, pb, pi, pn } from '../helpers.js'

export default () => [
  pt('functions', 'Widget Functions', 'Object with key:arrow-function pairs. Functions are available to expressions in all child components via the <code>fn</code> object.<br />Functions are evaluated on every call and re-evaluated when dependency values change.'),
  pt('constants', 'Widget Constants', 'Object with key:constant pairs. Constants are available to expressions in all child components via the <code>const</code> object.<br />Constants are evaluated only on widget build and cannot be changed.'),
  pt('variables', 'Widget Variables', 'Object with key:variable default value pairs. Variables are available to expressions in all child components via the <code>vars</code> object and take precedence over variables with the same name from higher contexts.<br />Variables are evaluated on widget build. Their values can only be changed by other component variable actions (e.g. <a class="external text-color-blue" target="_blank" href="https://www.openhab.org/docs/ui/components/oh-button.html#action-variable">oh-button</a>)')
]
