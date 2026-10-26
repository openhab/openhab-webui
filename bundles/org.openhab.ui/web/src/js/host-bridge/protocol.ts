// The messages Main UI and the openHAB iOS and Android apps send each other.
// "Host" means the app. Messages are JSON strings, wrapped in an Envelope.

export type HostFeature = 'navbar' | 'menu' | 'routeRestore'

export type UIFeature = 'navbar' | 'menu' | 'routeRestore' | 'layout'

export interface LayoutInfo {
  /** How much of the page the app's bars cover, in CSS pixels. */
  insets: { top: number; bottom: number }
  /**
   * How much of the page the app's top bar covers. 0 when the bar sits above the web view; Main UI
   * then leaves no room for it. Left out: Main UI keeps its own bar height.
   */
  navbarHeight?: number
}

/** Set by the app before Main UI starts, as `window.OHBridge.info`. */
export interface HostInfo {
  protocol: 1
  platform: 'ios' | 'android'
  appVersion: string
  features: HostFeature[]
  theme?: 'ios' | 'md' | 'aurora'
  darkMode?: 'light' | 'dark'
  /** Pages to restore at startup, oldest first. */
  initialHistory?: string[]
  /** The props of each page in initialHistory. */
  initialProps?: PageProps[]
  layout?: LayoutInfo
}

export interface Envelope<P = unknown> {
  v: 1
  type: string
  id?: string
  replyTo?: string
  payload: P
}

export type ReplyErrorCode = 'not_ready' | 'unknown_type' | 'not_allowed' | 'not_found' | 'failed'

export type ReplyPayload<R = unknown> = { ok: true; result?: R } | { ok: false; error: { code: ReplyErrorCode; message?: string } }

export interface UIHello {
  protocol: 1
  impl: 'mainui'
  version?: string
  accepted: HostFeature[]
  features: UIFeature[]
}

/** Page props worth saving: `deep` (back link) and `defineVars` (page variables). */
export interface PageProps {
  deep?: boolean
  defineVars?: Record<string, unknown>
}

export interface NavState {
  path: string
  history: string[]
  props?: PageProps[]
  modal: boolean
}

/** Icons in Main UI's own format, e.g. "f7:gear_alt_fill", "material:settings", "oh:classic:light". */
export interface Icon {
  name: string
  /** Icon for the md theme, if different. */
  md?: string
}

export interface NavbarAction {
  id: string
  label: string
  icon?: Icon
  disabled?: boolean
}

export interface NavbarState {
  title: string
  titleInContent: boolean
  /** The app should hide its bar: the page scrolled it away, or a popup, expanded card or search is open. */
  hidden: boolean
  back: { label?: string } | null
  leading: NavbarAction[]
  trailing: NavbarAction[]
}

export interface MenuItem {
  id: string
  label: string
  footer?: string
  icon?: Icon
  path?: string
  active?: boolean
  children?: MenuItem[]
  more?: MenuItem[]
}

export interface MenuSection {
  id: string
  title?: string
  items: MenuItem[]
}

export interface MenuState {
  sections: MenuSection[]
}

export interface Credentials {
  username: string
  password: string
}
