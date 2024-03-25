<template>
  <f7-page @page:afterin="onPageAfterIn" @page:afterout="stopEventSource">
    <f7-navbar title="Things" back-link="Settings" back-link-url="/settings/" back-link-force>
      <f7-nav-right>
        <developer-dock-icon />
        <f7-link icon-md="material:done_all" @click="toggleCheck()"
                 :text="(!$theme.md) ? ((showCheckboxes) ? 'Done' : 'Select') : ''" />
      </f7-nav-right>
      <f7-subnavbar :inner="false" v-show="initSearchbar">
        <f7-searchbar
          v-if="initSearchbar"
          ref="searchbar"
          class="searchbar-things"
          :init="initSearchbar"
          search-container=".contacts-list"
          search-in=".item-inner"
          :placeholder="searchPlaceholder"
          :disable-button="!$theme.aurora" />
      </f7-subnavbar>
    </f7-navbar>
    <f7-toolbar class="contextual-toolbar" :class="{ 'navbar': $theme.md }" v-if="showCheckboxes" bottom-ios bottom-aurora>
      <f7-link color="red" v-show="selectedItems.length" v-if="!$theme.md" class="delete" icon-ios="f7:trash" icon-aurora="f7:trash" @click="removeSelected">
        Remove {{ selectedItems.length }}
      </f7-link>
      <f7-link color="orange" v-show="selectedItems.length" v-if="!$theme.md" class="disable" @click="doDisableEnableSelected(false)" icon-ios="f7:pause_circle" icon-aurora="f7:pause_circle">
        &nbsp;Disable {{ selectedItems.length }}
      </f7-link>
      <f7-link color="green" v-show="selectedItems.length" v-if="!$theme.md" class="enable" @click="doDisableEnableSelected(true)" icon-ios="f7:play_circle" icon-aurora="f7:play_circle">
        &nbsp;Enable {{ selectedItems.length }}
      </f7-link>
      <f7-link v-if="$theme.md" icon-md="material:close" icon-color="white" @click="showCheckboxes = false" />
      <div class="title" v-if="$theme.md">
        {{ selectedItems.length }} selected
      </div>
      <div class="right" v-if="$theme.md">
        <f7-link v-show="selectedItems.length" tooltip="Disable selected" icon-md="material:pause_circle_outline" icon-color="white" @click="doDisableEnableSelected(false)" />
        <f7-link v-show="selectedItems.length" tooltip="Enable selected" icon-md="material:play_circle_outline" icon-color="white" @click="doDisableEnableSelected(true)" />
        <f7-link v-show="selectedItems.length" tooltip="Remove selected" icon-md="material:delete" icon-color="white" @click="removeSelected" />
      </div>
    </f7-toolbar>

    <f7-list-index
      ref="listIndex"
      v-show="groupBy === 'alphabetical' && !$device.desktop"
      list-el=".things-list"
      :scroll-list="true"
      :label="true" />

    <f7-list class="searchbar-not-found">
      <f7-list-item title="Nothing found" />
    </f7-list>

    <f7-block class="block-narrow">
      <!-- skeleton for not ready -->
      <f7-col v-if="!ready">
        <f7-block-title>&nbsp;Loading...</f7-block-title>
        <f7-list contacts-list class="col things-list">
          <f7-list-group>
            <f7-list-item
              media-item
              v-for="n in 10"
              :key="n"
              :class="`skeleton-text skeleton-effect-blink`"
              title="Label of the thing"
              subtitle="This contains the thing UID"
              after="status badge" />
          </f7-list-group>
        </f7-list>
      </f7-col>

      <f7-col v-else-if="things.length > 0">
        <f7-block-title class="searchbar-hide-on-search">
          <span>{{ thingsCount }} Things</span>
          <template v-if="groupBy === 'location'">
            <div v-if="!$device.desktop" style="text-align:right; color:var(--f7-block-text-color); font-weight: normal" class="float-right">
              <f7-checkbox :checked="showNoLocation" @change="toggleShowNoLocation" /> <label @click="toggleShowNoLocation" style="cursor:pointer">Show no location</label>
            </div>
            <div v-else style="text-align:right; color:var(--f7-block-text-color); font-weight: normal" class="float-right">
              <label @click="toggleShowNoLocation" style="cursor:pointer">Show no location</label> <f7-checkbox :checked="showNoLocation" @change="toggleShowNoLocation" />
            </div>
          </template>
        </f7-block-title>
        <div class="searchbar-found padding-left padding-right">
          <f7-segmented strong tag="p">
            <f7-button :active="groupBy === 'alphabetical'" @click="switchGroupOrder('alphabetical')">
              Alphabetical
            </f7-button>
            <f7-button :active="groupBy === 'binding'" @click="switchGroupOrder('binding')">
              By binding
            </f7-button>
            <f7-button :active="groupBy === 'location'" @click="switchGroupOrder('location')">
              By location
            </f7-button>
          </f7-segmented>
        </div>
        <f7-list class="searchbar-found col things-list" :contacts-list="groupBy === 'alphabetical'">
          <f7-list-group v-for="(thingsWithInitial, initial) in indexedThings" :key="initial">
            <f7-list-item v-if="thingsWithInitial.length" :title="initial" group-title />
            <f7-list-item
              v-for="(thing, index) in thingsWithInitial"
              :key="index"
              media-item
              class="thinglist-item"
              :checkbox="showCheckboxes"
              :checked="isChecked(thing.UID)"
              @click.ctrl="(e) => ctrlClick(e, thing)"
              @click.meta="(e) => ctrlClick(e, thing)"
              @click.exact="(e) => click(e, thing)"
              link=""
              :title="thing.label || thing.UID">
              <div slot="footer">
                {{ thing.UID }}
                <clipboard-icon :value="thing.UID" tooltip="Copy UID" />
              </div>

              <div slot="subtitle" v-if="thing.location && groupBy !== 'location'">
                {{ thing.location }}
                <f7-icon f7="placemark" color="gray" style="font-size: 16px; width: 16px; height: 16px;" />
              </div>
              <f7-badge slot="after" :color="thingStatusBadgeColor(thing.statusInfo)" :tooltip="thing.statusInfo.description">
                {{ thingStatusBadgeText(thing.statusInfo) }}
              </f7-badge>
              <f7-icon v-if="!thing.editable" slot="after-title" f7="lock_fill" size="1rem" color="gray" />
            </f7-list-item>
          </f7-list-group>
        </f7-list>
      </f7-col>
    </f7-block>

    <f7-block v-if="ready && !things.length" class="block-narrow">
      <empty-state-placeholder icon="lightbulb" title="things.title" text="things.text" />
      <f7-row v-if="$f7.width < 1280" class="display-flex justify-content-center">
        <f7-button large fill color="blue" external :href="`${$store.state.websiteUrl}/link/thing`" target="_blank" v-t="'home.overview.button.documentation'" />
      </f7-row>
    </f7-block>

    <f7-fab position="right-bottom" slot="fixed" color="blue" href="add">
      <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus" />
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

.searchbar-found
  @media (min-width 960px)
    padding-left 0 !important
    padding-right 0 !important
</style>

<script>
import thingStatus from '@/components/thing/thing-status-mixin'
import ClipboardIcon from '@/components/util/clipboard-icon.vue'

export default {
  mixins: [thingStatus],
  components: {
    'empty-state-placeholder': () => import('@/components/empty-state-placeholder.vue'),
    ClipboardIcon
  },
  data () {
    return {
      ready: false,
      loading: false,
      initSearchbar: false,
      things: [],
      inbox: [],
      selectedItems: [],
      showCheckboxes: false,
      groupBy: 'alphabetical',
      showNoLocation: false,
      eventSource: null
    }
  },
  created () {

  },
  computed: {
    indexedThings () {
      if (this.groupBy === 'alphabetical') {
        return this.things.reduce((prev, thing, i, things) => {
          const initial = (thing.label || thing.UID).substring(0, 1).toUpperCase()
          if (!prev[initial]) {
            prev[initial] = []
          }
          prev[initial].push(thing)

          return prev
        }, {})
      } else if (this.groupBy === 'binding') {
        const bindingGroups = this.things.reduce((prev, thing, i, things) => {
          const binding = thing.thingTypeUID.split(':')[0]
          if (!prev[binding]) {
            prev[binding] = []
          }
          prev[binding].push(thing)

          return prev
        }, {})
        return Object.keys(bindingGroups).sort((a, b) => a.localeCompare(b)).reduce((objEntries, key) => {
          objEntries[key] = bindingGroups[key]
          return objEntries
        }, {})
      } else {
        const locationGroups = this.things.reduce((prev, thing, i, things) => {
          if (!thing.location && !this.showNoLocation) return prev
          const location = thing.location || '- No location -'
          if (!prev[location]) {
            prev[location] = []
          }
          prev[location].push(thing)

          return prev
        }, {})
        return Object.keys(locationGroups).sort((a, b) => a.localeCompare(b)).reduce((objEntries, key) => {
          objEntries[key] = locationGroups[key]
          return objEntries
        }, {})
      }
    },
    thingsCount () {
      let sum = 0
      Object.keys(this.indexedThings).forEach(key => {
        sum = sum + this.indexedThings[key].length
      })
      return sum
    },
    inboxCount () {
      return this.inbox.length
    },
    searchPlaceholder () {
      return window.innerWidth >= 1280 ? 'Search (for advanced search, use the developer sidebar (Shift+Alt+D))' : 'Search'
    }
  },
  methods: {
    onPageAfterIn () {
      this.load()
    },
    load () {
      this.loading = true
      this.$oh.api.get('/rest/things?summary=true').then((data) => {
        this.things = data.sort((a, b) => (a.label || a.UID).localeCompare(b.label || a.UID))
        this.initSearchbar = true
        this.loading = false
        this.ready = true
        setTimeout(() => {
          this.$refs.listIndex.update()
          if (this.$device.desktop && this.$refs.searchbar) this.$refs.searchbar.f7Searchbar.$inputEl[0].focus()
        })
        if (!this.eventSource) this.startEventSource()
      })
      this.loadInbox()
    },
    loadInbox () {
      this.$oh.api.get('/rest/inbox?includeIgnored=false').then((data) => {
        this.inbox = data
      })
    },
    switchGroupOrder (groupBy) {
      this.groupBy = groupBy
      const searchbar = this.$refs.searchbar.$el.f7Searchbar
      const filterQuery = searchbar.query
      this.$nextTick(() => {
        if (filterQuery) {
          searchbar.clear()
          searchbar.search(filterQuery)
        }
        if (groupBy === 'alphabetical') this.$refs.listIndex.update()
      })
    },
    toggleShowNoLocation () {
      this.showNoLocation = !this.showNoLocation
    },
    toggleCheck () {
      this.showCheckboxes = !this.showCheckboxes
    },
    isChecked (item) {
      return this.selectedItems.indexOf(item) >= 0
    },
    click (event, item) {
      if (this.showCheckboxes) {
        this.toggleItemCheck(event, item.UID, item)
      } else {
        this.$f7router.navigate(item.UID)
      }
    },
    ctrlClick (event, item) {
      this.toggleItemCheck(event, item.UID, item)
      if (!this.selectedItems.length) this.showCheckboxes = false
    },
    toggleItemCheck (event, item) {
      if (!this.showCheckboxes) this.showCheckboxes = true
      if (this.isChecked(item)) {
        this.selectedItems.splice(this.selectedItems.indexOf(item), 1)
      } else {
        this.selectedItems.push(item)
      }
    },
    removeSelected () {
      const vm = this

      this.$f7.dialog.confirm(
        `Remove ${this.selectedItems.length} selected things?`,
        'Remove Things',
        () => {
          vm.doRemoveSelected()
        }
      )
    },
    doRemoveSelected () {
      if (this.selectedItems.some((i) => this.things.find((thing) => thing.UID === i).editable === false)) {
        this.$f7.dialog.alert('Some of the selected things are not modifiable because they have been provisioned by files')
        return
      }

      let dialog = this.$f7.dialog.progress('Deleting Things...')

      const promises = this.selectedItems.map((i) => this.$oh.api.delete('/rest/things/' + i))
      Promise.all(promises).then((data) => {
        this.$f7.toast.create({
          text: 'Things removed',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
        this.selectedItems = []
        dialog.close()
        this.load()
      }).catch((err) => {
        dialog.close()
        this.load()
        console.error(err)
        this.$f7.dialog.alert('An error occurred while deleting: ' + err)
      })
    },
    doDisableEnableSelected (enable) {
      let dialog = this.$f7.dialog.progress('Please Wait...')

      const promises = this.selectedItems.map((i) => this.$oh.api.putPlain('/rest/things/' + i + '/enable', enable.toString()))
      Promise.all(promises).then((data) => {
        this.$f7.toast.create({
          text: (enable) ? 'Things enabled' : 'Things disabled',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
        this.selectedItems = []
        dialog.close()
        this.load()
      }).catch((err) => {
        dialog.close()
        this.load()
        console.error(err)
        this.$f7.dialog.alert('An error occurred while enabling/disabling: ' + err)
      })
    },
    startEventSource () {
      this.eventSource = this.$oh.sse.connect('/rest/events?topics=openhab/things/*/added,openhab/things/*/removed,openhab/things/*/updated,openhab/things/*/status,openhab/inbox/*', null, (event) => {
        const topicParts = event.topic.split('/')
        if (topicParts[1] === 'inbox') {
          this.loadInbox()
        } else {
          switch (topicParts[3]) {
            case 'status':
              const updatedThing = this.things.find((t) => t.UID === topicParts[2])
              const newStatus = JSON.parse(event.payload)
              if (updatedThing) {
                if (updatedThing.statusInfo.status !== newStatus.status) updatedThing.statusInfo.status = newStatus.status
                if (updatedThing.statusInfo.statusDetail !== newStatus.statusDetail) updatedThing.statusInfo.statusDetail = newStatus.statusDetail
                if (updatedThing.statusInfo.description !== newStatus.description) updatedThing.statusInfo.description = newStatus.description
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
