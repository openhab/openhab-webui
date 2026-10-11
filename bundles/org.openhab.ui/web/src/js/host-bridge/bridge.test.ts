import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  BridgeError,
  hostDarkMode,
  hostTakesOver,
  installHostBridge,
  onHostCommand,
  request,
  resetHostBridge,
  sayHello,
  send
} from './bridge'
import type { HostInfo } from './protocol'

function fakeHost(info: Partial<HostInfo> = {}) {
  const posted: any[] = []
  const port: OHBridgePort = {
    info: { protocol: 1, platform: 'ios', appVersion: '1', features: ['navbar', 'menu'], ...info },
    onmessage: null,
    postMessage: (json: string) => posted.push(JSON.parse(json))
  }
  installHostBridge({ OHBridge: port } as unknown as Window)
  const deliver = (message: object) => port.onmessage!({ data: JSON.stringify({ v: 1, ...message }) })
  const replyTo = (id: string) => posted.find((m) => m.replyTo === id)?.payload
  return { posted, port, deliver, replyTo }
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('host bridge', () => {
  beforeEach(() => resetHostBridge())
  afterEach(() => resetHostBridge())

  it('does nothing without a host', () => {
    installHostBridge({} as Window)
    expect(hostTakesOver('navbar')).toBe(false)
    expect(() => send('nav.changed')).not.toThrow()
  })

  it('takes over only what the app offers and Main UI supports', () => {
    fakeHost({ features: ['navbar', 'somethingNew' as any] })
    expect(hostTakesOver('navbar')).toBe(true)
    expect(hostTakesOver('menu')).toBe(false)
  })

  it('says hello once, with what it took', () => {
    const { posted } = fakeHost()
    sayHello('5.1.0')
    sayHello('5.1.0')
    const hellos = posted.filter((m) => m.type === 'ui.hello')
    expect(hellos).toHaveLength(1)
    expect(hellos[0].payload).toMatchObject({ impl: 'mainui', version: '5.1.0', accepted: ['navbar', 'menu'] })
  })

  it('answers not_ready until Main UI handles a known message, unknown_type otherwise', () => {
    const { deliver, replyTo } = fakeHost()
    deliver({ type: 'nav.back', id: 'h1', payload: {} })
    deliver({ type: 'dance', id: 'h2', payload: {} })
    expect(replyTo('h1')).toEqual({ ok: false, error: { code: 'not_ready' } })
    expect(replyTo('h2')).toEqual({ ok: false, error: { code: 'unknown_type' } })
  })

  it('runs handlers and answers with their result or error', async () => {
    const { deliver, replyTo } = fakeHost()
    onHostCommand('nav.getState', () => ({ path: '/page/a' }))
    onHostCommand('navbar.activate', () => {
      throw new BridgeError('not_found')
    })
    onHostCommand('nav.back', () => {
      throw new Error('boom')
    })
    deliver({ type: 'nav.getState', id: 'h1', payload: {} })
    deliver({ type: 'navbar.activate', id: 'h2', payload: { id: 'x' } })
    deliver({ type: 'nav.back', id: 'h3', payload: {} })
    await flush()
    expect(replyTo('h1')).toEqual({ ok: true, result: { path: '/page/a' } })
    expect(replyTo('h2')).toMatchObject({ ok: false, error: { code: 'not_found' } })
    expect(replyTo('h3')).toMatchObject({ ok: false, error: { code: 'failed', message: 'boom' } })
  })

  it('runs a resent command once and answers it again', async () => {
    const { deliver, posted } = fakeHost()
    const handler = vi.fn(() => 'done')
    onHostCommand('nav.back', handler)
    deliver({ type: 'nav.back', id: 'h7', payload: {} })
    deliver({ type: 'nav.back', id: 'h7', payload: {} })
    await flush()
    deliver({ type: 'nav.back', id: 'h7', payload: {} })
    expect(handler).toHaveBeenCalledTimes(1)
    const replies = posted.filter((m) => m.replyTo === 'h7')
    expect(replies).toHaveLength(2)
    expect(replies.every((m) => m.payload.ok && m.payload.result === 'done')).toBe(true)
  })

  it('matches a request with its reply', async () => {
    const { posted, deliver } = fakeHost()
    const answer = request('auth.getCredentials')
    const asked = posted.find((m) => m.type === 'auth.getCredentials')
    deliver({ type: 'reply', replyTo: asked.id, payload: { ok: true, result: { username: 'u', password: 'p' } } })
    await expect(answer).resolves.toEqual({ username: 'u', password: 'p' })
  })

  it('gives up on a request nobody answers', async () => {
    vi.useFakeTimers()
    fakeHost()
    const answer = request('auth.getCredentials')
    vi.advanceTimersByTime(5000)
    await expect(answer).rejects.toThrow('No answer')
    vi.useRealTimers()
  })

  it('takes the app dark mode from its startup info', () => {
    fakeHost({ darkMode: 'dark' })
    expect(hostDarkMode.value).toBe('dark')
  })
})
