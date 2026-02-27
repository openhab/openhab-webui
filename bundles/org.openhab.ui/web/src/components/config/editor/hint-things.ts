import { CompletionContext, insertCompletionText, pickedCompletion, type Completion, type CompletionResult } from '@codemirror/autocomplete'
import { lineIndent, findParent, isConfig } from './yaml-utils'
import { completionStart, hintParameterValues, hintParameters } from './hint-utils'
import type { EditorView } from '@codemirror/view'
import type { Line } from '@codemirror/state'

import type { ExtendedEditorView } from './types'

function hintThingConfig(context: CompletionContext, line: Line, colonPos: number, afterColon: boolean) : CompletionResult | Promise<CompletionResult> | null {
  const parameters = (context.view as ExtendedEditorView)?.hintContext?.thingType?.configParameters

  if (!parameters) return null

  if (afterColon) {
    return hintParameterValues(context, parameters, line, colonPos)
  } else {
    return hintParameters(context, parameters, 6)
  }
}

//TODO
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
function findChannelTypeUID(context: CompletionContext, configLine: Line, configIndent: number) : string | null {
  const channelUidLine = findParent(context, configLine)
  if (!channelUidLine) return null

  const section = context.state.doc.slice(channelUidLine.to, configLine.from)
  //TODO text is not a member of type Text
  /* @ts-expect-error-next-line */
  const typeLine = section.text.find((line) => line.match(/^ {8}type: /))
  if (!typeLine) return null

  const type = typeLine.substring(typeLine.indexOf(':') + 1).trim()
  if (type.includes(':')) {
    return type
  }
  const bindingId = (context.view as ExtendedEditorView)?.hintContext?.thingType?.UID.split(':')[0]
  return bindingId + ':' + type
}
/* eslint-enable @typescript-eslint/no-unsafe-assignment */
/* eslint-enable @typescript-eslint/no-unsafe-member-access */
/* eslint-enable @typescript-eslint/no-unsafe-return */

function hintChannelConfig(context: CompletionContext, line: Line, configLine: Line, configIndent: number, colonPos: number, afterColon: boolean) : CompletionResult | Promise<CompletionResult> | null {
  const channelTypeUID = findChannelTypeUID(context, configLine, configIndent)
  const channelType = (context.view as ExtendedEditorView)?.hintContext?.channelTypes.find((m) => m.UID === channelTypeUID)
  if (!channelType) return null
  if (afterColon) {
    return hintParameterValues(context, channelType.parameters, line, colonPos)
  } else {
    return hintParameters(context, channelType.parameters, 10)
  }
}

function isChannelsSection(line: Line) {
  if (!line) return false
  console.log('isChannelsSection', line.text)
  return line.text.match(/^ {4}channels:/)
}

function hintChannelStructure(context: CompletionContext, line: Line, parentLine: Line) : CompletionResult | null {
  const editorView = context.view as ExtendedEditorView
  const thingType = editorView?.hintContext?.thingType
  if (!thingType) return null

  const bindingId = thingType.UID.split(':')[0]
  if (!thingType.extensibleChannelTypeIds || thingType.extensibleChannelTypeIds.length === 0) return null
  const extensibleChannelTypeUIDs = thingType.extensibleChannelTypeIds.map((t) => bindingId + ':' + t)
  const channelTypes = editorView.hintContext?.channelTypes
    .filter((c) => extensibleChannelTypeUIDs.indexOf(c.UID) >= 0)
    .sort((a, b) => a.UID.localeCompare(b.UID))

  if (!channelTypes || channelTypes.length === 0) return null

  const apply = (view: EditorView, completion: Completion, _from: number, _to: number) => {
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

function isChannelType(context: CompletionContext, line: Line, parentLine: Line) {
  if (!line || !line.text.match(/^ {8}type:/)) return false

  const grandParentLine = findParent(context, parentLine)
  if (!grandParentLine) return false

  return isChannelsSection(grandParentLine)
}

function hintChannelType(context: CompletionContext, line: Line, parentLine: Line) : CompletionResult | null {
  const editorView = context.view as ExtendedEditorView
  const thingType = editorView.hintContext?.thingType
  if (!thingType) return null

  const bindingId = thingType.UID.split(':')[0]
  if (!thingType.extensibleChannelTypeIds || thingType.extensibleChannelTypeIds.length === 0) return null

  const extensibleChannelTypeUIDs = thingType.extensibleChannelTypeIds.map((t) => bindingId + ':' + t)
  const channelTypes = editorView.hintContext?.channelTypes
    .filter((c) => extensibleChannelTypeUIDs.indexOf(c.UID) >= 0)
    .sort((a, b) => a.UID.localeCompare(b.UID))

  if (!channelTypes || channelTypes.length === 0) return null

  const apply = (view: EditorView, completion: Completion, _from: number, _to: number) => {
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

export default function hint(context: CompletionContext) : CompletionResult | Promise<CompletionResult> | null {
  const line = context.state.doc.lineAt(context.pos)
  const parentLine = findParent(context, line)

  if (!parentLine) return null

  if (isConfig(parentLine)) {
    const cursor = context.pos - line.from
    const colonPos = line.text.indexOf(':')
    const afterColon = colonPos > 0 && cursor > colonPos

    const configIndent = lineIndent(parentLine)
    switch (configIndent) {
      case 4:
        return hintThingConfig(context, line, colonPos, afterColon)
      case 8:
        return hintChannelConfig(context, line, parentLine, configIndent, colonPos, afterColon)
    }
  } else if (isChannelsSection(parentLine)) {
    return hintChannelStructure(context, line, parentLine)
  } else if (isChannelType(context, line, parentLine)) {
    return hintChannelType(context, line, parentLine)
  }
  return null
}
