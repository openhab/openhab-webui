// @vitest-environment-options {"url":"https://openhab.test/"}
import { flushPromises, mount } from '@vue/test-utils'
import { computed, reactive, type Ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import OhWebFrame from './oh-webframe.vue'

const { getAccessToken, fetchFrameSession } = vi.hoisted(() => ({
  getAccessToken: vi.fn(),
  fetchFrameSession: vi.fn<(request: Request) => Promise<Response>>()
}))

vi.mock('@/js/openhab/auth', () => ({
  getAccessToken,
  getTokenInCustomHeader: () => false,
  getBasicCredentials: () => null
}))

const userState = reactive<{ user: { name: string } | null }>({ user: null })

vi.mock('@/js/stores/useUserStore', () => ({
  useUserStore: () => userState
}))

vi.mock('@/components/widgets/useWidgetContext', () => ({
  useWidgetContext: (context: Ref<{ config: Record<string, unknown> }>) => ({
    config: computed(() => context.value.config)
  })
}))

function mountFrame(config: Record<string, unknown>) {
  return mount(OhWebFrame, {
    props: { context: { config } },
    global: { mocks: { $t: (key: string) => key } }
  })
}

describe('Web Frame session', () => {
  beforeEach(() => {
    userState.user = null
    getAccessToken.mockReturnValue(null)
    fetchFrameSession.mockReset()
    vi.stubGlobal('fetch', fetchFrameSession)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('loads an ordinary frame without requesting a session', () => {
    const wrapper = mountFrame({ src: 'https://example.org/page' })
    expect(wrapper.get('iframe').attributes('src')).toBe('https://example.org/page')
    expect(fetchFrameSession).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('uses the Main UI token and loads the frame only after a session is established', async () => {
    getAccessToken.mockReturnValue('main-ui-token')
    const { promise, resolve: completeSession } = Promise.withResolvers<Response>()
    fetchFrameSession.mockReturnValueOnce(promise)

    const wrapper = mountFrame({ src: '/homekit/camera/front-door/?layout=small#video', openhabSession: true })
    await flushPromises()
    expect(wrapper.find('iframe').exists()).toBe(false)
    expect(wrapper.get('[role="status"]').text()).toBe('webframe.session.loading')

    const [request] = fetchFrameSession.mock.calls[0]
    expect(request.url).toBe('https://openhab.test/homekit/camera/front-door/_openhab_session')
    expect(request.method).toBe('POST')
    expect(request.headers.get('Authorization')).toBe('Bearer main-ui-token')
    expect(request.redirect).toBe('error')
    expect(request.credentials).toBe('same-origin')

    completeSession(new Response(null, { status: 204 }))
    await flushPromises()
    expect(wrapper.get('iframe').attributes('src')).toBe('https://openhab.test/homekit/camera/front-door/?layout=small#video')
    wrapper.unmount()
  })

  it('can load a frame when the endpoint permits anonymous access', async () => {
    fetchFrameSession.mockResolvedValueOnce(new Response(null, { status: 204 }))
    const wrapper = mountFrame({ src: '/homekit/camera/front-door', openhabSession: true })
    await flushPromises()
    expect(fetchFrameSession.mock.calls[0][0].headers.has('Authorization')).toBe(false)
    expect(wrapper.find('iframe').exists()).toBe(true)
    wrapper.unmount()
  })

  it('retries session setup after the user signs in to Main UI', async () => {
    fetchFrameSession.mockResolvedValueOnce(new Response(null, { status: 401 }))
    const wrapper = mountFrame({ src: '/homekit/camera/front-door', openhabSession: true })
    await flushPromises()
    expect(wrapper.get('[role="status"]').text()).toBe('webframe.session.signIn')

    fetchFrameSession.mockResolvedValueOnce(new Response(null, { status: 204 }))
    getAccessToken.mockReturnValue('main-ui-token')
    userState.user = { name: 'User' }
    await flushPromises()
    expect(fetchFrameSession.mock.calls[1][0].headers.get('Authorization')).toBe('Bearer main-ui-token')
    expect(wrapper.find('iframe').exists()).toBe(true)
    wrapper.unmount()
  })

  it.each(['https://example.org/page', 'http://openhab.test/page', 'https://user:secret@openhab.test/page'])(
    'rejects an unsupported URL before any request is made',
    async (src) => {
      const wrapper = mountFrame({ src, openhabSession: true })
      await flushPromises()
      expect(fetchFrameSession).not.toHaveBeenCalled()
      expect(wrapper.find('iframe').exists()).toBe(false)
      wrapper.unmount()
    }
  )

  it.each([
    [401, 'webframe.session.signIn'],
    [200, 'webframe.session.unavailable']
  ])('keeps the frame closed when the session endpoint responds with %s', async (status, message) => {
    fetchFrameSession.mockResolvedValueOnce(new Response(null, { status }))
    const wrapper = mountFrame({ src: '/homekit/camera/front-door', openhabSession: true })
    await flushPromises()
    expect(wrapper.find('iframe').exists()).toBe(false)
    expect(wrapper.get('[role="status"]').text()).toBe(message)
    wrapper.unmount()
  })
})
