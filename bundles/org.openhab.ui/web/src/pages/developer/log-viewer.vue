<template>
  <f7-page name="logviewer">



    <div class="popup logsettings-popup">
      <div class="view">
        <div class="page">
          <div class="navbar">
            <div class="navbar-bg"></div>
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
              <div class="input-with-buttons">
                <f7-input type="text" placeholder="Add logger package entry..." v-model="inputText"
                  @keypress.enter="handleEnter" class="custom-input"></f7-input>
              </div>
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

    <div class="popup loghighlights-popup">
      <div class="view">
        <div class="page">
          <div class="navbar">
            <div class="navbar-bg"></div>
            <div class="navbar-inner">
              <div class="title">Logging Highlight Filters</div>
              <div class="right">
                <!-- Link to close popup -->
                <a class="link popup-close">Close</a>
              </div>
            </div>
          </div>
          <div class="page-content">
            <f7-block class="input-with-buttons-container">
              <div class="input-with-buttons">
                <f7-input type="text" placeholder="Add logger package entry..." v-model="inputText"
                  @keypress.enter="handleEnter" class="custom-input"></f7-input>
              </div>
              <div class="icon-buttons">
                <f7-button small icon-f7="checkmark_circle" @click="handleOk" />
                <f7-button small icon-f7="xmark_circle" color="red" @click="clearInput" />
              </div>
            </f7-block>

            <f7-list class="col wide">
              <f7-list-item v-for="loggerPackage in loggerPackages" :key="loggerPackage.loggerName"
                :title="loggerPackage.loggerName">
                <f7-input type="select" :value="loggerPackage.level"
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
                <f7-button small icon-f7="xmark_circle" @click="removeLogLevel(loggerPackage)" />
              </f7-list-item>
            </f7-list>

          </div>
        </div>
      </div>
    </div>





    <f7-navbar title="Log Viewer" back-link="Developer Tools" back-link-url="/developer/" back-link-force>
      <template #left>
        <f7-badge color="green" class="margin-left" tooltip="Filtered log entries currently displayed">
          {{ filterCount }}</f7-badge>
        <f7-badge color="orange" tooltip="Total log entries loaded" class="margin-left">
          {{ tableData.length }}</f7-badge>
        <f7-badge color="red" tooltip="Maximum log entries to be buffered" class="margin-left">
          {{ maxEntries }}</f7-badge>
      </template>

      <f7-nav-right>

        <div class="filter-input-box">
          <input type="text" placeholder="Filter..." v-model="filterText" @keyup.enter="handleFilter" />
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
          icon-md="material:rectangle_on_rectangle" tooltip="Copy log to clipboard" :disabled="filterCount == 0"
          :class="{ 'disabled-link': filterCount == 0 }" @click="copyTableToClipboard" />
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

            <table class="fixed-header-table" ref="dataTable">
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
                  <td v-html="highlightText(entity.message)" class="nowrap"></td>
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
      /* Ensure the container fills the page */
  height: 100%;
  /* Make card stretch across the row */
  overflow: hidden;
  /* Prevent unnecessary overflows */
}

.table-container {
  /* Set the height of the scrollable area */
  overflow-y: auto;
  /* Enable vertical scrolling */
  overflow-x: auto;
  /* Enable horizontal scrolling */
  display: block;
  /* Ensure scrolling works inside the container */
    /* Constrain height for scrolling */
  transition: height 0.2s ease-in-out;
    /* Smooth resizing */
  }

.fixed-header-table {
  width: 100%;
      /* Set the height of the table container */
  overflow-x: auto;
  /* Enable horizontal scrolling */
  position: relative;
  /* Ensure the child elements can be positioned relatively */
  border-collapse: collapse;
    /* Ensure clean table appearance */
    table-layout: auto;
    /* Ensure flexible column widths */
}

.fixed-header-table thead th {
  position: sticky;
  /* Fix the header */
  top: 0;
  /* Stick to the top */
  background-color: #f9f9f9;
  /* Optional: background for the header */
  z-index: 2;
  /* Ensure header stays above the body */
  border-bottom: 5px solid #ddd;
  /* Optional: add a border under the header */
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
  /* Stick the leftmost column */
  background: #f1f1f1;
  /* Optional: Add background color to distinguish */
  z-index: 1;
  /* Ensure the sticky column stays above other elements */
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
  /* Disable clicking */
  opacity: 0.5;
  /* Visually indicate disabled state */
  cursor: not-allowed;
  /* Change cursor to indicate disabled */
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
  /* Border around the input and icons */
  border-radius: 5px;
  overflow: hidden;
  /* Ensures the border wraps all elements */
  max-width: 400px;
  /* Optional max width */
  width: 100%;
}

.custom-input {
  flex: 1;
  border: none;
  /* Remove default border */
  padding: 10px;
  outline: none;
  /* Remove default outline */
}

.icon-buttons {
  display: flex;
  gap: 5px;
  /* Space between icons */
}

.icon-buttons f7-button {
  width: 20px;
  height: 35px;
  padding: 0;
  /* Compact icon buttons */
  display: flex;
  align-items: center;
  justify-content: center;
}

.milliseconds {
  font-size: 0.8em;
}

</style> 

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  components: {
  },
  methods: {
    updateLogLevel(logger, value) {
      logger.level = value
      console.log("Update log level 1 " + JSON.stringify(logger) + " -> " + JSON.stringify(event) + " - " + value)
      this.$oh.api.put('/rest/logging/' + logger.loggerName, logger)
    },
    removeLogLevel(loggerPackage) {
      this.$oh.api.delete('/rest/logging/' + logger.loggerName)
    },
    socketConnect() {
      this.stateConnecting = true;

      // Define the WebSocket URL for OpenHAB
      const wsUrl = 'ws://192.168.2.125:8080/ws/logs?accessToken=oh.websocket.cH9jGdjF2poeJDDMK9Js1gQAclyXU7afuhjJ703lbJGLbr0IEBQOhcPEkbaCN4h0eY0X3sm3jaKEWg96Q';

      // Create a new WebSocket connection
      this.socket = new WebSocket(wsUrl);

      const me = this;

      // Event handler when the WebSocket connection is opened
      this.socket.onopen = function () {
        me.stateConnected = true;
        me.stateConnecting = false;
        me.stateProcessing = true;
        me.scrollToBottom();
      };

      // Event handler when a message is received from OpenHAB
      this.socket.onmessage = function (event) {
        // Process the event data (usually in JSON format)
        try {
          const data = JSON.parse(event.data);
          // Handle the OpenHAB event data here
          me.addLogEntry(data);
        } catch (e) {
          console.error('Error parsing event data:', e);
        }
      };

      // Event handler for WebSocket errors
      this.socket.onerror = function (error) {
        console.error('WebSocket error:', error);
      };

      // Event handler when the WebSocket connection is closed
      this.socket.onclose = function () {
        me.stateConnected = false;
        me.stateConnecting = false;
      };
    },
    addLogEntry(logEntry) {
      const date = new Date(logEntry.unixtime); // Create a Date object

      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const seconds = date.getSeconds().toString().padStart(2, "0");
      const milliseconds = date.getMilliseconds().toString().padStart(3, "0");

      // Format the time with millisecond precision
      const formattedTime = `${hours}:${minutes}:${seconds}.`;

      var visible = false;
      if(this.stateProcessing) {
        visible = this.processFilter(logEntry);
        if(visible) {
          this.filterCount++;
        }
      }

      this.tableData.push({
        visible: visible,
        id: this.nextId,
        time: formattedTime,
        milliseconds: milliseconds,
        level: logEntry.level,
        loggerName: logEntry.loggerName,
        message: logEntry.message
      });
      this.nextId += 1;

      if (this.tableData.length > this.maxEntries) {
        const removedElement = this.tableData.shift();
        if(removedElement.visible) {
          this.filterCount--;
        }
      }

      if (this.autoScroll) {
        this.scrollToBottom();
      }
    },
    loggingPause() {
      this.stateProcessing = false;
    },
    loggingContinue() {
      if(!this.stateConnected) {
        this.socketConnect();
      }
      this.updateFilter();
      this.stateProcessing = true;
    },
    loggingStop() {
      this.stateConnected = false;
      this.socket.close();
    },
    clearLog() {
      this.tableData.length = 0;
      this.filterCount = 0;
    },
    showLatestLogs() {
      this.autoScroll = true;
      scrollToBottom();
    },
    scrollToBottom() {
      // Scroll to the bottom of the table
      const tableContainer = this.$refs.tableContainer;
      if (tableContainer) {
        tableContainer.scrollTop = tableContainer.scrollHeight;
        // Delay manual scroll detection to avoid autoscrolling being defeated when new logs arrive
        this.scrollTime = Date.now() + 250;
      }
    },
    handleScroll() {
      const tableContainer = this.$refs.tableContainer;

      if (Date.now() < this.scrollTime) return;

      // Detect if the user has scrolled up
      const isAtBottom = tableContainer.scrollHeight - tableContainer.scrollTop < (tableContainer.clientHeight + 20);
      this.autoScroll = isAtBottom;
    },
    resizeScrollRegion() {
      const tableContainer = this.$refs.tableContainer;
      const navbar = document.querySelector('.navbar'); // Target the Framework7 navbar
      if (tableContainer) {
        // TODO: Fix this sizing
        const availableHeight = window.innerHeight - navbar.offsetHeight -70;//tableContainer.getBoundingClientRect().top;
        tableContainer.style.height = `${availableHeight}px`;
      }
    },
    handleEnter() {
      this.handleOk(); // Trigger OK method on Enter key press
    },
    handleOk() {
      if (this.inputText) {
        console.log("OK pressed with text:", this.inputText);
        this.inputText = ""; // Optionally, clear the input after submission
      } else {
        console.log("Input is empty.");
      }
    },
    clearInput() {
      this.inputText = ""; // Clears the input field
    },
    processFilter(logEntry) {
      return logEntry.loggerName.toLowerCase().includes(this.filterTextLowerCase) || logEntry.message.toLowerCase().includes(this.filterTextLowerCase);
    },
    handleFilter() {
      this.filterTextLowerCase = this.filterText.trim().toLocaleLowerCase();
      this.updateFilter();
      this.scrollToBottom();
    },
    updateFilter() {
      var cnt = 0;
      for (const entry of this.tableData) {
        entry.visible = this.processFilter(entry);
        if(entry.visible) {
          cnt++;
        }
      }
      this.filterCount = cnt;
    },
    highlightText(text) {
      if (!this.highlightFilters.some((filter) => filter)) return text; // Skip if no filters are active

      // Apply each filter with its respective color
      this.highlightFilters.forEach((filter) => {
        if (filter.text) {
          const regex = new RegExp(`(${filter.text})`, "gi");
          text = text.replace(
            regex,
            `<span style="background-color: ${filter.color}; font-weight: bold;">$1</span>`
          );
        }
      });
      return text;
    },
    downloadCSV() {
      const filteredData = this.tableData.filter((row) => row.visible);

      const transformedData = filteredData.map((row) => ({
        time: row.time + row.milliseconds,
        level: row.level, 
        source: row.loggerName,
        data: row.message
      }));

      const csvContent = this.convertObjectArrayToCSV(transformedData);
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "logfile.csv"; // Name of the file
      link.click();

      URL.revokeObjectURL(url);
    },
    convertObjectArrayToCSV(array) {
      if (!array.length) {
        return "";
      }

      // Extract headers from object keys
      const headers = Object.keys(array[0]).join(",");

      // Map each object to a CSV-compatible row
      const rows = array.map((obj) =>
        Object.values(obj)
          .map((value) => `"${String(value).replace(/"/g, '""')}"`) // Escape quotes
          .join(",")
      );

      // Combine headers and rows into a single CSV string
      return [headers, ...rows].join("\n");
    },
    copyTableToClipboard() {
      const table = this.$refs.dataTable; // Reference to the table element
      if (!table) {
        console.error("Failed to copy table: Not found");
        return;
      }

      const tableHTML = table.outerHTML;

      // Create a Blob with the HTML content and define the MIME type
      const blob = new Blob([tableHTML], { type: "text/html" });

      // Use the ClipboardItem API to copy the Blob
      const clipboardItem = new ClipboardItem({ "text/html": blob });

      // Copy to clipboard
      navigator.clipboard
        .write([clipboardItem])
        .then(() => {
          this.$f7.toast.create({
            text: 'Table copied as HTML to clipboard',
            closeTimeout: 2000,
          }).open();
        })
        .catch((err) => {
          console.error("Failed to copy table: ", err);
        });

    },
  },
  created() {
    this.$oh.api.get('/rest/logging/').then(data4 => {
      data4.loggers.forEach(logger => this.loggerPackages.push(logger))
      this.$nextTick(() => {
        this.loggerPackages.sort((a, b) => a.loggerName.localeCompare(b.loggerName))
        this.loggerPackages = this.loggerPackages.filter(item => item.loggerName !== "ROOT");

        this.loadingLoggers = false
      })
    })

    this.socketConnect();
  },
  mounted() {
    this.resizeScrollRegion();
    window.addEventListener("resize", this.resizeScrollRegion);

    this.highlightFilters = [
      {
        text: "IsAlive",
        color: "#feca57"
      },
      {
        text: "Tracker",
        color: "#54a0ff"
      },
      {
        text: "Humidity",
        color: "#ff6b6b"
      },
      {
        text: "Temperature",
        color: "#48dbfb"
      },
      {
        text: "ZclAttribute",
        color: "#1dd1a1"
      },
    ];
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.resizeScrollRegion);
  },

  data: () => ({
    stateConnecting: false,
    stateConnected: false,
    stateProcessing: true,
    scrollTime: 0,
    autoScroll: true,
    socket: {},
    inputText: '', // Bound to the text input field
    highlightFilters: [], //'IsAlive', 'Tracker'],
   // highlightColors: ["#feca57", "#54a0ff", "#ff6b6b", "#48dbfb", "#1dd1a1"], // Color palette for filters
    filterText: "",
    filterTextLowerCase: "",
    filterCount: 0,
    loadingLoggers: true,
    loggerPackages: [],
    tableData: [],           // Initial empty data for live updates
    nextId: 1,               // ID tracker for each new entry
    maxEntries: 5000,           // Fixed number of entries to display
  })
})

</script>