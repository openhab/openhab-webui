import { EditorView } from '@codemirror/view'
import * as api from '@/api'

export interface HintContext {
  thingType: api.ThingType
  channelTypes: api.ChannelType[]
}

export interface ExtendedEditorView extends EditorView {
  originalMode: string
  hintContext?: HintContext
}