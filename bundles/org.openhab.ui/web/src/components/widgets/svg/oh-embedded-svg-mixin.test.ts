import { describe, expect, it } from 'vitest'

import embeddedSvgMixin from './oh-embedded-svg-mixin'

const mixinMethods = (embeddedSvgMixin as any).methods

describe('oh-embedded-svg-mixin applyStyleClasses', () => {
  it('resolves style class targets within its own SVG root before the document', () => {
    document.body.innerHTML = '<svg id="instance1"><rect id="indicator" /></svg>' + '<svg id="instance2"><rect id="indicator" /></svg>'
    const ownRoot = document.getElementById('instance2')
    const ctx = { embeddedSvgRoot: () => ownRoot }

    mixinMethods.applyStyleClasses.call(ctx, { stateOnAsStyleClass: 'indicator:active' }, true, { id: 'source' })

    expect(ownRoot!.querySelector('#indicator')!.classList.contains('active')).toBe(true)
    expect(document.querySelector('#instance1 #indicator')!.classList.contains('active')).toBe(false)
  })

  it('falls back to a document-wide lookup when the id is not inside the SVG root', () => {
    document.body.innerHTML = '<svg id="instance1"></svg><div id="outside"></div>'
    const ctx = { embeddedSvgRoot: () => document.getElementById('instance1') }

    mixinMethods.applyStyleClasses.call(ctx, { stateOnAsStyleClass: 'outside:active' }, true, { id: 'source' })

    expect(document.getElementById('outside')!.classList.contains('active')).toBe(true)
  })
})
