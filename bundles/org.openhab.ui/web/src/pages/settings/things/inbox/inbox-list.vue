<template>
  <f7-page @page:afterin="onPageAfterIn" @page:afterout="stopEventSource">
    <f7-navbar title="Inbox" back-link="Things" back-link-url="/settings/things/" back-link-force>
      <f7-nav-right>
        <f7-link icon-md="material:done_all" @click="toggleCheck()"
        :text="(!$theme.md) ? ((showCheckboxes) ? 'Done' : 'Select') : ''"></f7-link>
      </f7-nav-right>
      <f7-subnavbar :inner="false" v-show="initSearchbar">
        <f7-searchbar
          v-if="initSearchbar"
          class="searchbar-inbox"
          :init="initSearchbar"
          search-container=".contacts-list"
          search-in=".item-inner"
          remove-diacritics
          :disable-button="!$theme.aurora"
        ></f7-searchbar>
      </f7-subnavbar>
    </f7-navbar>
    <f7-toolbar class="contextual-toolbar" :class="{ 'navbar': $theme.md }" v-if="showCheckboxes" bottom-ios bottom-aurora>
      <f7-link color="red" v-show="selectedItems.length" v-if="!$theme.md" class="delete" icon-ios="f7:trash" icon-aurora="f7:trash" @click="confirmActionOnSelection('delete')">&nbsp;Remove {{selectedItems.length}}</f7-link>
      <f7-link color="orange" v-show="selectedItems.length" v-if="!$theme.md" class="ignore" @click="confirmActionOnSelection('ignore')" icon-ios="f7:eye_slash" icon-aurora="f7:eye_slash">&nbsp;Ignore {{selectedItems.length}}</f7-link>
      <f7-link color="green" v-show="selectedItems.length" v-if="!$theme.md" class="approve" @click="confirmActionOnSelection('approve')" icon-ios="f7:hand_thumbsup" icon-aurora="f7:hand_thumbsup">&nbsp;Approve {{selectedItems.length}}</f7-link>
      <f7-link v-if="$theme.md" icon-md="material:close" icon-color="white" @click="showCheckboxes = false"></f7-link>
      <div class="title" v-if="$theme.md">
        {{selectedItems.length}} selected
      </div>
      <div class="right" v-if="$theme.md">
        <f7-link v-show="selectedItems.length" icon-md="material:delete" icon-color="white" @click="confirmActionOnSelection('delete')"></f7-link>
        <f7-link v-show="selectedItems.length" icon-md="material:visibility_off" icon-color="white" @click="confirmActionOnSelection('ignore')"></f7-link>
        <f7-link v-show="selectedItems.length" icon-md="material:thumb_up" icon-color="white" @click="confirmActionOnSelection('approve')"></f7-link>
      </div>
    </f7-toolbar>

    <f7-list-index
      ref="listIndex"
      v-show="groupBy === 'alphabetical'"
      list-el=".inbox-list"
      :scroll-list="true"
      :label="true"
    ></f7-list-index>

    <f7-block class="block-narrow">
      <f7-col>
        <f7-block-title><span v-if="ready">{{inboxCount}} entries</span>
        <div style="text-align:right; color:var(--f7-block-text-color); font-weight: normal" class="float-right">
          <label @click="toggleIgnored" style="cursor:pointer">Show ignored</label> <f7-checkbox :checked="showIgnored" @change="toggleIgnored"></f7-checkbox>
        </div>
        </f7-block-title>
        <div class="padding-left padding-right" v-show="!ready || inboxCount > 0">
          <f7-segmented strong tag="p">
            <f7-button :active="groupBy === 'alphabetical'" @click="groupBy = 'alphabetical'; $nextTick(() => $refs.listIndex.update())">Alphabetical</f7-button>
            <f7-button :active="groupBy === 'binding'" @click="groupBy = 'binding'">By binding</f7-button>
          </f7-segmented>
        </div>
        <f7-list v-if="!ready" contacts-list class="col inbox-list">
          <f7-list-group>
            <f7-list-item
              media-item
              v-for="n in 10"
              :key="n"
              :class="`skeleton-text skeleton-effect-blink`"
              title="Label of the thing"
              subtitle="This contains the inbox UID"
              footer="binding:thingUID"
            >
            </f7-list-item>
          </f7-list-group>
        </f7-list>
        <f7-list v-else class="searchbar-found col" :contacts-list="groupBy === 'alphabetical'">
          <f7-list-group v-for="(inboxWithInitial, initial) in indexedInbox" :key="initial">
            <f7-list-item v-if="inboxWithInitial.length" :title="initial" group-title></f7-list-item>
            <f7-list-item v-for="entry in inboxWithInitial"
              :key="entry.thingUID"
              :link="true"
              media-item
              :checkbox="showCheckboxes"
              :checked="isChecked(entry.thingUID)"
              @change="(e) => toggleItemCheck(e, entry.thingUID)"
              @click="(e) => openEntryActions(e, entry)"
              :title="entry.label"
              :subtitle="entry.representationProperty ? entry.properties[entry.representationProperty] : ''"
              :footer="entry.thingTypeUID"
              :badge="(entry.flag === 'IGNORED') ? 'IGNORED' : ''"
            >
              <!-- <f7-button icon-f7="add_round" color="blue" slot="after"></f7-button>
              <f7-button icon-f7="eye_off" color="blue" slot="after"></f7-button>
              <f7-button icon-f7="trash" color="blue" slot="after"></f7-button> -->
            </f7-list-item>
          </f7-list-group>
        </f7-list>
      <f7-list class="searchbar-not-found">
        <f7-list-item title="Nothing found"></f7-list-item>
      </f7-list>

      </f7-col>
    </f7-block>
    <f7-block v-if="ready && inboxCount === 0" class="block-narrow">
      <empty-state-placeholder icon="tray" title="inbox.title" text="inbox.text" />
    </f7-block>
    <f7-fab v-show="!showCheckboxes" position="right-bottom" slot="fixed" color="blue" href="/settings/things/add">
      <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus"></f7-icon>
      <f7-icon ios="f7:close" md="material:close" aurora="f7:close"></f7-icon>
      <!-- <f7-fab-buttons position="top">
        <f7-fab-button label="Scan and add to Inbox">S</f7-fab-button>
        <f7-fab-button label="Add thing manually">M</f7-fab-button>
      </f7-fab-buttons> -->
    </f7-fab>
  </f7-page>
</template>

<script>
export default {
  data () {
    return {
      ready: false,
      loading: false,
      initSearchbar: false,
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
        return filteredInbox.reduce((prev, entry, i, inbox) => {
          const binding = entry.thingUID.split(':')[0]
          if (!prev[binding]) {
            prev[binding] = []
          }
          prev[binding].push(entry)

          return prev
        }, {})
      }
    }
  },
  methods: {
    load () {
      this.loading = true
      this.$oh.api.get('/rest/inbox').then((data) => {
        this.inbox = data.sort((a, b) => a.label.localeCompare(b.label))
        this.initSearchbar = true
        this.loading = false
        this.ready = true
        setTimeout(() => { this.$refs.listIndex.update() })
      })
    },
    onPageAfterIn () {
      this.load()
      this.startEventSource()
    },
    startEventSource () {
      this.eventSource = this.$oh.sse.connect('/rest/events?topics=smarthome/inbox/*', null, (event) => {
        console.log(event)
        // const topicParts = event.topic.split('/')
        this.load()
      })
    },
    stopEventSource () {
      this.$oh.sse.close(this.eventSource)
      this.eventSource = null
    },
    openEntryActions (e, entry) {
      if (this.showCheckboxes) {
        this.toggleItemCheck(e, entry.thingUID)
        return
      }
      let self = this
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
            {
              text: 'Add as Thing',
              color: 'green',
              bold: true,
              onClick: () => {
                console.log(`Add ${entry.thingUID} as thing`)
                this.$f7.dialog.prompt(`This will create a new Thing of type ${entry.thingTypeUID} with the following name:`,
                  'Add as Thing',
                  (name) => {
                    this.$oh.api.postPlain(`/rest/inbox/${entry.thingUID}/approve`, name).then((res) => {
                      this.$f7.toast.create({
                        text: 'Entry approved',
                        destroyOnClose: true,
                        closeTimeout: 2000
                      }).open()
                      self.load()
                    }).catch((err) => {
                      this.$f7.toast.create({
                        text: 'Error during thing creation: ' + err,
                        destroyOnClose: true,
                        closeTimeout: 2000
                      }).open()
                      self.load()
                    })
                  },
                  null,
                  entry.label)
              }
            },
            {
              text: (!ignored) ? 'Ignore' : 'Unignore',
              color: (!ignored) ? 'orange' : 'blue',
              onClick: () => {
                this.$oh.api.postPlain(`/rest/inbox/${entry.thingUID}/${(!ignored) ? 'ignore' : 'unignore'}`).then((res) => {
                  this.$f7.toast.create({
                    text: (!ignored) ? 'Entry ignored' : 'Entry unignored',
                    destroyOnClose: true,
                    closeTimeout: 2000
                  }).open()
                  self.load()
                }).catch((err) => {
                  this.$f7.toast.create({
                    text: 'Error while updating ignore flag: ' + err,
                    destroyOnClose: true,
                    closeTimeout: 2000
                  }).open()
                  self.load()
                })
              }
            }
          ],
          [
            {
              text: 'Remove',
              color: 'red',
              onClick: () => {
                this.$f7.dialog.confirm(`Remove ${entry.label} from the Inbox?`, 'Remove Entry', () => {
                  this.$oh.api.delete('/rest/inbox/' + entry.thingUID).then((res) => {
                    this.$f7.toast.create({
                      text: 'Entry removed',
                      destroyOnClose: true,
                      closeTimeout: 2000
                    }).open()
                    self.load()
                  }).catch((err) => {
                    this.$f7.toast.create({
                      text: 'Error while removing entry: ' + err,
                      destroyOnClose: true,
                      closeTimeout: 2000
                    }).open()
                    self.load()
                  })
                })
              }
            }
          ]
        ]
      })

      actions.open()
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
      console.log('toggle check')
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
          promises = this.selectedItems.map((i) => this.$oh.api.delete('/rest/inbox/' + i))
          break
        case 'approve':
          progressMessage = 'Approving Inbox Entries...'
          successMessage = `${this.selectedItems.length} entries approved`
          promises = this.selectedItems.map((i) => this.$oh.api.postPlain('/rest/inbox/' + i + '/approve', i.label))
          break
        case 'ignore':
          progressMessage = 'Ignoring Inbox Entries...'
          successMessage = `${this.selectedItems.length} entries ignored`
          promises = this.selectedItems.map((i) => this.$oh.api.postPlain('/rest/inbox/' + i + '/ignore'))
          break
        case 'unignore':
          progressMessage = 'Unignoring Inbox Entries...'
          successMessage = `${this.selectedItems.length} entries unignored`
          promises = this.selectedItems.map((i) => this.$oh.api.postPlain('/rest/inbox/' + i + '/unignore'))
          break
      }

      let dialog = this.$f7.dialog.progress(progressMessage)

      Promise.all(promises).then((data) => {
        this.$f7.toast.create({
          text: successMessage,
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
        this.$f7.dialog.alert('An error occurred: ' + err)
      })
    }
  }
}
</script>

<style>
</style>
