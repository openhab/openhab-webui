import { getCurrentInstance, onBeforeUnmount, ref, watch, type ComponentInternalInstance } from 'vue'
import type { Icon, NavbarAction, NavbarState } from './protocol'

/** `name` is used on the ios and aurora themes, `md` on md. With no icon for the theme, the label is shown. */
export interface ActionIcon {
  name?: string
  md?: string
}

export interface HostNavbarAction {
  id: string
  label: string
  icon?: ActionIcon
  disabled?: boolean
  run: () => void
  /** Classes for the button Main UI draws. Not sent to the app. */
  class?: string | Record<string, boolean | undefined>
}

/**
 * A page's top bar, for the app to draw.
 *
 * Every page must describe all of its bar. When the app draws the bar, Main UI hides its own, and a
 * button left out is lost. Pages using oh-nav-content are described through its props. Pages with
 * their own bar call useHostNavbar. host-navbar-contract.test.ts checks this. Popups keep their own
 * bar.
 */
export interface HostNavbar {
  title: string
  large?: boolean
  /** Null for no back button. Without `run` the router goes back. */
  back: { label?: string; run?: () => void } | null
  leading?: HostNavbarAction[]
  trailing?: HostNavbarAction[]
}

interface Registration {
  page: () => Element | null
  bar: HostNavbar
}

// Registered bars, looked up by page element. Framework7's page events pass the element.
const registrations = new Set<Registration>()

/** Increments when any description changes. */
export const hostNavbarVersion = ref(0)

// The element of the f7-page around the component, or the component's own root element.
function pageElement(instance: ComponentInternalInstance): () => Element | null {
  for (let i = instance.parent; i; i = i.parent) {
    if (i.type.name === 'f7-page') return () => (i.proxy?.$el as Element) ?? null
  }
  return () => (instance.proxy?.$el as Element) ?? null
}

/**
 * Describes the calling page's top bar to the app. Call from setup() in a page component or in a
 * component inside one. Return null to describe nothing.
 */
export function useHostNavbar(describe: () => HostNavbar | null) {
  const instance = getCurrentInstance()
  if (!instance) return
  let registration: Registration | null = null
  watch(
    describe,
    (bar) => {
      if (bar && registration) registration.bar = bar
      else if (bar) registrations.add((registration = { page: pageElement(instance), bar }))
      else if (registration) {
        registrations.delete(registration)
        registration = null
      }
      hostNavbarVersion.value++
    },
    { immediate: true, deep: true }
  )
  onBeforeUnmount(() => {
    if (registration) registrations.delete(registration)
    hostNavbarVersion.value++
  })
}

function barFor(page: Element | null | undefined): HostNavbar | undefined {
  if (!page) return undefined
  for (const r of registrations) if (r.page() === page) return r.bar
  return undefined
}

function actions(list: HostNavbarAction[] | undefined): NavbarAction[] {
  return (list ?? []).map(({ id, label, icon, disabled }) => {
    const action: NavbarAction = { id, label }
    const name = icon?.name ?? icon?.md
    if (name) action.icon = icon?.md && icon.md !== name ? { name, md: icon.md } : { name }
    if (disabled) action.disabled = true
    return action
  })
}

/** Builds navbar.state for a page element. Returns an empty bar for a page with no description. */
export function navbarStateFor(page: Element | null | undefined, view: { hidden: boolean; collapsed: boolean }): NavbarState {
  const bar = barFor(page)
  return {
    title: bar?.title ?? '',
    titleInContent: !!bar?.large && !view.collapsed,
    hidden: view.hidden,
    back: bar?.back ? (bar.back.label ? { label: bar.back.label } : {}) : null,
    leading: actions(bar?.leading),
    trailing: actions(bar?.trailing)
  }
}

/** Runs a bar button. Returns false if the page has no such button. */
export function runNavbarAction(page: Element | null | undefined, id: string): boolean {
  const bar = barFor(page)
  const action = [...(bar?.leading ?? []), ...(bar?.trailing ?? [])].find((a) => a.id === id)
  if (!action || action.disabled) return false
  action.run()
  return true
}

/** Runs the page's own back action. Returns false if it has none. */
export function runNavbarBack(page: Element | null | undefined): boolean {
  const run = barFor(page)?.back?.run
  if (!run) return false
  run()
  return true
}
