import { EditorView } from '@codemirror/view'

export interface HintContext {
  thingType?: {
    configParameters: Array<{ name: string, description?: string, type?: string }>
    UID: string
    extensibleChannelTypeIds: string[]
  }
  channelTypes: Array<{
    UID: string
    parameters: Array<{ name: string, description?: string, type?: string, options?: Array<{ value: string, label?: string }> }>
  }>
}

export interface ExtendedEditorView extends EditorView {
  originalMode: string
  hintContext?: HintContext
}