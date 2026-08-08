import { pt, pb, pi, pn } from '../helpers.ts'

export default () => [
  pt(
    'functions',
    'Widget Functions',
    'Object with key:arrow-function pairs. Functions are available to expressions in all child components via the <code>fn</code> object.<br />Functions are evaluated on every call and re-evaluated when dependency values change.'
  ),
  pt(
    'constants',
    'Widget Constants',
    'Object with key:constant pairs. Constants are available to expressions in all child components via the <code>const</code> object.<br />Constants are evaluated before the widget is displayed and cannot be changed. If an initial item state dependency is not available yet, constants are re-evaluated once when the missing item state arrives.'
  ),
  pt(
    'variables',
    'Widget Variables',
    'Object with key:variable default value pairs. Variables are available to expressions in all child components via the <code>vars</code> object and take precedence over variables with the same name from higher contexts.<br />Variables are evaluated before the widget is displayed. If an initial item state dependency is not available yet, variable defaults are re-evaluated once when the missing item state arrives. Their values can later be changed by component variable actions (e.g. <a class="external text-color-blue" target="_blank" href="https://www.openhab.org/docs/ui/components/oh-button.html#action-variable">oh-button</a>).'
  )
]
