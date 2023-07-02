export function lineIndent (cm, linenr) {
  const line = cm.getLine(linenr)
  const match = line.match(/^ +/)
  if (match && match.length === 1) return match[0].length
  return 0
}

export function findParent (cm, linenr) {
  const currentIndent = lineIndent(cm, linenr)
  for (let l = linenr; l >= 0; l--) {
    if (lineIndent(cm, l) < currentIndent) return l
  }
}

export function findParentRoot (cm, linenr) {
  for (let l = linenr; l >= 0; l--) {
    if (lineIndent(cm, l) === 0) return l
  }
}

export function findComponentType (cm, linenr) {
  const currentIndent = lineIndent(cm, linenr)
  for (let l = linenr - 1; l >= 0; l--) {
    const line = cm.getLine(l)
    const indent = lineIndent(cm, l)
    if (indent === 0 || indent < currentIndent) {
      const match = line.match(/component: (.*)$/)
      if (match && match.length === 2) return match[1]
    }
  }
}

export function isConfig (line) {
  if (!line) return false
  return line.match(/^ *config(uration)?:/)
}

export function isSlots (line) {
  if (!line) return false
  return line.match(/^ *slots:/)
}

export function isComponent (line) {
  if (!line) return false
  return line.match(/^ *-? ?component:/)
}

export function isRuleSection (line) {
  if (!line) return false
  return line.match(/^(triggers|conditions|actions|items):/)
}

export function isChannelsSection (line) {
  if (!line) return false
  return line.match(/^channels:/)
}
