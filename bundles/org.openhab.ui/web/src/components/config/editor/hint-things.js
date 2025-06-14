import { lineIndent, findParent, findParentRoot, isConfig, isChannelsSection } from './yaml-utils'
import { filterPartialCompletions, addTooltipHandlers, getClassNamesForParameter } from './hint-utils'

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
}

function findChannelTypeUID (cm, configLineNr) {
  const configIndent = lineIndent(cm, configLineNr)
  const channelUidLineNr = findParent(cm, configLineNr)
  for (let l = configLineNr - 1; l >= 0 && l > channelUidLineNr; l--) {
    const line = cm.getLine(l)
    if (line.match(/^ {8}type: /)) {
      const type = line.substring(line.indexOf(':') + 1).trim()
      if (type.includes(':')) {
        return type
      }
      const bindingId = cm.state.hintContext.thingType.UID.split(':')[0]
      return bindingId + ':' + type
    }
  }
}

function hintChannelConfig (cm, line, configLineNr) {
  const cursor = cm.getCursor()
  const channelTypeUID = findChannelTypeUID(cm, configLineNr)
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
        className: getClassNamesForParameter(p)
      }
    })
    completions = filterPartialCompletions(cm, line, completions)
    let ret = {
      list: completions,
      from: { line: cursor.line, ch: 10 },
      to: { line: cursor.line, ch: line.length }
    }
    addTooltipHandlers(cm, ret, true)
    return ret
  }
}

function buildChannelStructure (cm, channelID) {
  const channel = [
    '      your_channel_id:',
    '        type: ' + channelID,
    '        label:',
    // '        description:', // currently not supported by core's YAML Parser
    '        config: {}'
  ]
  return channel.join('\n')
}

function hintChannelStructure (cm, line, parentLineNr) {
  const cursor = cm.getCursor()
  const thingType = cm.state.hintContext.thingType
  const bindingId = cm.state.hintContext.thingType.UID.split(':')[0]
  const extensibleChannelTypeUIDs = thingType.extensibleChannelTypeIds.map((t) => bindingId + ':' + t)
  const channelTypes = cm.state.hintContext.channelTypes.filter((c) => extensibleChannelTypeUIDs.indexOf(c.UID) >= 0).sort((a, b) => a.UID.localeCompare(b.UID))
  let completions = channelTypes.map((c) => {
    const channelID = c.UID.substring(c.UID.indexOf(':') + 1)
    return {
      text: buildChannelStructure(cm, channelID),
      displayText: `channel: ${channelID}`,
      description: c.label + (c.description ? '<br/><br/>' + c.description : '')
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
}

function isChannelType (cm, line, parentLineNr) {
  if (!line || !line.match(/^ {8}type:/)) return false

  const grantParentLineNr = findParent(cm, parentLineNr)
  if (!grantParentLineNr) return false

  const grantParentLine = cm.getLine(grantParentLineNr)
  return isChannelsSection(grantParentLine)
}

function hintChannelType (cm, line, parentLineNr) {
  const cursor = cm.getCursor()
  const thingType = cm.state.hintContext.thingType
  const bindingId = cm.state.hintContext.thingType.UID.split(':')[0]
  const extensibleChannelTypeUIDs = thingType.extensibleChannelTypeIds.map((t) => bindingId + ':' + t)
  const channelTypes = cm.state.hintContext.channelTypes.filter((c) => extensibleChannelTypeUIDs.indexOf(c.UID) >= 0).sort((a, b) => a.UID.localeCompare(b.UID))
  let completions = channelTypes.map((c) => {
    const channelID = c.UID.substring(c.UID.indexOf(':') + 1)
    return {
      text: channelID,
      description: c.label + (c.description ? '<br/><br/>' + c.description : '')
    }
  })
  let ret = {
    list: completions,
    from: { line: cursor.line, ch: 14 },
    to: { line: cursor.line, ch: line.length }
  }
  ret.list = filterPartialCompletions(cm, line, ret.list)
  addTooltipHandlers(cm, ret)
  return ret
}

export default function hint (cm, option, mode) {
  const cursor = cm.getCursor()
  const line = cm.getLine(cursor.line)

  const parentLineNr = findParent(cm, cursor.line)
  const parentLine = cm.getLine(parentLineNr)
  console.debug(`parent line (${parentLineNr}): ${parentLine}`)

  let ret
  if (parentLine && isConfig(parentLine) && lineIndent(cm, parentLineNr) === 4) {
    ret = hintThingConfig(cm, line, parentLineNr)
  } else if (parentLine && isConfig(parentLine) && lineIndent(cm, parentLineNr) === 8) {
    ret = hintChannelConfig(cm, line, parentLineNr)
  } else if (isChannelsSection(parentLine)) {
    ret = hintChannelStructure(cm, line, parentLineNr)
  } else if (isChannelType(cm, line, parentLineNr)) {
    ret = hintChannelType(cm, line, parentLineNr)
  }

  if (!(ret instanceof Promise)) addTooltipHandlers(cm, ret)

  return ret
}
