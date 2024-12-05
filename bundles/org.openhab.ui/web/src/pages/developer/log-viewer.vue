<template>
  <f7-page name="logviewer" class="log-viewer" @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <!-- Logger Settings Popup -->
    <div class="popup logsettings-popup">
      <div class="view">
        <div class="page">
          <div class="navbar">
            <div class="navbar-bg" />
            <div class="navbar-inner">
              <div class="title">
                Logging Settings
              </div>
              <div class="right">
                <!-- Link to close popup -->
                <a class="link popup-close">Close</a>
              </div>
            </div>
          </div>
          <div class="page-content">
            <f7-block class="input-with-buttons-container">
              <div class="input-with-buttons searchbar">
                <input type="text" placeholder="Add custom logger package entry..."
                       @keyup.enter="handleLogPackageEnter($event)" class="custom-input"></input>
              </div>
            </f7-block>
            <f7-block style="margin-top: 4px; font-size: 0.85rem; text-align: center;">
              Logger will be added with ROOT log level {{ defaultLogLevel }}
            </f7-block>

            <f7-list class="col wide">
              <f7-list-item v-for="loggerPackage in loggerPackages" :key="loggerPackage.loggerName"
                            :title="loggerPackage.loggerName">
                <f7-input slot="after" type="select" :value="loggerPackage.level"
                          @input="updateLogLevel(loggerPackage, $event.target.value)">
                  <option value="DEFAULT">
                    Default
                  </option>
                  <option value="TRACE">
                    Trace
                  </option>
                  <option value="DEBUG">
                    Debug
                  </option>
                  <option value="INFO">
                    Info
                  </option>
                  <option value="WARN">
                    Warning
                  </option>
                  <option value="ERROR">
                    Error
                  </option>
                  <option value="OFF">
                    Off
                  </option>
                </f7-input>
                <f7-button slot="after" small icon-f7="xmark_circle" @click="removeLogLevel(loggerPackage)" />
              </f7-list-item>
            </f7-list>
          </div>
        </div>
      </div>
    </div>

    <!-- Highlights Popup -->
    <div class="popup loghighlights-popup" @popup:close="saveHighlighters">
      <div class="view">
        <div class="page">
          <div class="navbar">
            <div class="navbar-bg" />
            <div class="navbar-inner">
              <div class="title">
                Logging Highlight Filters
              </div>
              <div class="right">
                <!-- Link to close popup -->
                <a class="link popup-close">Close</a>
              </div>
            </div>
          </div>
          <div class="page-content">
            <f7-list class="col wide">
              <f7-list-item v-for="(highlightFilter, index) in highlightFilters" :key="index">
                <input slot="media" type="checkbox" v-model="highlightFilter.active" checked></input>
                <f7-input slot="title" type="text" placeholder="Enter text to highlight..."
                          :value="highlightFilter.text" @input="updateHighlightText($event, index)" />

                <!-- Color Picker -->
                <div slot="after">
                  <f7-button class="color-picker-button" @click="openColorPopover(index, $event)"
                             :style="{ backgroundColor: highlightFilter.color }" />
                </div>
                <f7-button slot="after" small icon-f7="xmark_circle" @click="removeHighlight(index)" />
              </f7-list-item>
            </f7-list>
            <button class="button" @click="addNewHighlight">
              Add New Highlight
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Color Picker Popover -->
    <f7-popover id="color-picker-popover">
      <f7-block>
        <div class="color-palette">
          <button v-for="color in colors" :key="color" :style="{ backgroundColor: color }"
                  :class="{ selected: currentHighlightColor === color }" @click="selectHighlightColor(color)" />
        </div>
      </f7-block>
    </f7-popover>

    <!-- Main Display -->
    <f7-navbar title="Log Viewer" back-link="Developer Tools" back-link-url="/developer/" back-link-force>
      <f7-nav-right>
        <f7-link icon-ios="f7:play_fill" icon-f7="play_fill" icon-md="material:play_arrow" class="margin-left"
                 tooltip="Continue receiving logs" :disabled="stateConnected && stateProcessing"
                 :class="{ 'disabled-link': stateConnected && stateProcessing }" @click="loggingContinue" />
        <f7-link icon-ios="f7:pause_fill" icon-aurora="f7:pause_fill" icon-md="material:pause_fill"
                 tooltip="Pause processing new logs" :disabled="!stateConnected || !stateProcessing"
                 :class="{ 'disabled-link': !stateConnected || !stateProcessing }" @click="loggingPause" />
        <f7-link icon-ios="f7:stop_fill" icon-aurora="f7:stop_fill" icon-md="material:stop_fill"
                 tooltip="Stop receiving logs" :disabled="!stateConnected" :class="{ 'disabled-link': !stateConnected }"
                 @click="loggingStop" />
      </f7-nav-right>

      <f7-subnavbar :inner="false">
        <f7-searchbar ref="searchbar" :value="filterText" custom-search placeholder="Filter" :disable-button="false" @searchbar:search="handleFilter" @searchbar.clear="clearFilter" />
        <!-- <div class="filter-input-box">
          <input type="search" placeholder="Filter..." v-model="filterText" @keyup.enter="handleFilter"></input>
        </div> -->
        <div style="display: flex; flex-wrap: nowrap;">
          <f7-badge class="log-period margin-left-half">
            {{ logStart }}&nbsp;>&nbsp;{{ logEnd }}
          </f7-badge>
          <f7-badge class="margin-horizontal" :color="countersBadgeColor" tooltip="Log entries filtered/total">
            {{ filterCount }}/{{ tableData.length }}
          </f7-badge>
          <!-- <f7-badge color="red" tooltip="Maximum log entries to be buffered">
            {{ maxEntries }}
          </f7-badge> -->
        </div>
      </f7-subnavbar>
    </f7-navbar>

    <f7-toolbar bottom>
      <!-- <f7-link icon-f7="arrow_down_to_line" tooltip="Scroll to latest log entries" :disabled="autoScroll"
                 :class="{ 'disabled-link': autoScroll }" @click="showLatestLogs" /> -->
      <f7-link icon-f7="cloud_download"
               tooltip="Download filtered log as CSV" :disabled="filterCount == 0"
               :class="{ 'disabled-link': filterCount == 0 }" @click="downloadCSV" />
      <f7-link icon-f7="rectangle_on_rectangle" tooltip="Copy filtered log to clipboard"
               :disabled="filterCount == 0" :class="{ 'disabled-link': filterCount == 0 }" @click="copyTableToClipboard" />
      <f7-link icon-f7="trash" tooltip="Clear the log buffer"
               :disabled="tableData.length == 0" :class="{ 'disabled-link': tableData.length == 0 }"
               @click="clearLog" />
      <f7-link @click="toggleErrorDisplay" tooltip="Always show error level logs">
        <f7-icon v-if="showErrors" f7="exclamationmark_triangle_fill" />
        <f7-icon v-else f7="exclamationmark_triangle" />
      </f7-link>
      <f7-link icon-f7="pencil" tooltip="Configure highlights"
               data-popup=".loghighlights-popup" class="popup-open" />
      <f7-link icon-f7="gear" tooltip="Configure logging"
               data-popup=".logsettings-popup" class="popup-open" />
    </f7-toolbar>

    <f7-block class="no-padding no-margin">
      <f7-col>
        <f7-card class="custom-card">
          <div class="table-container" ref="tableContainer" @scroll="handleScroll">
            <table ref="dataTable">
              <tbody>
                <tr v-for="entity in filteredTableData" :key="entity.id" class="table-rows"
                    :class="entity.level.toLowerCase()">
                  <td class="sticky">
                    {{ entity.time }}<span class="milliseconds">{{ entity.milliseconds }}</span>
                  </td>
                  <td>
                    {{ entity.level }}
                  </td>
                  <td>
                    {{ entity.loggerName }}
                  </td>
                  <td v-html="highlightText(entity.message)" class="nowrap" />
                </tr>
              </tbody>
            </table>
          </div>
        </f7-card>
      </f7-col>
    </f7-block>

    <f7-fab v-show="!autoScroll" position="right-bottom" slot="fixed" color="blue"
            tooltip="Scroll to latest log entries" @click="showLatestLogs">
      <f7-icon f7="arrow_down_to_line" />
    </f7-fab>
  </f7-page>
</template>

<style lang="stylus">
.log-viewer

  /* Ensure the card takes full width and removes padding */
  .custom-card
    margin 0
    padding 0
    width 100%
    display flex
    flex-direction column
    overflow hidden

  .table-container
    overflow-y auto
    overflow-x auto
    display block
    transition height 0.2s ease-in-out
    height calc(100vh - var(--f7-navbar-height) - var(--f7-subnavbar-height) - var(--f7-toolbar-height))

  table
    width 100%
    overflow-x auto
    position relative
    border-collapse collapse
    table-layout auto

  td.nowrap
    padding 5px
    text-align left
    white-space nowrap

  td.sticky
    position sticky
    left 0
    color black
    background #f1f1f1
    z-index 1

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

  .disabled-link
    pointer-events none
    opacity 0.5
    cursor not-allowed

  .filter-input-box input:focus
    outline none
    border-color #007aff

  .input-with-buttons-container
    display flex
    justify-content center
    padding 10px

  .input-with-buttons
    display flex
    align-items center
    border 1px solid #ccc
    border-radius 5px
    overflow hidden
    max-width 400px
    width 100%
    background-color var(--f7-searchbar-input-bg-color)

  .custom-input
    flex 1
    border none
    padding 10px
    outline none

  .milliseconds
    font-size 0.8em

  .log-period
    white-space nowrap !important

// @media (max-width: 767px)
//   .log-viewer .log-period
//     display none

#color-picker-popover
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

</style>

<script lang="ts">
import Vue from 'vue'

import auth from '@/components/auth-mixin.js'
import { getAccessToken, getTokenInCustomHeader, getBasicCredentials } from '@/js/openhab/auth.js'

export default {
  mixins: [auth],
  components: {
  },
  data () {
    return {
      stateConnecting: false,
      stateConnected: false,
      stateProcessing: true,
      scrollTime: 0,
      autoScroll: true,
      socket: {},
      keepAliveTimer: null,
      defaultLogLevel: 'WARN',
      logPackageInputText: '',
      highlightFilters: [],
      activeHighlights: [],
      filterText: '',
      filterTextLowerCase: '',
      filterCount: 0,
      showErrors: false,
      loadingLoggers: true,
      loggerPackages: [],
      tableData: [],
      nextId: 0,
      maxEntries: 2000,
      updateCount: 0,
      logStart: '--:--:--',
      logEnd: '--:--:--',
      currentHighlightColorItemIndex: null,
      currentHighlightColor: '#FF5252',
      colors: [
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
    }
  },
  computed: {
    filteredTableData () {
      return this.tableData.filter(item => item.visible)
    },
    countersBadgeColor () {
      if (this.tableData.length >= this.maxEntries) return 'red'
      if (this.filterCount < this.tableData.length) return 'orange'
      return 'green'
    }
  },
  methods: {
    onPageAfterIn () {
      this.$oh.api.get('/rest/logging/').then(data => {
        data.loggers.forEach(logger => this.loggerPackages.push(logger))
        this.$nextTick(() => {
          const rootPackageIndex = this.loggerPackages.findIndex(item => item.loggerName === 'ROOT')
          if (rootPackageIndex !== -1) {
            this.defaultLogLevel = this.loggerPackages[rootPackageIndex].level
          }
          this.loggerPackages.sort((a, b) => a.loggerName.localeCompare(b.loggerName))
          this.loggerPackages = this.loggerPackages.filter(item => item.loggerName !== 'ROOT')

          this.loadingLoggers = false
        })
      })

      this.socketConnect()

      this.highlightFilters = JSON.parse(localStorage.getItem('openhab.ui:logviewer.logHighlightFilters'))
      if (this.highlightFilters == null) {
        this.highlightFilters = []
      }
      this.prefilterHighlights()

      this.filterText = localStorage.getItem('openhab.ui:logviewer.logFilterText')
      if (this.filterText == null) {
        this.filterText = ''
      } else {
        this.$refs.searchbar.f7Searchbar.query = this.filterText
      }
      this.filterTextLowerCase = this.filterText.trim().toLocaleLowerCase()

      this.showErrors = localStorage.getItem('openhab.ui:logviewer.logShowErrors')
    },
    onPageBeforeOut () {
      this.loggingStop()
    },
    updateLogLevel (logger, value) {
      logger.level = value
      this.$oh.api.put('/rest/logging/' + logger.loggerName, logger)
    },
    removeLogLevel (logger) {
      this.$oh.api.delete('/rest/logging/' + logger.loggerName)
      this.loggerPackages = this.loggerPackages.filter(loggerPackage => loggerPackage.loggerName !== logger.loggerName)
    },
    socketConnect () {
      this.stateConnecting = true

      // Create a new WebSocket connection
      const wsUrl = '/ws/logs?accessToken=' + getAccessToken()
      this.socket = new WebSocket(wsUrl)

      const me = this

      // Event handler when the WebSocket connection is opened
      this.socket.onopen = function () {
        me.stateConnected = true
        me.stateConnecting = false
        me.stateProcessing = true
        me.$nextTick(() => me.scrollToBottom())
      }

      // Event handler when a message is received from OpenHAB
      this.socket.onmessage = function (event) {
        try {
          const data = JSON.parse(event.data)
          me.addLogEntry(data)
        } catch (e) {
          console.error('Error parsing event data:', e)
        }
      }

      // Event handler for WebSocket errors
      this.socket.onerror = function (error) {
        console.error('WebSocket error:', error)
      }

      // Event handler when the WebSocket connection is closed
      this.socket.onclose = function () {
        me.stateConnected = false
        me.stateConnecting = false
      }

      // TODO: handle timeouts
      // this.keepAliveTimer = setTimeout(this.keepAlive, 9000)
    },
    keepAlive () {
      if (this.socket && this.stateConnected) {
        this.socket.send('ping')
        this.keepAliveTimer = setTimeout(this.keepAlive, 9000)
      } else {
        if (this.keepAliveTimer) {
          clearTimeout(this.keepAliveTimer)
        }
      }
    },
    addLogEntry (logEntry) {
      this.updateCount++

      const date = new Date(logEntry.unixtime)

      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      const seconds = date.getSeconds().toString().padStart(2, '0')
      const ms = '.' + date.getMilliseconds().toString().padStart(3, '0')

      const formattedTime = `${hours}:${minutes}:${seconds}`

      this.logEnd = formattedTime
      if (this.tableData.length === 0) {
        this.logStart = formattedTime
      }

      let vis = false
      if (this.stateProcessing) {
        vis = this.processFilter(logEntry)
        if (vis) {
          // TODO: Do we need to scroll 1 line to keep the view steady?
          this.filterCount++
        }
      }

      this.tableData.push({
        id: this.nextId++,
        visible: vis,
        time: formattedTime,
        milliseconds: ms,
        level: logEntry.level.toUpperCase(),
        loggerName: logEntry.loggerName,
        message: logEntry.message
      })

      if (this.tableData.length > this.maxEntries) {
        const removedElement = this.tableData.shift()
        this.logStart = removedElement.time
        if (removedElement.visible) {
          this.filterCount--
        }
      }

      if (this.autoScroll) {
        this.$nextTick(() => this.scrollToBottom())
      }
    },
    loggingPause () {
      this.stateProcessing = false
    },
    loggingContinue () {
      if (!this.stateConnected) {
        this.socketConnect()
      }
      this.updateFilter()
      this.stateProcessing = true
    },
    loggingStop () {
      this.stateConnected = false
      this.socket.close()
    },
    clearLog () {
      this.tableData.length = 0
      this.filterCount = 0
      this.logStart = '--:--:--'
      this.logEnd = '--:--:--'
    },
    showLatestLogs () {
      this.autoScroll = true
      this.scrollToBottom()
    },
    scrollToBottom () {
      // Scroll to the bottom of the table
      const tableContainer = this.$refs.tableContainer
      if (tableContainer) {
        tableContainer.scrollTop = tableContainer.scrollHeight
        // Delay manual scroll detection to avoid autoscrolling being defeated when new logs arrive
        this.scrollTime = Date.now() + 250
      }
    },
    handleScroll () {
      const tableContainer = this.$refs.tableContainer

      if (Date.now() < this.scrollTime) return

      // Detect if the user has scrolled up
      const isAtBottom = tableContainer.scrollHeight - tableContainer.scrollTop < (tableContainer.clientHeight + 20)
      this.autoScroll = isAtBottom
    },
    handleLogPackageEnter (event) {
      let logger = {
        loggerName: event.target.value,
        level: 'INFO'
      }
      this.updateLogLevel(logger, this.defaultLogLevel)
      this.loggerPackages.push(logger)
      this.loggerPackages.sort((a, b) => a.loggerName.localeCompare(b.loggerName))
    },
    processFilter (logEntry) {
      return logEntry.loggerName.toLowerCase().includes(this.filterTextLowerCase) || logEntry.message.toLowerCase().includes(this.filterTextLowerCase) || (this.showErrors && logEntry.level === 'ERROR')
    },
    handleFilter (searchbar, filter) {
      if (!searchbar) return
      if (!filter) {
        this.clearFilter()
        return
      }
      this.filterText = filter
      this.filterTextLowerCase = this.filterText.trim().toLocaleLowerCase()
      localStorage.setItem('openhab.ui:logviewer.logFilterText', this.filterText)
      this.updateFilter()
      this.scrollToBottom()
    },
    clearFilter () {
      this.filterText = this.filterTextLowerCase = ''
      localStorage.removeItem('openhab.ui:logviewer.logFilterText')
      this.updateFilter()
      this.scrollToBottom()
    },
    updateFilter () {
      let cnt = 0
      for (const entry of this.tableData) {
        entry.visible = this.processFilter(entry)
        if (entry.visible) {
          cnt++
        }
      }
      this.filterCount = cnt
    },
    highlightText (text) {
      if (this.activeHighlights.length === 0) {
        return text // Skip if no filters are active
      }

      // Apply each filter with its respective color
      this.activeHighlights.forEach((filter) => {
        const regex = new RegExp(`(${filter.text})`, 'gi')
        text = text.replace(
          regex,
          `<span style="background-color: ${filter.color}; font-weight: bold;">$1</span>`
        )
      })
      return text
    },
    downloadCSV () {
      const filteredData = this.tableData.filter((row) => row.visible)

      const transformedData = filteredData.map((row) => ({
        time: row.time + row.milliseconds,
        level: row.level,
        source: row.loggerName,
        data: row.message
      }))

      const csvContent = this.convertObjectArrayToCSV(transformedData)
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = 'logfile.csv'
      link.click()

      URL.revokeObjectURL(url)
    },
    convertObjectArrayToCSV (array) {
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
    },
    copyTableToClipboard () {
      const table = this.$refs.dataTable
      if (!table) {
        return
      }

      const tableHTML = table.outerHTML

      // Create a Blob with the HTML content and define the MIME type
      const blob = new Blob([tableHTML], { type: 'text/html' })

      // Use the ClipboardItem API to copy the Blob
      const clipboardItem = new ClipboardItem({ 'text/html': blob })

      // Copy to clipboard
      navigator.clipboard
        .write([clipboardItem])
        .then(() => {
          this.$f7.toast.create({
            text: 'Table copied as HTML to clipboard',
            closeTimeout: 2000
          }).open()
        })
        .catch((err) => {
          console.error('Failed to copy table: ', err)
        })
    },
    prefilterHighlights () {
      this.activeHighlights.length = 0
      for (const entry of this.highlightFilters) {
        if (entry.active) {
          this.activeHighlights.push({
            text: entry.text,
            color: entry.color
          })
        }
      }
    },
    saveHighlighters () {
      localStorage.setItem('openhab.ui:logviewer.logHighlightFilters', JSON.stringify(this.highlightFilters))
      this.prefilterHighlights()
    },
    addNewHighlight () {
      this.highlightFilters.push({
        text: '',
        color: this.colors[0],
        active: false
      })
    },
    updateHighlightText (event, index) {
      this.highlightFilters[index].text = event.target.value
      this.prefilterHighlights()
    },
    removeHighlight (index) {
      this.highlightFilters.splice(index, 1)
      this.prefilterHighlights()
    },
    openColorPopover (index, event) {
      this.currentHighlightColorItemIndex = index
      this.currentHighlightColor = this.highlightFilters[index].color
      this.$f7.popover.open('#color-picker-popover', event.target)
    },
    selectHighlightColor (color) {
      this.$f7.popover.close('#color-picker-popover')
      if (color !== null) {
        this.highlightFilters[this.currentHighlightColorItemIndex].color = color
      }
    },
    toggleErrorDisplay () {
      this.showErrors = !this.showErrors
      this.updateFilter()
      localStorage.setItem('openhab.ui:logviewer.logShowErrors', this.showErrors)
    }
  }
}

</script>
