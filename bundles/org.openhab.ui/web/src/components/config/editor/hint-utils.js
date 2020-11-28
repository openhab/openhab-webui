import CodeMirror from 'codemirror'

export const cls = 'CodeMirror-Tern-'

function elt (tagname, cls /*, ... elts */) {
  var e = document.createElement(tagname)
  if (cls) e.className = cls
  for (var i = 2; i < arguments.length; ++i) {
    var elt = arguments[i]
    if (typeof elt === 'string') elt = document.createTextNode(elt)
    e.appendChild(elt)
  }
  return e
}

export function makeTooltip (x, y, content, cm) {
  var node = elt('div', cls + 'tooltip')
  node.innerHTML = content
  node.style.left = x + 'px'
  node.style.top = y + 'px'
  var container = ((cm.options || {}).hintOptions || {}).container || document.body
  container.appendChild(node)
  return node
}

export function remove (node) {
  var p = node && node.parentNode
  if (p) p.removeChild(node)
}

export function filterPartialCompletions (cm, line, completions, property = 'text') {
  const cursor = cm.getCursor()
  const lineBeforeCursor = line.substring(0, cursor.ch)
  const completionBeginPos = Math.max(lineBeforeCursor.lastIndexOf(' '), lineBeforeCursor.lastIndexOf('.'))
  const partialCompletion = lineBeforeCursor.substring(completionBeginPos + 1)
  return completions.filter((c) => c[property] && c[property].toLowerCase().indexOf(partialCompletion.toLowerCase()) >= 0)
}

export function addTooltipHandlers (cm, ret, retriggerHint) {
  let tooltip = null
  const cursor = cm.getCursor()

  if (!ret) return
  if (ret.tooltip) return
  if (!ret.from) ret.from = cursor
  if (!ret.to) ret.to = cursor
  ret.tooltip = true

  CodeMirror.on(ret, 'close', function () { remove(tooltip) })
  CodeMirror.on(ret, 'update', function () { remove(tooltip) })
  CodeMirror.on(ret, 'pick', function () {
    setTimeout(() => {
      cm.scrollIntoView(cm.getCursor())
      if (retriggerHint) CodeMirror.commands.autocomplete(cm)
    }, 100)
  })
  CodeMirror.on(ret, 'select', function (cur, node) {
    remove(tooltip)
    var content = cur.description
    if (content) {
      tooltip = makeTooltip(node.parentNode.getBoundingClientRect().right + window.pageXOffset,
        node.getBoundingClientRect().top + window.pageYOffset, content, cm)
      tooltip.className += ' ' + cls + 'hint-doc'
    }
  })
}

export function getTypeClasses (type) {
  return cls + 'completion ' + cls + 'completion-' + type
}

export function getClassNamesForParameter (param) {
  if (param.type === 'TEXT') return getTypeClasses('string')
  if (param.type === 'INTEGER') return getTypeClasses('number')
  if (param.type === 'BOOLEAN') return getTypeClasses('bool')
  return getTypeClasses('unknown')
}
