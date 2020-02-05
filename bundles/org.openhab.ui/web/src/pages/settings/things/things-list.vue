<template>
  <f7-page @page:afterin="onPageAfterIn" @page:afterout="stopEventSource">
    <f7-navbar title="Things" back-link="Settings" back-link-url="/settings/" back-link-force>
      <f7-subnavbar :inner="false" v-show="initSearchbar">
        <f7-searchbar
          v-if="initSearchbar"
          class="searchbar-things"
          :init="initSearchbar"
          search-container=".contacts-list"
          search-in=".item-inner"
          remove-diacritics
          :disable-button="!$theme.aurora"
        ></f7-searchbar>
      </f7-subnavbar>
    </f7-navbar>

    <f7-list-index
      ref="listIndex"
      v-show="groupBy === 'alphabetical'"
      list-el=".things-list"
      :scroll-list="true"
      :label="true"
    ></f7-list-index>

    <f7-list class="searchbar-not-found">
      <f7-list-item title="Nothing found"></f7-list-item>
    </f7-list>
    <f7-block class="block-narrow">
      <f7-col>
        <f7-block-title class="searchbar-hide-on-search"><span v-if="ready">{{things.length}} things</span></f7-block-title>
        <div class="padding-left padding-right" v-show="!ready || things.length > 0">
          <f7-segmented strong tag="p">
            <f7-button :active="groupBy === 'alphabetical'" @click="groupBy = 'alphabetical'; $nextTick(() => $refs.listIndex.update())">Alphabetical</f7-button>
            <f7-button :active="groupBy === 'binding'" @click="groupBy = 'binding'">By binding</f7-button>
          </f7-segmented>
        </div>
        <f7-list v-if="!ready" contacts-list class="col things-list">
          <f7-list-group>
            <f7-list-item
              media-item
              v-for="n in 10"
              :key="n"
              :class="`skeleton-text skeleton-effect-blink`"
              title="Label of the thing"
              subtitle="This contains the thing UID"
              after="status badge"
            >
            </f7-list-item>
          </f7-list-group>
        </f7-list>
        <f7-list v-else class="searchbar-found col things-list" :contacts-list="groupBy === 'alphabetical'">
          <f7-list-group v-for="(thingsWithInitial, initial) in indexedThings" :key="initial">
            <f7-list-item v-if="thingsWithInitial.length" :title="initial" group-title></f7-list-item>
            <f7-list-item v-for="thing in thingsWithInitial"
              :key="thing.UID"
              media-item
              :link="thing.UID"
              :title="thing.label"
              :footer="thing.UID"
              :badge="thing.statusInfo.status"
              :badge-color="thing.statusInfo.status === 'ONLINE' ? 'green' : 'red'"
            >
              <f7-icon v-if="!thing.editable" slot="after-title" f7="lock_fill" size="1rem" color="gray"></f7-icon>
            </f7-list-item>
          </f7-list-group>
        </f7-list>

      </f7-col>
    </f7-block>
    <f7-block v-if="ready && !things.length" class="block-narrow">
      <empty-state-placeholder icon="lightbulb" title="things.title" text="things.text" />
    </f7-block>
    <f7-fab position="right-bottom" slot="fixed" color="blue" href="add">
      <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus">
      </f7-icon>
      <!-- <f7-fab-buttons position="top">
        <f7-fab-button label="Scan and add to Inbox">S</f7-fab-button>
        <f7-fab-button label="Add thing manually">M</f7-fab-button>
      </f7-fab-buttons> -->
    </f7-fab>
    <f7-fab v-show="inbox.length > 0" position="center-bottom" :text="`Inbox (${inboxCount})`" slot="fixed" :color="inboxCount > 0 ? 'red' : 'gray'" href="inbox">
      <f7-icon f7="tray" />
    </f7-fab>
  </f7-page>
</template>

<style lang="stylus">
.things-list
  margin-bottom calc(var(--f7-fab-size) + 2 * calc(var(--f7-fab-margin) + var(--f7-safe-area-bottom)))
</style>

<script>
export default {
  data () {
    return {
      ready: false,
      loading: false,
      initSearchbar: false,
      things: [],
      inbox: [],
      // indexedThings: {},
      groupBy: 'alphabetical',
      eventSource: null
    }
  },
  created () {

  },
  computed: {
    indexedThings () {
      if (this.groupBy === 'alphabetical') {
        return this.things.reduce((prev, thing, i, things) => {
          const initial = thing.label.substring(0, 1).toUpperCase()
          if (!prev[initial]) {
            prev[initial] = []
          }
          prev[initial].push(thing)

          return prev
        }, {})
      } else {
        return this.things.reduce((prev, thing, i, things) => {
          const binding = thing.thingTypeUID.split(':')[0]
          if (!prev[binding]) {
            prev[binding] = []
          }
          prev[binding].push(thing)

          return prev
        }, {})
      }
    },
    inboxCount () {
      return this.inbox.filter((e) => e.flag !== 'IGNORED').length
    }
  },
  methods: {
    onPageAfterIn () {
      this.load()
    },
    load () {
      this.loading = true
      this.$oh.api.get('/rest/things').then((data) => {
        this.things = data.sort((a, b) => a.label.localeCompare(b.label))
        this.initSearchbar = true
        this.loading = false
        this.ready = true
        setTimeout(() => { this.$refs.listIndex.update() })
        if (!this.eventSource) this.startEventSource()
      })
      this.loadInbox()
    },
    loadInbox () {
      this.$oh.api.get('/rest/inbox').then((data) => {
        this.inbox = data
      })
    },
    startEventSource () {
      this.eventSource = this.$oh.sse.connect('/rest/events?topics=smarthome/things/*/added,smarthome/things/*/removed,smarthome/things/*/updated,smarthome/things/*/status,smarthome/inbox/*', null, (event) => {
        console.log(event)
        const topicParts = event.topic.split('/')
        if (topicParts[2] === 'inbox') {
          this.loadInbox()
        } else {
          switch (topicParts[3]) {
            case 'status':
              const updatedThing = this.things.find((t) => t.UID === topicParts[2])
              if (updatedThing) {
                this.$set(updatedThing, 'statusInfo', JSON.parse(event.payload))
              }
              break
            case 'added':
            case 'removed':
              this.load()
              break
          }
        }
      })
    },
    stopEventSource () {
      this.$oh.sse.close(this.eventSource)
      this.eventSource = null
    }
  }
}
</script>
