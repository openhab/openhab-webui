// Standard visibility settings

import { pg, pt } from './helpers.js'

export const VisibilityGroup = () => pg('visibility', 'Visibility Options')

export const VisibilityParameters = () => [
  pt('visible', 'Visible', 'Enter an expression to hide the widget conditionally or false to never display it').g('visibility'),
  pt(
    'visibleTo',
    'Visible only to',
    'Role(s) this widget will be visible to (in the code view you can restrict to specific users with the <code>user:userid</code> syntax).' +
      '<br/><strong>PLEASE NOTE: this should NOT be considered a security feature! Items can still be controlled by other means.</strong>'
  )
    .g('visibility')
    .o(
      [
        { value: 'role:administrator', label: 'Administrators' },
        { value: 'role:user', label: 'Users' }
      ],
      true,
      true
    ) // limit to options because we don't have a working control for autocompleting a multiple text param
]
