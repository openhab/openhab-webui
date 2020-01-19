<template>
  <f7-page name="devtools" @page:beforeremove="onPageBeforeRemove">
    <f7-navbar title="Developer Tools" back-link="Back" back-link-url="/" back-link-force no-hairline>
    </f7-navbar>
    <f7-toolbar tabbar position="top">
      <!-- <f7-link @click="currentTab = 'parser'" :tab-link-active="currentTab === 'parser'" class="tab-link">Items file parser</f7-link> -->
      <f7-link @click="currentTab = 'sse'" :tab-link-active="currentTab === 'sse'" class="tab-link">SSE &amp; Icons</f7-link>
      <f7-nav-right>
        <!-- <f7-link
          class="searchbar-enable"
          data-searchbar=".searchbar-demo"
          icon-ios="f7:search_strong"
          icon-aurora="f7:search_strong"
          icon-md="material:search"
        ></f7-link> -->
      </f7-nav-right>
    </f7-toolbar>

    <f7-tabs>
      <f7-tab id="info" @tab:show="() => this.currentTab = 'sse'" :tab-active="currentTab === 'sse'">
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
  data () {
    return {
      currentTab: 'sse',
      sseClient: null,
      sseEvents: [],
      icon: 'lightbulb',
      itemsDsl: ''
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
