import { CompletionContext } from '@codemirror/autocomplete'
import { javascript } from '@codemirror/lang-javascript'
import { EditorState } from '@codemirror/state'
import { describe, expect, it } from 'vitest'

import { shouldSkipImplicitAutocomplete } from '../hint-javascript'

function createCompletionContext(doc: string, explicit: boolean = false, pos: number = doc.length) {
  const state = EditorState.create({
    doc,
    extensions: [javascript()]
  })

  return new CompletionContext(state, pos, explicit)
}

describe('shouldSkipImplicitAutocomplete', () => {
  it('skips implicit completion on blank positions without a trigger', () => {
    const context = createCompletionContext('')

    expect(shouldSkipImplicitAutocomplete(context)).toBe(true)
  })

  it('skips implicit completion after a semicolon at the end of a line', () => {
    const context = createCompletionContext('items.getItem("Demo");')

    expect(shouldSkipImplicitAutocomplete(context)).toBe(true)
  })

  it('skips implicit completion after opening an array literal', () => {
    const context = createCompletionContext('const values = [')

    expect(shouldSkipImplicitAutocomplete(context)).toBe(true)
  })

  it('skips implicit completion inside comments', () => {
    const context = createCompletionContext('// items.')

    expect(shouldSkipImplicitAutocomplete(context)).toBe(true)
  })

  it('skips implicit completion inside strings', () => {
    const context = createCompletionContext('const value = "items"')

    expect(shouldSkipImplicitAutocomplete(context)).toBe(true)
  })

  it('skips implicit completion inside template string text', () => {
    const context = createCompletionContext('const value = `items`')

    expect(shouldSkipImplicitAutocomplete(context)).toBe(true)
  })

  it('skips implicit completion after opening a call without typing an identifier', () => {
    const context = createCompletionContext('foo(')

    expect(shouldSkipImplicitAutocomplete(context)).toBe(true)
  })

  it('skips implicit completion after commas without typing an identifier', () => {
    const context = createCompletionContext('foo,')

    expect(shouldSkipImplicitAutocomplete(context)).toBe(true)
  })

  it('keeps explicit completion available after opening an array literal', () => {
    const context = createCompletionContext('const values = [', true)

    expect(shouldSkipImplicitAutocomplete(context)).toBe(false)
  })

  it('allows implicit completion while typing an identifier', () => {
    const context = createCompletionContext('ite')

    expect(shouldSkipImplicitAutocomplete(context)).toBe(false)
  })

  it('allows implicit completion in normal code contexts', () => {
    const context = createCompletionContext('items.')

    expect(shouldSkipImplicitAutocomplete(context)).toBe(false)
  })

  it('allows implicit completion in template interpolations', () => {
    const doc = 'const value = `${items.length}`'
    const context = createCompletionContext(doc, false, doc.indexOf('items.') + 'items.'.length)

    expect(shouldSkipImplicitAutocomplete(context)).toBe(false)
  })
})
