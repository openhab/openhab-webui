<template>
  <f7-page name="logviewer" class="log-viewer log-viewer-page" @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar>
      <oh-nav-content title="Log Viewer" back-link="Developer Tools" back-link-url="/developer/" :f7router :actions="actions" />
      <f7-subnavbar :inner="false" style="padding-right: var(--f7-safe-area-right)">
        <f7-searchbar
          ref="searchbar"
          custom-search
          placeholder="Filter"
          clear-button
          :disable-button="false"
          :value="logViewerCore?.filterText"
          @searchbar:search="logViewerCore?.handleFilter"
          @searchbar:clear="logViewerCore?.clearFilter" />
        <div style="display: flex; flex-wrap: nowrap">
          <f7-badge
            class="log-period margin-left-half"
            :color="logViewerCore?.periodRangeColor"
            :tooltip="logViewerCore?.periodRangeTooltip">
            {{ logViewerCore?.logStart }}&nbsp;>&nbsp;{{ logViewerCore?.logEnd }}
          </f7-badge>
          <f7-badge class="margin-horizontal" :color="logViewerCore?.countersBadgeColor" tooltip="Log entries filtered/total">
            {{ logViewerCore?.filterCount }}/{{ logViewerCore?.tableData.length }}
          </f7-badge>
        </div>
      </f7-subnavbar>
    </f7-navbar>

    <f7-toolbar bottom class="log-viewer-toolbar">
      <log-viewer-toolbar :log-viewer-core="logViewerCore" />
    </f7-toolbar>

    <log-viewer-core ref="logViewerCore" />
  </f7-page>
</template>

<style lang="stylus">
.log-viewer-page
  .subnavbar
    height: unset

    .badge.color-red
      background-color #c81d00
    .badge.color-orange
      background-color #f59b00
    .badge.color-green
      background-color #12cc00

  .navbar
    .connecting-flash:not(.disabled)
      .icon
        animation opacity-pulse 0.5s cubic-bezier(1, 0, 0.4, 1) infinite alternate

  .table-container
    height calc(100vh - var(--f7-navbar-height) - var(--f7-subnavbar-height) - var(--f7-toolbar-height))

  .dock-scroll-button
    bottom: calc(var(--f7-toolbar-height) + 16px)
</style>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { type Router, getDevice } from 'framework7'
import LogViewerCore from './log-viewer-core.vue'
import LogViewerToolbar from './log-viewer-toolbar.vue'
import type { HostNavbarAction } from '@/js/host-bridge/navbar'

// Constants
const device = getDevice()

// Defines
defineProps<{
  f7router: Router.Router
}>()

// State/Data
const logViewerCore = useTemplateRef('logViewerCore')

const actions = computed<HostNavbarAction[]>(() => {
  const core = logViewerCore.value
  return [
    {
      id: 'continue',
      label: 'Continue receiving logs',
      icon: { name: 'f7:play_fill', md: 'material:play_arrow' },
      disabled: !!(core?.stateConnected && core?.stateProcessing),
      class: { 'no-margin-left': !!device.ios, 'connecting-flash': !!core?.isConnecting },
      run: () => core?.loggingContinue()
    },
    {
      id: 'pause',
      label: 'Pause processing new logs',
      icon: { name: 'f7:pause_fill', md: 'material:pause_fill' },
      disabled: !core?.stateConnected || !core?.stateProcessing,
      class: { 'no-margin-left': !!device.ios },
      run: () => core?.loggingPause()
    },
    {
      id: 'stop',
      label: 'Stop receiving logs',
      icon: { name: 'f7:stop_fill', md: 'material:stop_fill' },
      disabled: !core?.stateConnected && !core?.stateConnecting,
      class: { 'no-margin-left': !!device.ios },
      run: () => core?.loggingStop()
    }
  ]
})

// Lifecycle Hooks
function onPageAfterIn() {
  logViewerCore.value?.load()
}

function onPageBeforeOut() {
  logViewerCore.value?.cleanup()
}
</script>
