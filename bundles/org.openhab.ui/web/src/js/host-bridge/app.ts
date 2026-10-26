import { nextTick, ref, watch } from 'vue'
import { f7 } from 'framework7-vue'
import { useStatesStore } from '@/js/stores/useStatesStore'
import { BridgeError, hasSaidHello, hostDarkMode, hostInfo, hostTakesOver, onHostCommand, sayHello, send } from './bridge'
import { UNLOCK_ID } from './menu'
import { hostNavbarVersion, navbarStateFor, runNavbarAction, runNavbarBack } from './navbar'
import { captureNavState, isModalRoute, restoreProps, takeSeededHistory, type RouterLike } from './routes'
import type { LayoutInfo, MenuState } from './protocol'

interface F7Page {
  el?: Element | null
  route?: { url?: string }
}

// Everything that can be open on top of the page.
const MODALS = {
  popup: '.popup.modal-in',
  sheet: '.sheet-modal.modal-in',
  popover: '.popover.modal-in',
  actions: '.actions-modal.modal-in',
  dialog: '.dialog.modal-in',
  card: '.card-expandable.card-opened'
}
const MODAL_SELECTOR = Object.values(MODALS).join(', ')
// Open on top of the page and showing their own bar.
const BAR_COVERS = [MODALS.popup, MODALS.card].join(', ')
const MODAL_EVENTS = [
  'popupOpen',
  'popupOpened',
  'popupClose',
  'popupClosed',
  'sheetOpened',
  'sheetClosed',
  'popoverOpened',
  'popoverClosed',
  'actionsOpened',
  'actionsClosed',
  'dialogOpened',
  'dialogClosed',
  'cardOpen',
  'cardOpened',
  'cardClose',
  'cardClosed'
] as const

export interface HostAppOptions {
  version: string
  /** The menu to send as menu.state. Null until it is ready. */
  menu: () => MenuState | null
  /** Opens a popup, popover or sheet, as `kind:target`. */
  openModal: (command: string) => void
  /** Starts sign-in. Returns false when already signed in. */
  unlock: () => boolean
}

/**
 * Talks to the iOS or Android app that Main UI runs in. Sends the current page, top bar, menu and
 * connection state, and handles the app's commands. Call from App's created(), and call start()
 * once Framework7 is ready.
 */
export function useHostApp(options: HostAppOptions) {
  const hostNavbar = hostTakesOver('navbar')
  const hostMenu = hostTakesOver('menu')

  const navbarHeight = ref(hostInfo()?.layout?.navbarHeight)
  const insets = ref<LayoutInfo['insets'] | undefined>(hostInfo()?.layout?.insets)
  const scrolledAway = ref(false)
  const collapsed = ref(false)
  const covered = ref(false)
  const searching = ref(false)

  // Cast to the part of the router the route helpers use.
  const mainRouter = () => f7.views.main?.router as unknown as RouterLike | undefined

  let page: Element | null = null
  // Set when the current route is a popup, sheet or popover.
  let modalRoute = false
  let restore = takeSeededHistory()
  const sent = { nav: '', navbar: '', menu: '' }

  // Set on <html>, because f7-app ignores class and style bindings.
  document.documentElement.classList.toggle('host-navbar', hostNavbar)
  document.documentElement.classList.toggle('host-menu', hostMenu)
  // 0: the app's bar sits above the web view, and pages leave no room for it.
  watch(
    navbarHeight,
    (height) => {
      if (!hostNavbar || height === undefined) return
      document.documentElement.classList.toggle('host-navbar-outside', height === 0)
      if (height > 0) document.documentElement.style.setProperty('--f7-navbar-height', height + 'px')
    },
    { immediate: true }
  )
  // Leave room for the app's bars. The web view's own safe area still counts: the app can report
  // its insets before it knows them.
  watch(
    insets,
    (value) => {
      if (!value) return
      const root = document.documentElement.style
      root.setProperty('--f7-safe-area-top', `max(env(safe-area-inset-top), ${value.top}px)`)
      root.setProperty('--f7-safe-area-bottom', `max(env(safe-area-inset-bottom), ${value.bottom}px)`)
    },
    { immediate: true }
  )

  function modalOpen() {
    return modalRoute || openModals().length > 0
  }

  function sendMenu() {
    const menu = options.menu()
    if (!hostMenu || !hasSaidHello() || !menu) return
    const json = JSON.stringify(menu)
    if (json === sent.menu) return
    sent.menu = json
    send('menu.state', menu)
  }

  function sendNavbar() {
    if (!hostNavbar || !hasSaidHello()) return
    // Hide the app's bar while a popup, an expanded card or an expanded searchbar shows its own bar.
    const hidden = scrolledAway.value || covered.value || searching.value
    // Main UI's large title is part of its bar, which isn't shown when the app's bar is outside.
    const state = navbarStateFor(page, { hidden, collapsed: collapsed.value || navbarHeight.value === 0 })
    const json = JSON.stringify(state)
    if (json === sent.navbar) return
    sent.navbar = json
    send('navbar.state', state)
  }

  function sendNav() {
    if (!hasSaidHello() || restore) return
    const state = captureNavState(mainRouter()!, modalOpen())
    if (!state) return
    const json = JSON.stringify(state)
    if (json === sent.nav) return
    sent.nav = json
    send('nav.changed', state)
  }

  // Called for every page shown. The first one sends the hello and finishes the page restore.
  function pageShown(shown: F7Page) {
    if (!shown.el || shown.el.closest('.popup')) return
    page = shown.el
    modalRoute = false
    scrolledAway.value = false
    collapsed.value = false
    // Restore props only if the first page is the last saved page. A redirect can land elsewhere.
    if (restore) {
      const pages = restore
      restore = null
      const router = mainRouter()
      if (router && shown.route?.url === pages[pages.length - 1]) restoreProps(router, pages, hostInfo()?.initialProps)
    }
    sayHello(options.version)
    sendNav()
    sendNavbar()
    sendMenu()
  }

  watch(options.menu, sendMenu)
  watch(
    () => useStatesStore().sseConnected,
    (connected) => send('connection.state', { sseConnected: !!connected }),
    { immediate: true }
  )
  watch([scrolledAway, collapsed, covered, searching, navbarHeight], sendNavbar)
  watch(hostNavbarVersion, () => {
    void nextTick(sendNavbar)
  })

  function openModals() {
    return Array.from(document.querySelectorAll<HTMLElement>(MODAL_SELECTOR))
  }

  function closeModal(el: HTMLElement) {
    if (el.matches(MODALS.popup)) f7.popup.close(el)
    else if (el.matches(MODALS.sheet)) f7.sheet.close(el)
    else if (el.matches(MODALS.popover)) f7.popover.close(el)
    else if (el.matches(MODALS.actions)) f7.actions.close(el)
    else if (el.matches(MODALS.dialog)) f7.dialog.close(el)
    else if (el.matches(MODALS.card)) f7.card.close(el)
  }

  function registerCommands() {
    const router = () => f7.views.main.router
    onHostCommand('nav.navigate', ({ path }: { path?: string }) => {
      if (!path) throw new BridgeError('not_found')
      router().navigate(path)
    })
    // Close whatever is open on top of the page before going back.
    onHostCommand('nav.back', () => {
      const open = openModals().pop()
      if (open) closeModal(open)
      else if (!runNavbarBack(page)) router().back()
    })
    onHostCommand('nav.openModal', ({ kind, target }: { kind?: string; target?: string }) => {
      if (!['popup', 'popover', 'sheet'].includes(kind ?? '') || !/^(page:|widget:|oh-)/.test(target ?? ''))
        throw new BridgeError('not_found')
      options.openModal(kind + ':' + target)
    })
    onHostCommand('nav.closeModals', () => openModals().forEach(closeModal))
    onHostCommand('nav.getState', () => captureNavState(mainRouter()!, modalOpen()))
    onHostCommand('navbar.activate', ({ id }: { id: string }) => {
      if (!runNavbarAction(page, id)) throw new BridgeError('not_found')
    })
    onHostCommand('menu.activate', ({ id }: { id: string }) => {
      if (id !== UNLOCK_ID || !options.unlock()) throw new BridgeError('not_found')
    })
    onHostCommand('layout.changed', (layout: Partial<LayoutInfo>) => {
      if (layout.insets) insets.value = layout.insets
      if (typeof layout.navbarHeight === 'number' && layout.navbarHeight >= 0) navbarHeight.value = layout.navbarHeight
    })
    onHostCommand('settings.changed', ({ darkMode }: { darkMode?: string }) => {
      if (darkMode === 'light' || darkMode === 'dark') hostDarkMode.value = darkMode
    })
    onHostCommand('ui.reload', () => {
      setTimeout(() => window.location.reload(), 0)
    })
  }

  /** Adds the Framework7 listeners and command handlers. Call once Framework7 is ready. */
  function start() {
    f7.on('routeChange', (route) => {
      modalRoute = !!route && isModalRoute(route)
      void nextTick(() => {
        sendNav()
        sendNavbar()
      })
    })
    f7.on('pageAfterIn', pageShown)
    f7.on('routeUrlUpdate', () => {
      void nextTick(sendNav)
    })
    if (hostNavbar) {
      f7.on('navbarHide', () => (scrolledAway.value = true))
      f7.on('navbarShow', () => (scrolledAway.value = false))
      f7.on('navbarCollapse', () => (collapsed.value = true))
      f7.on('navbarExpand', () => (collapsed.value = false))
      f7.on('searchbarEnable', (searchbar) => (searching.value = !!searchbar?.expandable))
      f7.on('searchbarDisable', () => (searching.value = false))
    }
    // Modals opened from code don't change the route.
    for (const event of MODAL_EVENTS) {
      f7.on(event, () => {
        void nextTick(() => {
          covered.value = !!document.querySelector(BAR_COVERS)
          sendNav()
        })
      })
    }
    registerCommands()
    // The first page may already be in before these listeners were added.
    const current = document.querySelector('.view-main .page-current')
    if (current) pageShown({ el: current, route: f7.views.main?.router?.currentRoute })
  }

  return { hostNavbar, hostMenu, start }
}
