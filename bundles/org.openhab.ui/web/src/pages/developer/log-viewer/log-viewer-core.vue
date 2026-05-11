<template>
  <div class="table-block">
    <f7-card class="log-viewer-card">
      <div
        class="table-container"
        :class="{ 'resize-hovering': !textMode && (hoveredResizeHandle >= 0 || activeResizeHandle >= 0) }"
        ref="tableContainer"
        @scroll="handleScroll"
        @mousemove="handleTableMouseMove"
        @mouseleave="handleTableMouseLeave"
        @mousedown="handleTableMouseDown"
        @dblclick="handleTableDoubleClick"
        @touchstart="handleTableTouchStart">
        <div
          v-if="!textMode"
          class="column-header-overlay"
          :class="{ 'column-header-overlay-visible': showColumnHeaders }"
          :style="{ width: totalTableWidth + 'px' }">
          <div
            v-for="(col, i) in TABLE_COLUMN_DEFS"
            :key="i"
            class="column-header-cell"
            :class="{ 'column-header-cell-sticky': i === 0 }"
            :style="{ width: columnWidths[i] + 'px' }">
            <span>{{ col.label }}</span>
          </div>
        </div>
        <table
          ref="dataTable"
          :class="{ 'wrap-messages': wrapMessages && !textMode }"
          :style="!textMode ? { tableLayout: 'fixed', width: totalTableWidth + 'px' } : { width: '100%' }">
          <colgroup v-if="!textMode">
            <col v-for="(width, i) in columnWidths" :key="i" :style="{ width: width + 'px' }" />
          </colgroup>
          <tbody />
        </table>
        <div
          v-if="!textMode && resizeGuideLeft !== null"
          class="resize-guide"
          :class="{ 'resize-guide-active': activeResizeHandle >= 0 }"
          :style="{ left: resizeGuideLeft + 'px', top: tableScrollTop + 'px', height: tableViewportHeight + 'px' }"
          aria-hidden="true" />
      </div>
    </f7-card>
    <button v-show="!autoScroll" class="button button-fill dock-scroll-button color-blue" @click="showLatestLogs()">
      <f7-icon f7="arrow_down_to_line" />
    </button>
  </div>
  <!-- Logger Settings Popup -->
  <f7-popup class="log-settings-popup">
    <f7-page>
      <f7-navbar title="Logging Settings">
        <f7-nav-right>
          <f7-link class="popup-close">Close</f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-page-content class="no-padding">
        <f7-block class="input-with-buttons-container">
          <div class="input-with-buttons searchbar">
            <input
              type="text"
              placeholder="Add custom logger package entry..."
              @keyup.enter="handleLogPackageEnter($event)"
              class="custom-input" />
          </div>
        </f7-block>
        <f7-block style="margin-top: 4px; font-size: 0.85rem; text-align: center">
          Logger will be added with ROOT log level {{ defaultLogLevel }}
        </f7-block>

        <f7-list class="col wide">
          <f7-list-item v-for="loggerPackage in loggerPackages" :key="loggerPackage.loggerName" :title="loggerPackage.loggerName">
            <template #after>
              <f7-input type="select" :value="loggerPackage.level" @input="updateLogLevel(loggerPackage, $event.target.value)">
                <option value="DEFAULT">Default</option>
                <option value="TRACE">Trace</option>
                <option value="DEBUG">Debug</option>
                <option value="INFO">Info</option>
                <option value="WARN">Warning</option>
                <option value="ERROR">Error</option>
                <option value="OFF">Off</option>
              </f7-input>
              <f7-button small icon-f7="xmark_circle" @click="removeLogLevel(loggerPackage)" />
            </template>
          </f7-list-item>
        </f7-list>
      </f7-page-content>
    </f7-page>
  </f7-popup>

  <!-- Highlights Popup -->
  <f7-popup class="log-highlights-popup" @popup:close="saveHighlighters">
    <f7-page>
      <f7-navbar title="Logging Highlight Filters">
        <f7-nav-right>
          <f7-link class="popup-close">Close</f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-page-content>
        <f7-list class="col wide">
          <f7-list-item v-for="(highlightFilter, index) in highlightFilters" :key="index">
            <template #media>
              <input type="checkbox" v-model="highlightFilter.active" />
            </template>
            <template #title>
              <f7-input v-model:value="highlightFilter.text" type="text" placeholder="Enter text to highlight..." />
            </template>

            <!-- Color Picker -->
            <template #after>
              <div>
                <f7-button
                  class="color-picker-button"
                  @click="openColorPopover(index, $event)"
                  :style="{ backgroundColor: highlightFilter.color }" />
              </div>
              <f7-button small icon-f7="xmark_circle" @click="removeHighlight(index)" />
            </template>
          </f7-list-item>
        </f7-list>
        <button class="button" @click="addNewHighlight">Add New Highlight</button>
      </f7-page-content>
    </f7-page>
  </f7-popup>

  <!-- Color Picker Popover -->
  <f7-popover id="color-picker-popover" class="color-picker-popover">
    <f7-block>
      <div class="color-palette">
        <button
          v-for="color in colors"
          :key="color"
          :style="{ backgroundColor: color }"
          :class="{ selected: currentHighlightColor === color }"
          @click="selectHighlightColor(color)" />
      </div>
    </f7-block>
  </f7-popover>

  <!-- Log Details Popup -->
  <f7-popup class="log-details-popup" id="logdetails-popup" ref="logDetailsPopup" close-on-escape close-by-backdrop-click>
    <f7-page>
      <f7-navbar title="Log Details" ref="logDetailsNavbar">
        <f7-nav-right>
          <f7-link class="popup-close"> Close </f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-toolbar bottom class="toolbar-details">
        <div class="display-flex justify-content-center" style="width: 100%">
          <f7-link class="display-flex flex-direction-row margin-right" @click="selectedId = selectedId > 0 ? selectedId - 1 : 0">
            <f7-icon f7="backward_fill" />
            &nbsp; Previous
          </f7-link>
          <f7-link
            class="display-flex flex-direction-row margin-right"
            @click="selectedId = selectedId < tableData.length - 1 ? selectedId + 1 : tableData.length - 1">
            Next &nbsp;
            <f7-icon f7="forward_fill" />
          </f7-link>
          <f7-link class="display-flex flex-direction-row" @click="selectedId = tableData.length - 1">
            <f7-icon f7="forward_end_fill" />
          </f7-link>
        </div>
      </f7-toolbar>

      <f7-list class="col wide">
        <f7-list-item header="Time" :title="selectedLog ? selectedLog.time + selectedLog.milliseconds : ''" />
        <f7-list-item header="Timestamp" :title="selectedLog ? selectedLog.timestamp : ''" />
        <f7-list-item header="Level" :title="selectedLog ? selectedLog.level : ''" />
        <f7-list-item header="Logger Class" :title="selectedLog ? selectedLog.loggerName : ''" />
        <f7-list-item>
          <template #title>
            <div class="item-title">
              <div class="item-header">Message</div>
              <div class="log-message">
                {{ selectedLog ? selectedLog.message : '' }}
              </div>
            </div>
          </template>
        </f7-list-item>
        <f7-list-item v-if="selectedLog && selectedLog.stackTrace">
          <template #title>
            <div class="item-title">
              <div class="item-header">Stack Trace</div>
              <div class="stack-trace">
                {{ selectedLog.stackTrace }}
              </div>
            </div>
          </template>
        </f7-list-item>
      </f7-list>
    </f7-page>
  </f7-popup>
</template>

<style lang="stylus">
// shared styles for log viewer page and embedded component
.log-viewer
  .log-period
    white-space nowrap !important
  .disabled-link
    pointer-events none
    opacity 0.5
    cursor not-allowed
  .table-block
    padding 0
    margin 0
    padding-left var(--f7-safe-area-left)
    padding-right var(--f7-safe-area-right)

  .dock-scroll-button
    position absolute
    right 16px
    bottom 16px
    z-index 2
    width 40px
    min-width 40px
    height 40px
    border-radius 999px
    display flex
    align-items center
    justify-content center

/* Ensure the card takes full width and removes padding */
.log-viewer-card
    margin 0
    padding 0
    width 100%
    display flex
    flex-direction column
    overflow hidden
    border-radius 0

  .table-container
    overflow-y auto
    overflow-x auto
    display block
    position relative

  .table-container.resize-hovering
    cursor col-resize

  table
    overflow-x auto
    position relative
    border-collapse collapse
    table-layout auto

  .column-header-overlay
    position sticky
    top 0
    z-index 4
    display flex
    align-items stretch
    height 31px
    margin-bottom -31px
    opacity 0
    transform translateY(-100%)
    transition opacity 0.12s ease, transform 0.12s ease
    pointer-events none

  .column-header-overlay-visible
    opacity 1
    transform translateY(0)

  .column-header-cell
    background var(--f7-bars-bg-color)
    color var(--f7-bars-text-color)
    box-sizing border-box
    padding 5px
    padding-right 14px
    text-align left
    font-weight bold
    // box-shadow avoids border-collapse clipping on sticky cells
    box-shadow 0 1px 0 rgba(128, 128, 128, 0.3)
    user-select none
    white-space nowrap
    overflow hidden
    flex 0 0 auto

  .column-header-cell-sticky
    position sticky
    left 0
    z-index 1

  .resize-guide
    position absolute
    width 2px
    transform translateX(-1px)
    background rgba(90, 90, 90, 0.95)
    box-shadow 0 0 0 1px rgba(255, 255, 255, 0.55)
    border-radius 1px
    opacity 0.9
    z-index 6
    pointer-events none
    transition opacity 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease

  .resize-guide-active
    background var(--f7-theme-color)
    box-shadow 0 0 0 1px rgba(255, 255, 255, 0.7)
    opacity 1

  body.col-resizing &
    *
      user-select none
      cursor col-resize !important

  @media (pointer coarse)
    .resize-guide
      opacity 0.8

  table.wrap-messages
    tr.table-rows
      height auto
      min-height 31px
    td.nowrap
      white-space pre-wrap
      overflow visible
      text-overflow unset
      word-break break-word

  td.nowrap
    padding 5px
    text-align left
    white-space nowrap
    overflow hidden
    text-overflow ellipsis
    max-width 100dvw

  td.sticky
    position sticky
    left 0
    width 105px
    color black
    background-color #f1f1f1
    z-index 1
    white-space nowrap
    overflow hidden

  td.details-trigger
    cursor pointer

  td.details-trigger *
    cursor pointer

  td.level
    width 50px
    overflow hidden

  td.logger
    width 280px
    overflow hidden

  span.logger
    width 100%
    display block
    direction rtl
    text-align left
    overflow hidden
    text-overflow ellipsis
    white-space nowrap

  tr.table-rows
    height 31px

  tr.error
    background-color rgb(255, 96, 96)
    color black

  tr.warn
    background-color rgb(247, 253, 163)
    color black

  tr.info
    color black
    background-color rgb(163, 253, 163)

  tr.debug
    color inherit

  tr.trace
    color rgb(112, 112, 112)

  td.text
    font-family monospace
    font-size 0.9em
    padding-left 4em
    line-height 1.2em
    color grey
    span
      margin-right 5px
    .time
      margin-left -3.2em
      cursor pointer
    .level
      width 3em
      display inline-block
      margin-right 0
    .logger
      width 20em
      display inline-block
      vertical-align middle
      margin-right 0
    .msg
      font-weight bold
    .error
      color red
    .warn
      color orange
    .info
      color green
    .debug
      color teal
    .trace
      color teal

  .milliseconds
    font-size 0.8em

.log-settings-popup
  .input-with-buttons-container
    display flex
    justify-content center
    padding 10px

  .input-with-buttons
    display flex
    align-items center
    border-radius 5px !important
    overflow hidden
    width 100% !important
    background-color var(--f7-searchbar-input-bg-color)

  .custom-input
    flex 1
    border none
    padding 10px !important
    outline none

.log-details-popup
  .navbar
    cursor move
  .log-message
    white-space normal
    word-break break-word
  .stack-trace
    white-space pre-line
    word-break break-word
  margin-left 0
  margin-top 0

.color-picker-popover
  .color-palette
    display flex
    flex-wrap wrap
    gap 8px
    justify-content center

  .color-palette button
    width 32px
    height 32px
    border none
    border-radius 50%
    cursor pointer
    outline none
    box-shadow 0 2px 4px rgba(0, 0, 0, 0.2)
    transition transform 0.2s

  .color-palette button.selected
    transform scale(1.2)
    border 2px solid black

@keyframes opacity-pulse
  0%
    opacity 1
  100%
    opacity 0
</style>

<script setup lang="ts">
import { ref, computed, nextTick, useTemplateRef, shallowRef, triggerRef } from 'vue'
import { f7 } from 'framework7-vue'
import { useDraggable } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'

// TODO: Remove once we have refactored clipboard to TypeScript
// @ts-expect-error-next-line
import copyToClipboard from '@/js/clipboard'

import * as api from '@/api'
import ws, { type MessageCallback, type ReadyCallback, type CloseCallback, type ErrorCallback } from '@/js/openhab/ws'
import { showToast } from '@/js/dialog-promises'

interface LogEntry {
  sequence: number
  timestamp: number
  level: string
  loggerName: string
  message: string
  stackTrace?: string
  unixtime: number
}

interface EnrichedLogEntry extends LogEntry {
  id: number
  milliseconds: string
  visible: boolean
  time: string
}

enum LEVEL_ICONS {
  TRACE = 'line_horizontal_3',
  DEBUG = 'ant',
  INFO = 'info_circle',
  WARN = 'flag',
  ERROR = 'exclamationmark_octagon_fill',
  DEFAULT = 'question_diamond'
}

const maxEntries = 2000
const lineHeight = 31
const resizeHoverDistance = 6

const dataTableRef = useTemplateRef('dataTable')
const dataTableContainerRef = useTemplateRef('tableContainer')
const logDetailsPopupRef = useTemplateRef('logDetailsPopup')
const logDetailsNavbarRef = useTemplateRef('logDetailsNavbar')
let tableClickHandler: ((e: Event) => void) | null = null

// Composables
useDraggable(() => logDetailsNavbarRef.value?.$el, {
  preventDefault: true,
  stopPropagation: true,
  onStart: (_, event) => {
    const target = event.target as HTMLElement | null
    if (target?.closest('.popup-close, .link, a, button, input, select, textarea')) return false

    const popupEl = logDetailsPopupRef.value?.$el
    if (!popupEl || !popupEl.parentElement) return false

    // Prevent dragging if the popup has full parent width (e.g. on mobile)
    if (popupEl.offsetWidth >= popupEl.parentElement.offsetWidth) return false

    // Framework7 popups are centered with margins by default.
    // Reset margins so top/left updates take visible effect while dragging.
    popupEl.style.marginLeft = '0'
    popupEl.style.marginTop = '0'
    return
  },
  onMove: (pos) => {
    const popupEl = logDetailsPopupRef.value?.$el
    if (!popupEl) return

    popupEl.style.top = pos.y + 'px'
    popupEl.style.left = pos.x + 'px'
  }
})

// State/Data
let defaultLogLevel = 'WARN'
let socket: WebSocket | null = null
let reconnectDelay = 1000
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let batchUpdatePending = false
let nextId = 0
const batchLogs: EnrichedLogEntry[] = []

const colors: string[] = [
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
  '#008000', // Dark Green
  '#000080', // Navy Blue
  '#FFC0CB', // Pink
  '#A52A2A', // Brown
  '#FFD700', // Gold
  '#808080', // Gray
  '#8B4513', // Saddle Brown
  '#4682B4' // Steel Blue
]

let scrollTime: number = 0

const uiOptionsStore = useUIOptionsStore()
const {
  logViewerTextMode: textMode,
  logViewerShowErrors: showErrors,
  logViewerHighlightFilters: highlightFilters,
  logViewerFilterText: filterText
} = storeToRefs(uiOptionsStore)

const loggerPackages = ref<api.LoggerInfo[]>([])
const stateConnected = ref(false)
const stateProcessing = ref(true)
const stateConnecting = ref(false)
const loadingLoggers = ref(true)
const autoScroll = ref(true)
const filterCount = ref(0)
const wrapMessages = ref(localStorage.getItem('openhab.ui:logviewer.wrapMessages') === 'true')
const tableData = shallowRef<EnrichedLogEntry[]>([])
const logStart = ref('--:--:--')
const logEnd = ref('--:--:--')
const currentHighlightColorItemIndex = ref<number | null>(null)
const currentHighlightColor = ref('#FF5252')
const lastSequence = ref(0)
const selectedId = ref<number>(0)

// Column definitions (table mode only)
const COLUMN_WIDTHS_KEY = 'openhab.ui:logviewer.columnWidths'
const DEFAULT_COLUMN_WIDTHS = [110, 60, 280, 2000]
const TABLE_COLUMN_DEFS = [{ label: 'Time' }, { label: 'Level' }, { label: 'Logger' }, { label: 'Message' }]

function loadColumnWidths(): number[] {
  try {
    const stored = localStorage.getItem(COLUMN_WIDTHS_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as unknown
      if (Array.isArray(parsed) && parsed.length === DEFAULT_COLUMN_WIDTHS.length && parsed.every((n) => typeof n === 'number' && n > 0)) {
        return parsed as number[]
      }
    }
  } catch {}
  return [...DEFAULT_COLUMN_WIDTHS]
}

const columnWidths = ref<number[]>(loadColumnWidths())

// Column resize state
let resizingIndex = -1
let resizeStartX = 0
let resizeStartWidth = 0
const activeResizeHandle = ref(-1)
const hoveredResizeHandle = ref(-1)
const isHoveringTableTop = ref(false)
const tableScrollTop = ref(0)
const tableViewportHeight = ref(0)
let measureCanvasCtx: CanvasRenderingContext2D | null = null

function getMeasureCtx(): CanvasRenderingContext2D | null {
  if (!measureCanvasCtx) {
    measureCanvasCtx = document.createElement('canvas').getContext('2d')
  }
  return measureCanvasCtx
}

function measureTextWidth(text: string, font: string): number {
  const ctx = getMeasureCtx()
  if (!ctx) return 0
  ctx.font = font
  return ctx.measureText(text).width
}

function syncTableViewportMetrics() {
  const tableContainer = dataTableContainerRef.value
  if (!tableContainer) return
  tableScrollTop.value = tableContainer.scrollTop
  tableViewportHeight.value = tableContainer.clientHeight
}

function beginResize(clientX: number, colIndex: number) {
  resizingIndex = colIndex
  resizeStartX = clientX
  resizeStartWidth = columnWidths.value[colIndex]
  activeResizeHandle.value = colIndex
}

function startResize(event: MouseEvent, colIndex: number) {
  beginResize(event.clientX, colIndex)
  document.body.classList.add('col-resizing')
  document.body.style.cursor = 'col-resize'
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

function handleResize(event: MouseEvent) {
  if (resizingIndex < 0) return
  columnWidths.value[resizingIndex] = Math.max(40, resizeStartWidth + (event.clientX - resizeStartX))
}

function stopResize() {
  if (resizingIndex < 0) return
  resizingIndex = -1
  activeResizeHandle.value = -1
  document.body.classList.remove('col-resizing')
  document.body.style.cursor = ''
  localStorage.setItem(COLUMN_WIDTHS_KEY, JSON.stringify(columnWidths.value))
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

function resetColumnWidths() {
  columnWidths.value = [...DEFAULT_COLUMN_WIDTHS]
  localStorage.removeItem(COLUMN_WIDTHS_KEY)
}

function startResizeTouch(event: TouchEvent, colIndex: number) {
  if (event.touches.length !== 1) return
  const touch = event.touches[0]
  beginResize(touch.clientX, colIndex)
  document.addEventListener('touchmove', handleResizeTouch, { passive: false })
  document.addEventListener('touchend', stopResizeTouch)
  document.addEventListener('touchcancel', stopResizeTouch)
}

function handleResizeTouch(event: TouchEvent) {
  if (resizingIndex < 0 || event.touches.length !== 1) return
  event.preventDefault()
  const touch = event.touches[0]
  columnWidths.value[resizingIndex] = Math.max(40, resizeStartWidth + (touch.clientX - resizeStartX))
}

function stopResizeTouch() {
  if (resizingIndex < 0) return
  resizingIndex = -1
  activeResizeHandle.value = -1
  localStorage.setItem(COLUMN_WIDTHS_KEY, JSON.stringify(columnWidths.value))
  document.removeEventListener('touchmove', handleResizeTouch)
  document.removeEventListener('touchend', stopResizeTouch)
  document.removeEventListener('touchcancel', stopResizeTouch)
}

function clearResizeHoverState() {
  if (resizingIndex >= 0) {
    stopResize()
    stopResizeTouch()
  }
  hoveredResizeHandle.value = -1
  activeResizeHandle.value = -1
  isHoveringTableTop.value = false
}

function updateTableHoverState(clientX: number, clientY: number) {
  if (textMode.value) {
    clearResizeHoverState()
    return
  }

  const tableContainer = dataTableContainerRef.value
  if (!tableContainer) return
  syncTableViewportMetrics()

  const rect = tableContainer.getBoundingClientRect()
  const withinContainer = clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom

  if (!withinContainer) {
    if (resizingIndex < 0) {
      hoveredResizeHandle.value = -1
    }
    isHoveringTableTop.value = false
    return
  }

  isHoveringTableTop.value = clientY - rect.top <= lineHeight

  if (resizingIndex >= 0) return

  const cursorX = clientX - rect.left + tableContainer.scrollLeft
  let closestCol = -1
  let closestDist = Infinity

  for (const border of columnBorders.value) {
    const dist = Math.abs(cursorX - border.left)
    if (dist < closestDist) {
      closestDist = dist
      closestCol = border.index
    }
  }

  hoveredResizeHandle.value = closestDist <= resizeHoverDistance ? closestCol : -1
}

function handleTableMouseMove(event: MouseEvent) {
  updateTableHoverState(event.clientX, event.clientY)
}

function handleTableMouseLeave() {
  if (textMode.value) return
  if (resizingIndex >= 0) return
  hoveredResizeHandle.value = -1
  isHoveringTableTop.value = false
}

function handleTableMouseDown(event: MouseEvent) {
  if (textMode.value) return
  if (event.button !== 0 || hoveredResizeHandle.value < 0) return
  event.preventDefault()
  startResize(event, hoveredResizeHandle.value)
}

function handleTableDoubleClick(event: MouseEvent) {
  if (textMode.value) return
  if (hoveredResizeHandle.value < 0) return
  event.preventDefault()
  autoSizeColumn(hoveredResizeHandle.value)
}

function handleTableTouchStart(event: TouchEvent) {
  if (textMode.value) return
  if (event.touches.length !== 1) return
  const touch = event.touches[0]
  updateTableHoverState(touch.clientX, touch.clientY)
  if (hoveredResizeHandle.value < 0) return
  startResizeTouch(event, hoveredResizeHandle.value)
}

function autoSizeColumn(colIndex: number) {
  const tbody = getTableBody()
  const firstTd = tbody?.querySelector('td')
  const font = firstTd ? getComputedStyle(firstTd).font : '13px sans-serif'
  const fields: (keyof EnrichedLogEntry)[] = ['time', 'level', 'loggerName', 'message']
  const field = fields[colIndex]
  let maxWidth = measureTextWidth(TABLE_COLUMN_DEFS[colIndex].label, font)
  for (const entry of filteredTableData.value) {
    const text = colIndex === 0 ? entry.time + entry.milliseconds : String(entry[field])
    const w = measureTextWidth(text, font)
    if (w > maxWidth) maxWidth = w
  }
  // add cell padding; col 0 also needs room for the icon (~26px)
  const padding = colIndex === 0 ? 52 : 16
  columnWidths.value[colIndex] = Math.min(Math.ceil(maxWidth) + padding, 6000)
  localStorage.setItem(COLUMN_WIDTHS_KEY, JSON.stringify(columnWidths.value))
}

// Computed
const filteredTableData = computed(() => {
  return tableData.value.filter((item) => item.visible)
})

const totalTableWidth = computed(() => columnWidths.value.reduce((sum, w) => sum + w, 0))

const columnBorders = computed(() => {
  let offset = 0
  return columnWidths.value.map((width, index) => {
    offset += width
    return {
      index,
      left: offset
    }
  })
})

const resizeGuideLeft = computed(() => {
  const guideIndex = activeResizeHandle.value >= 0 ? activeResizeHandle.value : hoveredResizeHandle.value
  if (guideIndex < 0) return null
  return columnBorders.value[guideIndex]?.left ?? null
})

const showColumnHeaders = computed(() => isHoveringTableTop.value || hoveredResizeHandle.value >= 0 || activeResizeHandle.value >= 0)

const countersBadgeColor = computed(() => {
  if (tableData.value.length >= maxEntries) return 'red'
  if (filterCount.value < tableData.value.length) return 'orange'
  return 'green'
})

const selectedLog = computed<EnrichedLogEntry | null>(() => {
  return tableData.value.find((entry) => entry.id === selectedId.value) || null
})

const periodRangeColor = computed(() => {
  if (!stateConnected.value) return 'red'
  return stateProcessing.value ? 'green' : 'orange'
})

const periodRangeTooltip = computed(() => {
  if (stateConnecting.value) return 'Log period - Connecting'
  if (!stateConnected.value) return 'Log period - Disconnected'
  return stateProcessing.value ? 'Log period - Receiving logs' : 'Log period - Paused'
})

const isConnecting = computed(() => stateConnecting.value)

const filterTextLowerCase = computed(() => filterText.value.toLowerCase())
const activeHighlightFilters = computed(() => highlightFilters.value.filter((filter) => filter.active && filter.text.trim() !== ''))

// Methods
async function load() {
  loggerPackages.value = []
  loadingLoggers.value = true

  try {
    loggerPackages.value = (await api.getLogger1())?.loggers || []
    nextTick(() => {
      const rootPackageIndex = loggerPackages.value.findIndex((item) => item.loggerName === 'ROOT')
      if (rootPackageIndex !== -1) {
        defaultLogLevel = loggerPackages.value[rootPackageIndex].level
      }
      loggerPackages.value.sort((a, b) => a.loggerName.localeCompare(b.loggerName))
      loggerPackages.value = loggerPackages.value.filter((item) => item.loggerName !== 'ROOT')

      loadingLoggers.value = false
    })
  } catch (error) {
    console.warn('Failed to load logger packages:', error)
    loadingLoggers.value = false
  }

  startConnecting()

  updateFilter()

  nextTick(() => {
    const tbody = getTableBody()
    if (!tbody) return

    if (tableClickHandler) {
      tbody.removeEventListener('click', tableClickHandler)
      tableClickHandler = null
    }

    tableClickHandler = (e: Event) => {
      const target = e.target as HTMLElement
      const detailTrigger = target.closest('.details-trigger') as HTMLElement | null
      if (!detailTrigger) return
      const tr = detailTrigger.closest('tr') as HTMLTableRowElement | null
      if (!tr) return
      if (tr.classList.contains('padder')) return
      const idAttr = tr.dataset.id
      if (!idAttr) return
      const id = Number(idAttr)
      if (Number.isNaN(id)) return
      onRowClick(id)
    }

    tbody.addEventListener('click', tableClickHandler)
  })
}

function cleanup() {
  loggingStop()
  if (tableClickHandler) {
    const tbody = getTableBody()
    if (tbody) {
      tbody.removeEventListener('click', tableClickHandler)
    }
    tableClickHandler = null
  }
  // Clean up any active column resize listeners
  document.body.classList.remove('col-resizing')
  document.body.style.cursor = ''
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.removeEventListener('touchmove', handleResizeTouch)
  document.removeEventListener('touchend', stopResizeTouch)
  document.removeEventListener('touchcancel', stopResizeTouch)
}

function getTableBody(): HTMLTableSectionElement | null {
  return dataTableRef.value?.tBodies?.[0] ?? null
}

function updateLogLevel(logger: api.LoggerInfo, value: string) {
  logger.level = value
  api.putLogger({ loggerName: logger.loggerName, loggerInfo: logger }).catch((error) => {
    console.warn('Failed to update log level for ' + logger.loggerName + ':', error)
  })
}

async function removeLogLevel(logger: api.LoggerInfo) {
  await api.removeLogger({ loggerName: logger.loggerName }).catch((error) => {
    console.warn('Failed to remove log level for ' + logger.loggerName + ':', error)
  })
  loggerPackages.value = loggerPackages.value.filter((loggerPackage) => loggerPackage.loggerName !== logger.loggerName)
}

function startConnecting() {
  stateConnecting.value = true
  reconnectDelay = 1000
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  socketConnect()
}

function stopConnecting() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  stateConnecting.value = false
}

function socketConnect() {
  const readyCallback: ReadyCallback = (_event) => {
    if (stateConnecting.value) {
      stopConnecting()
    }
    stateConnected.value = true
    stateProcessing.value = true
    console.info('WebSocket connection established.')
    socket!.send('{"sequenceStart": ' + lastSequence.value + '}')
    nextTick(() => scrollToBottom())
  }

  const closeCallback: CloseCallback = () => {
    if (stateConnected.value) {
      console.warn('WebSocket connection closed by peer. Attempting to reconnect...')
      startConnecting()
    }
    stateConnected.value = false
  }

  const messageCallback: MessageCallback = (event) => {
    if (Array.isArray(event)) {
      event.forEach((ev) => {
        addLogEntry(ev as unknown as LogEntry)
      })
    } else {
      addLogEntry(event as unknown as LogEntry)
    }
  }

  const heartbeatCallback = () => {
    try {
      socket!.send('{}')
    } catch (e) {
      console.warn('WebSocket heartbeat failed:', e)
    }
  }

  const errorCallback: ErrorCallback = (event) => {
    if (stateConnecting.value) {
      if (reconnectDelay < 10000) {
        reconnectDelay *= 1.2
        if (reconnectDelay > 10000) {
          reconnectDelay = 10000
        }
      }
      console.info('Failed to connect, retrying in ' + (reconnectDelay / 1000).toFixed(1) + ' s...')
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null
        socketConnect()
      }, reconnectDelay)
    } else {
      console.error('WebSocket error:', event)
    }
  }

  socket = ws.connect('/ws/logs', messageCallback, heartbeatCallback, readyCallback, closeCallback, errorCallback, 9)
}

function socketClose() {
  if (!socket) return
  stateConnected.value = false
  ws.close(socket)
  socket = null
}

function renderEntry(entry: EnrichedLogEntry) {
  let tr = document.createElement('tr')
  let icon = LEVEL_ICONS[entry.level as keyof typeof LEVEL_ICONS] || LEVEL_ICONS.DEFAULT
  const levelLowerCased = entry.level.toLowerCase()
  if (textMode.value) {
    tr.innerHTML =
      `<td class="text"><span class="time details-trigger">${entry.time}${entry.milliseconds}</span>` +
      `[<span class="level ${levelLowerCased}">${entry.level}</span>] ` +
      `[<span class="logger" title="${entry.loggerName}">${entry.loggerName}</span>] - ` +
      `<span class="msg ${levelLowerCased}">${highlightText(escapeHtml(entry.message))}</span></td>`
  } else {
    tr.className = 'table-rows ' + levelLowerCased
    tr.innerHTML =
      '<td class="sticky details-trigger"><i class="icon f7-icons" style="font-size: 18px;">' +
      icon +
      `</i> ${entry.time}<span class="milliseconds">${entry.milliseconds}</span></td>` +
      `<td class="level">${entry.level}</td>` +
      `<td class="logger"><span class="logger" title="${entry.loggerName}">${entry.loggerName}</span></td>` +
      `<td class="nowrap">${highlightText(escapeHtml(entry.message))}</td>`
  }
  // mark row for delegated click handling
  tr.dataset.id = String(entry.id)
  return tr
}

function onRowClick(entityId: number) {
  selectedId.value = entityId
  f7.popup.open('#logdetails-popup')
}

function addLogEntry(logEntry: LogEntry) {
  lastSequence.value = Math.max(lastSequence.value, logEntry.sequence)
  const date = new Date(logEntry.unixtime)

  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  const ms = '.' + date.getMilliseconds().toString().padStart(3, '0')

  const formattedTime = `${hours}:${minutes}:${seconds}`

  logEnd.value = formattedTime
  if (tableData.value.length === 0) {
    logStart.value = formattedTime
  }

  let vis = false
  if (stateProcessing.value) {
    vis = processFilter(logEntry)
    if (vis) {
      // TODO: Do we need to scroll 1 line to keep the view steady?
      filterCount.value++
    }
  }

  let entry = {
    id: nextId++,
    visible: vis,
    time: formattedTime,
    timestamp: logEntry.timestamp,
    milliseconds: ms,
    level: logEntry.level.toUpperCase(),
    loggerName: logEntry.loggerName,
    message: logEntry.message,
    stackTrace: logEntry.stackTrace,
    sequence: logEntry.sequence,
    unixtime: logEntry.unixtime
  } satisfies EnrichedLogEntry

  batchLogs.push(entry)

  if (!batchUpdatePending) {
    batchUpdatePending = true
    requestAnimationFrame(() => {
      batchLogs.forEach((entry) => {
        tableData.value.push(entry)

        if (entry.visible) {
          const tr = renderEntry(entry)
          getTableBody()?.appendChild(tr)
        }

        if (tableData.value.length > maxEntries) {
          const removedElement = tableData.value.shift()
          if (removedElement) {
            logStart.value = removedElement.time
            if (removedElement.visible) {
              filterCount.value--
              let firstRow = getTableBody()?.firstElementChild
              if (firstRow?.classList.contains('padder')) firstRow = firstRow.nextElementSibling
              if (firstRow) {
                getTableBody()?.removeChild(firstRow)
              }
            }
          }
        }
      })
      batchLogs.length = 0

      // manually trigger shallowRef after pushing & optionally slicing data to/from tableData
      triggerRef(tableData)

      if (autoScroll.value) {
        nextTick(() => scrollToBottom())
      } else {
        nextTick(() => handleScroll())
      }

      batchUpdatePending = false
    })
  }
}

function loggingPause() {
  stateProcessing.value = false
}

function loggingContinue() {
  if (stateConnecting.value) {
    return
  }
  if (!stateConnected.value) {
    startConnecting()
  }
  updateFilter()
  stateProcessing.value = true
}

function loggingStop() {
  if (stateConnecting.value) {
    stopConnecting()
  }
  if (stateConnected.value) {
    stateConnected.value = false
    socketClose()
  }
}

function clearLog() {
  tableData.value.length = 0
  filterCount.value = 0
  logStart.value = '--:--:--'
  logEnd.value = '--:--:--'
  const tableBody = getTableBody()
  if (tableBody) tableBody.innerHTML = ''
}

function showLatestLogs() {
  autoScroll.value = true
  scrollToBottom()
}

function scrollToBottom() {
  // Scroll to the bottom of the table
  const tableContainer = dataTableContainerRef.value
  if (tableContainer) {
    tableContainer.scrollTop = tableContainer.scrollHeight
    // Delay manual scroll detection to avoid autoscrolling being defeated when new logs arrive
    scrollTime = Date.now() + 250
  }
  redrawPartOfTable()
}

function handleScroll() {
  const tableContainer = dataTableContainerRef.value
  if (!tableContainer) return
  syncTableViewportMetrics()

  if (Date.now() < scrollTime) return

  // Detect if the user has scrolled up
  const isAtBottom = tableContainer.scrollHeight - tableContainer.scrollTop < tableContainer.clientHeight + 20
  autoScroll.value = isAtBottom

  redrawPartOfTable()
}

function redrawPartOfTable() {
  const tableContainer = dataTableContainerRef.value
  if (!tableContainer) return

  const tableBody = getTableBody()
  if (!tableBody) return

  const filteredItemsCount = filteredTableData.value.length

  // When messages wrap, row heights vary — skip fixed-height virtual windowing
  if (!textMode.value && wrapMessages.value) {
    tableBody.innerHTML = ''
    for (let i = 0; i < filteredItemsCount; i++) {
      tableBody.appendChild(renderEntry(filteredTableData.value[i]))
    }
    return
  }

  const currentIndexAtTop = Math.floor(tableContainer.scrollTop / lineHeight)
  const nbVisibleLines = Math.floor(tableContainer.offsetHeight / lineHeight)

  // make sure to redraw only 50 elements below around visible area
  const firstIndexToRedraw = Math.max(0, currentIndexAtTop - 50)
  const lastIndexToRedraw = Math.min(currentIndexAtTop + nbVisibleLines + 50, filteredItemsCount - 1)
  // console.debug(`Should redraw ${firstIndexToRedraw}/${lastIndexToRedraw}`)

  tableBody.innerHTML = ''
  if (firstIndexToRedraw > 0) {
    const padder = document.createElement('tr')
    padder.className = 'padder'
    padder.style.height = lineHeight * firstIndexToRedraw + 'px'
    tableBody.appendChild(padder)
  }
  for (let i = firstIndexToRedraw; i <= lastIndexToRedraw; i++) {
    tableBody.appendChild(renderEntry(filteredTableData.value[i]))
  }
  if (lastIndexToRedraw < filteredItemsCount - 1) {
    const padder = document.createElement('tr')
    padder.className = 'padder'
    padder.style.height = lineHeight * (filteredItemsCount - 1 - lastIndexToRedraw) + 'px'
    tableBody.appendChild(padder)
  }
}

function handleLogPackageEnter(event: KeyboardEvent) {
  let logger = {
    loggerName: (event.target as HTMLInputElement)?.value,
    level: 'INFO'
  }
  updateLogLevel(logger, defaultLogLevel)
  loggerPackages.value.push(logger)
  loggerPackages.value.sort((a, b) => a.loggerName.localeCompare(b.loggerName))
}

const processFilter = (logEntry: LogEntry) => {
  return (
    logEntry.loggerName.toLowerCase().includes(filterTextLowerCase.value) ||
    logEntry.message.toLowerCase().includes(filterTextLowerCase.value) ||
    (showErrors.value && logEntry.level === 'ERROR')
  )
}

function handleFilter(searchbar: HTMLInputElement, filter: string) {
  if (!searchbar) return
  if (!filter) {
    clearFilter()
    return
  }
  filterText.value = filter
  updateFilter()
  scrollToBottom()
}

function clearFilter() {
  filterText.value = ''
  updateFilter()
  scrollToBottom()
}

function updateFilter() {
  let cnt = 0

  for (const entry of tableData.value) {
    entry.visible = processFilter(entry)
    if (entry.visible) {
      cnt++
    }
  }
  filterCount.value = cnt
  redrawPartOfTable()
}

/**
 * Utility to escape unsafe HTML characters and prevent XSS from log payloads.
 * @param unsafe
 */
function escapeHtml(unsafe: string): string {
  return unsafe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
}

/**
 * Render text highlighting based on active highlight filters.
 * @param text
 */
function highlightText(text: string) {
  if (activeHighlightFilters.value.length === 0) {
    return text // Skip if no filters are active
  }

  // Apply each filter with its respective color
  activeHighlightFilters.value.forEach((filter) => {
    // Escape regex special characters so users can search for things like "[WARN]"
    const regexSafeFilter = filter.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${regexSafeFilter})`, 'gi')
    text = text.replace(regex, `<span style="background-color: ${filter.color}; font-weight: bold;">$1</span>`)
  })
  return text
}

function downloadCSV() {
  const filteredData = tableData.value.filter((row) => row.visible)

  const transformedData = filteredData.map((row) => ({
    time: row.time + row.milliseconds,
    level: row.level,
    source: row.loggerName,
    data: row.message
  }))

  const csvContent = convertObjectArrayToCSV(transformedData)
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = 'logfile.csv'
  link.click()

  URL.revokeObjectURL(url)
}

function convertObjectArrayToCSV(array: Record<string, string>[]) {
  if (!array.length) {
    return ''
  }

  // Extract headers from object keys
  const headers = Object.keys(array[0]).join(',')

  // Map each object to a CSV-compatible row
  const rows = array.map((obj) =>
    Object.values(obj)
      .map((value) => `"${String(value).replace(/"/g, '""')}"`) // Escape quotes
      .join(',')
  )

  // Combine headers and rows into a single CSV string
  return [headers, ...rows].join('\n')
}

function copyTableToClipboard() {
  if (textMode.value) {
    const logs = filteredTableData.value
      .map((log) => {
        return `${log.time}${log.milliseconds} [${log.level}] [${log.loggerName}] - ${log.message}`
      })
      .join('\n')
    // v-clipboard works without https, but it can only copy plain text
    copyToClipboard(logs, {
      onSuccess: () => {
        showToast('Table copied as text to clipboard')
      }
    })
    return
  }

  const table = dataTableRef.value
  if (!table) {
    return
  }

  const tableHTML = table.outerHTML

  // Create a Blob with the HTML content and define the MIME type
  const blobHtml = new Blob([tableHTML], { type: 'text/html' })
  const blobText = new Blob([tableHTML], { type: 'text/plain' })

  // Use the ClipboardItem API to copy the Blob
  const clipboardItem = new ClipboardItem({
    'text/html': blobHtml,
    'text/plain': blobText
  })

  // Copy to clipboard
  // Uses the Clipboard API to write the ClipboardItem, as v-clipboard does not support HTML. This might not work in insecure contexts.
  navigator.clipboard
    .write([clipboardItem])
    .then(() => {
      showToast('Table copied as HTML to clipboard')
    })
    .catch((err) => {
      console.error('Failed to copy table: ', err)
    })
}

function setTextMode(textModeEnabled: boolean) {
  textMode.value = textModeEnabled
  if (textModeEnabled) {
    clearResizeHoverState()
  }
  updateFilter()
}

function saveHighlighters() {
  updateFilter()
}

function addNewHighlight() {
  highlightFilters.value.push({
    text: '',
    color: colors[0],
    active: false
  })
}

function removeHighlight(index: number) {
  highlightFilters.value.splice(index, 1)
}

function openColorPopover(index: number, event: Event) {
  currentHighlightColorItemIndex.value = index
  currentHighlightColor.value = highlightFilters.value[index].color
  f7.popover.open('#color-picker-popover', event.target as HTMLElement)
}

function selectHighlightColor(color: string | null) {
  f7.popover.close('#color-picker-popover')
  if (color !== null && currentHighlightColorItemIndex.value !== null) {
    highlightFilters.value[currentHighlightColorItemIndex.value].color = color
  }
}

function toggleErrorDisplay() {
  showErrors.value = !showErrors.value
  updateFilter()
}

function toggleWrapMessages() {
  wrapMessages.value = !wrapMessages.value
  localStorage.setItem('openhab.ui:logviewer.wrapMessages', wrapMessages.value.toString())
  updateFilter()
}

defineExpose({
  logStart,
  logEnd,
  countersBadgeColor,
  periodRangeColor,
  periodRangeTooltip,
  isConnecting,
  selectedLog,
  filterCount,
  stateConnected,
  stateProcessing,
  stateConnecting,
  filterText,
  tableData,
  textMode,
  showErrors,
  load,
  cleanup,
  handleFilter,
  clearFilter,
  loggingContinue,
  loggingPause,
  loggingStop,
  startConnecting,
  stopConnecting,
  toggleErrorDisplay,
  downloadCSV,
  copyTableToClipboard,
  clearLog,
  setTextMode,
  resetColumnWidths,
  wrapMessages,
  toggleWrapMessages
})
</script>
