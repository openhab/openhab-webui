<template>
  <f7-page name="logviewer" class="log-viewer log-viewer-page" @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar>
      <oh-nav-content title="Log Viewer" back-link="Developer Tools" back-link-url="/developer/" :f7router>
        <template #right>
          <f7-link
            icon-ios="f7:play_fill"
            icon-f7="play_fill"
            icon-md="material:play_arrow"
            :icon-color="logViewerCore?.stateConnected && logViewerCore?.stateProcessing ? 'gray' : ''"
            :tooltip="!device.ios ? 'Continue receiving logs' : ''"
            :class="{
              'disabled-link': logViewerCore?.stateConnected && logViewerCore?.stateProcessing,
              'no-margin-left': device.ios,
              'connecting-flash': logViewerCore?.isConnecting
            }"
            @click="logViewerCore?.loggingContinue" />
          <f7-link
            icon-ios="f7:pause_fill"
            icon-aurora="f7:pause_fill"
            icon-md="material:pause_fill"
            :icon-color="!logViewerCore?.stateConnected || !logViewerCore?.stateProcessing ? 'gray' : ''"
            :tooltip="!device.ios ? 'Pause processing new logs' : ''"
            :class="{ 'disabled-link': !logViewerCore?.stateConnected || !logViewerCore?.stateProcessing, 'no-margin-left': device.ios }"
            @click="logViewerCore?.loggingPause" />
          <f7-link
            icon-ios="f7:stop_fill"
            icon-aurora="f7:stop_fill"
            icon-md="material:stop_fill"
            :icon-color="!logViewerCore?.stateConnected && !logViewerCore?.stateConnecting ? 'gray' : ''"
            :tooltip="!device.ios ? 'Stop receiving logs' : ''"
            :class="{ 'disabled-link': !logViewerCore?.stateConnected && !logViewerCore?.stateConnecting, 'no-margin-left': device.ios }"
            @click="logViewerCore?.loggingStop" />
        </template>
      </oh-nav-content>
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

    <f7-toolbar bottom>
      <f7-link
        icon-f7="cloud_download"
        tooltip="Download filtered log as CSV"
        :class="{ 'disabled-link': logViewerCore?.filterCount == 0 }"
        @click="logViewerCore?.downloadCSV" />
      <f7-link
        icon-f7="rectangle_on_rectangle"
        tooltip="Copy filtered log to clipboard"
        :class="{ 'disabled-link': logViewerCore?.filterCount == 0 }"
        @click="logViewerCore?.copyTableToClipboard" />
      <f7-link
        icon-f7="trash"
        tooltip="Clear the log buffer"
        :class="{ 'disabled-link': logViewerCore?.tableData.length == 0 }"
        @click="logViewerCore?.clearLog" />
      <f7-link @click="logViewerCore?.toggleErrorDisplay" tooltip="Always show error level logs">
        <f7-icon v-if="logViewerCore?.showErrors" f7="exclamationmark_triangle_fill" />
        <f7-icon v-else f7="exclamationmark_triangle" />
      </f7-link>
      <f7-link icon-f7="pencil" tooltip="Configure highlights" data-popup=".loghighlights-popup" class="popup-open" />
      <f7-segmented>
        <f7-button
          outline
          small
          :active="!logViewerCore?.textMode"
          icon-f7="table"
          :icon-size="theme.aurora ? 20 : 22"
          class="no-ripple"
          @click="logViewerCore?.setTextMode(false)"
          tooltip="Show logs in a table" />
        <f7-button
          outline
          small
          :active="logViewerCore?.textMode"
          icon-f7="text_justifyleft"
          :icon-size="theme.aurora ? 20 : 22"
          class="no-ripple"
          @click="logViewerCore?.setTextMode(true)"
          tooltip="Show logs as plain text" />
      </f7-segmented>
      <f7-link icon-f7="gear" tooltip="Configure logging" data-popup=".log-settings-popup" class="popup-open" />
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
    .connecting-flash:not(.disabled-link)
      .icon
        animation opacity-pulse 0.5s cubic-bezier(1, 0, 0.4, 1) infinite alternate

  .table-container
    height calc(100vh - var(--f7-navbar-height) - var(--f7-subnavbar-height) - var(--f7-toolbar-height))

  .dock-scroll-button
    bottom: calc(var(--f7-toolbar-height) + 16px)
</style>

<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { type Router, getDevice } from 'framework7'
import { theme } from 'framework7-vue'
import LogViewerCore from './log-viewer-core.vue'

// Constants
const device = getDevice()

// Defines
defineProps<{
  f7router: Router.Router
}>()

// State/Data
const logViewerCore = useTemplateRef('logViewerCore')

// Lifecycle Hooks
function onPageAfterIn() {
  logViewerCore.value?.load()
}

function onPageBeforeOut() {
  logViewerCore.value?.cleanup()
}
</script>
