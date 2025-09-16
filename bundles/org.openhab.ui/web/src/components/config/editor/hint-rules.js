import { insertCompletionText } from '@codemirror/autocomplete'
import { findParent, findParentRoot, isConfig, isRuleSection } from './yaml-utils'
import { completionStart, hintBooleanValue, hintItems, hintParameterOptions, hintParameters } from './hint-utils'

let moduleTypesCache = null

function getModuleTypes (context, section) {
  if (moduleTypesCache) return Promise.resolve(moduleTypesCache)
  return context.view.$oh.api
    .get('/rest/module-types' + (section ? '?type=' + section : ''))
    .then((data) => {
      moduleTypesCache = data
      return data
    })
}

function findModuleType (context, line) {
  const parentLine = findParent(context, line)
  const grandParentLine = findParent(context, parentLine)
  for (let l = grandParentLine.number + 1; l <= context.state.doc.lines; l++) {
    const line = context.state.doc.line(l)
    if (line.text.match(/^ {4}type: /)) {
      return line.text.split(':')[1].trim()
    }
  }
}

function hintConfig (context, line, parentLine) {
  const cursor = context.pos - line.from
  const moduleTypeUid = findModuleType(context, line)
  console.debug(`hinting config for module type: ${moduleTypeUid}`)
  if (!moduleTypeUid) return

  const sectionRootLine = findParentRoot(context, parentLine)
  const section = sectionRootLine.text.replace('s:', '').trim()
  console.debug(`section: ${section}`)
  if (!section) return

  const colonPos = line.text.indexOf(':')
  const afterColon = colonPos > 0 && cursor > colonPos
  return getModuleTypes(context, section).then((moduleTypes) => {
    const moduleType = moduleTypes.find((m) => m.uid === moduleTypeUid)
    if (!moduleType) return null
    const parameters = moduleType.configDescriptions
    if (afterColon) {
      const parameterName = line.text.substring(0, colonPos).trim()
      const parameter = parameters.find((p) => p.name === parameterName)
      if (parameter) {
        if (parameter.type === 'BOOLEAN') {
          return hintBooleanValue(context, line, colonPos)
        } else if (parameter.context === 'item') {
          return hintItems(context, { replaceAfterColon: true })
        } else if (parameter.options) {
          return hintParameterOptions(context, parameter, colonPos)
        }
      }
    } else {
      console.debug(moduleType)
      return hintParameters(context, parameters, 6)
    }
  })
}

function getNextId (view) {
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

function buildModuleStructure (view, moduleType) {
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

function hintSceneItems (context) {
  console.info('hinting in the items section (scenes)')
  return hintItems(context, { indent: 2, suffix: ': ' })
}

function hintModuleStructure (context, line, parentLine) {
  const section = parentLine.text.replace('s:', '').trim()
  if (section === 'item') {
    if (!line.text.includes(':')) return hintSceneItems(context)
    return // todo: hint commands?
  }

  const apply = (view, completion, _from, _to) => {
    const insert = buildModuleStructure(view, completion.moduleType)
    view.dispatch(insertCompletionText(view.state, insert, line.from, line.to))
  }

  return getModuleTypes(context, section).then((moduleTypes) => {
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

export default function hint (context) {
  const line = context.state.doc.lineAt(context.pos)
  const parentLine = findParent(context, line)
  console.debug('parent line', parentLine)

  if (isConfig(parentLine)) {
    return hintConfig(context, line, parentLine)
  } else if (isRuleSection(parentLine)) {
    return hintModuleStructure(context, line, parentLine)
  }
}
