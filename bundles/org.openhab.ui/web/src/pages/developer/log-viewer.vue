<template>
  <f7-page name="logviewer">
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
              <div class="input-with-buttons">
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
                  :class="{ selected: currentHighlightColor === color }" @click="selectHighterColor(color)" />
        </div>
      </f7-block>
    </f7-popover>

    <!-- Main Display -->
    <f7-navbar title="Log Viewer" back-link="Developer Tools" back-link-url="/developer/" back-link-force>
      <template #left>
        <f7-badge class="margin-left">
          {{ logStart }} - {{ logEnd }}
        </f7-badge>
        <f7-badge color="green" class="margin-left" tooltip="Filtered log entries currently displayed">
          {{ filterCount }}
        </f7-badge>
        <f7-badge color="orange" tooltip="Total log entries loaded" class="margin-left">
          {{ tableData.length }}
        </f7-badge>
        <f7-badge color="red" tooltip="Maximum log entries to be buffered" class="margin-left">
          {{ maxEntries }}
        </f7-badge>
        <f7-badge color="blue" tooltip="Number of entries per second" class="margin-left">
          {{ updateRate }}
        </f7-badge>
      </template>

      <f7-nav-right>
        <div class="filter-input-box">
          <input type="text" placeholder="Filter..." v-model="filterText" @keyup.enter="handleFilter"></input>
        </div>

        <f7-link icon-ios="f7:play_fill" icon-aurora="f7:play_fill" icon-md="material:play_fill" class="margin-left"
                 tooltip="Continue receiving logs" :disabled="stateConnected && stateProcessing"
                 :class="{ 'disabled-link': stateConnected && stateProcessing }" @click="loggingContinue" />
        <f7-link icon-ios="f7:pause_fill" icon-aurora="f7:pause_fill" icon-md="material:pause_fill"
                 tooltip="Pause processing new logs" :disabled="!stateConnected || !stateProcessing"
                 :class="{ 'disabled-link': !stateConnected || !stateProcessing }" @click="loggingPause" />
        <f7-link icon-ios="f7:stop_fill" icon-aurora="f7:stop_fill" icon-md="material:stop_fill"
                 tooltip="Stop receiving logs" :disabled="!stateConnected" :class="{ 'disabled-link': !stateConnected }"
                 @click="loggingStop" />
        <f7-link icon-ios="f7:arrow_down_to_line" icon-aurora="f7:arrow_down_to_line"
                 icon-md="material:arrow_down_to_line" tooltip="Scroll to latest log entries" :disabled="autoScroll"
                 :class="{ 'disabled-link': autoScroll }" @click="showLatestLogs" />

        <f7-link icon-ios="f7:cloud_download" icon-aurora="f7:cloud_download" icon-md="material:cloud_download"
                 tooltip="Download filtered log as CSV" :disabled="filterCount==0"
                 :class="{ 'disabled-link': filterCount == 0 }" class="margin-left" @click="downloadCSV" />
        <f7-link icon-ios="f7:rectangle_on_rectangle" icon-aurora="f7:rectangle_on_rectangle"
                 icon-md="material:rectangle_on_rectangle" tooltip="Copy filtered log to clipboard"
                 :disabled="filterCount == 0" :class="{ 'disabled-link': filterCount == 0 }" @click="copyTableToClipboard" />
        <f7-link icon-ios="f7:trash" icon-aurora="f7:trash" icon-md="material:trash" tooltip="Clear the log buffer"
                 class="margin-left" :disabled="tableData.length==0" :class="{ 'disabled-link': tableData.length == 0 }"
                 @click="clearLog" />

        <f7-link icon-ios="f7:pencil" icon-aurora="f7:pencil" icon-md="material:pencil" tooltip="Configure highlights"
                 data-popup=".loghighlights-popup" class="popup-open margin-left" />
        <f7-link icon-ios="f7:gear" icon-aurora="f7:gear" icon-md="material:gear" tooltip="Configure logging"
                 data-popup=".logsettings-popup" class="popup-open" />
      </f7-nav-right>
    </f7-navbar>

    <f7-block>
      <f7-col>
        <f7-card class="custom-card">
          <div class="table-container" ref="tableContainer" @scroll="handleScroll">
            <table ref="dataTable">
              <tbody>
                <tr v-for="entity in tableData" v-if="entity.visible" class="table-rows"
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
  </f7-page>
</template>

<style>

/* Ensure the card takes full width and removes padding */
.custom-card {
  margin: 0;
  padding: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.table-container {
  overflow-y: auto;
  overflow-x: auto;
  display: block;
  transition: height 0.2s ease-in-out;
}

table {
  width: 100%;
  overflow-x: auto;
  position: relative;
  border-collapse: collapse;
  table-layout: auto;
}

table thead th {
  position: sticky;
  top: 0;
  background-color: #f9f9f9;
  z-index: 2;
  border-bottom: 5px solid #ddd;
}

th.nowrap,
td.nowrap {
  padding: 5px;
  text-align: left;
  white-space: nowrap;
}

th.sticky,
td.sticky {
  position: sticky;
  left: 0;
  background: #f1f1f1;
  z-index: 1;
}

tr.error {
  background-color: rgb(255, 96, 96);
}
tr.warn {
  background-color: rgb(247, 253, 163);
}
tr.info {
  background-color: rgb(163, 253, 163);
}
tr.debug {
}
tr.trace {
  color: rgb(112, 112, 112);
}

.disabled-link {
  pointer-events: none;
  opacity: 0.5;
  cursor: not-allowed;
}

.filter-input-box {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.filter-input-box input {
  width: 150px;
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.filter-input-box input:focus {
  outline: none;
  border-color: #007aff;
}

.input-with-buttons-container {
  display: flex;
  justify-content: center;
  padding: 10px;
}

.input-with-buttons {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow: hidden;
  max-width: 400px;
  width: 100%;
}

.custom-input {
  flex: 1;
  border: none;
  padding: 10px;
  outline: none;
}

.milliseconds {
  font-size: 0.8em;
}

.color-palette {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.color-palette button {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  outline: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
}

.color-palette button.selected {
  transform: scale(1.2);
  border: 2px solid black;
}
</style>

<script lang="ts">
import Vue from 'vue'

import auth from '@/components/auth-mixin.js'
import { getAccessToken, getTokenInCustomHeader, getBasicCredentials } from '@/js/openhab/auth.js'

export default Vue.extend({
  mixins: [auth],
  components: {
  },
  methods: {
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
      // TODO: Use the real address!!!
      const wsUrl = 'ws://192.168.2.125:8080/ws/logs?accessToken=' + getAccessToken()
      this.socket = new WebSocket(wsUrl)

      const me = this

      // Event handler when the WebSocket connection is opened
      this.socket.onopen = function () {
        me.stateConnected = true
        me.stateConnecting = false
        me.stateProcessing = true
        me.scrollToBottom()
      }

      // Event handler when a message is received from OpenHAB
      this.socket.onmessage = function (event) {
        // Process the event data (usually in JSON format)
        try {
          const data = JSON.parse(event.data)
          // Handle the OpenHAB event data here
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
    },
    addLogEntry (logEntry) {
      this.updateCount++

      const date = new Date(logEntry.unixtime) // Create a Date object

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
        visible: vis,
        time: formattedTime,
        milliseconds: ms,
        level: logEntry.level,
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
        this.scrollToBottom()
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
    resizeScrollRegion () {
      const tableContainer = this.$refs.tableContainer
      const navbar = document.querySelector('.navbar') // Target the Framework7 navbar
      if (tableContainer) {
        // TODO: Fix this sizing
        const availableHeight = window.innerHeight - navbar.offsetHeight - 70 // tableContainer.getBoundingClientRect().top
        tableContainer.style.height = `${availableHeight}px`
      }
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
      return logEntry.loggerName.toLowerCase().includes(this.filterTextLowerCase) || logEntry.message.toLowerCase().includes(this.filterTextLowerCase)
    },
    handleFilter () {
      this.filterTextLowerCase = this.filterText.trim().toLocaleLowerCase()
      localStorage.setItem('logFilterText', JSON.stringify(this.filterText))
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
      if (this.activeHighlights.length == 0) {
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
      this.activeHighlights.length = 0;
      for (const entry of this.highlightFilters) {
        if(entry.active) {
          this.activeHighlights.push({
            text: entry.text,
            color: entry.color
          });
        }
      }
    },
    saveHighlighters () {
      localStorage.setItem('logHighlightFilters', JSON.stringify(this.highlightFilters))
      this.prefilterHighlights()
    },
    addNewHighlight () {
      this.highlightFilters.push({
        text: 'New Highlighter',
        color: this.colors[0],
        active: false
      })
    },
    updateHighlightText (event, index) {
      this.highlightFilters[index].text = event.target.value
      this.prefilterHighlights();
    },
    removeHighlight (index) {
      this.highlightFilters.splice(index, 1)
      this.prefilterHighlights();
    },
    openColorPopover (index, event) {
      this.currentHighlightColorItemIndex = index
      this.currentHighlightColor = this.highlightFilters[index].color
      this.$f7.popover.open('#color-picker-popover', event.target)
    },
    selectHighterColor (color) {
      this.$f7.popover.close('#color-picker-popover')
      if (color !== null) {
        this.highlightFilters[this.currentHighlightColorItemIndex].color = color
      }
    },
    startTimer() {
      // Start a periodic timer
      this.timer = setInterval(() => {
        this.updateRate = this.updateCount
        this.updateCount = 0
      }, 1000)
    },
    stopTimer() {
      // Stop the timer
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    }
  },
  created () {
    this.$oh.api.get('/rest/logging/').then(data => {
      data.loggers.forEach(logger => this.loggerPackages.push(logger))
      this.$nextTick(() => {
        const rootPackageIndex = this.loggerPackages.findIndex(item => item.loggerName === 'ROOT');
        if (rootPackageIndex != -1) {
          console.log("Root log level = " + this.loggerPackages[rootPackageIndex].level)
          this.defaultLogLevel = this.loggerPackages[rootPackageIndex].level
        }
        this.loggerPackages.sort((a, b) => a.loggerName.localeCompare(b.loggerName))
        this.loggerPackages = this.loggerPackages.filter(item => item.loggerName !== 'ROOT')

        this.loadingLoggers = false
      })
    })

    this.socketConnect()

    this.highlightFilters = JSON.parse(localStorage.getItem('logHighlightFilters'))
    if (this.highlightFilters == null) {
      this.highlightFilters = []
    }
    this.prefilterHighlights()

    this.filterText = JSON.parse(localStorage.getItem('logFilterText'))
    if (this.filterText == null) {
      this.filterText = ''
    }
    this.filterTextLowerCase = this.filterText.trim().toLocaleLowerCase()

    this.startTimer()
  },
  mounted () {
    this.resizeScrollRegion()
    window.addEventListener('resize', this.resizeScrollRegion)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.resizeScrollRegion)
    this.stopTimer()
  },

  data: () => ({
    stateConnecting: false,
    stateConnected: false,
    stateProcessing: true,
    scrollTime: 0,
    autoScroll: true,
    socket: {},
    defaultLogLevel: 'xx',
    logPackageInputText: '',
    highlightFilters: [],
    activeHighlights: [],
    filterText: '',
    filterTextLowerCase: '',
    filterCount: 0,
    loadingLoggers: true,
    loggerPackages: [],
    tableData: [],
    maxEntries: 5000,
    updateCount: 0,
    updateRate: 0,
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
    ],
    timer: null
  })
})

</script>
