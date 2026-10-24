import type * as api from '@/api'
import { AddonIcons, AddonTitles } from '@/assets/addon-store'
import { getAdminSidebarCandidates, getEffectiveAdminSidebarItems } from '@/js/admin-menu'
import { useRuntimeStore } from '@/js/stores/useRuntimeStore'
import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'
import { useUserStore } from '@/js/stores/useUserStore'
import { getPageIcon } from '@/pages/page-type'
import { buildMenuState, type MenuInput, type MenuLink } from './menu'
import type { MenuState } from './protocol'

export interface SidebarContext {
  /** App.vue's local messages (sidebar.*, chat.title). */
  t: (key: string) => string
  /** Global messages, used for the admin menu titles. */
  globalT: (key: string) => string
  pages: readonly api.RootUiComponent[] | null
  currentUrl: string
  loggedIn: boolean
}

/** Builds menu.state from the sidebar content for the current user. */
export function sidebarMenuState({ t, globalT, pages, currentUrl, loggedIn }: SidebarContext): MenuState {
  const runtimeStore = useRuntimeStore()
  const uiOptionsStore = useUIOptionsStore()
  const userStore = useUserStore()

  const adminLinks = (section: 'settings' | 'developer') => {
    const all = getAdminSidebarCandidates(section, runtimeStore)
    const picked = getEffectiveAdminSidebarItems(section, runtimeStore, uiOptionsStore.sidebarSubmenuSelections[section])
    const link = (i: (typeof all)[number]): MenuLink => ({
      id: i.link,
      label: globalT(i.titleKey),
      path: i.link,
      icon: { name: 'f7:' + i.icon }
    })
    return { children: picked.map(link), more: all.filter((i) => !picked.includes(i)).map(link) }
  }

  const addons: MenuLink[] = runtimeStore.apiEndpoint('addons')
    ? (Object.keys(AddonTitles) as (keyof typeof AddonTitles)[]).map((key) => ({
        id: `/addons/${key}/`,
        label: AddonTitles[key],
        path: `/addons/${key}/`,
        icon: { name: 'f7:' + AddonIcons[key] }
      }))
    : []

  let account: MenuInput['account'] = null
  if (runtimeStore.apiEndpoint('auth')) {
    const user = userStore.user
    if (user) {
      account = {
        user: {
          id: '/profile/',
          label: user.name,
          path: '/profile/',
          footer: window.location.origin,
          icon: { name: 'f7:person_alt_circle_fill' }
        }
      }
    } else if (!loggedIn) {
      account = { unlock: { label: t('sidebar.unlockAdmin') } }
    }
  }

  return buildMenuState({
    currentUrl,
    pages: (pages ?? []).map((p) => ({
      id: '/page/' + p.uid,
      label: (p.config?.label as string | undefined) || p.uid,
      path: '/page/' + p.uid,
      icon: { name: getPageIcon(p) }
    })),
    chat: { id: '/chat', label: t('chat.title'), path: '/chat', icon: { name: 'f7:chat_bubble_2', md: 'material:chat' } },
    admin: userStore.isAdmin()
      ? {
          title: t('sidebar.administration'),
          settings: {
            id: '/settings/',
            label: t('sidebar.settings'),
            path: '/settings/',
            icon: { name: 'f7:gear_alt_fill', md: 'material:settings' },
            ...adminLinks('settings')
          },
          addons: {
            id: '/addons/',
            label: t('sidebar.addOnStore'),
            path: '/addons/',
            icon: { name: 'f7:bag_fill', md: 'material:shopping_bag' },
            children: addons
          },
          developer: {
            id: '/developer/',
            label: t('sidebar.developerTools'),
            path: '/developer/',
            icon: { name: 'f7:wrench_fill', md: 'material:construction' },
            ...adminLinks('developer')
          }
        }
      : null,
    about: {
      id: '/about/',
      label: t('sidebar.helpAbout'),
      path: '/about/',
      icon: { name: 'f7:question_circle_fill', md: 'material:help' }
    },
    account
  })
}
