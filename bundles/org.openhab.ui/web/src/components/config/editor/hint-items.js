import { insertCompletionText } from '@codemirror/autocomplete'
import { findParent } from './yaml-utils'
import { completionStart, hintItems } from './hint-utils'

import YAML from 'yaml'
import * as Types from '@/assets/item-types.js'
import Metadata from '@/assets/definitions/metadata/namespaces'
import { Categories } from '@/assets/categories.js'

let dimensions = null

function getDimensions (context) {
  if (dimensions) return Promise.resolve(dimensions)

  return context.view.$oh.api.get('/rest/systeminfo/uom').then((data) => {
    dimensions = data.uomInfo.dimensions.map((d) => d.dimension)
    return dimensions
  })
}

function hintTypes (context, line, position) {
  const apply = (view, completion, _from, _to) => {
    const insert = completion.label
    const from = line.from + position
    const to = view.state.doc.lineAt(context.pos).to
    view.dispatch(insertCompletionText(view.state, insert, from, to))
  }

  return {
    from: completionStart(context),
    validFor: /\w+/,
    options: Types.ItemTypes.map((t) => {
      return {
        label: t,
        apply
      }
    })
  }
}

function hintDimension (context, line, position) {
  const apply = (view, completion, _from, _to) => {
    const insert = completion.label
    const from = line.from + position
    const to = view.state.doc.lineAt(context.pos).to
    view.dispatch(insertCompletionText(view.state, insert, from, to))
  }

  return getDimensions(context).then((dimensions) => {
    return {
      from: completionStart(context),
      validFor: /\w+/,
      options: dimensions.map((d) => {
        return {
          label: d,
          apply
        }
      })
    }
  })
}

function hintIcon (context, line) {
  const apply = (view, completion, _from, _to) => {
    const insert = completion.label
    const from = line.from + 10 // after 'icon: '
    const to = view.state.doc.lineAt(context.pos).to
    view.dispatch(insertCompletionText(view.state, insert, from, to))
  }

  return {
    from: completionStart(context),
    validFor: /\w+/,
    options: Categories.map((label) => {
      return {
        label,
        apply
      }
    })
  }
}

const MetadataCompletions = {
  unit: { value: ''},
  stateDescription: { value: '', config: { pattern: '%.2f' } },
  commandDescription: { value: '', config: { options: '' } },
  synonyms: { value: 'synonym1,synonym2' },
  // widget
  // listWidget
  // cellWidget
  // widgetOrder
  autoupdate: { value: 'false' },
  expire: { value: '3s' }
  // voiceSystem
  // matter
  // alexa
  // homekit
  // ga
  // link_to_more
}

const DefaultMetadataCompletion = { value: '', config: {} }

function hintMetadata (context, line) {
  const apply = (view, completion, _from, _to) => {
    const completionStructure = MetadataCompletions[completion.label] || DefaultMetadataCompletion
    const indent = ' '.repeat(6)
    const insert = YAML.stringify({ [completion.label]: completionStructure }).split('\n').map((l) => indent + l).join('\n')
    const from = line.from
    const to = view.state.doc.lineAt(context.pos).to
    view.dispatch(insertCompletionText(view.state, insert, from, to))
  }

  return {
    from: completionStart(context),
    validFor: /\w+/,
    options: Metadata.map((m) => {
      return {
        label: m.name,
        info: m.label,
        apply
      }
    })
  }
}

export default function hint (context) {
  const line = context.state.doc.lineAt(context.pos)
  if (!line) return
  const parentLine = findParent(context, line)

  if (line.text.match(/^ {4}type: /)) {
    return hintTypes(context, line, 10)
  } else if (line.text.match(/^ {4}dimension: /)) {
    return hintDimension(context, line, 15)
  } else if (line.text.match(/^ {6}type: /)) { // Group type
    return hintTypes(context, line, 12)
  } else if (line.text.match(/^ {6}dimension: /)) { // Group dimension
    return hintDimension(context, line, 17)
  } else if (line.text.match(/^ {4}icon: /)) {
    return hintIcon(context, line)
  } else if (parentLine && parentLine.text.match(/^ {4}groups:/)) {
    return hintItems(context, { indent: 6, prefix: '- ', groupsOnly: true })
  } else if (parentLine && parentLine.text.match(/^ {4}metadata:/)) {
    return hintMetadata(context, line)
  }
}
