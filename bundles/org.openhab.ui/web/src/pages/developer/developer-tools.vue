<template>
  <f7-page name="devtools" @page:beforeremove="onPageBeforeRemove">
    <f7-navbar title="Developer Tools" back-link="Back" back-link-url="/" back-link-force no-hairline>
    </f7-navbar>
    <f7-toolbar tabbar position="top">
      <f7-link @click="currentTab = 'menu'" :tab-link-active="currentTab === 'menu'" class="tab-link">Expert Features</f7-link>
      <f7-link @click="currentTab = 'debug'" :tab-link-active="currentTab === 'debug'" class="tab-link">Debug</f7-link>
      <f7-nav-right>
      </f7-nav-right>
    </f7-toolbar>

    <f7-tabs>
      <f7-tab id="menu-tab" @ tab:show="() => this.currentTab = 'menu'" :tab-active="currentTab === 'menu'">
      <f7-block class="block-narrow after-big-title settings-menu">
        <f7-row>
          <f7-col width="100" medium="50">
            <f7-block-title>Advanced Object Management</f7-block-title>
            <f7-list media-item>
              <f7-list-item media-item title="Widgets" footer="Develop custom widgets to use on pages" link="widgets/">
                <f7-icon slot="media" f7="rectangle_on_rectangle_angled" color="gray"></f7-icon>
              </f7-list-item>
              <f7-list-item media-item title="Add Items from Textual Definition" footer="Create or update items &amp; links in bulk" link="add-items-dsl">
                <f7-icon slot="media" f7="text_badge_plus" color="gray"></f7-icon>
              </f7-list-item>
            </f7-list>
          </f7-col>
        </f7-row>
      </f7-block>
      </f7-tab>
      <f7-tab id="debug-tab" @tab:show="() => this.currentTab = 'debug'" :tab-active="currentTab === 'debug'">
        <f7-block class="block-narrow">
          <f7-row>
            <f7-col>
              <f7-block>
                <f7-block-title class="after-big-title">Test SSE connection</f7-block-title>
                <p>Start a SSE connection to check the different implementations</p>
                <f7-button text="Stream Events" @click="startSSE()" v-if="!sseClient" />
                <f7-button text="Stop Streaming" @click="stopSSE()" v-if="sseClient" />
                <f7-list media-list>
                  <f7-list-item v-for="event in sseEvents" :key="event.time.getTime()" :title="event.topic" :subtitle="event.payload" :after="event.type">
                  </f7-list-item>
                </f7-list>
              </f7-block>
            </f7-col>
          </f7-row>
        </f7-block>
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
                    clear-button
                  >
                    <img :src="iconUrl" width="44" slot="media" />
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

</style>

<script>

export default {
  components: {
  },
  data () {
    return {
      currentTab: 'menu',
      sseClient: null,
      sseEvents: [],
      icon: 'lightbulb',
      split: this.$device.desktop ? 'vertical' : 'horizontal'
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
    }
  },
  asyncComputed: {
    iconUrl () {
      return this.$oh.media.getIcon(this.icon)
    }
  }
}
</script>
