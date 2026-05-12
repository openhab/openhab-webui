<template>
  <div
    ref="toolbarRef"
    class="log-viewer-toolbar-actions"
    :class="{
      'has-scroll-left': showToolbarScrollLeft,
      'has-scroll-right': showToolbarScrollRight,
      'toolbar-scrollable-mobile': !device.desktop
    }">
    <button
      v-if="showToolbarScrollLeft && !device.desktop"
      type="button"
      class="toolbar-scroll-indicator toolbar-scroll-indicator-left"
      aria-label="Scroll toolbar left"
      @pointerdown.stop.prevent
      @click.stop.prevent="scrollToolbar('left')">
      <i class="icon f7-icons">chevron_left</i>
    </button>
    <f7-link
      icon-f7="cloud_download"
      tooltip="Download filtered log as CSV"
      :class="{ 'disabled-link': logViewerCore?.filterCount === 0 }"
      @click="logViewerCore?.downloadCSV()" />
    <f7-link
      icon-f7="rectangle_on_rectangle"
      tooltip="Copy filtered log to clipboard"
      :class="{ 'disabled-link': logViewerCore?.filterCount === 0 }"
      @click="logViewerCore?.copyTableToClipboard()" />
    <f7-link
      icon-f7="trash"
      tooltip="Clear the log buffer"
      :class="{ 'disabled-link': (logViewerCore?.tableData?.length ?? 0) === 0 }"
      @click="logViewerCore?.clearLog()" />
    <f7-link @click="logViewerCore?.toggleErrorDisplay()" tooltip="Always show error level logs">
      <f7-icon v-if="logViewerCore?.showErrors" f7="exclamationmark_triangle_fill" />
      <f7-icon v-else f7="exclamationmark_triangle" />
    </f7-link>
    <f7-link icon-f7="pencil" tooltip="Configure highlights" data-popup=".log-highlights-popup" class="popup-open" />
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
    <f7-link
      v-if="!logViewerCore?.textMode"
      icon-f7="arrow_counterclockwise"
      tooltip="Reset column widths to default"
      @click="logViewerCore?.resetColumnWidths()" />
    <f7-link
      v-if="!logViewerCore?.textMode"
      icon-f7="arrow_turn_down_left"
      :icon-color="logViewerCore?.wrapMessages ? '' : 'gray'"
      tooltip="Toggle message wrapping"
      @click="logViewerCore?.toggleWrapMessages()" />
    <f7-link icon-f7="gear" tooltip="Configure logging" data-popup=".log-settings-popup" class="popup-open" />
    <button
      v-if="showToolbarScrollRight && !device.desktop"
      type="button"
      class="toolbar-scroll-indicator toolbar-scroll-indicator-right"
      aria-label="Scroll toolbar right"
      @pointerdown.stop.prevent
      @click.stop.prevent="scrollToolbar('right')">
      <i class="icon f7-icons">chevron_right</i>
    </button>
  </div>
</template>

<style lang="stylus">
.log-viewer-toolbar-actions
  width 100%
  display flex
  align-items center
  justify-content space-between

  @media (max-width 767px)
    &.toolbar-scrollable-mobile
      justify-content flex-start
      gap 4px
      overflow-x auto
      overflow-y hidden
      scrollbar-width none
      -ms-overflow-style none

      &::-webkit-scrollbar
        display none

      > .link,
      > .segmented
        flex 0 0 auto

      .toolbar-scroll-indicator
        position sticky
        z-index 2
        flex 0 0 18px
        display flex
        align-items center
        justify-content center
        color var(--f7-text-color)
        font-size 18px
        line-height 1
        background var(--f7-bars-bg-color)
        border 0
        margin 0
        padding 0
        cursor pointer

        .icon
          pointer-events none

      .toolbar-scroll-indicator-left
        left 0
        box-shadow -10px 0 12px 10px var(--f7-bars-bg-color)

      .toolbar-scroll-indicator-right
        right 0
        box-shadow 10px 0 12px 10px var(--f7-bars-bg-color)
</style>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { getDevice } from 'framework7'
import { theme } from 'framework7-vue'

interface LogViewerToolbarTarget {
  filterCount: number
  tableData: unknown[]
  textMode: boolean
  showErrors: boolean
  wrapMessages: boolean
  downloadCSV: () => void
  copyTableToClipboard: () => void
  clearLog: () => void
  toggleErrorDisplay: () => void
  setTextMode: (enabled: boolean) => void
  resetColumnWidths: () => void
  toggleWrapMessages: () => void
}

defineProps<{
  logViewerCore: LogViewerToolbarTarget | null
}>()

const device = getDevice()
const toolbarRef = useTemplateRef('toolbarRef')
const showToolbarScrollLeft = ref(false)
const showToolbarScrollRight = ref(false)
let toolbarResizeObserver: ResizeObserver | null = null
let toolbarMutationObserver: MutationObserver | null = null

function updateToolbarScrollIndicators() {
  const toolbarEl = toolbarRef.value
  if (!toolbarEl) {
    showToolbarScrollLeft.value = false
    showToolbarScrollRight.value = false
    return
  }

  const maxScrollLeft = Math.max(0, toolbarEl.scrollWidth - toolbarEl.clientWidth)
  showToolbarScrollLeft.value = toolbarEl.scrollLeft > 4
  showToolbarScrollRight.value = maxScrollLeft - toolbarEl.scrollLeft > 4
}

function handleToolbarScroll() {
  updateToolbarScrollIndicators()
}

function scrollToolbar(direction: 'left' | 'right') {
  const toolbarEl = toolbarRef.value
  if (!toolbarEl) return

  const distance = Math.max(toolbarEl.clientWidth * 0.75, 120)
  toolbarEl.scrollBy({
    left: direction === 'left' ? -distance : distance,
    behavior: 'smooth'
  })
}

function setupToolbarScrollIndicators() {
  nextTick(() => {
    const toolbarEl = toolbarRef.value
    if (!toolbarEl) return

    toolbarEl.addEventListener('scroll', handleToolbarScroll, { passive: true })

    toolbarResizeObserver = new ResizeObserver(() => updateToolbarScrollIndicators())
    toolbarResizeObserver.observe(toolbarEl)

    toolbarMutationObserver = new MutationObserver(() => nextTick(updateToolbarScrollIndicators))
    toolbarMutationObserver.observe(toolbarEl, { childList: true, subtree: true, attributes: true })

    updateToolbarScrollIndicators()
  })
}

function cleanupToolbarScrollIndicators() {
  toolbarRef.value?.removeEventListener('scroll', handleToolbarScroll)
  toolbarResizeObserver?.disconnect()
  toolbarResizeObserver = null
  toolbarMutationObserver?.disconnect()
  toolbarMutationObserver = null
}

onMounted(() => {
  setupToolbarScrollIndicators()
})

onBeforeUnmount(() => {
  cleanupToolbarScrollIndicators()
})
</script>
