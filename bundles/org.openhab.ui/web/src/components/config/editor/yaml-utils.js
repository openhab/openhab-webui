export function lineIndent (line) {
  const match = line.text.match(/^ +/)
  if (match && match.length === 1) return match[0].length
  return 0
}

export function findParent (context, line) {
  // If the line is all blank, assume the current indent is at the cursor
  const currentIndent = line.text.match(/^\s*$/) ? context.pos - line.from : lineIndent(line)
  for (let l = line.number - 1; l >= 1; l--) {
    line = context.state.doc.line(l)
    if (line.text.match(/^\s*$/)) continue // skip empty lines
    if (lineIndent(line) < currentIndent) return line
  }
}

export function findParentRoot (context, line) {
  while (lineIndent(line) > 0 && line.number > 1) {
    line = context.state.doc.line(line.number - 1)
  }
  return line
}

export function findComponentType (context, line) {
  const currentIndent = lineIndent(line)
  for (let l = line.number - 1; l >= 1; l--) {
    line = context.state.doc.line(l)
    const indent = lineIndent(line)
    if (indent === 0 || indent < currentIndent) {
      const match = line.text.match(/component: (.*)$/)
      if (match && match.length === 2) return match[1]
    }
  }
}

export function isConfig (line) {
  if (!line) return false
  return line.text.match(/^ *config(uration)?:/)
}

export function isSlots (line) {
  if (!line) return false
  return line.text.match(/^ *slots:/)
}

export function isComponent (line) {
  if (!line) return false
  return line.text.match(/^ *-? ?component:/)
}

export function isRuleSection (line) {
  if (!line) return false
  return line.text.match(/^(triggers|conditions|actions|items):/)
}
