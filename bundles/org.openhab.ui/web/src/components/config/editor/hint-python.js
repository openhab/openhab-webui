/* This code is adapted from https://github.com/mildsunrise/CodeMirror/blob/master/addon/hint/python-hint.js */

import CodeMirror from 'codemirror'

function forEach (arr, f) {
  for (var i = 0, e = arr.length; i < e; ++i) f(arr[i])
}

function arrayContains (arr, item) {
  if (!Array.prototype.indexOf) {
    var i = arr.length
    while (i--) {
      if (arr[i] === item) {
        return true
      }
    }
    return false
  }
  return arr.indexOf(item) !== -1
}

function scriptHint (editor, _keywords, getToken) {
  // Find the token at the cursor
  var cur = editor.getCursor(), token = getToken(editor, cur), tprop = token
  // If it's not a 'word-style' token, ignore the token.

  if (!/^[\w$_]*$/.test(token.string)) {
    token = tprop = { start: cur.ch,
      end: cur.ch,
      string: '',
      state: token.state,
      className: token.string === ':' ? 'python-type' : null }
  }

  let context
  if (!context) context = []
  context.push(tprop)

  var completionList = getCompletions(token, context)
  completionList = completionList.sort()
  // prevent autocomplete for last word, instead show dropdown with one word
  if (completionList.length === 1) {
    completionList.push(' ')
  }

  return { list: completionList,
    from: CodeMirror.Pos(cur.line, token.start),
    to: CodeMirror.Pos(cur.line, token.end) }
}

CodeMirror.pythonHint = function (editor) {
  const scriptHints = scriptHint(editor, pythonKeywordsU, function (e, cur) { return e.getTokenAt(cur) })
  const otherHints = CodeMirror.hint.anyword(editor)
  return {
    from: otherHints.from,
    to: otherHints.to,
    list: Array.from(new Set([...scriptHints.list, ...otherHints.list])).sort()
  }
}

export default CodeMirror.pythonHint

var pythonKeywords = 'and del from not while as elif global or with assert else if pass yield' +
'break except import print class exec in raise continue finally is return def for lambda try'
var pythonKeywordsL = pythonKeywords.split(' ')
var pythonKeywordsU = pythonKeywords.toUpperCase().split(' ')

var pythonBuiltins = 'abs divmod input open staticmethod all enumerate int ord str ' +
'any eval isinstance pow sum basestring execfile issubclass print super' +
'bin file iter property tuple bool filter len range type' +
'bytearray float list raw_input unichr callable format locals reduce unicode' +
'chr frozenset long reload vars classmethod getattr map repr xrange' +
'cmp globals max reversed zip compile hasattr memoryview round __import__' +
'complex hash min set apply delattr help next setattr buffer' +
'dict hex object slice coerce dir id oct sorted intern '
var pythonBuiltinsL = pythonBuiltins.split(' ').join('() ').split(' ')
var pythonBuiltinsU = pythonBuiltins.toUpperCase().split(' ').join('() ').split(' ')

function getCompletions (token, context) {
  var found = [], start = token.string
  function maybeAdd (str) {
    if (str.indexOf(start) === 0 && !arrayContains(found, str)) found.push(str)
  }

  function gatherCompletions (_obj) {
    forEach(pythonBuiltinsL, maybeAdd)
    forEach(pythonBuiltinsU, maybeAdd)
    forEach(pythonKeywordsL, maybeAdd)
    forEach(pythonKeywordsU, maybeAdd)
  }

  if (context) {
    // If this is a property, see if it belongs to some object we can
    // find in the current environment.
    var obj = context.pop(), base

    if (obj.type === 'variable') { base = obj.string } else if (obj.type === 'variable-3') { base = ':' + obj.string }

    while (base != null && context.length) { base = base[context.pop().string] }
    if (base != null) gatherCompletions(base)
  }
  return found
}
