import { describe, expect, it, vi } from 'vitest'

import ohImage from './oh-image.vue'

const methods = (ohImage as any).methods

function embedContext(overrides: Record<string, unknown> = {}) {
  const container = document.createElement('div')
  return {
    config: { url: '/static/floorplan.svg', embedSvg: true },
    context: {},
    embeddedSvgToken: 0,
    embeddedSvgReady: false,
    $refs: { svgContainer: container },
    fetchEmbeddedSvgText: vi.fn(),
    removeWidgetSvg: methods.removeWidgetSvg,
    subscribeEmbeddedSvgListeners: vi.fn(),
    setupEmbeddedSvgStateTracking: vi.fn(),
    unsubscribeEmbeddedSvgListeners: vi.fn(),
    unsubscribeEmbeddedSvgStateTracking: vi.fn(),
    ...overrides
  }
}

describe('oh-image.vue SVG embedding', () => {
  it('reads the SVG URL from the url config', () => {
    const ctx = { config: { url: '/static/remote.svg' } }
    expect(methods.embeddedSvgUrl.call(ctx)).toBe('/static/remote.svg')
  })

  it('embeds the SVG, derives a viewBox from fixed dimensions and subscribes', async () => {
    const ctx = embedContext()
    ctx.fetchEmbeddedSvgText.mockResolvedValue(
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"><rect id="lamp" openhab="true" /></svg>'
    )

    await methods.embedWidgetSvg.call(ctx)

    const svg = (ctx.$refs.svgContainer as HTMLElement).querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg!.getAttribute('viewBox')).toBe('0 0 100 50')
    expect(svg!.hasAttribute('width')).toBe(false)
    expect(svg!.hasAttribute('height')).toBe(false)
    expect(ctx.embeddedSvgReady).toBe(true)
    expect(ctx.subscribeEmbeddedSvgListeners).toHaveBeenCalled()
    expect(ctx.setupEmbeddedSvgStateTracking).toHaveBeenCalled()
  })

  it('keeps an existing viewBox untouched', async () => {
    const ctx = embedContext()
    ctx.fetchEmbeddedSvgText.mockResolvedValue('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 20" width="100" height="50"></svg>')

    await methods.embedWidgetSvg.call(ctx)

    const svg = (ctx.$refs.svgContainer as HTMLElement).querySelector('svg')
    expect(svg!.getAttribute('viewBox')).toBe('0 0 10 20')
  })

  it('discards a stale in-flight embed after the token was invalidated', async () => {
    const ctx = embedContext()
    let resolveFetch: (svg: string) => void
    ctx.fetchEmbeddedSvgText.mockReturnValue(new Promise((resolve) => (resolveFetch = resolve)))

    const embedding = methods.embedWidgetSvg.call(ctx)
    ctx.embeddedSvgToken++ // simulates an unmount or re-embed while the fetch is in flight
    resolveFetch!('<svg xmlns="http://www.w3.org/2000/svg"></svg>')
    await embedding

    expect((ctx.$refs.svgContainer as HTMLElement).querySelector('svg')).toBeNull()
    expect(ctx.embeddedSvgReady).toBe(false)
    expect(ctx.subscribeEmbeddedSvgListeners).not.toHaveBeenCalled()
  })

  it('performs the configured action on click in run mode', () => {
    const actionConfig = { action: 'toggle', actionItem: 'Lamp' }
    const ctx = {
      context: {},
      config: { embeddedSvgActions: { lamp: actionConfig } },
      performAction: vi.fn()
    }

    methods.svgOnClick.call(ctx, { id: 'lamp' })

    expect(ctx.performAction).toHaveBeenCalledWith(null, null, actionConfig, ctx.context)
  })

  it('does not perform actions in edit mode or for unconfigured elements', () => {
    const ctx = {
      context: { editmode: {} },
      config: { embeddedSvgActions: { lamp: { action: 'toggle' } } },
      performAction: vi.fn()
    }
    methods.svgOnClick.call(ctx, { id: 'lamp' })

    const runCtx = {
      context: {},
      config: {},
      performAction: vi.fn()
    }
    methods.svgOnClick.call(runCtx, { id: 'unconfigured' })

    expect(ctx.performAction).not.toHaveBeenCalled()
    expect(runCtx.performAction).not.toHaveBeenCalled()
  })
})
