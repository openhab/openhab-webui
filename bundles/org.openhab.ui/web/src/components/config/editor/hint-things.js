import { insertCompletionText, pickedCompletion } from '@codemirror/autocomplete'
import { lineIndent, findParent, isConfig } from './yaml-utils'
import { completionStart, hintParameterValues, hintParameters } from './hint-utils'

function hintThingConfig (context, line, colonPos, afterColon) {
  const parameters = context.view.hintContext.thingType.configParameters

  if (afterColon) {
    return hintParameterValues(context, parameters, line, colonPos)
  } else {
    return hintParameters(context, parameters, 6)
  }
}

function findChannelTypeUID (context, configLine, configIndent) {
  const channelUidLine = findParent(context, configLine)
  const section = context.state.doc.slice(channelUidLine.to, configLine.from)
  const typeLine = section.text.find((line) => line.match(/^ {8}type: /))
  if (!typeLine) return null

  const type = typeLine.substring(typeLine.indexOf(':') + 1).trim()
  if (type.includes(':')) {
    return type
  }
  const bindingId = context.view.hintContext.thingType.UID.split(':')[0]
  return bindingId + ':' + type
}

function hintChannelConfig (context, line, configLine, configIndent, colonPos, afterColon) {
  const channelTypeUID = findChannelTypeUID(context, configLine, configIndent)
  const channelType = context.view.hintContext.channelTypes.find((m) => m.UID === channelTypeUID)
  if (!channelType) return null
  if (afterColon) {
    return hintParameterValues(context, channelType.parameters, line, colonPos)
  } else {
    return hintParameters(context, channelType.parameters, 10)
  }
}

function isChannelsSection (line) {
  if (!line) return false
  return line.text.match(/^ {4}channels:/)
}

function hintChannelStructure (context, line, parentLine) {
  const thingType = context.view.hintContext.thingType
  const bindingId = thingType.UID.split(':')[0]
  const extensibleChannelTypeUIDs = thingType.extensibleChannelTypeIds.map((t) => bindingId + ':' + t)
  const channelTypes = context.view.hintContext.channelTypes.filter((c) => extensibleChannelTypeUIDs.indexOf(c.UID) >= 0).sort((a, b) => a.UID.localeCompare(b.UID))

  const apply = (view, completion, _from, _to) => {
    const insert = [
      '      your_channel_id:',
      '        type: ' + completion.type,
      '        label: ""',
      // '        description:', // currently not supported by core's YAML Parser(?)
      '        config:',
      '          '
    ].join('\n')
    const from = line.from
    const to = view.state.doc.lineAt(context.pos).to
    view.dispatch({
      ...insertCompletionText(view.state, insert, from, to),
      annotations: pickedCompletion.of(completion) // trigger subsequent completion
    })
  }

  return {
    from: completionStart(context),
    validFor: /\w+/,
    options: channelTypes.map((t) => {
      const type = t.UID.substring(t.UID.indexOf(':') + 1)
      return {
        type, // to be used in apply function
        label: `channel: ${type}`,
        info: t.label + (t.description ? '\n\n' + t.description : ''),
        apply
      }
    })
  }
}

function isChannelType (context, line, parentLine) {
  if (!line || !line.text.match(/^ {8}type:/)) return false

  const grandParentLine = findParent(context, parentLine)
  if (!grandParentLine) return false

  return isChannelsSection(grandParentLine)
}

function hintChannelType (context, line, parentLine) {
  const thingType = context.view.hintContext.thingType
  const bindingId = thingType.UID.split(':')[0]
  const extensibleChannelTypeUIDs = thingType.extensibleChannelTypeIds.map((t) => bindingId + ':' + t)
  const channelTypes = context.view.hintContext.channelTypes.filter((c) => extensibleChannelTypeUIDs.indexOf(c.UID) >= 0).sort((a, b) => a.UID.localeCompare(b.UID))

  const apply = (view, completion, _from, _to) => {
    const insert = completion.label
    const from = line.from + 14 // after 'type: '
    const to = view.state.doc.lineAt(context.pos).to
    view.dispatch(insertCompletionText(view.state, insert, from, to))
  }

  return {
    from: completionStart(context),
    validFor: /\w+/,
    options: channelTypes.map((t) => {
      const type = t.UID.substring(t.UID.indexOf(':') + 1)
      return {
        label: type,
        info: t.label + (t.description ? '\n\n' + t.description : ''),
        apply
      }
    })
  }
}

export default function hint (context) {
  const line = context.state.doc.lineAt(context.pos)
  const parentLine = findParent(context, line)

  if (isConfig(parentLine)) {
    const cursor = context.pos - line.from
    const colonPos = line.text.indexOf(':')
    const afterColon = colonPos > 0 && cursor > colonPos

    const configIndent = lineIndent(parentLine)
    switch (configIndent) {
      case 4: return hintThingConfig(context, line, colonPos, afterColon)
      case 8: return hintChannelConfig(context, line, parentLine, configIndent, colonPos, afterColon)
    }
  } else if (isChannelsSection(parentLine)) {
    return hintChannelStructure(context, line, parentLine)
  } else if (isChannelType(context, line, parentLine)) {
    return hintChannelType(context, line, parentLine)
  }
}
