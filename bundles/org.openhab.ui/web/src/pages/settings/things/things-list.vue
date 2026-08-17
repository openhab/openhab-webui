<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar>
      <oh-nav-content title="Things" back-link="Settings" back-link-url="/settings/" :f7router>
        <template #right>
          <f7-link icon-md="material:done_all" @click="toggleCheck()" :text="!theme.md ? (showCheckboxes ? 'Done' : 'Select') : ''" />
        </template>
      </oh-nav-content>
      <f7-subnavbar v-show="initSearchbar" :inner="false">
        <oh-searchbar
          v-if="initSearchbar"
          ref="oh-searchbar"
          class="searchbar-things"
          :persist-search-string-key="'things-search-string'"
          :haystack-fields="haystackFields"
          :filters-definitions="filtersDefinitions"
          @update:tokenized-search="onUpdateTokenizedSearch" />
      </f7-subnavbar>
    </f7-navbar>
    <f7-toolbar v-if="showCheckboxes" class="contextual-toolbar" :class="{ navbar: theme.md }" bottom-ios bottom-aurora>
      <div v-if="!theme.md && selected.length > 0" class="display-flex justify-content-center" style="width: 100%">
        <f7-link
          v-show="selected.length"
          color="red"
          class="delete display-flex flex-direction-row margin-right"
          icon-ios="f7:trash"
          icon-aurora="f7:trash"
          @click="removeSelected">
          Remove
        </f7-link>
        <f7-link
          v-show="selected.length"
          color="orange"
          class="disable display-flex flex-direction-row margin-right"
          @click="doDisableEnableSelected(false)"
          icon-ios="f7:pause_circle"
          icon-aurora="f7:pause_circle">
          &nbsp;Disable
        </f7-link>
        <f7-link
          v-show="selected.length"
          color="green"
          class="enable display-flex flex-direction-row margin-right"
          @click="doDisableEnableSelected(true)"
          icon-ios="f7:play_circle"
          icon-aurora="f7:play_circle">
          &nbsp;Enable
        </f7-link>
        <f7-link
          v-show="selected.length"
          color="blue"
          class="copy display-flex flex-direction-row"
          @click="copyFileDefinitionToClipboard(ObjectType.THING, selected)"
          icon-ios="f7:square_on_square"
          icon-aurora="f7:square_on_square">
          &nbsp;Copy
        </f7-link>
      </div>
      <f7-link v-if="theme.md" icon-md="material:close" icon-color="white" @click="showCheckboxes = false" />
      <div v-if="theme.md" class="title">{{ selected.length }} selected</div>
      <div v-if="theme.md" class="right">
        <f7-link
          v-show="selected.length"
          tooltip="Disable selected"
          icon-md="material:pause_circle_outline"
          icon-color="white"
          @click="doDisableEnableSelected(false)" />
        <f7-link
          v-show="selected.length"
          tooltip="Enable selected"
          icon-md="material:play_circle_outline"
          icon-color="white"
          @click="doDisableEnableSelected(true)" />
        <f7-link v-show="selected.length" tooltip="Remove selected" icon-md="material:delete" icon-color="white" @click="removeSelected" />
        <f7-link
          v-show="selected.length"
          tooltip="Copy selected"
          icon-md="material:content_copy"
          icon-color="white"
          @click="copyFileDefinitionToClipboard(ObjectType.THING, selected)" />
      </div>
    </f7-toolbar>

    <f7-list-index
      v-if="ready"
      v-show="groupBy === 'alphabetical' && !$device.desktop"
      ref="listIndex"
      list-el=".things-list"
      :scroll-list="true"
      :label="true" />

    <f7-block class="block-narrow">
      <f7-col v-show="ready">
        <f7-block-title>
          <span>{{ getListTitle(isFiltered, filteredList.length, things.length, 'Thing', selected.length) }}</span>
          <template v-if="showCheckboxes && filteredList.length">
            -
            <f7-link @click="selectDeselectAll" :text="allSelected ? 'Deselect all' : 'Select all'" />
          </template>
          <template v-if="groupBy === 'location'">
            <div style="text-align: right" class="padding-right">
              <label class="advanced-label">
                <f7-checkbox v-model:checked="showNoLocation" />
                Show no location</label
              >
            </div>
          </template>
        </f7-block-title>
      </f7-col>
      <!-- skeleton for not ready -->
      <f7-col v-if="!ready">
        <f7-block-title>&nbsp;Loading...</f7-block-title>
        <f7-list contacts-list class="col things-list">
          <f7-list-group>
            <f7-list-item
              v-for="n in 10"
              media-item
              :key="n"
              :class="`skeleton-text skeleton-effect-blink`"
              title="Label of the thing"
              subtitle="This contains the thing UID"
              after="status badge" />
          </f7-list-group>
        </f7-list>
      </f7-col>

      <f7-col v-else-if="things.length > 0">
        <div class="padding-left padding-right">
          <f7-segmented strong tag="p">
            <f7-button :active="groupBy === 'alphabetical'" @click="switchGroupOrder('alphabetical')"> Alphabetical </f7-button>
            <f7-button :active="groupBy === 'binding'" @click="switchGroupOrder('binding')"> By binding </f7-button>
            <f7-button :active="groupBy === 'location'" @click="switchGroupOrder('location')"> By location </f7-button>
          </f7-segmented>
        </div>
        <f7-list v-if="!filteredList.length">
          <f7-list-item title="Nothing found" />
        </f7-list>
        <f7-list v-show="filteredList.length" class="col things-list" :contacts-list="groupBy === 'alphabetical'">
          <f7-list-group v-for="(thingsWithInitial, initial) in indexedThings" :key="initial">
            <f7-list-item v-if="thingsWithInitial.length" :title="initial" group-title media-item />
            <f7-list-item
              v-for="(thing, index) in thingsWithInitial"
              :key="index"
              media-item
              class="thinglist-item"
              :checkbox="showCheckboxes"
              :checked="isChecked(thing.UID) ? true : null"
              :value="thing.UID"
              prevent-router
              @click.ctrl="ctrlClick($event, thing)"
              @click.meta="ctrlClick($event, thing)"
              @click.exact="click($event, thing)"
              :link="`${encodeURIComponent(thing.UID)}`"
              :title="thing.label || thing.UID">
              <template #footer>
                <div>
                  {{ thing.UID }}
                  <clipboard-icon :value="thing.UID" tooltip="Copy UID" />
                </div>
              </template>

              <template #subtitle>
                <div v-if="thing.location && groupBy !== 'location'">
                  {{ thing.location }}
                  <f7-icon f7="placemark" color="gray" style="font-size: 16px; width: 16px; height: 16px" />
                </div>
              </template>
              <template #after>
                <div class="badge-with-marker">
                  <f7-badge :color="thingStatusBadgeColor(thing.statusInfo)" :tooltip="thing.statusInfo.description || null">
                    {{ thingStatusBadgeText(thing.statusInfo) }}
                  </f7-badge>
                  <span
                    v-if="thing.statusInfo.status === 'ONLINE' && thing.statusInfo.description && thing.statusInfo.description !== ''"
                    class="badge-marker-dot">
                  </span>
                </div>
              </template>
              <template #after-title>
                <f7-icon v-if="!thing.editable" f7="lock_fill" size="1rem" color="gray" />
              </template>
            </f7-list-item>
          </f7-list-group>
        </f7-list>
      </f7-col>
    </f7-block>

    <f7-block v-if="ready && !things.length" class="block-narrow">
      <empty-state-placeholder icon="lightbulb" title="things.title" text="things.text" />
      <f7-row v-if="$f7dim.width < 1280" class="display-flex justify-content-center">
        <f7-button
          large
          fill
          color="blue"
          external
          :href="`${runtimeStore.websiteUrl}/link/thing`"
          target="_blank"
          :text="$t('home.overview.button.documentation')" />
      </f7-row>
    </f7-block>

    <template #fixed>
      <f7-fab position="right-bottom" color="blue" href="add/">
        <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus" />
      </f7-fab>
      <f7-fab position="center-bottom" :text="`Inbox (${inboxCount})`" :color="inboxCount > 0 ? 'red' : 'gray'" href="inbox">
        <f7-icon f7="tray" />
      </f7-fab>
    </template>
  </f7-page>
</template>

<style lang="stylus">
.things-list
  margin-bottom calc(var(--f7-fab-size) + 2 * calc(var(--f7-fab-margin) + var(--f7-safe-area-bottom)))
  .badge-with-marker
    position relative
    display inline-block
  .badge-marker-dot
    position absolute
    top -4px
    right -4px
    width 10px
    height 10px
    background-color var(--f7-color-blue)
    border 1px solid var(--f7-list-bg-color)
    border-radius 50%
    pointer-events none
</style>

<script>
import { nextTick, shallowRef, useTemplateRef } from 'vue'
import { f7, theme } from 'framework7-vue'
import { mapStores } from 'pinia'

import { useRuntimeStore } from '@/js/stores/useRuntimeStore'
import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'

import { thingStatusBadgeColor, thingStatusBadgeText, thingStatusDescription } from '@/components/thing/thing-status'
import ClipboardIcon from '@/components/util/clipboard-icon.vue'
import OhSearchbar from '@/pages/oh-searchbar.vue'
import FileDefinition from '@/pages/settings/file-definition-mixin'

import EmptyStatePlaceholder from '@/components/empty-state-placeholder.vue'
import { showToast } from '@/js/dialog-promises'
import { useSearch } from '@/components/useSearch'
import { getListTitle } from '@/pages/list-helpers'

const ITEM_STATUSES = {
  online: 'Online',
  offline: 'Offline',
  disabled: 'Disabled',
  unitialized: 'Uninitialized',
  unknown: 'Unknown',
  others: 'Other Status'
}

export default {
  mixins: [FileDefinition],
  props: {
    searchFor: String,
    f7route: Object,
    f7router: Object
  },
  components: {
    EmptyStatePlaceholder,
    ClipboardIcon,
    OhSearchbar
  },
  setup() {
    const things = shallowRef([])
    const haystackFields = ['uid', 'label', 'location']
    const ohSearchbarRef = useTemplateRef('oh-searchbar')

    const filtersDefinitions = {
      is: {
        label: 'Kind',
        getFn: (thing) => (thing.editable ? 'editable' : 'readonly'),
        options: ['Editable', 'Readonly']
      },
      uid: {
        label: 'UID',
        getFn: (thing) => [thing.UID, thing.bridgeUID]
      },
      label: {
        label: 'Label',
        path: 'label'
      },
      status: {
        label: 'Status',
        path: 'statusInfo.status'
      },
      location: {
        label: 'Location',
        path: 'location'
      },
      binding: {
        label: 'Binding',
        path: 'thingTypeUID',
        getFn: (thing) => thing.thingTypeUID.split(':')[0]
      }
    }

    const { filteredList, isFiltered, onUpdateTokenizedSearch, getFuseValuesForField } = useSearch(things, {
      filtersDefinitions,
      haystackFields
    })

    filtersDefinitions.status.options = () => getFuseValuesForField('statusInfo.status')
    filtersDefinitions.location.options = () => getFuseValuesForField('location')
    filtersDefinitions.binding.options = () => getFuseValuesForField('thingTypeUID')

    return {
      f7,
      theme,
      things,
      filtersDefinitions,
      filteredList,
      isFiltered,
      onUpdateTokenizedSearch,
      thingStatusBadgeColor,
      thingStatusBadgeText,
      thingStatusDescription,
      getListTitle,
      haystackFields,
      ohSearchbarRef
    }
  },
  data() {
    return {
      ready: false,
      initSearchbar: false,
      loading: false,
      inbox: [],
      selected: [],
      showCheckboxes: false,
      groupBy: 'alphabetical',
      showNoLocation: false,
      eventSource: null
    }
  },
  watch: {
    listedUids() {
      this.selected = this.selected.filter((i) => this.listedUids.has(i))
    }
  },
  computed: {
    emptySearchOrFilterResults() {
      return (this.isFiltered || this.$refs['list-filter']?.filtered) && !this.filteredList.length && this.things.length
    },
    listedUids() {
      return new Set(this.filteredList.map((t) => t.UID))
    },
    indexedThings() {
      const things = this.filteredList
      if (this.groupBy === 'alphabetical') {
        return things.reduce((prev, thing, i, things) => {
          const initial = (thing.label || thing.UID).substring(0, 1).toUpperCase()
          if (!prev[initial]) {
            prev[initial] = []
          }
          prev[initial].push(thing)

          return prev
        }, {})
      } else if (this.groupBy === 'binding') {
        const bindingGroups = things.reduce((prev, thing, i, things) => {
          const binding = thing.thingTypeUID.split(':')[0]
          if (!prev[binding]) {
            prev[binding] = []
          }
          prev[binding].push(thing)

          return prev
        }, {})
        return Object.keys(bindingGroups)
          .sort((a, b) => a.localeCompare(b))
          .reduce((objEntries, key) => {
            objEntries[key] = bindingGroups[key]
            return objEntries
          }, {})
      } else {
        const locationGroups = things.reduce((prev, thing, i, things) => {
          if (!thing.location && !this.showNoLocation) return prev
          const location = thing.location || '- No location -'
          if (!prev[location]) {
            prev[location] = []
          }
          prev[location].push(thing)

          return prev
        }, {})
        return Object.keys(locationGroups)
          .sort((a, b) => a.localeCompare(b))
          .reduce((objEntries, key) => {
            objEntries[key] = locationGroups[key]
            return objEntries
          }, {})
      }
    },
    thingsCount() {
      let sum = 0
      Object.keys(this.indexedThings).forEach((key) => {
        sum = sum + this.indexedThings[key].length
      })
      return sum
    },
    inboxCount() {
      return this.inbox.length
    },
    allSelected() {
      return this.selected.length >= this.filteredList.length && this.filteredList.length > 0
    },
    ...mapStores(useRuntimeStore, useUIOptionsStore)
  },
  methods: {
    async onPageAfterIn() {
      await this.load()
      if (this.searchFor) {
        this.$refs.searchbar.$el.f7Searchbar.search(this.searchFor)
      }
    },
    onPageBeforeOut() {
      this.stopEventSource()
      this.ohSearchbarRef.value?.persistSearchbarQuery()
    },
    async load() {
      if (this.loading) return
      this.loading = true
      this.initSearchbar = false

      await this.$oh.api.get('/rest/things?summary=true').then((data) => {
        this.things = data.sort((a, b) => (a.label || a.UID).localeCompare(b.label || a.UID))

        this.initSearchbar = true
        this.loading = false
        this.ready = true
        nextTick(() => {
          if (this.$refs.listIndex) this.$refs.listIndex.update()
          const searchbar = this.$refs.searchbar?.$el?.f7Searchbar
          if (this.$device.desktop && searchbar) {
            searchbar.$inputEl[0].focus()
          }
        })
        if (!this.eventSource) this.startEventSource()
      })
      this.loadInbox()
    },
    loadInbox() {
      this.$oh.api.get('/rest/inbox?includeIgnored=false').then((data) => {
        this.inbox = data
      })
    },
    switchGroupOrder(groupBy) {
      this.groupBy = groupBy
      const searchbar = this.$refs.searchbar.$el.f7Searchbar
      const filterQuery = searchbar.query
      nextTick(() => {
        if (filterQuery) {
          searchbar.clear()
          searchbar.search(filterQuery)
        }
        if (groupBy === 'alphabetical') this.$refs.listIndex.update()
      })
    },
    toggleCheck() {
      this.showCheckboxes = !this.showCheckboxes
    },
    selectDeselectAll() {
      if (this.allSelected) {
        this.selected = []
      } else {
        this.selected = Array.from(this.listedUids)
      }
    },
    isChecked(item) {
      return this.selected.indexOf(item) >= 0
    },
    click(event, item) {
      if (this.showCheckboxes) {
        this.toggleItemCheck(event, item.UID, item)
      } else {
        this.f7router.navigate(item.UID)
      }
    },
    ctrlClick(event, item) {
      this.toggleItemCheck(event, item.UID, item)
      if (!this.selected.length) this.showCheckboxes = false
    },
    toggleItemCheck(event, item) {
      if (!this.showCheckboxes) this.showCheckboxes = true
      if (this.isChecked(item)) {
        this.selected.splice(this.selected.indexOf(item), 1)
      } else {
        this.selected.push(item)
      }
    },
    removeSelected() {
      const vm = this

      f7.dialog.confirm(`Remove ${this.selected.length} selected things?`, 'Remove Things', () => {
        vm.doRemoveSelected()
      })
    },
    doRemoveSelected() {
      if (this.selected.some((i) => this.things.find((thing) => thing.UID === i).editable === false)) {
        f7.dialog.alert('Some of the selected things are not modifiable because they have been provisioned by files')
        return
      }

      let dialog = f7.dialog.progress('Deleting Things...')

      const promises = this.selected.map((i) => this.$oh.api.delete('/rest/things/' + i))
      Promise.all(promises)
        .then((data) => {
          showToast('Things removed')
          this.selected = []
          dialog.close()
          this.load()
        })
        .catch((err) => {
          dialog.close()
          this.load()
          console.error(err)
          f7.dialog.alert('An error occurred while deleting: ' + err)
        })
    },
    doDisableEnableSelected(enable) {
      let dialog = f7.dialog.progress('Please Wait...')

      const promises = this.selected.map((i) => this.$oh.api.putPlain('/rest/things/' + i + '/enable', enable.toString()))
      Promise.all(promises)
        .then((data) => {
          showToast(enable ? 'Things enabled' : 'Things disabled')
          this.selected = []
          dialog.close()
          this.load()
        })
        .catch((err) => {
          dialog.close()
          this.load()
          console.error(err)
          f7.dialog.alert('An error occurred while enabling/disabling: ' + err)
        })
    },
    startEventSource() {
      this.eventSource = this.$oh.sse.connect(
        '/rest/events?topics=openhab/things/*/added,openhab/things/*/removed,openhab/things/*/updated,openhab/things/*/status,openhab/inbox/*/added,openhab/inbox/*/removed',
        null,
        (event) => {
          const topicParts = event.topic.split('/')
          if (topicParts[1] === 'inbox') {
            this.loadInbox()
          } else {
            switch (topicParts[3]) {
              case 'status':
                // console.log('Received status update for thing', topicParts[2], 'with payload', event.payload)
                const updatedThing = this.things.find((t) => t.UID === topicParts[2])
                const newStatus = JSON.parse(event.payload)
                if (updatedThing) {
                  if (updatedThing.statusInfo.status !== newStatus.status) updatedThing.statusInfo.status = newStatus.status
                  if (updatedThing.statusInfo.statusDetail !== newStatus.statusDetail)
                    updatedThing.statusInfo.statusDetail = newStatus.statusDetail
                  if (updatedThing.statusInfo.description !== newStatus.description)
                    updatedThing.statusInfo.description = newStatus.description
                }
                break
              case 'added':
              case 'removed':
              case 'updated':
                this.load()
                break
            }
          }
        }
      )
    },
    stopEventSource() {
      this.$oh.sse.close(this.eventSource)
      this.eventSource = null
    }
  }
}
</script>
