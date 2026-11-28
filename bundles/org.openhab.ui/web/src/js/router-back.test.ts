import { describe, expect, it, vi } from 'vitest'
import { backArgsForCurrentRoute, guardRouterBack, type RouterBackTarget } from './router-back'

const runtimeRoute: RouterBackTarget['currentRoute'] = {
  route: { options: { browserHistory: false } }
}

describe('backArgsForCurrentRoute', () => {
  it('leaves back unchanged when the current route is in window history', () => {
    expect(backArgsForCurrentRoute({ route: {} }, [])).toEqual([])
    expect(backArgsForCurrentRoute(undefined, ['/settings/things/', { force: true }])).toEqual([
      '/settings/things/',
      { force: true }
    ])
  })

  it('pops only the page stack when the current route was not pushed to window history', () => {
    expect(backArgsForCurrentRoute(runtimeRoute, [])).toEqual([{ browserHistory: false }])
    expect(backArgsForCurrentRoute(runtimeRoute, [{ force: true }])).toEqual([{ force: true, browserHistory: false }])
    expect(backArgsForCurrentRoute(runtimeRoute, ['/settings/things/uid', { force: true }])).toEqual([
      '/settings/things/uid',
      { force: true, browserHistory: false }
    ])
  })

  it('keeps an explicit browserHistory option', () => {
    expect(backArgsForCurrentRoute(runtimeRoute, [{ browserHistory: true, force: true }])).toEqual([
      { browserHistory: true, force: true }
    ])
  })
})

describe('guardRouterBack', () => {
  it('applies the guard once and only for the current route', () => {
    const back = vi.fn()
    const router: RouterBackTarget = { back, currentRoute: runtimeRoute }

    guardRouterBack(router)
    guardRouterBack(router)
    router.back()
    router.currentRoute = { route: { options: { browserHistory: true } } }
    router.back('/settings/things/', { force: true })

    expect(back).toHaveBeenCalledTimes(2)
    expect(back.mock.calls[0]).toEqual([{ browserHistory: false }])
    expect(back.mock.calls[1]).toEqual(['/settings/things/', { force: true }])
  })
})
