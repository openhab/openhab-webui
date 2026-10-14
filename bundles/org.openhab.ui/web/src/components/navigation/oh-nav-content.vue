<template>
  <f7-nav-left class="oh-nav-content">
    <f7-link
      v-if="menuIcon && !hostMenu"
      class="menu-icon"
      icon-ios="f7:menu"
      icon-aurora="f7:menu"
      icon-md="material:menu"
      panel-open="left" />
    <f7-link v-if="!theme.md" icon-f7="chevron_left" :href="backLinkUrl" @click="back">
      {{ $f7dim.width > 500 ? backLink || t('dialogs.back') : null }}
    </f7-link>
    <f7-link v-else icon-f7="arrow_left_md" :href="backLinkUrl" @click="back" />
  </f7-nav-left>
  <!-- if large is enabled, we need both the normal and the large title, as the navbar might collapse when scrolling down -->
  <f7-nav-title>
    {{ title }}<span v-if="subtitle" class="subtitle">{{ subtitle }}</span>
  </f7-nav-title>
  <f7-nav-title-large v-if="large">
    {{ title }}<span v-if="subtitle" class="subtitle">{{ subtitle }}</span>
  </f7-nav-title-large>
  <f7-nav-right>
    <developer-dock-icon />
    <f7-link v-if="editable === false" icon-f7="lock_fill" icon-only tooltip="Not editable through the UI" />
    <template v-if="saveLink && (editable === undefined || editable === true)">
      <f7-link
        v-if="theme.md"
        :href="saveLinkUrl"
        @click="$emit('save')"
        :class="{ disabled: disableSaveLink }"
        icon-md="material:save"
        icon-only />
      <f7-link v-if="!theme.md" @click="$emit('save')" :class="{ disabled: disableSaveLink }">
        {{ saveLink }}
      </f7-link>
    </template>
    <f7-link
      v-for="action in actions"
      :key="action.id"
      :icon-ios="action.icon?.name"
      :icon-aurora="action.icon?.name"
      :icon-md="action.icon?.md ?? action.icon?.name"
      :text="hasIcon(action) ? undefined : action.label"
      :tooltip="hasIcon(action) && !$device.ios ? action.label : undefined"
      :class="[action.class, { disabled: action.disabled }]"
      @click="action.run()" />
  </f7-nav-right>
  <slot name="after" />
</template>

<style lang="stylus">
.aurora .navbar .oh-nav-content.left a + a
  margin-left: unset
.ios .navbar .oh-nav-content.left a + a
  margin-left: unset
.md .navbar .oh-nav-content.left a + a
  margin-left: unset
.navbar .oh-nav-content.left a.menu-icon
  margin-right: 10px
</style>

<script setup lang="ts">
/*
 * The oh-nav-content component provides the default content for <f7-navbar>.
 * It includes a (working - F7 doesn't work properly) back button, a title, and a prefilled <f7-nav-right>:
 * - a lock icon if editable is false
 * - a save button if saveLink is provided and editable is not false - a click on this button emits a 'save' event and navigates to the saveLinkUrl if configured
 * - the buttons in the actions prop
 *
 * All buttons must come from these props. The iOS and Android apps draw the bar from them.
 * See js/host-bridge/navbar.ts.
 *
 * By setting the backLinkUrl property to null, the included back navigation can be disabled.
 * Instead, the 'back' event is emitted and navigation has to be implemented explicitly.
 *
 * To use it, simply put it as the first component into the f7-navbar.
 */
import { f7, theme } from 'framework7-vue'
import type { Router } from 'framework7'
import DeveloperDockIcon from '@/components/developer/developer-dock-icon.vue'
import { useI18n } from 'vue-i18n'
import { hostTakesOver } from '@/js/host-bridge/bridge'
import { useHostNavbar, type HostNavbarAction } from '@/js/host-bridge/navbar'

const props = withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    menuIcon?: boolean
    backLink?: string
    backLinkUrl?: string
    editable?: boolean
    saveLink?: string
    saveLinkUrl?: string
    disableSaveLink?: boolean
    large?: boolean
    f7router?: Router.Router
    actions?: HostNavbarAction[]
  }>(),
  {
    actions: () => [],
    menuIcon: true,
    editable: undefined,
    large: false,
    disableSaveLink: false
  }
)

const emit = defineEmits(['back', 'save'])

defineSlots<{
  after: void
}>()

const { t } = useI18n({ useScope: 'local' })

console.log('nav router', props.f7router)

// Does a native host take over our menu
const hostMenu = hostTakesOver('menu')

function hasIcon(action: HostNavbarAction) {
  return !!(theme.md ? (action.icon?.md ?? action.icon?.name) : action.icon?.name)
}

function router(): Router.Router {
  return props.f7router || f7.views.main.router
}

// Returns the top menu bar structure/state for native apps to render
useHostNavbar(() => {
  if (!hostTakesOver('navbar')) return null
  const trailing: HostNavbarAction[] = []
  if (props.editable === false) {
    trailing.push({ id: 'locked', label: 'Not editable', icon: { name: 'f7:lock_fill' }, disabled: true, run: () => {} })
  }
  if (props.saveLink && props.editable !== false) {
    trailing.push({
      id: 'save',
      label: props.saveLink,
      disabled: props.disableSaveLink,
      run: () => {
        emit('save')
        if (props.saveLinkUrl) router().navigate(props.saveLinkUrl)
      }
    })
  }
  let runBack: (() => void) | undefined
  if (props.backLinkUrl) runBack = () => router().navigate(props.backLinkUrl!)
  else if (props.backLinkUrl === null) runBack = () => emit('back')
  return {
    title: props.title,
    large: props.large,
    back: { label: props.backLink || t('dialogs.back'), run: runBack },
    trailing: [...trailing, ...props.actions]
  }
})

function back() {
  if (props.backLinkUrl) return
  if (props.backLinkUrl === null) {
    emit('back')
    return
  }
  const f7router: Router.Router = props.f7router || f7.views.main.router
  f7router.back()

  /*
  const currentPath = f7router.currentRoute.path
  let previousPath : string | null = null
  for (let i = f7router.history.length - 1; i >= 0; i--) {
    const path = f7router.history[i]
    if (!path.startsWith(currentPath)) {
      previousPath = path
      break
    }
  }

  if (previousPath === null) {
    console.warn('No previous path found in history, falling back to root path.')
    previousPath = '/'
  }
  console.debug('Navigating back to previous path:', previousPath)
  f7router.history.pop()
  f7router.navigate(previousPath, { force: true })
  */
}
</script>
