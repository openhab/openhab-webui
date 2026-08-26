<template>
  <div class="table-block">
    <f7-card class="log-viewer-card">
      <resizable-table
        ref="resizableTable"
        :columns="TABLE_COLUMN_DEFS"
        :column-resize-enabled="!textMode"
        :storage-key="props.storageKeyPrefix + 'columnWidths'"
        :default-column-widths="DEFAULT_COLUMN_WIDTHS"
        @auto-size-column="autoSizeColumn"
        @table-click="onTableClick"
        @scroll="onScroll"
        :line-height="!textMode ? LineHeights[textSize] : LineHeights[`textmode_${textSize}` as TextSize]"
        :list="filteredList"
        :class="{
          small: textSize === 'small',
          medium: textSize === 'medium',
          large: textSize === 'large',
          textmode: textMode,
          'content-wrapped': wrapMessages
        }"
        :getItemKey="(item) => (item as EnrichedLogEntry).sequence">
        <template #row="{ item }">
          <LogTableRow :item="item as EnrichedLogEntry" :text-mode="textMode" :highlight-filters="activeHighlightFilters" />
        </template>
      </resizable-table>
      <button v-show="!autoScroll" class="button button-fill dock-scroll-button color-blue" @click="showLatestLogs()">
        <f7-icon f7="arrow_down_to_line" />
      </button>
    </f7-card>
  </div>

  <LogViewerSettingsPopup
    :default-log-level="defaultLogLevel"
    :logger-packages="loggerPackages"
    @update:log-level="updateLogLevel"
    @add:logger="addLogger"
    @delete:logger="removeLogger" />

  <LogViewerHighlightsPopup v-model:highlight-filters="highlightFilters" />

  <LogViewerDetailsPopup
    :log-entry="selectedLogEntry"
    @select:next="updateSelectedByIndex(selectedLogIndex + 1)"
    @select:previous="updateSelectedByIndex(selectedLogIndex - 1)"
    @select:latest="updateSelectedByIndex(filteredList.length - 1)" />

  <Teleport v-if="searchbarContainer" defer :to="searchbarContainer">
    <oh-searchbar
      ref="oh-searchbar"
      class="searchbar-logviewer"
      :persist-search-string-key="storageKeyPrefix + 'searchbar-search-string'"
      :haystack-fields="haystackFields"
      :filters-definitions="filtersDefinitions"
      @update:tokenized-search="onUpdateTokenizedSearch" />
  </Teleport>
</template>

<style lang="stylus">
// shared styles fo r log viewer page and embedded component
.log-viewer .table-block
  background #F8F9FA !important
  color #343A40
  .resizable-table-header-cell
    background-color #E9ECEF !important
    color #343A40 !important
    border-bottom 1px solid #DEE2E6
  table tbody
    tr
      border-bottom 1px solid #DEE2E6
    tr:hover
      background-color #EEF2F6 !important
    tr:nth-child(even)
      background-color #FFFFFF !important
    td
      overflow hidden
      text-overflow ellipsis
      white-space nowrap
      vertical-align middle
      text-align left

    td.time
      color #6C757D !important
      font-family monospace
      cursor pointer
      padding-left 0.5em
      text-align left
    td.level
      text-align center
      text-overflow unset
      span
        border-radius 3px
        display inline-flex
        line-height 1;
        padding 2px 6px
        align-items center
        height 1.2em
      span::before
        content "●"
        margin-right 4px
        font-size 0.8em
    td.logger
      color #5C6670 !important
      direction rtl
    td.message
      text-wrap nowrap
      white-space pre
      max-width 80vw

    tr.info .level span
      color #1976D2 !important
      background #E3F2FD !important
    tr.debug .level span
      color #6C757D !important
      background #E9ECEF !important
    tr.warn .level span
      color #B77900 !important
      background #FFF3CD !important
    tr.error .level span
      color #D32F2F !important
      background #FDECEC !important
    tr.trace .level span
      color #7B4AB5 !important
      background #F1E8FA !important

    td span.filter-highlight
      font-weight bold

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

  .log-viewer-card
    margin 0
    padding 0
    width 100%
    display flex
    flex-direction column
    overflow hidden
    border-radius 0

  .table-container
    display block
    position relative

  .small table
    font-size 11px
    line-height 13px
    tr
      height 13px
    i.icon
      font-size 12px !important
    td
      padding 2px

  .medium table
    font-size 13px
    line-height 15px
    i.icon
      font-size 15px !important
    td
      padding 4px

  .large table
    font-size 15px
    line-height 18px
    i.icon
      font-size 18px !important
    td
      padding 5px

  .content-wrapped table
    td.msg
      white-space pre-wrap
      word-break break-word
      text-wrap normal

  .textmode
    font-family monospace
    tr
      border-bottom none
    td
      padding 0
      white-space pre-wrap
      word-break break-word
      text-wrap normal
      div.textline
        display inline-block
        width 100%
        padding-left 4em
        text-indent -4em
    span.info
      color #1976D2 !important
    span.debug
      color #6C757D !important
    span.warn
      color #B77900 !important
    span.error
      color #D32F2F !important
    span.trace
      color #7B4AB5 !important

    span.msg
      font-weight bold

.dark .log-viewer .table-block
  background #15191d !important
  color #d5d9de
  .resizable-table-header-cell
    background-color #20262D !important
    color #F0F3F6 !important
    border-bottom 1px solid #303841
  tbody
    tr
      border-bottom 1px solid #303841
    tr:hover
      background-color #252C33 !important
    tr:nth-child(even)
      background-color #1B2025 !important

    td.time // Timestamp
      color #9DA7B1 !important
    td.logger   // Logger
      color #9da7b1 !important
    td.msg   // Message
      color #d5d9de !important

    tr.info .level span
      background #12395A !important
    tr.debug .level span
      background #30363D !important
    tr.warn .level span
      background #4A3508 !important
    tr.error .level span
      background #4A1818 !important
    tr.trace .level span
      background #392447 !important
  .textmode
    tbody
      tr
        border-bottom none

@keyframes opacity-pulse
  0%
    opacity 1
  100%
    opacity 0
</style>

<script setup lang="ts">
import { ref, computed, nextTick, useTemplateRef, watch, type Ref } from 'vue'
import { f7 } from 'framework7-vue'
import { useStorage } from '@vueuse/core'
import ResizableTable from './resizable-table.vue'
import LogViewerSettingsPopup from './log-viewer-settings-popup.vue'
import LogViewerHighlightsPopup from './log-viewer-highlights-popup.vue'
import LogViewerDetailsPopup from './log-viewer-details-popup.vue'
import OhSearchbar from '@/pages/oh-searchbar.vue'
import { useSearch } from '@/components/useSearch'
import { LogTableRow } from './log-viewer-row.ts'

// TODO: Remove once we have refactored clipboard to TypeScript
// @ts-expect-error-next-line
import copyToClipboard from '@/js/clipboard'

import * as api from '@/api'
import ws, { type MessageCallback, type ReadyCallback, type CloseCallback, type ErrorCallback } from '@/js/openhab/ws'
import { showToast } from '@/js/dialog-promises'

import { type LogEntry, type EnrichedLogEntry, type LogHighlightFilter, Color } from './types'

// Should match the actual line heights used in the CSS for the different text sizes and modes
enum LineHeights {
  small = 22,
  medium = 28,
  large = 33,
  textmode_small = 17,
  textmode_medium = 23,
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  textmode_large = 28
}
type TextSize = keyof typeof LineHeights

const maxEntries = 2000
const resizableTableRef = useTemplateRef('resizableTable')

const props = withDefaults(
  defineProps<{
    searchbarContainer?: string | HTMLElement | null
    storageKeyPrefix?: string
  }>(),
  {
    storageKeyPrefix: 'org.openhab.ui:logviewer:'
  }
)

// --- Persistent State ---
const textMode = useStorage<boolean>(props.storageKeyPrefix + 'textMode', false, localStorage, { flush: 'sync', writeDefaults: false })
const showErrors = useStorage<boolean>(props.storageKeyPrefix + 'showErrors', false, localStorage, { flush: 'sync', writeDefaults: false })
const wrapMessages = useStorage<boolean>(props.storageKeyPrefix + 'wrapMessages', false, localStorage, {
  flush: 'sync',
  writeDefaults: false
})
const filterText = useStorage<string>(props.storageKeyPrefix + 'logFilterText', '', localStorage, { flush: 'sync', writeDefaults: false })
const textSize = useStorage<TextSize>(props.storageKeyPrefix + 'textSize', 'medium', localStorage, { flush: 'sync', writeDefaults: false })
const highlightFilters = useStorage<LogHighlightFilter[]>(props.storageKeyPrefix + 'logHighlightFilters', [], localStorage, {
  flush: 'sync',
  writeDefaults: false,
  serializer: {
    read: (raw) => {
      // parse highlight filters from storage in order to ensure backward compatibility with previous versions of the app
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          return parsed.map((item) => ({
            text: item.text ?? '',
            color: Object.values(Color).includes(item.color) ? item.color : Color.yellow,
            active: item.active ?? true
          }))
        }
      } catch (e) {
        console.warn('Failed to parse highlight filters from storage:', e)
      }
      return []
    },
    write: (value) => JSON.stringify(value)
  }
})

// --- State/Data ---
let defaultLogLevel = 'WARN'
let socket: WebSocket | null = null
let reconnectDelay = 1000
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let batchUpdatePending = false
const batchLogs: EnrichedLogEntry[] = []

const filtersDefinitions = {
  level: {
    label: 'Kind',
    options: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'TRACE']
  },
  message: {
    label: 'Message'
  },
  logger: {
    label: 'Logger',
    path: 'loggerName'
  },
  has: {
    label: 'Has',
    getFn: (entry: unknown) => {
      const logEntry = entry as LogEntry
      return logEntry.stackTrace && logEntry.stackTrace.length > 0 ? 'stacktrace' : ''
    },
    options: ['stacktrace']
  }
}
const haystackFields = ['message', 'loggerName']

let maxScrollHeight = 0
const loggerPackages = ref<api.LoggerInfo[]>([])
const stateConnected = ref(false)
const stateProcessing = ref(true)
const stateConnecting = ref(false)
const loadingLoggers = ref(true)
const autoScroll = ref(true)
const tableData: EnrichedLogEntry[] = [] // non-reactive to manually updates efficiently
const logStart = ref('--:--:--')
const logEnd = ref('--:--:--')
const lastSequence = ref(0)

const selectedLogId = ref<number>(-1)
const selectedLogIndex = ref<number>(-1)
const selectedLogEntry = ref<EnrichedLogEntry | null>(null)

// Column definitions (table mode only)
const DEFAULT_COLUMN_WIDTHS = [110, 60, 280, 2000]
const TABLE_COLUMN_DEFS = [
  { label: 'Time', width: 'max-content' },
  { label: 'Level', width: 'max-content' },
  { label: 'Logger', width: '15%', maxWidth: '0' }, // maxWidth = 0 will force width % when in auto-size
  { label: 'Message', width: 'auto' }
]

const { filteredList, onUpdateTokenizedSearch, addDataToFuse, forceUpdateFuseIndex, forceUpdateFuseFilter } = useSearch(tableData, {
  filtersDefinitions,
  haystackFields,
  fuseSearchInterceptor: (fuseSearch) => {
    if (typeof fuseSearch === 'string' && fuseSearch.trim() === '') {
      return fuseSearch
    } else if (typeof fuseSearch === 'object' && Object.keys(fuseSearch).length >= 0) {
      if (showErrors.value) {
        return { $or: [fuseSearch, { level: 'ERROR' }] }
      }
    }
    return fuseSearch
  }
})

function autoSizeColumn(colIndex: number) {
  const fields: (keyof EnrichedLogEntry)[] = ['time', 'level', 'loggerName', 'message']

  const maxColumnTexts = filteredList.value.reduce((acc: string[], entry) => {
    entry = entry as EnrichedLogEntry
    fields.forEach((field, index) => {
      const text = String(entry[field])
      if (text.length > (acc[index]?.length ?? 0)) {
        acc[index] = text
      }
    })
    return acc
  }, [])
  maxColumnTexts[1] = 'ERROR'

  const columnWidths = resizableTableRef.value?.autoSizeColumns(maxColumnTexts, '100%')
  if (colIndex < 0) {
    // auto size all columns
    columnWidths?.forEach((width, index) => {
      resizableTableRef.value?.setColumnWidth(index, width)
    })
  } else {
    resizableTableRef.value?.setColumnWidth(colIndex, columnWidths?.[colIndex] ?? DEFAULT_COLUMN_WIDTHS[colIndex])
  }
}

// Computed
const filterCount = computed(() => {
  return filteredList.value.length
})

const countersBadgeColor = computed(() => {
  if (tableData.length >= maxEntries) return 'red'
  if (filterCount.value < tableData.length) return 'orange'
  return 'green'
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
const activeHighlightFilters = computed(() => highlightFilters.value.filter((filter) => filter.active && filter.text.trim() !== ''))

watch(
  activeHighlightFilters,
  () => {
    // updateFilter()
  },
  { deep: true }
)

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
}

function cleanup() {
  loggingStop()
}

function updateSelectedByIndex(selectedIndex: number) {
  if (selectedIndex >= 0 && selectedIndex < tableData.length) {
    selectedLogIndex.value = selectedIndex
    selectedLogEntry.value = { ...tableData[selectedIndex] }
    selectedLogId.value = selectedLogEntry.value.sequence
  } else {
    selectedLogIndex.value = -1
    selectedLogEntry.value = null
    selectedLogId.value = -1
  }
}

function updateSelectedById(selectedId: number) {
  const index = tableData.findIndex((item) => item.sequence === selectedId)
  updateSelectedByIndex(index)
}

function updateLogLevel(loggerName: string, value: string) {
  const logger = loggerPackages.value.find((item) => item.loggerName === loggerName)
  if (logger) {
    logger.level = value
    api.putLogger({ loggerName: logger.loggerName, loggerInfo: logger }).catch((error) => {
      console.warn('Failed to update log level for ' + logger.loggerName + ':', error)
    })
  }
}

async function removeLogger(loggerName: string) {
  await api.removeLogger({ loggerName: loggerName }).catch((error) => {
    console.warn('Failed to remove logger ' + loggerName + ':', error)
  })
  loggerPackages.value = loggerPackages.value.filter((loggerPackage) => loggerPackage.loggerName !== loggerName)
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

function onTableClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  const tr = target.closest('tr')
  if (!tr) return
  const entityId = Number(tr.dataset.id)
  if (!isNaN(entityId)) {
    updateSelectedById(entityId)
    nextTick(() => {
      f7.popup.open('#logdetails-popup')
    })
  }
}

function addLogEntry(logEntry: LogEntry) {
  lastSequence.value = Math.max(lastSequence.value, logEntry.sequence)
  const date = new Date(logEntry.unixtime)

  const time = date.toISOString().slice(11, 23)
  const formattedTimeSansMS = time.slice(0, 8)

  logEnd.value = formattedTimeSansMS
  if (tableData.length === 0) {
    logStart.value = formattedTimeSansMS
  }

  let entry = { ...logEntry, time } satisfies EnrichedLogEntry
  batchLogs.push(entry)

  if (!batchUpdatePending) {
    batchUpdatePending = true
    requestAnimationFrame(() => {
      batchLogs.forEach((entry) => {
        if (stateProcessing.value) {
          // fuse will add data to tableData
          addDataToFuse(entry, tableData.length > maxEntries)
        } else {
          if (tableData.length > maxEntries) {
            tableData.shift()
          }
          tableData.push(entry)
        }
      })
      batchLogs.length = 0

      if (autoScroll.value && stateProcessing.value) {
        nextTick(() => scrollToBottom())
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
  forceUpdateFuseIndex()
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
  tableData.length = 0
  forceUpdateFuseIndex()
  logStart.value = '--:--:--'
  logEnd.value = '--:--:--'
  updateSelectedByIndex(-1)
  batchLogs.length = 0
}

function showLatestLogs() {
  stateProcessing.value = true
  autoScroll.value = true
  maxScrollHeight = 0
  nextTick(() => scrollToBottom())
}

function scrollToBottom() {
  // resizableTableRef.value?.scrollTo(filteredList.value.length, { block: 'end', inline: 'end' })
  resizableTableRef.value?.scrollToBottom()
}

function onScroll(event: Event) {
  const scrollTop = (event.target as HTMLElement).scrollTop
  const clientHeight = (event.target as HTMLElement).clientHeight

  // add some guardband to avoid auto-scroll being triggered inadvertently
  if (scrollTop + clientHeight < maxScrollHeight - 100) {
    autoScroll.value = false
  }

  maxScrollHeight = Math.max(maxScrollHeight, scrollTop + clientHeight)
}

function addLogger(loggerName: string) {
  let logger = {
    loggerName: loggerName,
    level: 'INFO'
  }
  updateLogLevel(loggerName, defaultLogLevel)
  loggerPackages.value.push(logger)
  loggerPackages.value.sort((a, b) => a.loggerName.localeCompare(b.loggerName))
}

function downloadCSV() {
  const filteredData = filteredList.value

  const transformedData = filteredData.map((row) => ({
    time: row.time,
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
    const logs = filteredList.value
      .map((log) => {
        return `${log.time} [${log.level}] [${log.loggerName}] - ${log.message}`
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

  const table = resizableTableRef.value?.getTableElement()
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
  maxScrollHeight = 0
  textMode.value = textModeEnabled
  if (textModeEnabled) {
    resizableTableRef.value?.clearResizeHoverState()
  }
}

function toggleErrorDisplay() {
  showErrors.value = !showErrors.value
  forceUpdateFuseFilter()
}

function toggleWrapMessages() {
  wrapMessages.value = !wrapMessages.value
}

function toggleTextSize() {
  maxScrollHeight = 0
  if (textSize.value === 'small') {
    textSize.value = 'medium'
  } else if (textSize.value === 'medium') {
    textSize.value = 'large'
  } else {
    textSize.value = 'small'
  }
  nextTick(() => {
    autoSizeColumn(-1) // auto size all columns
  })
}

defineExpose({
  logStart,
  logEnd,
  countersBadgeColor,
  periodRangeColor,
  periodRangeTooltip,
  isConnecting,
  selectedLogEntry,
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
  wrapMessages,
  toggleWrapMessages,
  toggleTextSize,
  autoSizeColumn
})
</script>
