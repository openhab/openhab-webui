<template>
  <f7-nav-left v-if="backLink">
    <f7-link v-if="!theme.md"
             icon-f7="chevron_left"
             :href="backLinkUrl"
             @click="back">
      {{ backLink }}
    </f7-link>
    <f7-link v-else
             icon-f7="arrow_left_md"
             :href="backLinkUrl"
             @click="back" />
  </f7-nav-left>
  <f7-nav-title>
    {{ title }}
    <span v-if="subtitle" class="subtitle">{{ subtitle }}</span>
  </f7-nav-title>
  <f7-nav-right>
    <developer-dock-icon />
    <f7-link v-if="editable === false"
             icon-f7="lock_fill"
             icon-only
             tooltip="Not editable through the UI" />
    <template v-if="saveLink && (editable === undefined || editable === true)">
      <f7-link v-if="theme.md"
               :href="saveLinkUrl"
               @click="$emit('save')"
               icon-md="material:save"
               icon-only />
      <f7-link v-if="!theme.md" @click="$emit('save')">
        {{ saveLink }}
      </f7-link>
    </template>
    <slot name="right" />
  </f7-nav-right>
</template>

<script setup lang="ts">
/*
 * The oh-nav-content component provides the default content for <f7-navbar>.
 * It includes a (working - F7 doesn't work properly) back button, a title, and a prefilled <f7-nav-right>:
 * - a lock icon if editable is false
 * - a save button if saveLink is provided and editable is not false - a click on this button emits a 'save' event and navigates to the saveLinkUrl if configured
 * - additional content can be added into <f7-nav-right> through the right slot
 *
 * To use it, simply put it as the first component into the f7-navbar.
 */
import { f7, theme } from 'framework7-vue'
import type { Router } from 'framework7'
import DeveloperDockIcon from '@/components/developer/developer-dock-icon.vue'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  title: string,
  subtitle?: string,
  backLink?: string,
  backLinkUrl?: string,
  editable?: boolean,
  saveLink?: string,
  saveLinkUrl?: string,
  f7router?: object,
}>(), {
  backLink: 'Back',
  editable: undefined
})

defineEmits(['save'])

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
