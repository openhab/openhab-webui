import { findParent } from './yaml-utils'
import { filterPartialCompletions, addTooltipHandlers } from './hint-utils'
import * as Types from '@/assets/item-types.js'
import Metadata from '@/assets/definitions/metadata/namespaces'
import api from '@/js/openhab/api'

const dimensions = []
let itemsCache = null

api.get('/rest/systeminfo/uom').then((data) => {
  data.uomInfo.dimensions.forEach((d) => {
    dimensions.push(d.dimension)
  })
})

function hintTypes (cm, line, types, position, regex) {
  if (!cm.state.$oh) return
  const cursor = cm.getCursor()
  const ret = {
    list: types.map((t) => {
      return {
        text: t,
        displayText: t,
        from: { line: cursor.line, ch: position },
        to: { line: cursor.line, ch: line.length }
      }
    })
  }
  ret.list = filterPartialCompletions(cm, line, ret.list, 'text', regex)
  addTooltipHandlers(cm, ret)
  return ret
}

function hintDimension (cm, line, position, regex) {
  if (!cm.state.$oh) return
  const cursor = cm.getCursor()
  const ret = {
    list: dimensions.map((t) => {
      return {
        text: t,
        displayText: t,
        from: { line: cursor.line, ch: position },
        to: { line: cursor.line, ch: line.length }
      }
    })
  }
  ret.list = filterPartialCompletions(cm, line, ret.list, 'text', regex)
  addTooltipHandlers(cm, ret)
  return ret
}

function hintItems (cm, line, onlyGroups) {
  if (!cm.state.$oh) return
  const cursor = cm.getCursor()
  const promise = (itemsCache) ? Promise.resolve(itemsCache) : cm.state.$oh.api.get('/rest/items')
  return promise.then((data) => {
    if (!itemsCache) itemsCache = data
    if (onlyGroups) {
      data = data.filter((item) => item.type === 'Group')
    }
    const ret = {
      list: data.map((item) => {
        return {
          text: '- ' + item.name,
          displayText: item.name,
          description: `${(item.label) ? item.label + ' ' : ''}(${item.type})<br />${item.state}`,
          from: { line: cursor.line, ch: 6 },
          to: { line: cursor.line, ch: line.length }
        }
      }).sort((i1, i2) => i1.text.localeCompare(i2.text))
    }
    ret.list = filterPartialCompletions(cm, line, ret.list)
    addTooltipHandlers(cm, ret)
    return ret
  })
}

function hintMetadata (cm, line) {
  if (!cm.state.$oh) return
  const cursor = cm.getCursor()
  const ret = {
    list: Metadata.map((m) => {
      return {
        text: m.name + ':\n        value: ""\n        config: {}',
        displayText: m.label,
        from: { line: cursor.line, ch: 6 },
        to: { line: cursor.line, ch: line.length }
      }
    })
  }
  ret.list = filterPartialCompletions(cm, line, ret.list)
  addTooltipHandlers(cm, ret)
  return ret
}

export default function hint (cm, option, mode) {
  const cursor = cm.getCursor()
  const line = cm.getLine(cursor.line)
  console.debug(`line: ${line}`)

  const parentLineNr = findParent(cm, cursor.line)
  const parentLine = cm.getLine(parentLineNr)
  console.debug(`parent line (${parentLineNr}): ${parentLine}`)

  let ret
  if (line && line.match(/^ {4}type:/)) {
    ret = hintTypes(cm, line, Types.ItemTypes, 10, /^ {4}type:/)
  } else if (line && line.match(/^ {4}dimension:/)) {
    ret = hintDimension(cm, line, 15, /^ {4}dimension:/)
  } else if (line && line.match(/^ {6}type:/)) { // Group type
    ret = hintTypes(cm, line, Types.GroupTypes, 12, /^ {6}type:/)
  } else if (line && line.match(/^ {6}dimension:/)) { // Group dimension
    ret = hintDimension(cm, line, 17, /^ {6}dimension:/)
  } else if (parentLine && parentLine.match(/^ {4}groups:/)) {
    ret = hintItems(cm, line, true)
    // } else if (parentLine && parentLine.match(/^ {4}metadata:/)) {
    // metadata isn't currently supported
    // ret = hintMetadata(cm, line)
  }

  if (!(ret instanceof Promise)) addTooltipHandlers(cm, ret)

  return ret
}
