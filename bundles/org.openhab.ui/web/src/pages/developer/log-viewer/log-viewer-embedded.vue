<template>
  <div class="log-viewer log-viewer-embedded" :class="{ 'log-viewer-fullscreen': fullscreen }">
    <div class="dock-header">
      <div class="dock-header-row">
        <div class="dock-title">Log Viewer</div>
        <div class="dock-actions">
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
            @click="logViewerCore?.loggingContinue()" />
          <f7-link
            icon-ios="f7:pause_fill"
            icon-aurora="f7:pause_fill"
            icon-md="material:pause_fill"
            :icon-color="!logViewerCore?.stateConnected || !logViewerCore?.stateProcessing ? 'gray' : ''"
            :tooltip="!device.ios ? 'Pause processing new logs' : ''"
            :class="{ 'disabled-link': !logViewerCore?.stateConnected || !logViewerCore?.stateProcessing, 'no-margin-left': device.ios }"
            @click="logViewerCore?.loggingPause()" />
          <f7-link
            icon-ios="f7:stop_fill"
            icon-aurora="f7:stop_fill"
            icon-md="material:stop_fill"
            :icon-color="!logViewerCore?.stateConnected && !logViewerCore?.stateConnecting ? 'gray' : ''"
            :tooltip="!device.ios ? 'Stop receiving logs' : ''"
            :class="{ 'disabled-link': !logViewerCore?.stateConnected && !logViewerCore?.stateConnecting, 'no-margin-left': device.ios }"
            @click="logViewerCore?.loggingStop()" />
          <span class="dock-action-sep" />
          <f7-link
            :icon-f7="fullscreen ? 'arrow_down_to_line' : 'arrow_up_left_arrow_down_right'"
            :tooltip="fullscreen ? 'Restore docked size (Shift+Alt+F)' : 'Fill main pane (Shift+Alt+F)'"
            @click="$emit('toggle-fullscreen')" />
          <f7-link
            :icon-f7="collapsed ? 'chevron_down' : 'chevron_up'"
            :tooltip="collapsed ? 'Show filter and toolbar' : 'Hide filter and toolbar'"
            @click="toggleCollapsed" />
          <span class="dock-action-sep" />
          <f7-link icon-f7="xmark" tooltip="Hide log pane (Shift+Alt+L)" @click="$emit('hide')" />
        </div>
      </div>
    </div>

    <div v-if="!collapsed" class="dock-filter-row searchbar">
      <f7-searchbar
        ref="searchbar"
        :value="logViewerCore?.filterText"
        custom-search
        placeholder="Filter"
        clear-button
        :disable-button="false"
        @searchbar:search="logViewerCore?.handleFilter"
        @searchbar:clear="logViewerCore?.clearFilter" />
      <div class="dock-stats">
        <f7-badge class="log-period margin-left-half" :color="logViewerCore?.periodRangeColor" :tooltip="logViewerCore?.periodRangeTooltip">
          {{ logViewerCore?.logStart }}&nbsp;>&nbsp;{{ logViewerCore?.logEnd }}
        </f7-badge>
        <f7-badge class="margin-horizontal" :color="logViewerCore?.countersBadgeColor" tooltip="Log entries filtered/total">
          {{ logViewerCore?.filterCount ?? 0 }}/{{ logViewerCore?.tableData?.length ?? 0 }}
        </f7-badge>
      </div>
    </div>

    <div v-if="!collapsed" class="dock-toolbar">
      <f7-link
        icon-f7="cloud_download"
        tooltip="Download filtered log as CSV"
        :class="{ 'disabled-link': logViewerCore?.filterCount == 0 }"
        @click="logViewerCore?.downloadCSV()" />
      <f7-link
        icon-f7="rectangle_on_rectangle"
        tooltip="Copy filtered log to clipboard"
        :class="{ 'disabled-link': logViewerCore?.filterCount == 0 }"
        @click="logViewerCore?.copyTableToClipboard()" />
      <f7-link
        icon-f7="trash"
        tooltip="Clear the log buffer"
        :class="{ 'disabled-link': (logViewerCore?.tableData?.length ?? 0) == 0 }"
        @click="logViewerCore?.clearLog()" />
      <f7-link @click="logViewerCore?.toggleErrorDisplay()" tooltip="Always show error level logs">
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
      <f7-link icon-f7="gear" tooltip="Configure logging" data-popup=".logsettings-popup" class="popup-open" />
    </div>

    <log-viewer-core ref="logViewerCore" />
  </div>
</template>

<style lang="stylus">
.log-viewer-embedded
  position relative
  width 100%
  height 100%
  min-height 0
  display flex
  flex-direction column
  overflow hidden
  --log-viewer-height 100%

  .badge.color-red
    background-color #c81d00
  .badge.color-orange
    background-color #f59b00
  .badge.color-green
    background-color #12cc00

  .dock-header
    .connecting-flash:not(.disabled-link)
      .icon
        animation opacity-pulse 0.5s cubic-bezier(1, 0, 0.4, 1) infinite alternate

  .table-block
    flex 1
    min-height 0
    position relative

  .log-viewer-card
    height 100%

  .table-container
    height 100%

  .dock-header
    flex none
    padding 10px 18px 8px
    background var(--f7-bars-bg-color)
    color var(--f7-bars-text-color)
    border-bottom 1px solid var(--f7-bars-border-color)
    .link
      color var(--f7-navbar-link-color, var(--f7-bars-link-color, var(--f7-theme-color)))

  .dock-header-row
    display flex
    align-items center
    justify-content space-between
    gap 12px

  .dock-title
    font-size 16px
    font-weight 600

  .dock-actions
    display flex
    align-items center
    gap 4px

  .dock-action-sep
    display inline-block
    width 1px
    height 16px
    background var(--f7-bars-border-color)
    margin 0 4px
    flex-shrink 0

  .dock-filter-row
    display flex
    align-items center
    gap 12px

  .dock-stats
    display flex
    align-items center
    flex-wrap nowrap

  .dock-toolbar
    flex none
    display flex
    align-items center
    gap 6px
    padding 8px 18px
    border-bottom 1px solid var(--f7-bars-border-color)
    background var(--f7-page-bg-color)

  .table-block
    flex 1
    min-height 0
    position relative
    overflow hidden
    .log-viewer-card
      height 100%
    .table-container
      height 100%
</style>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef, nextTick, ref, watch } from 'vue'
import { getDevice } from 'framework7'
import { theme } from 'framework7-vue'
import LogViewerCore from './log-viewer-core.vue'

// Constants
const device = getDevice()
const COLLAPSED_STORAGE_KEY = 'openhab.ui:logviewer.embedded.collapsedToolbar'

// Defines
defineEmits<{
  'toggle-fullscreen': []
  hide: []
}>()

defineProps<{
  fullscreen: boolean
}>()

// State/Data
const logViewerCore = useTemplateRef('logViewerCore')
const searchbar = useTemplateRef('searchbar')
let initialCollapsed = true
try {
  const stored = localStorage.getItem(COLLAPSED_STORAGE_KEY)
  if (stored !== null) {
    initialCollapsed = stored === 'true'
  }
} catch (e) {}
const collapsed = ref(initialCollapsed)

function toggleCollapsed() {
  collapsed.value = !collapsed.value
}

watch(collapsed, (val) => {
  try {
    localStorage.setItem(COLLAPSED_STORAGE_KEY, String(val))
  } catch (e) {}
})

// Lifecycle Hooks
onMounted(() => {
  logViewerCore.value?.load()
  // Ensure the F7 searchbar shows the persisted query (Framework7 may not
  // update its internal query from the prop binding in some cases).
  nextTick(() => {
    const sb = searchbar.value as any
    if (sb?.$el?.f7Searchbar && logViewerCore.value?.filterText) {
      sb.$el.f7Searchbar.query = logViewerCore.value.filterText
    }
  })
})

onBeforeUnmount(() => {
  logViewerCore.value?.cleanup()
})
</script>
