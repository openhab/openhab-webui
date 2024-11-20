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
      ...
    </div>


    <f7-navbar title="Log Viewer" back-link="Developer Tools" back-link-url="/developer/" back-link-force>



      <f7-nav-right>
        <div>{{ tableData.length }}</div> / <div>{{ maxEntries }}</div>
        <f7-link icon-ios="f7:play_fill" icon-aurora="f7:play_fill" icon-md="material:play_fill"
          tooltip="Continue receiving logs" />
        <f7-link icon-ios="f7:pause_fill" icon-aurora="f7:pause_fill" icon-md="material:pause_fill"
          tooltip="Continue receiving logs" />
        <f7-link icon-ios="f7:stop_fill" icon-aurora="f7:stop_fill" icon-md="material:stop_fill"
          tooltip="Continue receiving logs" />

        <f7-link icon-ios="f7:cloud_download" icon-aurora="f7:cloud_download" icon-md="material:cloud_download"
          tooltip="Download log" class="margin-left" />
        <f7-link icon-ios="f7:gear" icon-aurora="f7:gear" icon-md="material:gear" tooltip="Configure logging"
          data-popup=".logsettings-popup" class="popup-open" />
      </f7-nav-right>

    </f7-navbar>

    <f7-block>



      <f7-col>
        <f7-card>



          <div class="data-table">
            <thead>
              <tr>
                <th v-for="(header, i) in headers" :key="`${header}${i}`" class="header-item">
                  {{ header }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entity in tableData" class="table-rows" :class="entity.level.toLowerCase()">
                <td>
                  {{ entity.time }}<span class="milliseconds">{{ entity.milliseconds }}</span>
                </td>
                <td>
                  {{ entity.level }}
                </td>
                <td>
                  {{ entity.source }}
                </td>
                <td>
                  {{ entity.data }}
                </td>
              </tr>
            </tbody>
          </div>




        </f7-card>
      </f7-col>
    </f7-block>
  </f7-page>
</template>


<style>
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
   //   var data = {
     //   loggerName: logger.loggerName,
       // level: level
     // };

      logger.level = value
      console.log("Update log level 1 " + JSON.stringify(logger) + " -> " + JSON.stringify(event) + " - " + value)
      this.$oh.api.put('/rest/logging/' + logger.loggerName, logger)
    },
    removeLogLevel(loggerPackage) {
      this.$oh.api.delete('/rest/logging/' + logger.loggerName)
    },
    addLogEntry(logEntry) {
      console.log('Adding:', logEntry);
      const date = new Date(logEntry.unixtime); // Create a Date object

      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const seconds = date.getSeconds().toString().padStart(2, "0");
      const milliseconds = date.getMilliseconds().toString().padStart(3, "0");

      // Format the time with millisecond precision
      const formattedTime = `${hours}:${minutes}:${seconds}.`;

     this.tableData.push({
        id: this.nextId,
        time: formattedTime,
        milliseconds: milliseconds,
        level: logEntry.level,
        source: logEntry.loggerName,
        data: logEntry.message
      });
      this.nextId += 1;



      if (this.tableData.length > this.maxEntries) {
        console.log('Remove entry');
        this.tableData.shift();
      }
    },
    startTimer() {
      return;
      console.log('Start Timer');
      // Set up a timer to run every second (1000 ms)
      this.timerInterval = setInterval(() => {
        this.counter += 1; // Increment counter every second
        var rnd = Math.floor((Math.random() * this.demoData.length));
        console.log('Timer running: rnd=' + rnd + ", value=" + JSON.stringify(this.demoData[rnd]));
        this.addLogEntry(this.demoData[rnd])
      }, 5000); 
    },
    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval); // Clear the interval
        this.timerInterval = null;         // Reset the timer variable
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

    // Define the WebSocket URL for OpenHAB
    const wsUrl = 'ws://192.168.2.125:8080/ws/logs?accessToken=oh.websocket.cH9jGdjF2poeJDDMK9Js1gQAclyXU7afuhjJ703lbJGLbr0IEBQOhcPEkbaCN4h0eY0X3sm3jaKEWg96Q';

    // Create a new WebSocket connection
    const socket = new WebSocket(wsUrl);

    // Event handler when the WebSocket connection is opened
    socket.onopen = function () {
      console.log('WebSocket connection established');
      // Optionally send a message to OpenHAB if required
      // socket.send(JSON.stringify({ ... }));
    };

    const me = this;
    // Event handler when a message is received from OpenHAB
    socket.onmessage = function (event) {
      console.log('Received message:', event.data);
      // Process the event data (usually in JSON format)
      try {
        const data = JSON.parse(event.data);
        // Handle the OpenHAB event data here
        console.log('Processed Event:', data);
        me.addLogEntry(data);
      } catch (e) {
        console.error('Error parsing event data:', e);
      }
    };

    // Event handler for WebSocket errors
    socket.onerror = function (error) {
      console.error('WebSocket error:', error);
    };

    // Event handler when the WebSocket connection is closed
    socket.onclose = function () {
      console.log('WebSocket connection closed');
    };
  },
  mounted() {
    this.startTimer(); // Start the timer when the component is mounted
  },
  beforeDestroy() {
    this.stopTimer(); // Clear the timer when the component is destroyed
  },

  data: () => ({
    inputText: '', // Bound to the text input field
    loadingLoggers: true,
    loggerPackages: [],
    headers: [
      'Time',
      'Level',
      'Source',
      'Data'
    ],
    columns: [
      { label: 'ID', field: 'id' },
      { label: 'Time', field: 'time' },
      { label: 'Level', field: 'level' },
      { label: 'Source', field: 'source' },
      { label: 'Data', field: 'data' },
    ],
    tableData: [],           // Initial empty data for live updates
    nextId: 1,               // ID tracker for each new entry
    maxEntries: 5000,           // Fixed number of entries to display
    demoData: [
      {
        time: '2024-11-11 11:40:32.739',
        level: 'DEBUG',
        source: 'tsystems.zigbee.ZigBeeNetworkManager',
        data: '0022A3000011CF86: Updating node NWK=EFF3'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'DEBUG',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'DEBUG',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'INFO',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:33.802',
        level: 'DEBUG',
        source: 'e.ember.internal.ash.AshFrameHandler',
        data: 'ASH TX EZSP: EzspSendUnicastRequest [networkId=0, type=EMBER_OUTGOING_DIRECT, indexOrDestination=C1B7, apsFrame=EmberApsFrame [profileId=0104, clusterId=0B04, sourceEndpoint=1, destinationEndpoint=1, options=[EMBER_APS_OPTION_ENABLE_ADDRESS_DISCOVERY, EMBER_APS_OPTION_ENABLE_ROUTE_DISCOVERY, EMBER_APS_OPTION_RETRY], groupId=0, sequence=24], messageTag=70, messageContents=10 70 0B 0A 00]'
      },
      {
        time: '2024-11-11 11:40:34.387',
        level: 'TRACE',
        source: 'e.ember.internal.ash.AshFrameHandler',
        data: '<-- RX ASH frame: AshFrameData [frmNum=3, ackNum=4, reTx=false, data=43 90 3F 00 F3 EF 00 00 00 00 00 00 40 11 00 00 79 C5 00 00]'
      },
      {
        time: '2024-11-11 11:40:32.739',
        level: 'DEBUG',
        source: 'tsystems.zigbee.ZigBeeNetworkManager',
        data: '0022A3000011CF86: Updating node NWK=EFF3'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'DEBUG',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'DEBUG',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'INFO',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:33.802',
        level: 'DEBUG',
        source: 'e.ember.internal.ash.AshFrameHandler',
        data: 'ASH TX EZSP: EzspSendUnicastRequest [networkId=0, type=EMBER_OUTGOING_DIRECT, indexOrDestination=C1B7, apsFrame=EmberApsFrame [profileId=0104, clusterId=0B04, sourceEndpoint=1, destinationEndpoint=1, options=[EMBER_APS_OPTION_ENABLE_ADDRESS_DISCOVERY, EMBER_APS_OPTION_ENABLE_ROUTE_DISCOVERY, EMBER_APS_OPTION_RETRY], groupId=0, sequence=24], messageTag=70, messageContents=10 70 0B 0A 00]'
      },
      {
        time: '2024-11-11 11:40:34.387',
        level: 'TRACE',
        source: 'e.ember.internal.ash.AshFrameHandler',
        data: '<-- RX ASH frame: AshFrameData [frmNum=3, ackNum=4, reTx=false, data=43 90 3F 00 F3 EF 00 00 00 00 00 00 40 11 00 00 79 C5 00 00]'
      },
      {
        time: '2024-11-11 11:40:32.739',
        level: 'DEBUG',
        source: 'tsystems.zigbee.ZigBeeNetworkManager',
        data: '0022A3000011CF86: Updating node NWK=EFF3'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'DEBUG',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'DEBUG',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'INFO',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:33.802',
        level: 'DEBUG',
        source: 'e.ember.internal.ash.AshFrameHandler',
        data: 'ASH TX EZSP: EzspSendUnicastRequest [networkId=0, type=EMBER_OUTGOING_DIRECT, indexOrDestination=C1B7, apsFrame=EmberApsFrame [profileId=0104, clusterId=0B04, sourceEndpoint=1, destinationEndpoint=1, options=[EMBER_APS_OPTION_ENABLE_ADDRESS_DISCOVERY, EMBER_APS_OPTION_ENABLE_ROUTE_DISCOVERY, EMBER_APS_OPTION_RETRY], groupId=0, sequence=24], messageTag=70, messageContents=10 70 0B 0A 00]'
      },
      {
        time: '2024-11-11 11:40:34.387',
        level: 'TRACE',
        source: 'e.ember.internal.ash.AshFrameHandler',
        data: '<-- RX ASH frame: AshFrameData [frmNum=3, ackNum=4, reTx=false, data=43 90 3F 00 F3 EF 00 00 00 00 00 00 40 11 00 00 79 C5 00 00]'
      },
      {
        time: '2024-11-11 11:40:32.739',
        level: 'DEBUG',
        source: 'tsystems.zigbee.ZigBeeNetworkManager',
        data: '0022A3000011CF86: Updating node NWK=EFF3'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'DEBUG',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'DEBUG',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'INFO',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:33.802',
        level: 'DEBUG',
        source: 'e.ember.internal.ash.AshFrameHandler',
        data: 'ASH TX EZSP: EzspSendUnicastRequest [networkId=0, type=EMBER_OUTGOING_DIRECT, indexOrDestination=C1B7, apsFrame=EmberApsFrame [profileId=0104, clusterId=0B04, sourceEndpoint=1, destinationEndpoint=1, options=[EMBER_APS_OPTION_ENABLE_ADDRESS_DISCOVERY, EMBER_APS_OPTION_ENABLE_ROUTE_DISCOVERY, EMBER_APS_OPTION_RETRY], groupId=0, sequence=24], messageTag=70, messageContents=10 70 0B 0A 00]'
      },
      {
        time: '2024-11-11 11:40:34.387',
        level: 'TRACE',
        source: 'e.ember.internal.ash.AshFrameHandler',
        data: '<-- RX ASH frame: AshFrameData [frmNum=3, ackNum=4, reTx=false, data=43 90 3F 00 F3 EF 00 00 00 00 00 00 40 11 00 00 79 C5 00 00]'
      },
      {
        time: '2024-11-11 11:40:32.739',
        level: 'DEBUG',
        source: 'tsystems.zigbee.ZigBeeNetworkManager',
        data: '0022A3000011CF86: Updating node NWK=EFF3'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'DEBUG',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'DEBUG',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'INFO',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:33.802',
        level: 'DEBUG',
        source: 'e.ember.internal.ash.AshFrameHandler',
        data: 'ASH TX EZSP: EzspSendUnicastRequest [networkId=0, type=EMBER_OUTGOING_DIRECT, indexOrDestination=C1B7, apsFrame=EmberApsFrame [profileId=0104, clusterId=0B04, sourceEndpoint=1, destinationEndpoint=1, options=[EMBER_APS_OPTION_ENABLE_ADDRESS_DISCOVERY, EMBER_APS_OPTION_ENABLE_ROUTE_DISCOVERY, EMBER_APS_OPTION_RETRY], groupId=0, sequence=24], messageTag=70, messageContents=10 70 0B 0A 00]'
      },
      {
        time: '2024-11-11 11:40:34.387',
        level: 'TRACE',
        source: 'e.ember.internal.ash.AshFrameHandler',
        data: '<-- RX ASH frame: AshFrameData [frmNum=3, ackNum=4, reTx=false, data=43 90 3F 00 F3 EF 00 00 00 00 00 00 40 11 00 00 79 C5 00 00]'
      },
      {
        time: '2024-11-11 11:40:32.739',
        level: 'DEBUG',
        source: 'tsystems.zigbee.ZigBeeNetworkManager',
        data: '0022A3000011CF86: Updating node NWK=EFF3'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'DEBUG',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'DEBUG',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'INFO',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:33.802',
        level: 'DEBUG',
        source: 'e.ember.internal.ash.AshFrameHandler',
        data: 'ASH TX EZSP: EzspSendUnicastRequest [networkId=0, type=EMBER_OUTGOING_DIRECT, indexOrDestination=C1B7, apsFrame=EmberApsFrame [profileId=0104, clusterId=0B04, sourceEndpoint=1, destinationEndpoint=1, options=[EMBER_APS_OPTION_ENABLE_ADDRESS_DISCOVERY, EMBER_APS_OPTION_ENABLE_ROUTE_DISCOVERY, EMBER_APS_OPTION_RETRY], groupId=0, sequence=24], messageTag=70, messageContents=10 70 0B 0A 00]'
      },
      {
        time: '2024-11-11 11:40:34.387',
        level: 'TRACE',
        source: 'e.ember.internal.ash.AshFrameHandler',
        data: '<-- RX ASH frame: AshFrameData [frmNum=3, ackNum=4, reTx=false, data=43 90 3F 00 F3 EF 00 00 00 00 00 00 40 11 00 00 79 C5 00 00]'
      },
      {
        time: '2024-11-11 11:40:32.739',
        level: 'DEBUG',
        source: 'tsystems.zigbee.ZigBeeNetworkManager',
        data: '0022A3000011CF86: Updating node NWK=EFF3'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'DEBUG',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'DEBUG',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'INFO',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:33.802',
        level: 'DEBUG',
        source: 'e.ember.internal.ash.AshFrameHandler',
        data: 'ASH TX EZSP: EzspSendUnicastRequest [networkId=0, type=EMBER_OUTGOING_DIRECT, indexOrDestination=C1B7, apsFrame=EmberApsFrame [profileId=0104, clusterId=0B04, sourceEndpoint=1, destinationEndpoint=1, options=[EMBER_APS_OPTION_ENABLE_ADDRESS_DISCOVERY, EMBER_APS_OPTION_ENABLE_ROUTE_DISCOVERY, EMBER_APS_OPTION_RETRY], groupId=0, sequence=24], messageTag=70, messageContents=10 70 0B 0A 00]'
      },
      {
        time: '2024-11-11 11:40:34.387',
        level: 'TRACE',
        source: 'e.ember.internal.ash.AshFrameHandler',
        data: '<-- RX ASH frame: AshFrameData [frmNum=3, ackNum=4, reTx=false, data=43 90 3F 00 F3 EF 00 00 00 00 00 00 40 11 00 00 79 C5 00 00]'
      },
      {
        time: '2024-11-11 11:40:32.739',
        level: 'DEBUG',
        source: 'tsystems.zigbee.ZigBeeNetworkManager',
        data: '0022A3000011CF86: Updating node NWK=EFF3'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'DEBUG',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'DEBUG',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'INFO',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:33.802',
        level: 'DEBUG',
        source: 'e.ember.internal.ash.AshFrameHandler',
        data: 'ASH TX EZSP: EzspSendUnicastRequest [networkId=0, type=EMBER_OUTGOING_DIRECT, indexOrDestination=C1B7, apsFrame=EmberApsFrame [profileId=0104, clusterId=0B04, sourceEndpoint=1, destinationEndpoint=1, options=[EMBER_APS_OPTION_ENABLE_ADDRESS_DISCOVERY, EMBER_APS_OPTION_ENABLE_ROUTE_DISCOVERY, EMBER_APS_OPTION_RETRY], groupId=0, sequence=24], messageTag=70, messageContents=10 70 0B 0A 00]'
      },
      {
        time: '2024-11-11 11:40:34.387',
        level: 'TRACE',
        source: 'e.ember.internal.ash.AshFrameHandler',
        data: '<-- RX ASH frame: AshFrameData [frmNum=3, ackNum=4, reTx=false, data=43 90 3F 00 F3 EF 00 00 00 00 00 00 40 11 00 00 79 C5 00 00]'
      },
      {
        time: '2024-11-11 11:40:32.739',
        level: 'DEBUG',
        source: 'tsystems.zigbee.ZigBeeNetworkManager',
        data: '0022A3000011CF86: Updating node NWK=EFF3'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'DEBUG',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'ERROR',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'INFO',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:33.802',
        level: 'DEBUG',
        source: 'e.ember.internal.ash.AshFrameHandler',
        data: 'ASH TX EZSP: EzspSendUnicastRequest [networkId=0, type=EMBER_OUTGOING_DIRECT, indexOrDestination=C1B7, apsFrame=EmberApsFrame [profileId=0104, clusterId=0B04, sourceEndpoint=1, destinationEndpoint=1, options=[EMBER_APS_OPTION_ENABLE_ADDRESS_DISCOVERY, EMBER_APS_OPTION_ENABLE_ROUTE_DISCOVERY, EMBER_APS_OPTION_RETRY], groupId=0, sequence=24], messageTag=70, messageContents=10 70 0B 0A 00]'
      },
      {
        time: '2024-11-11 11:40:34.387',
        level: 'TRACE',
        source: 'e.ember.internal.ash.AshFrameHandler',
        data: '<-- RX ASH frame: AshFrameData [frmNum=3, ackNum=4, reTx=false, data=43 90 3F 00 F3 EF 00 00 00 00 00 00 40 11 00 00 79 C5 00 00]'
      },
      {
        time: '2024-11-11 11:40:32.739',
        level: 'DEBUG',
        source: 'tsystems.zigbee.ZigBeeNetworkManager',
        data: '0022A3000011CF86: Updating node NWK=EFF3'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'DEBUG',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'WARN',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'INFO',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:33.802',
        level: 'DEBUG',
        source: 'e.ember.internal.ash.AshFrameHandler',
        data: 'ASH TX EZSP: EzspSendUnicastRequest [networkId=0, type=EMBER_OUTGOING_DIRECT, indexOrDestination=C1B7, apsFrame=EmberApsFrame [profileId=0104, clusterId=0B04, sourceEndpoint=1, destinationEndpoint=1, options=[EMBER_APS_OPTION_ENABLE_ADDRESS_DISCOVERY, EMBER_APS_OPTION_ENABLE_ROUTE_DISCOVERY, EMBER_APS_OPTION_RETRY], groupId=0, sequence=24], messageTag=70, messageContents=10 70 0B 0A 00]'
      },
      {
        time: '2024-11-11 11:40:34.387',
        level: 'TRACE',
        source: 'e.ember.internal.ash.AshFrameHandler',
        data: '<-- RX ASH frame: AshFrameData [frmNum=3, ackNum=4, reTx=false, data=43 90 3F 00 F3 EF 00 00 00 00 00 00 40 11 00 00 79 C5 00 00]'
      },
      {
        time: '2024-11-11 11:40:32.739',
        level: 'DEBUG',
        source: 'tsystems.zigbee.ZigBeeNetworkManager',
        data: '0022A3000011CF86: Updating node NWK=EFF3'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'DEBUG',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'DEBUG',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'INFO',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:33.802',
        level: 'DEBUG',
        source: 'e.ember.internal.ash.AshFrameHandler',
        data: 'ASH TX EZSP: EzspSendUnicastRequest [networkId=0, type=EMBER_OUTGOING_DIRECT, indexOrDestination=C1B7, apsFrame=EmberApsFrame [profileId=0104, clusterId=0B04, sourceEndpoint=1, destinationEndpoint=1, options=[EMBER_APS_OPTION_ENABLE_ADDRESS_DISCOVERY, EMBER_APS_OPTION_ENABLE_ROUTE_DISCOVERY, EMBER_APS_OPTION_RETRY], groupId=0, sequence=24], messageTag=70, messageContents=10 70 0B 0A 00]'
      },
      {
        time: '2024-11-11 11:40:34.387',
        level: 'TRACE',
        source: 'e.ember.internal.ash.AshFrameHandler',
        data: '<-- RX ASH frame: AshFrameData [frmNum=3, ackNum=4, reTx=false, data=43 90 3F 00 F3 EF 00 00 00 00 00 00 40 11 00 00 79 C5 00 00]'
      },
      {
        time: '2024-11-11 11:40:32.739',
        level: 'DEBUG',
        source: 'tsystems.zigbee.ZigBeeNetworkManager',
        data: '0022A3000011CF86: Updating node NWK=EFF3'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'DEBUG',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'DEBUG',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'INFO',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:33.802',
        level: 'DEBUG',
        source: 'e.ember.internal.ash.AshFrameHandler',
        data: 'ASH TX EZSP: EzspSendUnicastRequest [networkId=0, type=EMBER_OUTGOING_DIRECT, indexOrDestination=C1B7, apsFrame=EmberApsFrame [profileId=0104, clusterId=0B04, sourceEndpoint=1, destinationEndpoint=1, options=[EMBER_APS_OPTION_ENABLE_ADDRESS_DISCOVERY, EMBER_APS_OPTION_ENABLE_ROUTE_DISCOVERY, EMBER_APS_OPTION_RETRY], groupId=0, sequence=24], messageTag=70, messageContents=10 70 0B 0A 00]'
      },
      {
        time: '2024-11-11 11:40:34.387',
        level: 'TRACE',
        source: 'e.ember.internal.ash.AshFrameHandler',
        data: '<-- RX ASH frame: AshFrameData [frmNum=3, ackNum=4, reTx=false, data=43 90 3F 00 F3 EF 00 00 00 00 00 00 40 11 00 00 79 C5 00 00]'
      },
      {
        time: '2024-11-11 11:40:32.739',
        level: 'DEBUG',
        source: 'tsystems.zigbee.ZigBeeNetworkManager',
        data: '0022A3000011CF86: Updating node NWK=EFF3'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'DEBUG',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'DEBUG',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:32.743',
        level: 'INFO',
        source: 'iscovery.ZigBeeNodeServiceDiscoverer',
        data: '0022A3000011CF86: Node SVC Discovery: created discoverer'
      },
      {
        time: '2024-11-11 11:40:33.802',
        level: 'DEBUG',
        source: 'e.ember.internal.ash.AshFrameHandler',
        data: 'ASH TX EZSP: EzspSendUnicastRequest [networkId=0, type=EMBER_OUTGOING_DIRECT, indexOrDestination=C1B7, apsFrame=EmberApsFrame [profileId=0104, clusterId=0B04, sourceEndpoint=1, destinationEndpoint=1, options=[EMBER_APS_OPTION_ENABLE_ADDRESS_DISCOVERY, EMBER_APS_OPTION_ENABLE_ROUTE_DISCOVERY, EMBER_APS_OPTION_RETRY], groupId=0, sequence=24], messageTag=70, messageContents=10 70 0B 0A 00]'
      },
      {
        time: '2024-11-11 11:40:34.387',
        level: 'TRACE',
        source: 'e.ember.internal.ash.AshFrameHandler',
        data: '<-- RX ASH frame: AshFrameData [frmNum=3, ackNum=4, reTx=false, data=43 90 3F 00 F3 EF 00 00 00 00 00 00 40 11 00 00 79 C5 00 00]'
      },
    ],
  })
})

</script>