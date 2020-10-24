<template>
  <f7-page class="developer-sidebar">
    <f7-navbar title="Developer Sidebar" subtitle="(Shift+Alt+D)" color="black">
      <f7-subnavbar :inner="false">
        <f7-searchbar :disable-button="false"></f7-searchbar>
      </f7-subnavbar>
    </f7-navbar>
    <f7-block class="no-margin no-padding after-big-title">
      <f7-block-title class="padding-horizontal display-flex">
        <span>Item Monitor</span>
        <span style="margin-left:auto">
          <f7-link color="gray" icon-f7="eye" icon-size="14"></f7-link>
          <f7-link color="gray" icon-f7="plus" icon-size="14" @click="modelPickerOpened = true"></f7-link>
          <f7-link color="gray" icon-f7="multiply" icon-size="14"></f7-link>
        </span>
      </f7-block-title>
      <f7-list>
        <ul>
          <item v-for="item in monitoredItems" :key="item.name" :item="item" :context="context" :no-icon="true" :no-type="true">
          </item>
        </ul>
        <!-- <f7-list-button title="Pick Items" @click="modelPickerOpened = true"></f7-list-button> -->
      </f7-list>
    </f7-block>
    <f7-block class="no-margin no-padding">
      <f7-block-title class="padding-horizontal display-flex">
        <span>Rules Monitor</span>
        <span style="margin-left:auto">
          <f7-link color="gray" icon-f7="plus" icon-size="14" @click="modelPickerOpened = true"></f7-link>
          <f7-link color="gray" icon-f7="multiply" icon-size="14"></f7-link>
        </span>
      </f7-block-title>
      <f7-list media-list>
        <ul>
          <f7-list-item media-item title="Rule 1" footer="rule1" badge="IDLE" badge-color="green">
            <div class="display-flex align-items-flex-end justify-content-flex-end" style="margin-top: 3px" slot="footer">
              <f7-link class="margin-right" color="gray" icon-f7="pause_circle" icon-size="18" tooltip="Disable" />
              <f7-link class="margin-right" color="blue" icon-f7="play" icon-size="18" tooltip="Run" />
              <f7-link color="gray" icon-f7="pencil" icon-size="18" tooltip="Edit" />
            </div>
          </f7-list-item>
          <f7-list-item media-item title="Other Rule" footer="other_rule" badge="DISABLED" badge-color="gray">
            <div class="display-flex align-items-flex-end justify-content-flex-end" style="margin-top: 3px" slot="footer">
              <f7-link class="margin-right" color="orange" icon-f7="pause_circle" icon-size="18" tooltip="Enable" />
              <f7-link class="margin-right" color="blue" icon-f7="play" icon-size="18" tooltip="Run" />
              <f7-link color="gray" icon-f7="pencil" icon-size="18" tooltip="Edit" />
            </div>
          </f7-list-item>
        </ul>
      </f7-list>
    </f7-block>
    <f7-block class="no-margin no-padding">
      <f7-block-title class="padding-horizontal display-flex">
        <span>Things Monitor</span>
        <span style="margin-left:auto">
          <f7-link color="gray" icon-f7="plus" icon-size="14" @click="modelPickerOpened = true"></f7-link>
          <f7-link color="gray" icon-f7="multiply" icon-size="14"></f7-link>
        </span>
      </f7-block-title>
      <f7-list media-list>
        <ul>
          <f7-list-item media-item title="Working Thing" footer="The UID of the thing" badge="ONLINE" badge-color="green">
            <div class="display-flex align-items-flex-end justify-content-flex-end" style="margin-top: 3px" slot="footer">
              <f7-link class="margin-right" color="gray" icon-f7="pause_circle" icon-size="18" tooltip="Disable" />
              <f7-link color="gray" icon-f7="pencil" icon-size="18" tooltip="Edit" />
            </div>
          </f7-list-item>
          <f7-list-item media-item title="Other Thing" footer="The UID of the thing" badge="DISABLED" badge-color="gray">
            <div class="display-flex align-items-flex-end justify-content-flex-end" style="margin-top: 3px" slot="footer">
              <f7-link class="margin-right" color="orange" icon-f7="pause_circle" icon-size="18" tooltip="Enable" />
              <f7-link color="gray" icon-f7="pencil" icon-size="18" tooltip="Edit" />
            </div>
          </f7-list-item>
          <f7-list-item media-item title="Offline Thing" footer="The UID of the thing" badge="ERROR: COMM" badge-color="red">
            <div class="display-flex align-items-flex-end justify-content-flex-end" style="margin-top: 3px" slot="footer">
              <f7-link class="margin-right" color="gray" icon-f7="pause_circle" icon-size="18" tooltip="Disable" />
              <f7-link color="gray" icon-f7="pencil" icon-size="18" tooltip="Edit" />
            </div>
          </f7-list-item>
        </ul>
      </f7-list>
    </f7-block>
    <f7-block class="no-margin no-padding">
      <f7-block-title class="padding-horizontal display-flex">
        <span>Events Monitor</span>
        <span style="margin-left:auto">
          <f7-link color="gray" icon-f7="rectangle_compress_vertical" icon-size="14" @click="modelPickerOpened = true"></f7-link>
        </span>
      </f7-block-title>
      <f7-list media-list>
        <f7-list-item v-for="event in sseEvents" :key="event.time.getTime()" :title="event.topic" :subtitle="event.type" :footer="event.payload">
        </f7-list-item>
        <f7-list-button text="Stream Events" @click="startSSE()" v-if="!sseClient" />
        <f7-list-button color="red" text="Stop Streaming" @click="stopSSE()" v-if="sseClient" />
      </f7-list>
    </f7-block>
    <f7-block class="no-margin no-padding">
      <f7-block-title class="padding-horizontal display-flex">
        <span>Pages</span>
        <span style="margin-left:auto">
          <f7-link color="gray" icon-f7="plus" icon-size="14" @click="modelPickerOpened = true"></f7-link>
          <f7-link color="gray" icon-f7="multiply" icon-size="14"></f7-link>
        </span>
      </f7-block-title>
      <f7-list media-list>
        <ul>
          <f7-list-item media-item title="Page1" footer="page1">
            <div class="display-flex align-items-flex-end justify-content-flex-end" style="margin-top: 3px" slot="after">
              <f7-link class="margin-right" color="blue" icon-f7="rectangle_on_rectangle" icon-size="18" tooltip="Open in Popup" />
              <f7-link class="margin-right" color="blue" icon-f7="play" icon-size="18" tooltip="View" />
              <f7-link color="gray" icon-f7="pencil" icon-size="18" tooltip="Edit" />
            </div>
          </f7-list-item>
        </ul>
      </f7-list>
    </f7-block>
    <f7-block class="no-margin no-padding">
      <f7-block-title class="padding-horizontal">Expression Tester</f7-block-title>
      <f7-list media-list>
        <f7-list-input type="text" title="Expression">
        </f7-list-input>
        <f7-list-item type="text" title="Result">
        </f7-list-item>
      </f7-list>
    </f7-block>
    <f7-block class="no-margin no-padding">
      <f7-block-title class="padding-horizontal">Other Tools</f7-block-title>
      <f7-list>
        <f7-list-button title="Show Widget in Popup"></f7-list-button>
        <f7-list-button title="Another Tool"></f7-list-button>
      </f7-list>
    </f7-block>
    <model-picker-popup :value="monitoredItems" :opened="modelPickerOpened" :multiple="true" @closed="modelPickerOpened = false" @input="addItemsFromModel" action-label="Add" />
  </f7-page>
</template>

<style lang="stylus">
.developer-sidebar
  scrollbar-width none /* Firefox */
  -ms-overflow-style none  /* IE 10+ */

  &.page
    background #e7e7e7 !important

  .page-content
    overflow-x hidden
.theme-dark
  .developer-sidebar
    &.page
      background #232323 !important
</style>

<script>
import Item from '@/components/item/item.vue'
import ModelPickerPopup from '@/components/model/model-picker-popup.vue'

export default {
  components: {
    Item,
    ModelPickerPopup
  },
  data () {
    return {
      modelPickerOpened: false,
      monitoredItems: [],
      sseClient: null,
      sseEvents: []
    }
  },
  computed: {
    context () {
      return {
        store: this.$store.getters.trackedItems
      }
    }
  },
  methods: {
    itemContext (item) {
      return {

      }
    },
    addItemsFromModel (value) {
      this.$set(this, 'monitoredItems', value)
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
  }
}
</script>
