import { lineIndent, findParent, isConfig, isChannelsSection } from './yaml-utils'
import { getCompletionType } from './hint-utils'

// TODO-V3.1 clean up commented out code

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
  // ret.list = filterPartialCompletions(cm, line, ret.list)
  ret.from = { line: cursor.line, ch: colonPos + 2 }
  ret.to = { line: cursor.line, ch: line.length }
  // addTooltipHandlers(cm, ret)
  return ret
}

function hintThingConfig (cm, line, parentLineNr) {
  const cursor = cm.getCursor()
  const colonPos = line.indexOf(':')
  const afterColon = colonPos > 0 && cursor.ch > colonPos
  const parameters = cm.state.hintContext.thingType.configParameters
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
      } else if (parameter.options) {
        return hintOptions(cm, line, parameter)
      }
    }
  } else {
    let completions = parameters.map((p) => {
      return {
        text: p.name + ': ',
        displayText: p.name,
        description: p.description,
        className: getCompletionType(p.type)
      }
    })
    // completions = filterPartialCompletions(cm, line, completions)
    let ret = {
      list: completions,
      from: { line: cursor.line, ch: 6 },
      to: { line: cursor.line, ch: line.length }
    }
    // addTooltipHandlers(cm, ret, true)
    return ret
  }
}

function findChannelTypeUID (cm) {
  // FIXME: this function will assume the module type will appear directly before
  // the configuration block, which will usually be the case but it's not guaranteed.
  // It doesn't parse the YAML properly.
  const cursor = cm.getCursor()
  for (let l = cursor.line - 1; l >= 0; l--) {
    const line = cm.getLine(l)
    if (line.match(/^ {4}channelTypeUID: /)) {
      return line.substring(line.indexOf(':') + 1).trim()
    }
  }
}

function hintChannelConfig (cm, line, parentLineNr) {
  const cursor = cm.getCursor()
  const channelTypeUID = findChannelTypeUID(cm, cursor.line)
  console.debug(`hinting config for module type: ${channelTypeUID}`)
  // const indent = lineIndent(cm, parentLineNr)
  const colonPos = line.indexOf(':')
  const afterColon = colonPos > 0 && cursor.ch > colonPos
  const channelType = cm.state.hintContext.channelTypes.find((m) => m.UID === channelTypeUID)
  if (!channelType) return null
  const parameters = channelType.parameters
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
      } else if (parameter.options) {
        return hintOptions(cm, line, parameter)
      }
    }
  } else {
    console.debug(channelType)
    let completions = parameters.map((p) => {
      return {
        text: p.name + ': ',
        displayText: p.name,
        description: p.description,
        className: getCompletionType(p.type)
      }
    })
    // completions = filterPartialCompletions(cm, line, completions)
    let ret = {
      list: completions,
      from: { line: cursor.line, ch: 6 },
      to: { line: cursor.line, ch: line.length }
    }
    // addTooltipHandlers(cm, ret, true)
    return ret
  }
}

function buildChannelStructure (cm, channelType) {
  let ret = '  - id: \n    channelTypeUID: ' + channelType.UID + '\n'
  ret += '    label: \n    description: \n'
  ret += '    configuration: {}\n'
  ret += '  '
  return ret
}

function hintChannelStructure (cm, line, parentLineNr) {
  const cursor = cm.getCursor()
  const thingType = cm.state.hintContext.thingType
  const bindingId = cm.state.hintContext.thingType.UID.split(':')[0]
  const channelTypes = cm.state.hintContext.channelTypes.filter(
    (c) => thingType.extensibleChannelTypeIds.map((t) => bindingId + ':' + t).indexOf(c.UID) >= 0
  )
  let completions = channelTypes.map((c) => {
    return {
      text: buildChannelStructure(cm, c),
      displayText: `channel: ${c.UID}`,
      description: `${c.label}${c.description ? '<br/><br />' + c.description : ''}`
    }
  })
  let ret = {
    list: completions,
    from: { line: cursor.line, ch: 0 },
    to: { line: cursor.line, ch: cm.getLine(cursor.line).length }
  }
  // ret.list = filterPartialCompletions(cm, line, ret.list)
  // addTooltipHandlers(cm, ret)
  return ret
}

export default function hint (cm, option, mode) {
  const cursor = cm.getCursor()
  const line = cm.getLine(cursor.line)

  const parentLineNr = findParent(cm, cursor.line)
  const parentLine = cm.getLine(parentLineNr)
  console.debug(`parent line (${parentLineNr}): ${parentLine}`)

  let ret
  if (parentLine && isConfig(parentLine) && lineIndent(cm, parentLineNr) === 0) {
    ret = hintThingConfig(cm, line, parentLineNr)
  } else if (parentLine && isConfig(parentLine) && lineIndent(cm, parentLineNr) === 4) {
    ret = hintChannelConfig(cm, line, parentLineNr)
  } else if (isChannelsSection(parentLine)) {
    ret = hintChannelStructure(cm, line, parentLineNr)
  }

  // if (!(ret instanceof Promise)) addTooltipHandlers(cm, ret)

  return ret
}
