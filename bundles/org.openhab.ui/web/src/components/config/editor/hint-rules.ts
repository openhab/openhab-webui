import { CompletionContext, insertCompletionText, type Completion, type CompletionResult } from '@codemirror/autocomplete'
import { findParent, findParentRoot, isConfig, isRuleSection } from './yaml-utils'
import { completionStart, hintItems, hintParameterValues, hintParameters } from './hint-utils'
import type { Line } from '@codemirror/state'
import type { EditorView } from '@codemirror/view'

import * as api from '@/api'

let moduleTypesCache : api.ModuleType[] | null = null

async function getModuleTypes(section : string) {
  if (moduleTypesCache) return moduleTypesCache
  
  const result = await api.getModuleTypes({ type: section })

  if (result) {
    moduleTypesCache = result
    return moduleTypesCache
  }

  return []
}

function findModuleType(context: CompletionContext, line: Line) {
  const parentLine = findParent(context, line)
  const grandParentLine = findParent(context, parentLine)
  for (let l = grandParentLine.number + 1; l <= context.state.doc.lines; l++) {
    const line = context.state.doc.line(l)
    if (line.text.match(/^ {4}type: /)) {
      return line.text.split(':')[1].trim()
    }
  }
}

function hintConfig(context: CompletionContext, line: Line, parentLine: Line) : CompletionResult | Promise<CompletionResult> | null {
  const cursor = context.pos - line.from
  const moduleTypeUid = findModuleType(context, line)
  console.debug(`hinting config for module type: ${moduleTypeUid}`)
  if (!moduleTypeUid) return null

  const sectionRootLine = findParentRoot(context, parentLine)
  const section = sectionRootLine.text.replace('s:', '').trim()
  console.debug(`section: ${section}`)
  if (!section) return null

  const colonPos = line.text.indexOf(':')
  const afterColon = colonPos > 0 && cursor > colonPos
  return getModuleTypes(section).then((moduleTypes) => {
    const moduleType = moduleTypes.find((m) => m.uid === moduleTypeUid)
    if (!moduleType) return null
    const parameters = moduleType.configDescriptions
    if (afterColon) {
      return hintParameterValues(context, parameters, line, colonPos)
    }
    console.debug(moduleType)
    return hintParameters(context, parameters, 6)
  })
}

function getNextId(view: EditorView) {
  let nextId = 1
  const lineIterator = view.state.doc.iterLines()
  while (!lineIterator.next().done) {
    const line = lineIterator.value
    if (line.match(/^[ -]{4}id: /)) {
      const id = parseInt(line.split(':')[1].replace('"', '').trim())
      if (id >= nextId) nextId = id + 1
    }
  }
  return nextId
}

function buildModuleStructure(view: EditorView, moduleType : api.ModuleType) {
  const nextId = getNextId(view)
  let ret = `  - inputs: {}\n    id: "${nextId}"\n`
  if (moduleType.configDescriptions.some((p) => p.required)) {
    ret += '    configuration:\n'
    for (const configDescription of moduleType.configDescriptions.filter((m) => m.required)) {
      ret += '      ' + configDescription.name + ': \n'
    }
  }
  ret += '    type: ' + moduleType.uid + '\n  '
  return ret
}

function hintSceneItems(context: CompletionContext) {
  console.info('hinting in the items section (scenes)')
  return hintItems(context, { indent: 2, suffix: ': ' })
}

function hintModuleStructure(context: CompletionContext, line: Line, parentLine: Line) {
  const section = parentLine.text.replace('s:', '').trim()
  if (section === 'item') {
    if (!line.text.includes(':')) return hintSceneItems(context)
    return // todo: hint commands?
  }

  const apply = (view: EditorView, completion: Completion, _from: number, _to: number) => {
    const insert = buildModuleStructure(view, completion.moduleType)
    view.dispatch(insertCompletionText(view.state, insert, line.from, line.to))
  }

  return getModuleTypes(section).then((moduleTypes) => {
    return {
      from: completionStart(context),
      validFor: /\w+/,
      options: moduleTypes.map((m) => {
        return {
          label: `${section}: ${m.label}`,
          info: m.uid,
          moduleType: m,
          apply
        }
      })
    }
  })
}

export default function hint(context: CompletionContext) : CompletionResult | Promise<CompletionResult> | null {
  const line = context.state.doc.lineAt(context.pos)
  const parentLine = findParent(context, line)
  console.debug('parent line', parentLine)

  if (!parentLine) return null

  if (isConfig(parentLine)) {
    return hintConfig(context, line, parentLine)
  } else if (isRuleSection(parentLine)) {
    return hintModuleStructure(context, line, parentLine)
  }
  return null
}
