import type { NavState, PageProps } from './protocol'

// Framework7 uses the main view's name in its history storage key and history state.
const VIEW_ID = 'view_main'
const STORAGE_KEY = 'f7router-' + VIEW_ID + '-history'
const MODAL_KEYS = ['popup', 'popover', 'sheet', 'actions', 'panel', 'loginScreen', 'customModal']
// Pages that can't be opened from their address alone.
const PROPS_ONLY = /\/(duplicate|stub)$/
// Props worth saving: `deep` (back link) and `defineVars` (page variables). The others are live objects.
const KEPT_PROPS = ['deep', 'defineVars']
// Placeholder for an open popup in propsHistory. See padPopupProps.
const POPUP_PROPS = { popup: true }

let seeded: string[] | null = null

/** Returns the pages seedInitialHistory restored, and null on later calls. */
export function takeSeededHistory(): string[] | null {
  const pages = seeded
  seeded = null
  return pages
}

export interface RouterLike {
  history: string[]
  propsHistory?: object[]
  findMatchingRoute(url: string): { route: Record<string, any> } | undefined
  navigate(url: string, options?: object): unknown
}

/**
 * Restores the app's saved pages before the router starts. Main UI opens on the last page, with
 * the others behind it for Back. Only runs on the bare front page: a page opened by address keeps
 * that address, and so does the return from sign-in (?code=…&state=…). Returns the restored
 * pages, or null.
 */
export function seedInitialHistory(pages: string[] | undefined, location: Location, history: History, storage: Storage): string[] | null {
  if (!pages?.length || location.search || (location.pathname !== '/' && location.pathname !== '')) return null
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(pages))
    history.replaceState(stateFor(pages[0]), '', pages[0])
    for (let i = 1; i < pages.length; i++) history.pushState(stateFor(pages[i]), '', pages[i])
  } catch (e) {
    console.warn('OHBridge: could not restore pages', e)
    return null
  }
  seeded = pages
  return pages
}

function stateFor(url: string) {
  return { [VIEW_ID]: { url } }
}

/**
 * Framework7 opens a restored page from its address only, without its props. Puts the saved props
 * back into the router history and reopens the current page with its props. Call once the
 * restored page is open.
 */
export function restoreProps(router: RouterLike, pages: string[], props: PageProps[] | undefined) {
  const n = router.history.length
  const k = pages.length
  if (router.history[n - 1] !== pages[k - 1]) return
  const list = router.history.map((_, i): Record<string, unknown> => {
    const saved = props?.[i - (n - k)]
    return saved && typeof saved === 'object' ? { ...saved } : {}
  })
  router.propsHistory = list
  const top = list[n - 1]
  if (Object.keys(top).length) {
    router.navigate(router.history[n - 1], { reloadCurrent: true, animate: false, browserHistory: false, props: top })
  }
}

function matchRoute(router: RouterLike, url: string) {
  if (!url || url.charAt(0) !== '/') return null
  try {
    const match = router.findMatchingRoute(url.split('#')[0])
    return match?.route ? match : null
  } catch {
    return null
  }
}

export function isModalRoute(match: { route?: Record<string, any> }) {
  return MODAL_KEYS.some((key) => match.route?.[key])
}

function navigable(router: RouterLike, url: string) {
  const match = matchRoute(router, url)
  if (!match || isModalRoute(match) || match.route.redirect) return false
  if (PROPS_ONLY.test(url.split('#')[0].split('?')[0])) return false
  return match.route.path !== '(.*)'
}

// Opening a popup adds a history entry but no props entry. Closing it removes the last entry of
// both, which drops the props of the page below. Pad propsHistory to keep the lists in step.
function padPopupProps(router: RouterLike) {
  if (!router.propsHistory) return
  let open = 0
  for (let i = router.history.length - 1; i >= 0; i--) {
    const match = matchRoute(router, String(router.history[i]))
    if (!match || !isModalRoute(match)) break
    open++
  }
  let padded = 0
  for (let j = router.propsHistory.length - 1; j >= 0 && router.propsHistory[j] === POPUP_PROPS; j--) padded++
  for (; padded < open; padded++) router.propsHistory.push(POPUP_PROPS)
}

// history and propsHistory can differ in length (a restored page has no props). Match them from the end.
function propsAt(router: RouterLike, i: number): PageProps {
  const list = router.propsHistory || []
  const props = list[i - (router.history.length - list.length)] as Record<string, unknown> | undefined
  const kept: Record<string, unknown> = {}
  if (!props) return kept
  for (const key of KEPT_PROPS) if (props[key] !== undefined) kept[key] = props[key]
  // Copy through JSON. Throws if a prop can't be serialized.
  return JSON.parse(JSON.stringify(kept)) as PageProps
}

/** Builds nav.changed from the router. Returns null when there is no page yet. */
export function captureNavState(router: RouterLike, modalOpen: boolean): NavState | null {
  if (!router?.history) return null
  padPopupProps(router)
  const history: string[] = []
  const props: PageProps[] = []
  router.history.forEach((entry, i) => {
    const url = String(entry).split('#')[0]
    if (!navigable(router, url)) return
    let pageProps: PageProps = {}
    try {
      pageProps = propsAt(router, i)
    } catch {}
    if (history.length && history[history.length - 1] === url) {
      props[props.length - 1] = pageProps
      return
    }
    history.push(url)
    props.push(pageProps)
  })
  if (!history.length) return null
  return { path: history[history.length - 1], history, props, modal: modalOpen }
}
