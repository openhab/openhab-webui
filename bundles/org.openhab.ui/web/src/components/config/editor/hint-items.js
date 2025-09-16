import { findParent } from './yaml-utils'
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

function hintItemTypes (cm, line) {
  if (!cm.state.$oh) return
  let ret = {
    list: Types.ItemTypes.map((t) => {
      return {
        text: t,
        displayText: t
      }
    })
  }
  // ret.list = filterPartialCompletions(cm, line, ret.list, 'text', /^type:( )?/)
  if (line.indexOf('Number:') !== -1) {
    ret.list = dimensions.map((t) => {
      return {
        text: t,
        displayText: t
      }
    })
    // ret.list = filterPartialCompletions(cm, line, ret.list, 'text', /^type: Number:/)
  }
  // addTooltipHandlers(cm, ret)
  return ret
}

function hintItems (cm, line, onlyGroups) {
  if (!cm.state.$oh) return
  const promise = itemsCache ? Promise.resolve(itemsCache) : cm.state.$oh.api.get('/rest/items')
  return promise.then((data) => {
    if (!itemsCache) itemsCache = data
    if (onlyGroups) {
      data = data.filter((item) => item.type === 'Group')
    }
    let ret = {
      list: data
        .map((item) => {
          return {
            text: item.name,
            displayText: item.name,
            description: `${item.label ? item.label + ' ' : ''}(${item.type})<br />${item.state}`
          }
        })
        .sort((i1, i2) => i1.text.localeCompare(i2.text))
    }
    // ret.list = filterPartialCompletions(cm, line, ret.list)
    // addTooltipHandlers(cm, ret)
    return ret
  })
}

function hintGroupTypes (cm, line) {
  if (!cm.state.$oh) return
  let ret = {
    list: Types.GroupTypes.map((t) => {
      return {
        text: t,
        displayText: t
      }
    })
  }
  // ret.list = filterPartialCompletions(cm, line, ret.list, 'text', /^groupType:( )?/)
  // addTooltipHandlers(cm, ret)
  return ret
}

function hintMetadata (cm, line) {
  if (!cm.state.$oh) return
  let ret = {
    list: Metadata.map((m) => {
      return {
        text: m.name + ':\n    value: ""\n    configuration: {}',
        displayText: m.label
      }
    })
  }
  // ret.list = filterPartialCompletions(cm, line, ret.list)
  // addTooltipHandlers(cm, ret)
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
  if (line && line.match(/^type:/)) {
    ret = hintItemTypes(cm, line)
  } else if (line && line.match(/^groupType:/)) {
    ret = hintGroupTypes(cm, line)
  } else if (parentLine && parentLine.match(/^groupNames:/)) {
    ret = hintItems(cm, line, true)
  } else if (parentLine && parentLine.match(/^metadata:/)) {
    ret = hintMetadata(cm, line)
  }

  // if (!(ret instanceof Promise)) addTooltipHandlers(cm, ret)

  return ret
}
