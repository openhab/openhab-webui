import { type CompletionContext } from '@codemirror/autocomplete'
import { Line } from '@codemirror/state'

export function lineIndent(line: Line, ignoreHyphen = false): number {
  const match = line.text.match(ignoreHyphen ? /^ +(?:- )?/ : /^ +/)
  if (match && match.length === 1) return match[0].length
  return 0
}

export function findParent(context: CompletionContext, line: Line | undefined, ignoreHyphen = false): Line | undefined {
  if (!line) return undefined
  // If the line is all blank, assume the current indent is at the cursor
  const currentIndent = line.text.match(/^\s*$/) ? context.pos - line.from : lineIndent(line, ignoreHyphen)
  for (let l = line.number - 1; l >= 1; l--) {
    line = context.state.doc.line(l)
    if (line.text.match(/^\s*$/)) continue // skip empty lines
    if (lineIndent(line, ignoreHyphen) < currentIndent) return line
  }
}

export function findParentRoot(context: CompletionContext, line: Line) {
  while (lineIndent(line) > 0 && line.number > 1) {
    line = context.state.doc.line(line.number - 1)
  }
  return line
}

export function findComponentType(context: CompletionContext, line: Line) {
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

export function isConfig(line: Line | undefined) {
  if (!line) return false
  return line.text.match(/^ *config(uration)?:/)
}

export function isSlots(line: Line | undefined) {
  if (!line) return false
  return line.text.match(/^ *slots:/)
}

export function isComponent(line: Line | undefined) {
  if (!line) return false
  return line.text.match(/^ *-? ?component:/)
}

export interface RootSection {
  type: string
  line: Line
}

export function findRootSection(context: CompletionContext, line: Line): RootSection | undefined {
  // Traverse up to find the root-level section
  let match: RegExpMatchArray | null = null
  for (let l = line.number; l > 0; l--) {
    const checkLine = context.state.doc.line(l)
    match = checkLine.text.match(/^(\w+):\s*$/)
    if (match && match.length === 2) {
      return { type: match[1], line: checkLine }
    }
  }
  return undefined
}
