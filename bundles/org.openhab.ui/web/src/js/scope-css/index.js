'use strict'

import { replace as escaperReplace, paste as escaperPaste } from 'escaper'
import slugify from 'slugify'

import stripComments from 'strip-css-comments'

export default scope
scope.replace = replace

function scope (css, parent, o) {
  if (!css) return css

  if (!parent) return css

  if (typeof o === 'string') o = { keyframes: o }
  if (!o) o = { keyframes: false }

  css = replace(css, parent + ' $1$2')

  //regexp.escape
  var parentRe = parent.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')

  //replace self-selectors
  css = css.replace(new RegExp('(' + parentRe + ')\\s*\\1(?=[\\s\\r\\n,{])', 'g'), '$1')

  //replace `:host` with parent
  css = css.replace(new RegExp('(' + parentRe + ')\\s*:host', 'g'), '$1')

  //revoke wrongly replaced @ statements, like @supports, @import, @media etc.
  css = css.replace(new RegExp('(' + parentRe + ')\\s*@', 'g'), '@')

  //revoke wrongly replaced :root blocks
  css = css.replace(new RegExp('(' + parentRe + ')\\s*:root', 'g'), ':root')

  //animations: prefix animation anmes
  var animations = [],
    animationNameRe = /@keyframes\s+([a-zA-Z0-9_-]+)\s*{/g,
    match
  while ((match = animationNameRe.exec(css)) !== null) {
    if (animations.indexOf(match[1]) < 0) animations.push(match[1])
  }

  var slug = slugify(parent)

  animations.forEach(function (name) {
    var newName =
      (o.keyframes === true ? slug + '-' : typeof o.keyframes === 'string' ? o.keyframes : '') +
      name
    css = css.replace(new RegExp('(@keyframes\\s+)' + name + '(\\s*{)', 'g'), '$1' + newName + '$2')
    css = css.replace(
      new RegExp('(animation(?:-name)?\\s*:[^;]*\\s*)' + name + '([\\s;}])', 'g'),
      '$1' + newName + '$2'
    )
  })
  //animation: revoke wrongly replaced keyframes
  css = css.replace(
    new RegExp(
      '(' +
        parentRe +
        ' )(\\s*(?:to|from|[+-]?(?:(?:\\.\\d+)|(?:\\d+(?:\\.\\d*)?))%))(?=[\\s\\r\\n,{])',
      'g'
    ),
    '$2'
  )

  return css
}

function replace (css, replacer) {
  var arr = []

  css = stripComments(css)

  // escape strings etc.
  css = escaperReplace(css, true, arr)

  css = css.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g, replacer)

  // insert comments, strings etc. back
  css = escaperPaste(css, arr)

  return css
}
