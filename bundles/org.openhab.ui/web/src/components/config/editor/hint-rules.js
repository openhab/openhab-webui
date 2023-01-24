import { lineIndent, findParent, findParentRoot, isConfig, isRuleSection } from './yaml-utils'
import { filterPartialCompletions, addTooltipHandlers, getClassNamesForParameter } from './hint-utils'

let itemsCache = null

function getModuleTypes (cm, section) {
  if (cm.state['moduleTypes' + section]) return Promise.resolve(cm.state['moduleTypes' + section])
  return cm.state.$oh.api.get('/rest/module-types' + ((section) ? '?type=' + section : '')).then((data) => {
    cm.state['moduleTypes' + section] = data
    return data
  })
}

function hintItems (cm, line, replaceAfterColon, addStatePropertySuffix) {
  const cursor = cm.getCursor()
  if (!cm.state.$oh) return
  const promise = (itemsCache) ? Promise.resolve(itemsCache) : cm.state.$oh.api.get('/rest/items?cacheable=true')
  return promise.then((data) => {
    if (!itemsCache) itemsCache = data
    let ret = {
      list: data.map((item) => {
        return {
          text: item.name + ((addStatePropertySuffix ? '.state' : '')),
          displayText: item.name,
          description: `${(item.label) ? item.label + ' ' : ''}(${item.type})<br />${item.state}`
        }
      }).sort((i1, i2) => i1.text.localeCompare(i2.text))
    }
    ret.list = filterPartialCompletions(cm, line, ret.list)
    if (replaceAfterColon) {
      const colonPos = line.indexOf(':')
      ret.from = { line: cursor.line, ch: colonPos + 2 }
      ret.to = { line: cursor.line, ch: line.length }
    }
    addTooltipHandlers(cm, ret)
    return ret
  })
}

function hintOptions (cm, line, parameter) {
  const cursor = cm.getCursor()
  const colonPos = line.indexOf(':')
  let ret = {
    list: parameter.options.map((o) => {
      return {
        text: o.value,
        description: o.label || o.value
      }
    })
  }
  ret.list = filterPartialCompletions(cm, line, ret.list)
  ret.from = { line: cursor.line, ch: colonPos + 2 }
  ret.to = { line: cursor.line, ch: line.length }
  addTooltipHandlers(cm, ret)
  return ret
}

function findModuleType (cm) {
  // FIXME: this function will assume the module type will appear directly after
  // the configuration block, which will usually be the case but it's not guaranteed.
  // It doesn't parse the YAML properly.
  const cursor = cm.getCursor()
  for (let l = cursor.line + 1; l < cm.doc.size; l++) {
    const line = cm.getLine(l)
    if (line.match(/^ {4}type: /)) {
      return line.split(':')[1].trim()
    }
  }
}

function hintConfig (cm, line, parentLineNr) {
  const cursor = cm.getCursor()
  const moduleTypeUid = findModuleType(cm, cursor.line)
  console.debug(`hinting config for module type: ${moduleTypeUid}`)
  // const indent = lineIndent(cm, parentLineNr)
  if (!moduleTypeUid) return
  const sectionRootLineNr = findParentRoot(cm, parentLineNr)
  const sectionRootLine = cm.getLine(sectionRootLineNr)
  const section = sectionRootLine.replace('s:', '').trim()
  console.debug(`section: ${section}`)
  if (!section) return
  const colonPos = line.indexOf(':')
  const afterColon = colonPos > 0 && cursor.ch > colonPos
  return getModuleTypes(cm, section).then((moduleTypes) => {
    const moduleType = moduleTypes.find((m) => m.uid === moduleTypeUid)
    if (!moduleType) return null
    const parameters = moduleType.configDescriptions
    if (afterColon) {
      const parameterName = line.substring(0, colonPos).trim()
      const parameter = parameters.find((p) => p.name === parameterName)
      if (parameter) {
        if (parameter.type === 'BOOLEAN') {
          if (line.endsWith('true') || line.endsWith('false')) return
          return {
            list: [{ text: 'true' }, { text: 'false' }],
            from: { line: cursor.line, ch: colonPos + 2 },
            to: { line: cursor.line, ch: line.length }
          }
        } else if (parameter.context === 'item') {
          return hintItems(cm, line, true)
        } else if (parameter.options) {
          return hintOptions(cm, line, parameter)
        }
      }
    } else {
      console.debug(moduleType)
      let completions = parameters.map((p) => {
        return {
          text: p.name + ': ',
          displayText: p.name,
          description: p.description,
          className: getClassNamesForParameter(p)
        }
      })
      completions = filterPartialCompletions(cm, line, completions)
      let ret = {
        list: completions,
        from: { line: cursor.line, ch: 6 },
        to: { line: cursor.line, ch: line.length }
      }
      addTooltipHandlers(cm, ret, true)
      return ret
    }
  })
}

function buildModuleStructure (cm, moduleType) {
  let nextId = 1
  cm.doc.eachLine((l) => {
    console.debug(l.text)
    if (l.text.match(/^[ -]{4}id:/)) {
      const id = parseInt(l.text.split(':')[1].replace('"', '').trim())
      if (id >= nextId) nextId = id + 1
    }
  })
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

function hintModuleStructure (cm, line, parentLineNr) {
  const cursor = cm.getCursor()
  const section = cm.getLine(parentLineNr).replace('s:', '').trim()
  return getModuleTypes(cm, section).then((moduleTypes) => {
    let completions = moduleTypes.map((m) => {
      return {
        text: buildModuleStructure(cm, m),
        displayText: `${section}: ${m.label}`,
        description: m.uid
      }
    })
    let ret = {
      list: completions,
      from: { line: cursor.line, ch: 0 },
      to: { line: cursor.line, ch: cm.getLine(cursor.line).length }
    }
    ret.list = filterPartialCompletions(cm, line, ret.list)
    addTooltipHandlers(cm, ret)
    return ret
  })
}

export default function hint (cm, option, mode) {
  const cursor = cm.getCursor()
  const line = cm.getLine(cursor.line)

  const parentLineNr = findParent(cm, cursor.line)
  const parentLine = cm.getLine(parentLineNr)
  console.debug(`parent line (${parentLineNr}): ${parentLine}`)

  let ret
  if (parentLine && isConfig(parentLine)) {
    ret = hintConfig(cm, line, parentLineNr)
  } else if (isRuleSection(parentLine)) {
    ret = hintModuleStructure(cm, line, parentLineNr)
  }

  if (!(ret instanceof Promise)) addTooltipHandlers(cm, ret)

  return ret
}
