<template>
  <f7-nav-left>
    <f7-link v-if="!theme.md"
             icon-f7="chevron_left"
             :href="backLinkUrl"
             @click="back">
      {{ backLink ?? 'Back' }}
    </f7-link>
    <f7-link v-else
             icon-f7="arrow_left_md"
             :href="backLinkUrl"
             @click="back" />
  </f7-nav-left>
  <f7-nav-title>{{ title }}</f7-nav-title>
  <f7-nav-right>
    <developer-dock-icon />
    <slot name="right" />
  </f7-nav-right>
</template>

<script setup lang="ts">
/*
 * The oh-nav-content component provides the default content for the f7-navbar.
 * It includes a (working - F7 doesn't work properly) back button, a title, the developer dock icon and a slot for additional content for f7-nav-right.
 *
 * To use it, simply put it as first component into the f7-navbar.
 */
import { f7, theme } from 'framework7-vue'
import type { Router } from 'framework7'
import DeveloperDockIcon from '@/components/developer/developer-dock-icon.vue'

const props = defineProps<{
  title: string | undefined,
  backLink?: string
  backLinkUrl?: string,
  f7router?: object,
}>()

defineSlots<{
  right: void,
}>()

function back () {
  if (props.backLinkUrl) return
  // @ts-expect-error assuming Router.Router for f7router prop
  const f7router : Router.Router = props.f7router || f7.views.main.router

  f7router.history.pop()
  const previousRoute : string | null = f7router.history.pop() ?? null
  if (previousRoute === null) {
    console.warn('No previous route found in history, cannot navigate back.')
    return
  }
  console.debug('Navigating back to previous route:', previousRoute)
  f7router.navigate(previousRoute, { force: true })
}
</script>
