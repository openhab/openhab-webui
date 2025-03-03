<template>
  <f7-page @page:afterin="onPageAfterIn" @page:afterout="stopEventSource">
    <f7-navbar title="Inbox" back-link="Things" back-link-url="/settings/things/" back-link-force>
      <f7-nav-right>
        <f7-link icon-md="material:done_all" @click="toggleCheck()"
                 :text="(!$theme.md) ? ((showCheckboxes) ? 'Done' : 'Select') : ''" />
      </f7-nav-right>
      <f7-subnavbar :inner="false" v-show="initSearchbar">
        <f7-searchbar
          v-if="initSearchbar"
          ref="searchbar"
          class="searchbar-inbox"
          :init="initSearchbar"
          search-container=".contacts-list"
          search-in=".item-inner"
          :disable-button="!$theme.aurora" />
      </f7-subnavbar>
    </f7-navbar>
    <f7-toolbar class="contextual-toolbar" :class="{ 'navbar': $theme.md }" v-if="showCheckboxes" bottom-ios bottom-aurora>
      <div class="display-flex justify-content-center" v-if="!$theme.md && selectedItems.length > 0" style="width: 100%">
        <f7-button @click="confirmActionOnSelection('delete')" color="red" class="delete display-flex flex-direction-row margin-right"
                   icon-ios="f7:trash" icon-aurora="f7:trash">
          &nbsp;Remove
        </f7-button>
        <f7-button @click="confirmActionOnSelection('ignore')" color="orange" class="ignore display-flex flex-direction-row margin-right"
                   icon-ios="f7:eye_slash" icon-aurora="f7:eye_slash">
          &nbsp;Ignore
        </f7-button>
        <f7-button @click="confirmActionOnSelection('approve')" color="green" class="approve display-flex flex-direction-row margin-right"
                   icon-ios="f7:hand_thumbsup" icon-aurora="f7:hand_thumbsup">
          &nbsp;Approve
        </f7-button>
        <f7-button @click="performActionOnSelection('copy')" color="blue" class="delete wider-screen display-flex flex-direction-row"
                   icon-ios="f7:square_on_square" icon-aurora="f7:square_on_square">
          &nbsp;Copy
        </f7-button>
        <f7-button color="blue" class="delete narrower-screen" popover-open=".item-popover">
          ...
        </f7-button>
        <f7-popover class="item-popover" ref="popover" :backdrop="false" :close-by-backdrop-click="true"
                    :style="{ width: '96px' }" :animate="false">
          <div class="display-flex justify-content-center" style="width: 100%">
            <f7-link @click="performActionOnSelection('copy')" color="blue" class="delete display-flex flex-direction-column margin-right"
                     icon-ios="f7:square_on_square" icon-aurora="f7:square_on_square" popover-close=".item-popover">
              Copy
            </f7-link>
          </div>
        </f7-popover>
      </div>
      <f7-link v-if="$theme.md" icon-md="material:close" icon-color="white" @click="showCheckboxes = false" />
      <div class="title" v-if="$theme.md">
        {{ selectedItems.length }} selected
      </div>
      <div class="right" v-if="$theme.md && selectedItems.length > 0">
        <f7-link v-show="selectedItems.length" icon-md="material:delete" icon-color="white" @click="confirmActionOnSelection('delete')" />
        <f7-link v-show="selectedItems.length" icon-md="material:visibility_off" icon-color="white" @click="confirmActionOnSelection('ignore')" />
        <f7-link v-show="selectedItems.length" icon-md="material:thumb_up" icon-color="white" @click="confirmActionOnSelection('approve')" />
        <f7-link v-show="selectedItems.length" icon-md="material:content_copy" icon-color="white" @click="performActionOnSelection('copy')" />
      </div>
    </f7-toolbar>

    <f7-list-index
      ref="listIndex"
      v-show="groupBy === 'alphabetical' && !$device.desktop"
      list-el=".inbox-list"
      :scroll-list="true"
      :label="true" />

    <f7-block class="block-narrow">
      <f7-col>
        <f7-block-title>
          <span v-if="ready"><template v-if="selectedItems.length > 0">{{ selectedItems.length }} selected of </template>{{ inboxCount }} entries</span>
          <div v-if="!$device.desktop && $f7.width < 1024" style="text-align:right; color:var(--f7-block-text-color); font-weight: normal" class="float-right">
            <f7-checkbox :checked="showIgnored" @change="toggleIgnored" /> <label @click="toggleIgnored" style="cursor:pointer">Show ignored</label>
          </div>
          <div v-else style="text-align:right; color:var(--f7-block-text-color); font-weight: normal" class="float-right">
            <label @click="toggleIgnored" style="cursor:pointer">Show ignored</label> <f7-checkbox :checked="showIgnored" @change="toggleIgnored" />
          </div>
        </f7-block-title>
        <div class="searchbar-found padding-left padding-right" v-show="!ready || inboxCount > 0">
          <f7-segmented strong tag="p">
            <f7-button :active="groupBy === 'alphabetical'" @click="switchGroupOrder('alphabetical')">
              Alphabetical
            </f7-button>
            <f7-button :active="groupBy === 'binding'" @click="switchGroupOrder('binding')">
              By binding
            </f7-button>
          </f7-segmented>
        </div>

        <!-- skeleton for not ready -->
        <f7-list v-if="!ready" contacts-list class="col inbox-list">
          <f7-list-group>
            <f7-list-item
              media-item
              v-for="n in 10"
              :key="n"
              :class="`skeleton-text skeleton-effect-blink`"
              title="Label of the thing"
              subtitle="This contains the inbox UID"
              footer="binding:thingUID" />
          </f7-list-group>
        </f7-list>

        <f7-list v-else class="searchbar-found col" :contacts-list="groupBy === 'alphabetical'">
          <f7-list-group v-for="(inboxWithInitial, initial) in indexedInbox" :key="initial">
            <f7-list-item v-if="inboxWithInitial.length" :title="initial" group-title />
            <f7-list-item v-for="entry in inboxWithInitial"
                          :key="entry.thingUID"
                          :link="true"
                          media-item
                          :checkbox="showCheckboxes"
                          :checked="isChecked(entry.thingUID)"
                          @change="(e) => toggleItemCheck(e, entry.thingUID)"
                          @click.ctrl="(e) => ctrlClick(e, entry)"
                          @click.meta="(e) => ctrlClick(e, entry)"
                          @click.exact="(e) => click(e, entry)"
                          :title="entry.label"
                          :subtitle="entry.representationProperty ? entry.properties[entry.representationProperty] : ''"
                          :footer="entry.thingUID"
                          :badge="(entry.flag === 'IGNORED') ? 'IGNORED' : ''">
                          <!-- <f7-button icon-f7="add_round" color="blue" slot="after"></f7-button>
              <f7-button icon-f7="eye_off" color="blue" slot="after"></f7-button>
              <f7-button icon-f7="trash" color="blue" slot="after"></f7-button> -->
            </f7-list-item>
          </f7-list-group>
        </f7-list>
        <f7-list class="searchbar-not-found">
          <f7-list-item title="Nothing found" />
        </f7-list>
      </f7-col>
    </f7-block>

    <f7-block v-if="ready && inboxCount === 0" class="block-narrow">
      <empty-state-placeholder icon="tray" title="inbox.title" text="inbox.text" />
    </f7-block>

    <f7-fab v-show="!showCheckboxes" position="right-bottom" slot="fixed" color="blue" href="/settings/things/add">
      <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus" />
      <f7-icon ios="f7:close" md="material:close" aurora="f7:close" />
      <!-- <f7-fab-buttons position="top">
        <f7-fab-button label="Scan and add to Inbox">S</f7-fab-button>
        <f7-fab-button label="Add thing manually">M</f7-fab-button>
      </f7-fab-buttons> -->
    </f7-fab>
  </f7-page>
</template>

<style lang="stylus">
.searchbar-found
  @media (min-width 960px)
    padding-left 0 !important
    padding-right 0 !important
.wider-screen
  @media (max-width 499px)
    display none !important
.narrower-screen
  @media (min-width 500px)
    display none !important

</style>

<script>
import ThingInboxMixin from '@/pages/settings/things/thing-inbox-mixin'

export default {
  mixins: [ThingInboxMixin],
  components: {
    'empty-state-placeholder': () => import('@/components/empty-state-placeholder.vue')
  },
  data () {
    return {
      ready: false,
      loading: false,
      initSearchbar: false,
      things: [], // for validating thingUIDs against existing things
      inbox: [],
      // indexedInbox: {},
      selectedItems: [],
      showIgnored: false,
      groupBy: 'alphabetical',
      showCheckboxes: false,
      eventSource: null
    }
  },
  computed: {
    inboxCount () {
      if (!this.inbox) return 0
      return (this.showIgnored) ? this.inbox.length : this.inbox.filter((e) => e.flag !== 'IGNORED').length
    },
    indexedInbox () {
      const filteredInbox = (this.showIgnored) ? this.inbox : this.inbox.filter((e) => e.flag !== 'IGNORED')
      if (this.groupBy === 'alphabetical') {
        return filteredInbox.reduce((prev, entry, i, inbox) => {
          const initial = entry.label.substring(0, 1).toUpperCase()
          if (!prev[initial]) {
            prev[initial] = []
          }
          prev[initial].push(entry)

          return prev
        }, {})
      } else {
        const bindingGroups = filteredInbox.reduce((prev, entry, i, inbox) => {
          const binding = entry.thingUID.split(':')[0]
          if (!prev[binding]) {
            prev[binding] = []
          }
          prev[binding].push(entry)

          return prev
        }, {})
        return Object.keys(bindingGroups).sort((a, b) => a.localeCompare(b)).reduce((objEntries, key) => {
          objEntries[key] = bindingGroups[key]
          return objEntries
        }, {})
      }
    }
  },
  methods: {
    load () {
      this.loading = true
      this.$oh.api.get('/rest/inbox?includeIgnored=true').then((data) => {
        this.inbox = data.sort((a, b) => a.label.localeCompare(b.label))
        this.initSearchbar = true
        this.loading = false
        setTimeout(() => {
          this.$refs.listIndex.update()
          this.$nextTick(() => {
            if (this.$device.desktop && this.$refs.searchbar) {
              this.$refs.searchbar.f7Searchbar.$inputEl[0].focus()
            }
          })
        })
        this.$oh.api.get('/rest/things?summary=true&staticDataOnly=true').then((things) => {
          this.things = things
          this.ready = true
        })
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
    onPageAfterIn () {
      this.load()
      this.startEventSource()
    },
    startEventSource () {
      this.eventSource = this.$oh.sse.connect('/rest/events?topics=openhab/inbox/*', null, (event) => {
        // const topicParts = event.topic.split('/')
        this.load()
      })
    },
    stopEventSource () {
      this.$oh.sse.close(this.eventSource)
      this.eventSource = null
    },
    click (event, item) {
      if (this.showCheckboxes) {
        this.toggleItemCheck(event, item.thingUID, item)
      } else {
        this.openEntryActions(event, item)
      }
    },
    ctrlClick (event, item) {
      this.toggleItemCheck(event, item.thingUID, item)
      if (!this.selectedItems.length) this.showCheckboxes = false
    },
    openEntryActions (e, entry) {
      if (this.showCheckboxes) {
        this.toggleItemCheck(e, entry.thingUID)
        return
      }
      let ignored = entry.flag === 'IGNORED'
      let actions = this.$f7.actions.create({
        convertToPopover: true,
        closeOnEscape: true,
        buttons: [
          [
            {
              text: entry.label,
              label: true
            }
          ],
          [
            this.entryActionsAddAsThingButton(entry, this.load),
            this.entryActionsCopyThingDefinitionButton(entry),
            {
              text: (!ignored) ? 'Ignore' : 'Unignore',
              color: (!ignored) ? 'orange' : 'blue',
              onClick: () => {
                if (ignored) {
                  this.unignoreEntry(entry)
                } else {
                  this.ignoreEntry(entry)
                }
              }
            }
          ],
          [
            {
              text: 'Remove',
              color: 'red',
              onClick: () => {
                this.$f7.dialog.confirm(`Remove ${entry.label} from the Inbox?`, 'Remove Entry', () => {
                  this.removeEntry(entry)
                })
              }
            }
          ]
        ]
      })

      actions.open()
    },
    ignoreEntry (entry) {
      this.$oh.api.postPlain(`/rest/inbox/${entry.thingUID}/ignore`).then((res) => {
        this.$f7.toast.create({
          text: 'Entry ignored',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
        this.load()
      }).catch((err) => {
        this.$f7.toast.create({
          text: 'Error while ignoring entry: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
        this.load()
      })
    },
    unignoreEntry (entry) {
      this.$oh.api.postPlain(`/rest/inbox/${entry.thingUID}/unignore`).then((res) => {
        this.$f7.toast.create({
          text: 'Entry unignored',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
        this.load()
      }).catch((err) => {
        this.$f7.toast.create({
          text: 'Error while unignoring entry: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
        this.load()
      })
    },
    removeEntry (entry) {
      this.$oh.api.delete('/rest/inbox/' + entry.thingUID).then((res) => {
        this.$f7.toast.create({
          text: 'Entry removed',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
        this.load()
      }).catch((err) => {
        this.$f7.toast.create({
          text: 'Error while removing entry: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
        this.load()
      })
    },
    toggleIgnored () {
      this.showIgnored = !this.showIgnored
      setTimeout(() => { this.$refs.listIndex.update() })
    },
    toggleCheck () {
      this.showCheckboxes = !this.showCheckboxes
      this.selectedItems = []
    },
    isChecked (item) {
      return this.selectedItems.indexOf(item) >= 0
    },
    toggleItemCheck (event, item) {
      if (!this.showCheckboxes) this.showCheckboxes = true
      if (this.isChecked(item)) {
        this.selectedItems.splice(this.selectedItems.indexOf(item), 1)
      } else {
        this.selectedItems.push(item)
      }
    },
    confirmActionOnSelection (action) {
      const vm = this

      let title, message
      switch (action) {
        case 'delete':
          title = 'Remove Inbox Entries'
          message = `Remove ${this.selectedItems.length} selected entries?`
          break
        case 'approve':
          title = 'Approve Inbox Entries'
          message = `Approve ${this.selectedItems.length} selected entries?`
          break
        case 'ignore':
          title = 'Ignore Inbox Entries'
          message = `Ignore ${this.selectedItems.length} selected entries?`
          break
        case 'unignore':
          title = 'Unignore Inbox Entries'
          message = `Unignore ${this.selectedItems.length} selected entries?`
          break
      }

      this.$f7.dialog.confirm(message, title, () => { vm.performActionOnSelection(action) })
    },
    performActionOnSelection (action) {
      let progressMessage, successMessage, promises
      switch (action) {
        case 'delete':
          progressMessage = 'Removing Inbox Entries...'
          successMessage = `${this.selectedItems.length} entries removed`
          promises = this.filterSelectedItems().map((e) => this.$oh.api.delete('/rest/inbox/' + e.thingUID))
          break
        case 'approve':
          progressMessage = 'Approving Inbox Entries...'
          successMessage = `${this.selectedItems.length} entries approved`
          promises = this.filterSelectedItems().map((e) => this.$oh.api.postPlain('/rest/inbox/' + e.thingUID + '/approve', e.label))
          break
        case 'ignore':
          progressMessage = 'Ignoring Inbox Entries...'
          successMessage = `${this.selectedItems.length} entries ignored`
          promises = this.filterSelectedItems().map((e) => this.$oh.api.postPlain('/rest/inbox/' + e.thingUID + '/ignore'))
          break
        case 'unignore':
          progressMessage = 'Unignoring Inbox Entries...'
          successMessage = `${this.selectedItems.length} entries unignored`
          promises = this.filterSelectedItems().map((e) => this.$oh.api.postPlain('/rest/inbox/' + e.thingUID + '/unignore'))
          break
        case 'copy':
          progressMessage = 'Copying Inbox Entries...'
          successMessage = `${this.selectedItems.length} entries copied to clipboard`
          promises = this.filterSelectedItems().map((e) => this.$oh.api.getPlain({
            url: '/rest/file-format/things/' + e.thingUID,
            headers: { accept: 'text/vnd.openhab.dsl.thing' }
          }))

          promises = [Promise.all(promises).then((data) => {
            if (this.$clipboard(data.join('\n'))) {
              Promise.resolve()
            } else {
              Promise.reject('Failed to copy to clipboard')
            }
          })]
          break
      }

      let dialog = this.$f7.dialog.progress(progressMessage)

      Promise.all(promises).then((data) => {
        this.$f7.toast.create({
          text: successMessage,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
        dialog.close()
        this.$f7router.navigate('/settings/things/', {
          props: {
            searchFor: this.selectedItems.join(',')
          }
        })
      }).catch((err) => {
        dialog.close()
        this.load()
        console.error(err)
        this.$f7.dialog.alert('An error occurred: ' + err)
      })
    },
    filterSelectedItems () {
      return this.inbox.filter((e) => this.selectedItems.indexOf(e.thingUID) >= 0)
    }
  }
}
</script>
