<template>
  <!-- Logger Settings Popup -->
  <div class="popup logsettings-popup">
    <div class="view">
      <div class="page">
        <div class="navbar">
          <div class="navbar-bg" />
          <div class="navbar-inner">
            <div class="title">Logging Settings</div>
            <div class="right">
              <!-- Link to close popup -->
              <a class="link popup-close">Close</a>
            </div>
          </div>
        </div>
        <div class="page-content">
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
            <div class="title">Logging Highlight Filters</div>
            <div class="right">
              <!-- Link to close popup -->
              <a class="link popup-close">Close</a>
            </div>
          </div>
        </div>
        <div class="page-content">
          <f7-list class="col wide">
            <f7-list-item v-for="(highlightFilter, index) in highlightFilters" :key="index">
              <template #media>
                <input type="checkbox" v-model="highlightFilter.active" checked />
              </template>
              <template #title>
                <f7-input
                  type="text"
                  placeholder="Enter text to highlight..."
                  :value="highlightFilter.text"
                  @input="updateHighlightText($event, index)" />
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
        </div>
      </div>
    </div>
  </div>

  <!-- Color Picker Popover -->
  <f7-popover id="color-picker-popover">
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
  <f7-popup
    id="logdetails-popup"
    ref="logDetailsPopup"
    close-on-escape
    close-by-backdrop-click
    @popup:open="popupOpened($refs.logDetailsPopup, $refs.logDetailsNavbar)"
    @popup:closed="cleanupMovablePopup">
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
        <f7-list-item header="Time" :title="selectedLog.time + selectedLog.milliseconds" />
        <f7-list-item header="Timestamp" :title="selectedLog.timestamp" />
        <f7-list-item header="Level" :title="selectedLog.level" />
        <f7-list-item header="Logger Class" :title="selectedLog.loggerName" />
        <f7-list-item>
          <template #title>
            <div class="item-title">
              <div class="item-header">Message</div>
              <div class="log-message">
                {{ selectedLog.message }}
              </div>
            </div>
          </template>
        </f7-list-item>
        <f7-list-item v-if="selectedLog.stackTrace">
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

  <div v-if="embedded" class="log-viewer log-viewer-embedded" :class="{ 'log-viewer-fullscreen': fullscreen }">
    <div class="dock-header">
      <div class="dock-header-row">
        <div class="dock-title">Log Viewer</div>
        <div class="dock-actions">
          <f7-link
            icon-ios="f7:play_fill"
            icon-f7="play_fill"
            icon-md="material:play_arrow"
            :icon-color="stateConnected && stateProcessing ? 'gray' : ''"
            :tooltip="!$device.ios ? 'Continue receiving logs' : ''"
            :class="{ 'disabled-link': stateConnected && stateProcessing, 'no-margin-left': $device.ios }"
            @click="loggingContinue" />
          <f7-link
            icon-ios="f7:pause_fill"
            icon-aurora="f7:pause_fill"
            icon-md="material:pause_fill"
            :icon-color="!stateConnected || !stateProcessing ? 'gray' : ''"
            :tooltip="!$device.ios ? 'Pause processing new logs' : ''"
            :class="{ 'disabled-link': !stateConnected || !stateProcessing, 'no-margin-left': $device.ios }"
            @click="loggingPause" />
          <f7-link
            icon-ios="f7:stop_fill"
            icon-aurora="f7:stop_fill"
            icon-md="material:stop_fill"
            :icon-color="!stateConnected ? 'gray' : ''"
            :tooltip="!$device.ios ? 'Stop receiving logs' : ''"
            :class="{ 'disabled-link': !stateConnected, 'no-margin-left': $device.ios }"
            @click="loggingStop" />
          <f7-link
            :icon-f7="fullscreen ? 'arrow_down_to_line' : 'arrow_up_left_arrow_down_right'"
            :tooltip="fullscreen ? 'Restore docked size (Shift+Alt+F)' : 'Fill main pane (Shift+Alt+F)'"
            @click="$emit('toggle-fullscreen')" />
          <span class="dock-action-sep" />
          <f7-link icon-f7="xmark" tooltip="Hide log pane (Shift+Alt+L)" @click="$emit('hide')" />
        </div>
      </div>
      <div class="dock-filter-row">
        <f7-searchbar
          ref="searchbar"
          class="dock-searchbar"
          :value="filterText"
          custom-search
          placeholder="Filter"
          :disable-button="false"
          @searchbar:search="handleFilter"
          @searchbar.clear="clearFilter" />
        <div class="dock-stats">
          <f7-badge class="log-period margin-left-half"> {{ logStart }}&nbsp;>&nbsp;{{ logEnd }} </f7-badge>
          <f7-badge class="margin-horizontal" :color="countersBadgeColor" tooltip="Log entries filtered/total">
            {{ filterCount }}/{{ tableData.length }}
          </f7-badge>
        </div>
      </div>
    </div>

    <div class="dock-toolbar">
      <f7-link
        icon-f7="cloud_download"
        tooltip="Download filtered log as CSV"
        :class="{ 'disabled-link': filterCount == 0 }"
        @click="downloadCSV" />
      <f7-link
        icon-f7="rectangle_on_rectangle"
        tooltip="Copy filtered log to clipboard"
        :class="{ 'disabled-link': filterCount == 0 }"
        @click="copyTableToClipboard" />
      <f7-link icon-f7="trash" tooltip="Clear the log buffer" :class="{ 'disabled-link': tableData.length == 0 }" @click="clearLog" />
      <f7-link @click="toggleErrorDisplay" tooltip="Always show error level logs">
        <f7-icon v-if="showErrors" f7="exclamationmark_triangle_fill" />
        <f7-icon v-else f7="exclamationmark_triangle" />
      </f7-link>
      <f7-link icon-f7="pencil" tooltip="Configure highlights" data-popup=".loghighlights-popup" class="popup-open" />
      <f7-segmented>
        <f7-button
          outline
          small
          :active="!textMode"
          icon-f7="table"
          :icon-size="theme.aurora ? 20 : 22"
          class="no-ripple"
          @click="setTextMode(false)"
          tooltip="Show logs in a table" />
        <f7-button
          outline
          small
          :active="textMode"
          icon-f7="text_justifyleft"
          :icon-size="theme.aurora ? 20 : 22"
          class="no-ripple"
          @click="setTextMode(true)"
          tooltip="Show logs as plain text" />
      </f7-segmented>
      <f7-link icon-f7="gear" tooltip="Configure logging" data-popup=".logsettings-popup" class="popup-open" />
    </div>

    <div class="dock-content table-block">
      <f7-card class="custom-card">
        <div class="table-container" ref="tableContainer" @scroll="handleScroll">
          <table ref="dataTable">
            <tbody />
          </table>
        </div>
      </f7-card>
      <button v-show="!autoScroll" class="button button-fill dock-scroll-button" @click="showLatestLogs">
        <f7-icon f7="arrow_down_to_line" />
      </button>
    </div>
  </div>

  <f7-page v-else name="logviewer" class="log-viewer" @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar>
      <oh-nav-content title="Log Viewer" back-link="Developer Tools" back-link-url="/developer/" :f7router>
        <template #right>
          <f7-link
            icon-ios="f7:play_fill"
            icon-f7="play_fill"
            icon-md="material:play_arrow"
            :icon-color="stateConnected && stateProcessing ? 'gray' : ''"
            :tooltip="!$device.ios ? 'Continue receiving logs' : ''"
            :class="{ 'disabled-link': stateConnected && stateProcessing, 'no-margin-left': $device.ios, 'connecting-flash': isConnecting }"
            @click="loggingContinue" />
          <f7-link
            icon-ios="f7:pause_fill"
            icon-aurora="f7:pause_fill"
            icon-md="material:pause_fill"
            :icon-color="!stateConnected || !stateProcessing ? 'gray' : ''"
            :tooltip="!$device.ios ? 'Pause processing new logs' : ''"
            :class="{ 'disabled-link': !stateConnected || !stateProcessing, 'no-margin-left': $device.ios }"
            @click="loggingPause" />
          <f7-link
            icon-ios="f7:stop_fill"
            icon-aurora="f7:stop_fill"
            icon-md="material:stop_fill"
            :icon-color="!stateConnected && !stateConnecting ? 'gray' : ''"
            :tooltip="!$device.ios ? 'Stop receiving logs' : ''"
            :class="{ 'disabled-link': !stateConnected && !stateConnecting, 'no-margin-left': $device.ios }"
            @click="loggingStop" />
        </template>
      </oh-nav-content>
      <f7-subnavbar :inner="false" style="padding-right: var(--f7-safe-area-right)">
        <f7-searchbar
          ref="searchbar"
          :value="filterText"
          custom-search
          placeholder="Filter"
          :disable-button="false"
          @searchbar:search="handleFilter"
          @searchbar.clear="clearFilter" />
        <!-- <div class="filter-input-box">
          <input type="search" placeholder="Filter..." v-model="filterText" @keyup.enter="handleFilter"></input>
        </div> -->
        <div style="display: flex; flex-wrap: nowrap">
          <f7-badge class="log-period margin-left-half" :color="periodRangeColor" :tooltip="periodRangeTooltip">
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
      <f7-link
        icon-f7="cloud_download"
        tooltip="Download filtered log as CSV"
        :class="{ 'disabled-link': filterCount == 0 }"
        @click="downloadCSV" />
      <f7-link
        icon-f7="rectangle_on_rectangle"
        tooltip="Copy filtered log to clipboard"
        :class="{ 'disabled-link': filterCount == 0 }"
        @click="copyTableToClipboard" />
      <f7-link icon-f7="trash" tooltip="Clear the log buffer" :class="{ 'disabled-link': tableData.length == 0 }" @click="clearLog" />
      <f7-link @click="toggleErrorDisplay" tooltip="Always show error level logs">
        <f7-icon v-if="showErrors" f7="exclamationmark_triangle_fill" />
        <f7-icon v-else f7="exclamationmark_triangle" />
      </f7-link>
      <f7-link icon-f7="pencil" tooltip="Configure highlights" data-popup=".loghighlights-popup" class="popup-open" />
      <f7-segmented>
        <f7-button
          outline
          small
          :active="!textMode"
          icon-f7="table"
          :icon-size="theme.aurora ? 20 : 22"
          class="no-ripple"
          @click="setTextMode(false)"
          tooltip="Show logs in a table" />
        <f7-button
          outline
          small
          :active="textMode"
          icon-f7="text_justifyleft"
          :icon-size="theme.aurora ? 20 : 22"
          class="no-ripple"
          @click="setTextMode(true)"
          tooltip="Show logs as plain text" />
      </f7-segmented>
      <f7-link icon-f7="gear" tooltip="Configure logging" data-popup=".logsettings-popup" class="popup-open" />
    </f7-toolbar>

    <f7-block class="table-block">
      <f7-col>
        <f7-card class="custom-card">
          <div class="table-container" ref="tableContainer" @scroll="handleScroll">
            <table ref="dataTable">
              <tbody />
            </table>
          </div>
        </f7-card>
      </f7-col>
    </f7-block>

    <template #fixed>
      <f7-fab v-show="!autoScroll" position="right-bottom" color="blue" tooltip="Scroll to latest log entries" @click="showLatestLogs">
        <f7-icon f7="arrow_down_to_line" />
      </f7-fab>
    </template>
  </f7-page>
</template>

<style lang="stylus">
.log-viewer

  &.log-viewer-embedded
    position relative
    width 100%
    height 100%
    min-height 0
    display flex
    flex-direction column
    overflow hidden
    --log-viewer-height 100%

    .table-block
      flex 1
      min-height 0
      position relative

    .custom-card
      height 100%

    .table-container
      height 100%

    .dock-header
      flex none
      padding 10px 12px 8px
      border-bottom 1px solid var(--f7-bars-border-color)
      background var(--f7-page-bg-color)

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
      margin-top 8px

    .dock-searchbar
      flex 1
      min-width 0
      margin 0

    .dock-stats
      display flex
      align-items center
      flex-wrap nowrap

    .dock-toolbar
      flex none
      display flex
      align-items center
      gap 6px
      padding 8px 12px
      border-bottom 1px solid var(--f7-bars-border-color)
      background var(--f7-page-bg-color)

    .dock-content
      flex 1
      min-height 0
      position relative
      overflow hidden

      .custom-card
        height 100%

      .table-container
        height 100%

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

  /* Ensure the card takes full width and removes padding */
  .custom-card
    margin 0
    padding 0
    width 100%
    display flex
    flex-direction column
    overflow hidden
    border-radius 0

  .table-block
    padding 0
    margin 0
    padding-left var(--f7-safe-area-left)
    padding-right var(--f7-safe-area-right)

  &:not(.log-viewer-embedded)
    .table-container
      overflow-y auto
      overflow-x auto
      display block
      height calc(var(--log-viewer-height, 100vh) - var(--f7-navbar-height) - var(--f7-subnavbar-height) - var(--f7-toolbar-height))

  .table-container
    overflow-y auto
    overflow-x auto
    display block

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
    overflow hidden
    text-overflow ellipsis
    max-width 100dvw

  td.sticky
    position sticky
    left 0
    width 105px
    color black
    background #f1f1f1
    z-index 1
    white-space nowrap
    overflow hidden

  td.level
    width 50px

  td.logger
    width 280px

  span.logger
    width 280px
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

  .disabled-link
    pointer-events none
    opacity 0.5
    cursor not-allowed

  .filter-input-box input:focus
    outline none
    border-color #007aff

  @keyframes opacity-pulse
    0%
      opacity 1
    100%
      opacity 0

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

#logdetails-popup
  .log-message
    white-space normal
    word-break break-word
  .stack-trace
    white-space pre-line
    word-break break-word

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

<script>
import { nextTick } from 'vue'
import { theme, f7 } from 'framework7-vue'

import MovablePopupMixin from '@/pages/settings/movable-popup-mixin'
import copyToClipboard from '@/js/clipboard'
import { showToast } from '@/js/dialog-promises'

export default {
  mixins: [MovablePopupMixin],
  emits: ['toggle-fullscreen', 'hide'],
  props: {
    f7router: Object,
    embedded: {
      type: Boolean,
      default: false
    },
    fullscreen: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    return {
      theme
    }
  },
  data() {
    return {
      stateConnected: false,
      stateProcessing: true,
      stateConnecting: false,
      scrollTime: 0,
      autoScroll: true,
      socket: null,
      reconnectDelay: 1000,
      reconnectTimer: null,
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
      textMode: localStorage.getItem('openhab.ui:logviewer.textMode') === 'true',
      tableData: [],
      batchUpdatePending: false,
      batchLogs: [],
      nextId: 0,
      maxEntries: 2000,
      logStart: '--:--:--',
      logEnd: '--:--:--',
      currentHighlightColorItemIndex: null,
      currentHighlightColor: '#FF5252',
      lastSequence: 0,
      selectedId: null,
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
    filteredTableData() {
      return this.tableData.filter((item) => item.visible)
    },
    periodRangeColor() {
      if (!this.stateConnected) return 'red'
      return this.stateProcessing ? 'green' : 'orange'
    },
    periodRangeTooltip() {
      if (this.stateConnecting) return 'Log period - Connecting'
      if (!this.stateConnected) return 'Log period - Disconnected'
      return this.stateProcessing ? 'Log period - Receiving logs' : 'Log period - Paused'
    },
    countersBadgeColor() {
      if (this.tableData.length >= this.maxEntries) return 'red'
      if (this.filterCount < this.tableData.length) return 'orange'
      return 'green'
    },
    selectedLog() {
      return this.tableData.find((entry) => entry.id === this.selectedId) || {}
    },
    isConnecting() {
      return this.stateConnecting
    }
  },
  methods: {
    onPageAfterIn() {
      this.loggerPackages = []
      this.loadingLoggers = true
      this.$oh.api
        .get('/rest/logging/')
        .then((data) => {
          data.loggers.forEach((logger) => this.loggerPackages.push(logger))
          nextTick(() => {
            const rootPackageIndex = this.loggerPackages.findIndex((item) => item.loggerName === 'ROOT')
            if (rootPackageIndex !== -1) {
              this.defaultLogLevel = this.loggerPackages[rootPackageIndex].level
            }
            this.loggerPackages.sort((a, b) => a.loggerName.localeCompare(b.loggerName))
            this.loggerPackages = this.loggerPackages.filter((item) => item.loggerName !== 'ROOT')

            this.loadingLoggers = false
          })
        })
        .catch((error) => {
          console.warn('Failed to load logger packages:', error)
          this.loadingLoggers = false
        })

      this.startConnecting()

      this.highlightFilters = JSON.parse(localStorage.getItem('openhab.ui:logviewer.logHighlightFilters'))
      if (this.highlightFilters == null) {
        this.highlightFilters = []
      }
      this.prefilterHighlights()

      this.filterText = localStorage.getItem('openhab.ui:logviewer.logFilterText')
      if (this.filterText == null) {
        this.filterText = ''
      } else {
        this.$refs.searchbar.$el.f7Searchbar.query = this.filterText
      }
      this.filterTextLowerCase = this.filterText.trim().toLocaleLowerCase()

      this.showErrors = localStorage.getItem('openhab.ui:logviewer.logShowErrors') === 'true'
    },
    onPageBeforeOut() {
      this.loggingStop()
    },
    popupOpened(ref, navbar) {
      nextTick(() => {
        this.initializeMovablePopup(ref, navbar)
      })
    },
    updateLogLevel(logger, value) {
      logger.level = value
      this.$oh.api.put('/rest/logging/' + logger.loggerName, logger).catch((error) => {
        console.warn('Failed to update log level for ' + logger.loggerName + ':', error)
      })
    },
    removeLogLevel(logger) {
      this.$oh.api.delete('/rest/logging/' + logger.loggerName).catch((error) => {
        console.warn('Failed to remove log level for ' + logger.loggerName + ':', error)
      })
      this.loggerPackages = this.loggerPackages.filter((loggerPackage) => loggerPackage.loggerName !== logger.loggerName)
    },
    startConnecting() {
      this.stateConnecting = true
      this.reconnectDelay = 1000
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer)
        this.reconnectTimer = null
      }
      this.socketConnect()
    },
    stopConnecting() {
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer)
        this.reconnectTimer = null
      }
      this.stateConnecting = false
    },
    socketConnect() {
      const readyCallback = () => {
        if (this.stateConnecting) {
          this.stopConnecting()
        }
        this.stateConnected = true
        this.stateProcessing = true
        console.info('WebSocket connection established.')
        this.socket.send('{"sequenceStart": ' + this.lastSequence + '}')
        nextTick(() => this.scrollToBottom())
      }

      const closeCallback = () => {
        if (this.stateConnected) {
          console.warn('WebSocket connection closed by peer. Attempting to reconnect...')
          this.startConnecting()
        }
        this.stateConnected = false
      }

      const messageCallback = (event) => {
        if (Array.isArray(event)) {
          event.forEach((ev) => {
            this.addLogEntry(ev)
          })
        } else {
          this.addLogEntry(event)
        }
      }

      const heartbeatCallback = () => {
        try {
          this.socket.send('{}')
        } catch (e) {
          console.warn('WebSocket heartbeat failed:', e)
        }
      }

      const errorCallback = (event) => {
        if (this.stateConnecting) {
          if (this.reconnectDelay < 10000) {
            this.reconnectDelay *= 1.2
            if (this.reconnectDelay > 10000) {
              this.reconnectDelay = 10000
            }
          }
          console.info('Failed to connect, retrying in ' + (this.reconnectDelay / 1000).toFixed(1) + ' s...')
          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null
            this.socketConnect()
          }, this.reconnectDelay)
        } else {
          console.error('WebSocket error:', event)
        }
      }

      this.socket = this.$oh.ws.connect('/ws/logs', messageCallback, heartbeatCallback, readyCallback, closeCallback, errorCallback, 9)

      // TEMP
      // for (let i = 0; i < 1980; i++) {
      //   this.addLogEntry({
      //     unixtime: Date.now(),
      //     level: 'TRACE',
      //     loggerName: 'test',
      //     message: 'Test ' + i
      //   })
      // }
    },
    socketClose() {
      this.stateConnected = false
      this.$oh.ws.close(this.socket)
    },
    renderEntry(entity) {
      let tr = document.createElement('tr')
      let icon = 'question_diamond'
      switch (entity.level) {
        case 'TRACE':
          icon = 'line_horizontal_3'
          break
        case 'DEBUG':
          icon = 'ant'
          break
        case 'INFO':
          icon = 'info_circle'
          break
        case 'WARN':
          icon = 'flag'
          break
        case 'ERROR':
          icon = 'exclamationmark_octagon_fill'
          break
      }
      const levelLowerCased = entity.level.toLowerCase()
      if (this.textMode) {
        tr.innerHTML =
          `<td class="text"><span class="time">${entity.time}${entity.milliseconds}</span>` +
          `[<span class="level ${levelLowerCased}">${entity.level}</span>] ` +
          `[<span class="logger" title="${entity.loggerName}">${entity.loggerName}</span>] - ` +
          `<span class="msg ${levelLowerCased}">${this.highlightText(entity.message)}</span></td>`
      } else {
        tr.className = 'table-rows ' + levelLowerCased
        tr.innerHTML =
          '<td class="sticky"><i class="icon f7-icons" style="font-size: 18px;">' +
          icon +
          `</i> ${entity.time}<span class="milliseconds">${entity.milliseconds}</span></td>` +
          `<td class="level">${entity.level}</td>` +
          `<td class="logger"><span class="logger" title="${entity.loggerName}">${entity.loggerName}</span></td>` +
          `<td class="nowrap">${this.highlightText(entity.message)}</td>`
      }
      tr.addEventListener('click', () => {
        this.onRowClick(entity.id)
      })
      return tr
    },
    onRowClick(entityId) {
      this.selectedId = entityId
      f7.popup.open('#logdetails-popup')
    },
    addLogEntry(logEntry) {
      this.lastSequence = Math.max(this.lastSequence, logEntry.sequence)
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

      let entry = {
        id: this.nextId++,
        visible: vis,
        time: formattedTime,
        timestamp: logEntry.timestamp,
        milliseconds: ms,
        level: logEntry.level.toUpperCase(),
        loggerName: logEntry.loggerName,
        message: logEntry.message,
        stackTrace: logEntry.stackTrace
      }

      this.batchLogs.push(entry)

      if (!this.batchUpdatePending) {
        this.batchUpdatePending = true
        requestAnimationFrame(() => {
          this.batchLogs.forEach((entry) => {
            this.tableData.push(entry)

            if (entry.visible) {
              const tr = this.renderEntry(entry)
              this.$refs.dataTable.firstChild.appendChild(tr)
            }

            if (this.tableData.length > this.maxEntries) {
              const removedElement = this.tableData.shift()
              this.logStart = removedElement.time
              if (removedElement.visible) {
                this.filterCount--
                let firstRow = this.$refs.dataTable.firstChild.firstChild
                if (firstRow.className === 'padder') firstRow = firstRow.nextSibling
                this.$refs.dataTable.firstChild.removeChild(firstRow)
              }
            }
          })
          this.batchLogs.length = 0
          if (this.autoScroll) {
            nextTick(() => this.scrollToBottom())
          } else {
            nextTick(() => this.handleScroll())
          }

          this.batchUpdatePending = false
        })
      }
    },
    loggingPause() {
      this.stateProcessing = false
    },
    loggingContinue() {
      if (this.stateConnecting) {
        return
      }
      if (!this.stateConnected) {
        this.startConnecting()
      }
      this.updateFilter()
      this.stateProcessing = true
    },
    loggingStop() {
      if (this.stateConnecting) {
        this.stopConnecting()
      }
      if (this.stateConnected) {
        this.stateConnected = false
        this.socketClose()
      }
    },
    clearLog() {
      this.tableData.length = 0
      this.filterCount = 0
      this.logStart = '--:--:--'
      this.logEnd = '--:--:--'
      this.$refs.dataTable.firstChild.innerHTML = ''
    },
    showLatestLogs() {
      this.autoScroll = true
      this.scrollToBottom()
    },
    scrollToBottom() {
      // Scroll to the bottom of the table
      const tableContainer = this.$refs.tableContainer
      if (tableContainer) {
        tableContainer.scrollTop = tableContainer.scrollHeight
        // Delay manual scroll detection to avoid autoscrolling being defeated when new logs arrive
        this.scrollTime = Date.now() + 250
      }
      this.redrawPartOfTable()
    },
    handleScroll() {
      const tableContainer = this.$refs.tableContainer

      if (Date.now() < this.scrollTime) return

      // Detect if the user has scrolled up
      const isAtBottom = tableContainer.scrollHeight - tableContainer.scrollTop < tableContainer.clientHeight + 20
      this.autoScroll = isAtBottom

      this.redrawPartOfTable()
    },
    redrawPartOfTable() {
      const LINE_HEIGHT = 31

      const tableContainer = this.$refs.tableContainer
      const tableBody = this.$refs.dataTable?.firstChild
      if (!tableBody) {
        return
      }
      const filteredItemsCount = this.filteredTableData.length
      const currentIndexAtTop = Math.floor(tableContainer.scrollTop / LINE_HEIGHT)
      const nbVisibleLines = Math.floor(tableContainer.offsetHeight / LINE_HEIGHT)

      // make sure to redraw only 50 elements below around visible area
      const firstIndexToRedraw = Math.max(0, currentIndexAtTop - 50)
      const lastIndexToRedraw = Math.min(currentIndexAtTop + nbVisibleLines + 50, filteredItemsCount - 1)
      console.debug(`Should redraw ${firstIndexToRedraw}/${lastIndexToRedraw}`)

      tableBody.innerHTML = ''
      if (firstIndexToRedraw > 0) {
        const padder = document.createElement('tr')
        padder.className = 'padder'
        padder.style.height = LINE_HEIGHT * firstIndexToRedraw + 'px'
        tableBody.appendChild(padder)
      }
      for (let i = firstIndexToRedraw; i <= lastIndexToRedraw; i++) {
        tableBody.appendChild(this.renderEntry(this.filteredTableData[i]))
      }
      if (lastIndexToRedraw < filteredItemsCount - 1) {
        const padder = document.createElement('tr')
        padder.className = 'padder'
        padder.style.height = LINE_HEIGHT * (filteredItemsCount - 1 - lastIndexToRedraw) + 'px'
        tableBody.appendChild(padder)
      }
    },
    handleLogPackageEnter(event) {
      let logger = {
        loggerName: event.target.value,
        level: 'INFO'
      }
      this.updateLogLevel(logger, this.defaultLogLevel)
      this.loggerPackages.push(logger)
      this.loggerPackages.sort((a, b) => a.loggerName.localeCompare(b.loggerName))
    },
    processFilter(logEntry) {
      return (
        logEntry.loggerName.toLowerCase().includes(this.filterTextLowerCase) ||
        logEntry.message.toLowerCase().includes(this.filterTextLowerCase) ||
        (this.showErrors && logEntry.level === 'ERROR')
      )
    },
    handleFilter(searchbar, filter) {
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
    clearFilter() {
      this.filterText = this.filterTextLowerCase = ''
      localStorage.removeItem('openhab.ui:logviewer.logFilterText')
      this.updateFilter()
      this.scrollToBottom()
    },
    updateFilter() {
      let cnt = 0

      this.$refs.dataTable.firstChild.innerHTML = ''
      for (const entry of this.tableData) {
        entry.visible = this.processFilter(entry)
        if (entry.visible) {
          cnt++
        }
      }
      this.filterCount = cnt
      this.redrawPartOfTable()
    },
    highlightText(text) {
      if (this.activeHighlights.length === 0) {
        return text // Skip if no filters are active
      }

      // Apply each filter with its respective color
      this.activeHighlights.forEach((filter) => {
        const regex = new RegExp(`(${filter.text})`, 'gi')
        text = text.replace(regex, `<span style="background-color: ${filter.color}; font-weight: bold;">$1</span>`)
      })
      return text
    },
    downloadCSV() {
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
    convertObjectArrayToCSV(array) {
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
    copyTableToClipboard() {
      if (this.textMode) {
        const logs = this.filteredTableData
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

      const table = this.$refs.dataTable
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
    },
    setTextMode(textModeEnabled) {
      this.textMode = textModeEnabled
      localStorage.setItem('openhab.ui:logviewer.textMode', this.textMode)
      this.updateFilter()
    },
    prefilterHighlights() {
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
    saveHighlighters() {
      localStorage.setItem('openhab.ui:logviewer.logHighlightFilters', JSON.stringify(this.highlightFilters))
      this.prefilterHighlights()
      this.updateFilter()
    },
    addNewHighlight() {
      this.highlightFilters.push({
        text: '',
        color: this.colors[0],
        active: false
      })
    },
    updateHighlightText(event, index) {
      this.highlightFilters[index].text = event.target.value
      this.prefilterHighlights()
    },
    removeHighlight(index) {
      this.highlightFilters.splice(index, 1)
      this.prefilterHighlights()
    },
    openColorPopover(index, event) {
      this.currentHighlightColorItemIndex = index
      this.currentHighlightColor = this.highlightFilters[index].color
      f7.popover.open('#color-picker-popover', event.target)
    },
    selectHighlightColor(color) {
      f7.popover.close('#color-picker-popover')
      if (color !== null) {
        this.highlightFilters[this.currentHighlightColorItemIndex].color = color
      }
    },
    toggleErrorDisplay() {
      this.showErrors = !this.showErrors
      this.updateFilter()
      localStorage.setItem('openhab.ui:logviewer.logShowErrors', this.showErrors)
    }
  },
  mounted() {
    if (this.embedded) {
      this.onPageAfterIn()
    }
  },
  beforeUnmount() {
    this.loggingStop()
  }
}
</script>
