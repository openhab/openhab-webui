import { describe, expect, it, vi } from 'vitest'
import { captureNavState, restoreProps, seedInitialHistory, takeSeededHistory } from './routes'

function fakeRouter(history: string[], propsHistory?: object[]) {
  return {
    history,
    propsHistory,
    findMatchingRoute: (url: string) => {
      if (url === '/') return { route: { path: url, redirect: '/overview/' } }
      if (url.endsWith('/popup')) return { route: { path: url, popup: {} } }
      if (url.startsWith('/missing')) return { route: { path: '(.*)' } }
      return { route: { path: url } }
    },
    navigate: vi.fn()
  }
}

describe('route restore', () => {
  it('puts the saved pages in place on the front page only', () => {
    const storage = { setItem: vi.fn() } as unknown as Storage
    const history = { replaceState: vi.fn(), pushState: vi.fn() } as unknown as History
    const pages = ['/overview/', '/page/kitchen']

    expect(seedInitialHistory(pages, { pathname: '/page/other', search: '' } as Location, history, storage)).toBeNull()
    expect(seedInitialHistory(pages, { pathname: '/', search: '' } as Location, history, storage)).toEqual(pages)
    expect(storage.setItem).toHaveBeenCalledWith('f7router-view_main-history', JSON.stringify(pages))
    expect(history.replaceState).toHaveBeenCalledWith({ view_main: { url: '/overview/' } }, '', '/overview/')
    expect(history.pushState).toHaveBeenCalledWith({ view_main: { url: '/page/kitchen' } }, '', '/page/kitchen')
    expect(takeSeededHistory()).toEqual(pages)
    expect(takeSeededHistory()).toBeNull()
  })

  it('leaves the sign-in coming back to the front page alone', () => {
    const storage = { setItem: vi.fn() } as unknown as Storage
    const history = { replaceState: vi.fn(), pushState: vi.fn() } as unknown as History
    expect(seedInitialHistory(['/overview/'], { pathname: '/', search: '?code=abc&state=xyz' } as Location, history, storage)).toBeNull()
    expect(history.replaceState).not.toHaveBeenCalled()
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it('hands back the props and reopens the current page with its own', () => {
    const router = fakeRouter(['/overview/', '/page/kitchen'])
    restoreProps(router, ['/overview/', '/page/kitchen'], [{}, { deep: true }])
    expect(router.propsHistory).toEqual([{}, { deep: true }])
    expect(router.navigate).toHaveBeenCalledWith('/page/kitchen', expect.objectContaining({ reloadCurrent: true, props: { deep: true } }))
  })

  it('leaves another page alone', () => {
    const router = fakeRouter(['/overview/', '/page/other'])
    restoreProps(router, ['/overview/', '/page/kitchen'], [{}, { deep: true }])
    expect(router.navigate).not.toHaveBeenCalled()
  })
})

describe('nav.changed', () => {
  it('reports the pages that can be put back, with the props worth keeping', () => {
    const router = fakeRouter(
      ['/overview/', '/page/kitchen', '/page/kitchen'],
      [{}, { deep: true, live: {} }, { deep: true, defineVars: { a: 1 } }]
    )
    expect(captureNavState(router, false)).toEqual({
      path: '/page/kitchen',
      history: ['/overview/', '/page/kitchen'],
      props: [{}, { deep: true, defineVars: { a: 1 } }],
      modal: false
    })
  })

  it('leaves out an address that only redirects', () => {
    const router = fakeRouter(['/', '/overview/'], [{}, {}])
    expect(captureNavState(router, false)?.history).toEqual(['/overview/'])
  })

  it('leaves out popups and addresses with nothing behind them', () => {
    const router = fakeRouter(['/overview/', '/missing/', '/page/kitchen', '/widget:x/popup'], [{}, {}, {}])
    const state = captureNavState(router, true)
    expect(state?.history).toEqual(['/overview/', '/page/kitchen'])
    expect(state?.modal).toBe(true)
  })
})
