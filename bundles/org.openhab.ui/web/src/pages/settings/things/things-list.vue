<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar>
      <oh-nav-content title="Things" back-link="Settings" back-link-url="/settings/" :f7router>
        <template #right>
          <f7-link
            icon-md="material:done_all"
            @click="selection.toggleSelectionMode()"
            :text="!theme.md ? (selection.selectionMode ? 'Done' : 'Select') : ''" />
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
          @update:tokenized-search="search.onUpdateTokenizedSearch" />
      </f7-subnavbar>
    </f7-navbar>
    <f7-toolbar v-if="selection.selectionMode" class="contextual-toolbar" :class="{ navbar: theme.md }" bottom-ios bottom-aurora>
      <list-selection-actions
        @close="selection.toggleSelectionMode"
        :remove-count="selectedDeletable.size"
        @remove="removeSelected"
        :copy-count="selection.selectedInFilter.size"
        @copy="copyFileDefinitionToClipboard(ObjectType.THING, [...selection.selectedInFilter])">
        <template #extra-actions>
          <list-selection-action-link
            text="Disable"
            :count="selectedDisablable.size"
            tooltip="Disable selected"
            icon-md="material:pause_circle_outline"
            icon-ios="f7:pause_circle"
            icon-aurora="f7:pause_circle"
            color="orange"
            @click="doDisableEnableSelected(false)" />
          <list-selection-action-link
            text="Enable"
            :count="selectedEnablable.size"
            tooltip="Enable selected"
            icon-md="material:play_circle_outline"
            icon-ios="f7:play_circle"
            icon-aurora="f7:play_circle"
            color="green"
            @click="doDisableEnableSelected(true)" />
        </template>
      </list-selection-actions>
    </f7-toolbar>

    <f7-list-index
      v-if="ready"
      v-show="groupBy === 'alphabetical' && !$device.desktop"
      ref="listIndex"
      list-el=".things-list"
      :scroll-list="true"
      :label="true" />

    <f7-block class="block-narrow">
      <!-- skeleton for not ready -->
      <f7-col v-if="!ready" v-deferred>
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
        <group-box
          :title="getListTitle(search.isFiltered, search.filteredResults.length, things.length, 'Thing', selection.selectedInFilter.size)">
          <template #after-title>
            <f7-link
              v-if="selection.selectionMode && search.filteredResults.length > 0"
              @click="selection.selectDeselectAll"
              :text="selection.allSelected ? 'Deselect all' : 'Select all'" />
            <label v-if="groupBy === 'location'" class="advanced-label">
              <f7-checkbox v-model:checked="showNoLocation" />
              Show no location
            </label>
          </template>
          <f7-list v-show="search.filteredResults.length > 0" class="col things-list" :contacts-list="groupBy === 'alphabetical'">
            <f7-list-group v-for="(resultsWithInitial, initial) in indexedResults" :key="initial">
              <f7-list-item v-if="resultsWithInitial.length > 0" :title="initial" group-title media-item />
              <f7-list-item
                v-for="({ item: thing, matches }, index) in resultsWithInitial"
                :key="index"
                media-item
                class="thinglist-item"
                :checkbox="selection.selectionMode"
                :checked="selection.isSelected(thing.UID)"
                :value="thing.UID"
                prevent-router
                @click.ctrl="selection.ctrlClick(thing.UID)"
                @click.meta="selection.ctrlClick(thing.UID)"
                @click.exact="click($event, thing)"
                :link="`${encodeURIComponent(thing.UID)}`">
                <template #title>
                  <span v-html="highlightMatches(thing.label, matches, 'label') || highlightMatches(thing.UID, matches, 'UID')"></span>
                </template>
                <template #footer>
                  <div>
                    <span v-html="highlightMatches(thing.UID, matches, 'UID')"></span>
                    <clipboard-icon :value="thing.UID" tooltip="Copy UID" />
                  </div>
                </template>

                <template #subtitle>
                  <div v-if="thing.location && groupBy !== 'location'">
                    <span v-html="highlightMatches(thing.location, matches, 'location')"></span>
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
        </group-box>
      </f7-col>
    </f7-block>

    <f7-block v-if="ready && !things.length" class="block-narrow">
      <empty-state-placeholder icon="lightbulb" title="things.title" text="things.text" />
      <f7-row v-if="$f7dim.width < BREAKPOINTS.LG" class="display-flex justify-content-center">
        <f7-button
          large
          fill
          color="theme-alt"
          external
          :href="`${runtimeStore.websiteUrl}/link/thing`"
          target="_blank"
          :text="$t('home.overview.button.documentation')" />
      </f7-row>
    </f7-block>

    <template #fixed>
      <f7-fab position="right-bottom" color="theme-alt" href="add/">
        <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus" />
      </f7-fab>
      <f7-fab position="center-bottom" :text="`Inbox (${inbox.length})`" :color="inbox.length > 0 ? 'red' : 'gray'" href="inbox">
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
    background-color var(--oh-theme-alt-color)
    border 1px solid var(--f7-list-bg-color)
    border-radius 50%
    pointer-events none
</style>

<script>
import { nextTick, reactive, shallowRef, useTemplateRef } from 'vue'
import { f7, theme } from 'framework7-vue'

import { useRuntimeStore } from '@/js/stores/useRuntimeStore'

import { thingStatusBadgeColor, thingStatusBadgeText } from '@/components/thing/thing-helpers'
import ClipboardIcon from '@/components/util/clipboard-icon.vue'
import OhSearchbar from '@/pages/oh-searchbar.vue'
import ListSelectionActions from '@/components/list/list-selection-actions.vue'
import ListSelectionActionLink from '@/components/list/list-selection-action-link.vue'
import FileDefinition from '@/pages/settings/file-definition-mixin'

import EmptyStatePlaceholder from '@/components/empty-state-placeholder.vue'
import { showToast, showConfirmDialog } from '@/js/dialog-promises'
import { BREAKPOINTS } from '@/js/constants/breakpoints'

import { useSearch } from '@/components/useSearch'
import { useSelection } from '@/components/useSelection'
import { getListTitle, highlightMatches } from '@/pages/list-helpers'

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
    OhSearchbar,
    ListSelectionActions,
    ListSelectionActionLink
  },
  setup() {
    const things = shallowRef([])
    const haystackFields = ['uid', 'label', 'location']
    const ohSearchbarRef = useTemplateRef('oh-searchbar')

    const runtimeStore = useRuntimeStore()

    const filtersDefinitions = {
      is: {
        label: 'Kind',
        getFn: (thing) => (thing.editable ? 'editable' : 'readonly'),
        options: ['Editable', 'Readonly']
      },
      uid: {
        label: 'UID',
        path: 'UID'
      },
      bridge: {
        label: 'Bridge',
        path: 'bridgeUID'
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

    const searchState = useSearch(things, {
      filtersDefinitions,
      haystackFields,
      uidField: 'UID',
      includeMatches: true
    })
    const search = reactive(searchState)
    const selection = reactive(useSelection(searchState.filteredUids))

    filtersDefinitions.status.options = () => search.getFuseValuesForField('statusInfo.status')
    filtersDefinitions.location.options = () => search.getFuseValuesForField('location')
    filtersDefinitions.binding.options = () => search.getFuseValuesForField('thingTypeUID')

    return {
      f7,
      theme,
      BREAKPOINTS,
      things,
      filtersDefinitions,
      search,
      selection,
      thingStatusBadgeColor,
      thingStatusBadgeText,
      getListTitle,
      haystackFields,
      highlightMatches,
      runtimeStore,
      ohSearchbarRef
    }
  },
  data() {
    return {
      ready: false,
      initSearchbar: false,
      loading: false,
      inbox: [],
      groupBy: 'alphabetical',
      showNoLocation: false,
      eventSource: null
    }
  },
  computed: {
    indexedResults() {
      if (this.groupBy === 'alphabetical') {
        return this.search.filteredResults.reduce((prev, result) => {
          const thing = result.item
          const initial = (thing.label || thing.UID).substring(0, 1).toUpperCase()
          if (!prev[initial]) {
            prev[initial] = []
          }
          prev[initial].push(result)

          return prev
        }, {})
      } else if (this.groupBy === 'binding') {
        const bindingGroups = this.search.filteredResults.reduce((prev, result) => {
          const thing = result.item
          const binding = thing.thingTypeUID.split(':')[0]
          if (!prev[binding]) {
            prev[binding] = []
          }
          prev[binding].push(result)

          return prev
        }, {})
        return Object.keys(bindingGroups)
          .sort((a, b) => a.localeCompare(b))
          .reduce((objEntries, key) => {
            objEntries[key] = bindingGroups[key]
            return objEntries
          }, {})
      } else {
        const locationGroups = this.search.filteredResults.reduce((prev, result) => {
          const thing = result.item
          if (!thing.location && !this.showNoLocation) return prev
          const location = thing.location || '- No location -'
          if (!prev[location]) {
            prev[location] = []
          }
          prev[location].push(result)

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
    selectedDeletable() {
      return new Set(
        this.things.filter((thing) => this.selection.selectedInFilter.has(thing.UID) && thing.editable !== false).map((thing) => thing.UID)
      )
    },
    selectedEnablable() {
      return new Set(
        this.things
          .filter((thing) => this.selection.selectedInFilter.has(thing.UID) && thing.statusInfo?.statusDetail === 'DISABLED')
          .map((thing) => thing.UID)
      )
    },
    selectedDisablable() {
      return new Set(
        this.things
          .filter((thing) => this.selection.selectedInFilter.has(thing.UID) && thing.statusInfo?.statusDetail !== 'DISABLED')
          .map((thing) => thing.UID)
      )
    }
  },
  methods: {
    async onPageAfterIn() {
      await this.load()
    },
    onPageBeforeOut() {
      this.stopEventSource()
      this.ohSearchbarRef?.persistSearchbarQuery()
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
          if (this.$device.desktop) {
            this.ohSearchbarRef?.focus()
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
    click(event, item) {
      if (this.selection.selectionMode) {
        this.selection.toggleItemSelection(item.UID)
      } else {
        this.f7router.navigate(item.UID)
      }
    },
    async removeSelected() {
      if (this.selection.selectedDeletable.size === 0) return
      if (
        !(await showConfirmDialog(
          `Remove ${this.selectedDeletable.size} of ${this.selection.selectedInFilter.size} selected things?`,
          'Remove Things'
        ))
      )
        return

      let dialog = f7.dialog.progress('Deleting Things...')
      const promises = [...this.selectedDeletable].map((i) => this.$oh.api.delete('/rest/things/' + i))
      try {
        await Promise.all(promises)
        showToast('Things removed')
      } catch (err) {
        console.error(err)
        f7.dialog.alert('An error occurred while deleting: ' + err)
      } finally {
        dialog.close()
        this.load()
      }
    },
    doDisableEnableSelected(enable) {
      let dialog = f7.dialog.progress('Please Wait...')

      const selectedSet = enable ? this.selectedEnablable : this.selectedDisablable

      const promises = [...selectedSet].map((uid) => this.$oh.api.putPlain('/rest/things/' + uid + '/enable', enable.toString()))
      Promise.all(promises)
        .then((data) => {
          showToast(enable ? 'Things enabled' : 'Things disabled')
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
