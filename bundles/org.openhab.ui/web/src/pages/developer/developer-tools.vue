<template>
  <f7-page name="devtools" @page:beforeremove="onPageBeforeRemove">
    <f7-navbar title="Developer Tools" back-link="Back" back-link-url="/" back-link-force no-hairline>
      <f7-nav-right>
        <developer-dock-icon />
      </f7-nav-right>
    </f7-navbar>
    <f7-toolbar tabbar position="top">
      <f7-link @click="currentTab = 'menu'" :tab-link-active="currentTab === 'menu'" class="tab-link">
        Expert Features
      </f7-link>
      <f7-link @click="currentTab = 'debug'" :tab-link-active="currentTab === 'debug'" class="tab-link">
        Debug
      </f7-link>
    </f7-toolbar>

    <f7-tabs>
      <f7-tab id="menu-tab" tab:show="() => this.currentTab = 'menu'" :tab-active="currentTab === 'menu'">
        <f7-block class="block-narrow after-big-title settings-menu">
          <f7-row>
            <f7-col width="100" medium="50">
              <f7-block-title>Advanced Object Management</f7-block-title>
              <f7-list media-item>
                <f7-list-item media-item title="Widgets" footer="Develop custom widgets to use on pages" link="widgets/">
                  <f7-icon slot="media" f7="rectangle_on_rectangle_angled" color="gray" />
                </f7-list-item>
                <f7-list-item media-item title="Block Libraries" footer="Develop custom extensions for Blockly scripts" link="blocks/">
                  <f7-icon slot="media" f7="ticket" color="gray" />
                </f7-list-item>
                <f7-list-item media-item title="Semantic Tags" footer="Extend the list of semantic tags for the model" link="semantics/">
                  <f7-icon slot="media" f7="list_bullet_indent" color="gray" />
                </f7-list-item>
                <f7-list-item media-item title="Things File Definitions" footer="Copy all Things' file definitions to clipboard" link="#" @click="copyFileDefinitionToClipboard(ObjectType.THING)">
                  <f7-icon slot="media" f7="lightbulb" color="gray" />
                </f7-list-item>
                <f7-list-item media-item title="Items File Definitions" footer="Copy all Items' file definitions to clipboard" link="#" @click="copyFileDefinitionToClipboard(ObjectType.ITEM)">
                  <f7-icon slot="media" f7="square_on_circle" color="gray" />
                </f7-list-item>
                <f7-list-item media-item title="Add Items from DSL Definition" footer="Create or update items &amp; links in bulk" link="add-items-dsl">
                  <f7-icon slot="media" f7="text_badge_plus" color="gray" />
                </f7-list-item>
              </f7-list>
            </f7-col>
            <f7-col width="100" medium="50">
              <f7-block-title>Maintenance Tools</f7-block-title>
              <f7-list media-item>
                <f7-list-item media-item title="Developer Sidebar" class="developer-sidebar-toggle" footer="Show a panel with various tools and help" link="" no-chevron @click="$f7.emit('toggleDeveloperDock')">
                  <f7-icon slot="media" f7="wrench" color="gray" />
                  <div slot="header" style="height: 100%; height: 32px" class="display-flex float-right flex-direction-column justify-content-center">
                    <f7-toggle color="blue" :checked="$store.state.developerDock" />
                  </div>
                </f7-list-item>
                <f7-list-item media-item title="API Explorer" footer="Discover and access the REST API directly" link="api-explorer">
                  <f7-icon slot="media" f7="burn" color="gray" />
                </f7-list-item>
                <f7-list-item media-item title="Log Viewer" footer="Monitor openHAB log output" link="log-viewer">
                  <f7-icon slot="media" f7="square_list" color="gray" />
                </f7-list-item>
                <f7-list-item smart-select :smartSelectParams="{ openIn: 'popup', closeOnSelect: true }" media-item title="UI Logging" footer="Set the log level for the browser console logs">
                  <f7-icon slot="media" f7="exclamationmark_circle" color="gray" />
                  <select v-model="logLevel" @change="onLogLevelChange">
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
                      Warn
                    </option>
                    <option value="ERROR">
                      Error
                    </option>
                    <option value="OFF">
                      Off
                    </option>
                  </select>
                </f7-list-item>
              </f7-list>
            </f7-col>
          </f7-row>
          <f7-block-footer v-if="$t('home.overview.title') !== 'Overview'" class="margin text-align-center">
            <small v-t="'admin.notTranslatedYet'" />
          </f7-block-footer>
        </f7-block>
      </f7-tab>
      <f7-tab id="debug-tab" @tab:show="() => this.currentTab = 'debug'" :tab-active="currentTab === 'debug'">
        <!-- Test SSE connection -->
        <f7-block class="block-narrow">
          <f7-row>
            <f7-col>
              <f7-block>
                <f7-block-title class="after-big-title">
                  Test SSE connection
                </f7-block-title>
                <f7-button text="Stream Events" @click="startSSE()" v-if="!sseClient" />
                <f7-button text="Stop Streaming" @click="stopSSE()" v-if="sseClient" />
                <f7-list media-list>
                  <f7-list-item v-for="event in sseEvents" :key="event.time.getTime()" :title="event.topic" :subtitle="event.payload" :after="event.type" />
                </f7-list>
              </f7-block>
            </f7-col>
          </f7-row>
        </f7-block>
        <!-- Test WebSocket connection -->
        <f7-block class="block-narrow">
          <f7-row>
            <f7-col>
              <f7-block>
                <f7-block-title class="after-big-title">
                  Test WebSocket connection
                </f7-block-title>
                <f7-button text="Stream Events" @click="startWS()" v-if="!wsClient" />
                <f7-button text="Stop Streaming" @click="stopWS()" v-if="wsClient" />
                <f7-list media-list>
                  <f7-list-item v-for="event in wsEvents" :key="event.time.getTime()" :title="event.topic" :subtitle="event.payload" :after="event.type" />
                </f7-list>
              </f7-block>
            </f7-col>
          </f7-row>
        </f7-block>
        <!-- Test an icon -->
        <f7-block class="block-narrow">
          <f7-row>
            <f7-col>
              <f7-block>
                <p>Test an icon fetch to check the different implementations</p>
                <f7-list media-list>
                  <f7-list-input
                    label="Icon"
                    type="text"
                    :value="icon"
                    @change="icon = $event.target.value"
                    placeholder="e.g. lightbulb, qualityofservice-2"
                    :info="iconUrl"
                    clear-button>
                    <img :src="iconUrl" width="44" slot="media">
                  </f7-list-input>
                </f7-list>
              </f7-block>
            </f7-col>
          </f7-row>
        </f7-block>
      </f7-tab>
    </f7-tabs>
  </f7-page>
</template>

<style lang="stylus">
@media (max-width 1279px)
  .developer-sidebar-toggle
    display none

</style>

<script>
import FileDefinition from '@/pages/settings/file-definition-mixin'

export default {
  mixins: [FileDefinition],
  components: {
  },
  data () {
    return {
      currentTab: 'menu',
      sseClient: null,
      sseEvents: [],
      wsClient: null,
      wsEvents: [],
      icon: 'lightbulb',
      split: this.$device.desktop ? 'vertical' : 'horizontal',
      logLevel: localStorage.getItem('openhab.ui:logLevel') || 'INFO'
    }
  },
  methods: {
    onPageBeforeRemove () {
      if (this.sseClient) this.$oh.sse.close(this.sseClient)
    },
    startSSE () {
      this.sseClient = this.$oh.sse.connect('/rest/events', '', (event) => {
        event.time = new Date()
        this.sseEvents.unshift(...[event])
        this.sseEvents.splice(5)
      })
    },
    stopSSE () {
      this.$oh.sse.close(this.sseClient)
      this.sseClient = null
      this.sseEvents = []
    },
    startWS () {
      this.wsClient = this.$oh.ws.events([], (event) => {
        event.time = new Date()
        this.wsEvents.unshift(...[event])
        this.wsEvents.splice(5)
      })
    },
    stopWS () {
      this.$oh.ws.close(this.wsClient)
      this.wsClient = null
      this.wsEvents = []
    },
    onLogLevelChange () {
      window.setLogLevel(this.logLevel)
    }
  },
  asyncComputed: {
    iconUrl () {
      return this.$oh.media.getIcon(this.icon)
    }
  }
}
</script>
