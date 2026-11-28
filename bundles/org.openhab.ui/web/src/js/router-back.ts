/**
 * In-app back for routes opened with `browserHistory: false`.
 *
 * Those routes stay in the Framework7 page stack so refresh does not open a
 * URL that only exists at runtime. `router.back()` still defaults to
 * `browserHistory: true` and then calls `history.back()`, which leaves the
 * previous real URL. Channel Details therefore returns to the things list,
 * and Configure Channel Done leaves the thing page before its save handoff.
 *
 * Framework7 already skips that history pop for modals. This applies the same
 * rule to page back: pop the page stack only.
 */

export interface BackRoute {
  options?: {
    browserHistory?: boolean
  }
}

export interface RouterBackTarget {
  back: (...args: unknown[]) => unknown
  currentRoute?: {
    route?: BackRoute
  }
}

const guardedRouters = new WeakSet<object>()

export function backArgsForCurrentRoute(currentRoute: RouterBackTarget['currentRoute'], args: unknown[]): unknown[] {
  if (currentRoute?.route?.options?.browserHistory !== false) return args

  if (args.length === 0) return [{ browserHistory: false }]

  const [first] = args
  if (typeof first === 'string') {
    const options = isOptions(args[1]) ? { ...args[1] } : {}
    if (options.browserHistory === undefined) options.browserHistory = false
    return [first, options, ...args.slice(2)]
  }

  if (isOptions(first)) {
    if (first.browserHistory !== undefined) return args
    return [{ ...first, browserHistory: false }, ...args.slice(1)]
  }

  return [{ browserHistory: false }]
}

export function guardRouterBack(router: RouterBackTarget | undefined): void {
  if (!router || typeof router.back !== 'function' || guardedRouters.has(router)) return

  const original = router.back.bind(router)
  router.back = (...args: unknown[]) => original(...backArgsForCurrentRoute(router.currentRoute, args))
  guardedRouters.add(router)
}

export function guardFramework7Back(app: { views?: Record<string, { router?: RouterBackTarget } | undefined> } | undefined): void {
  const views = app?.views
  if (!views) return
  for (const view of Object.values(views)) {
    guardRouterBack(view?.router)
  }
}

function isOptions(value: unknown): value is { browserHistory?: boolean } {
  return !!value && typeof value === 'object'
}
