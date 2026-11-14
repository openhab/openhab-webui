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
        <group-box>
          <list-header>
            <template v-if="selection.selectionMode && search.filteredResults.length > 0" #before-title>
              <f7-checkbox
                :indeterminate="selection.someSelected && !selection.allSelected"
                :checked="selection.allSelected"
                @change="selection.selectDeselectAll" />
            </template>
            <template #title>
              {{ getListTitle(search.isFiltered, search.filteredResults.length, things.length, 'Thing', selection.selectedInFilter.size) }}
            </template>
            <template #view>
              <f7-segmented strong class="grouping-switch">
                <f7-button :active="groupBy === 'alphabetical'" @click="groupBy = 'alphabetical'">A-Z</f7-button>
                <f7-button :active="groupBy === 'binding'" @click="groupBy = 'binding'">Binding</f7-button>
                <f7-button :active="groupBy === 'location'" @click="groupBy = 'location'">Location</f7-button>
              </f7-segmented>
            </template>
          </list-header>

          <f7-list v-show="search.filteredResults.length > 0" class="col things-list" :contacts-list="groupBy === 'alphabetical'">
            <f7-list-group v-if="needsAttention.length > 0" class="needs-attention-group">
              <f7-list-item
                title="Needs Attention"
                media-item
                :after="needsAttention.length"
                class="needs-attention-title"
                accordion-item
                :accordion-item-opened="needsAttentionExpanded"
                @accordion:open="needsAttentionExpanded = true"
                @accordion:close="needsAttentionExpanded = false">
                <f7-accordion-content>
                  <thing-list-item
                    v-for="({ item: thing, matches }, index) in needsAttention"
                    :key="index"
                    :thing="thing"
                    :matches="matches"
                    :selection-mode="selection.selectionMode"
                    :selected="selection.isSelected(thing.UID)"
                    compact
                    @toggle-selection="selection.ctrlClick"
                    @activate="click" />
                </f7-accordion-content>
              </f7-list-item>
            </f7-list-group>
            <f7-list-group v-if="groupBy === 'location' && noLocation.length > 0" class="no-location-group">
              <f7-list-item
                title="-- No location --"
                media-item
                :after="noLocation.length"
                class="no-location-title"
                :show-chevron="true"
                :accordion-item="true"
                :accordion-item-opened="noLocationExpanded"
                @accordion:open="noLocationExpanded = true"
                @accordion:close="noLocationExpanded = false">
                <f7-accordion-content>
                  <thing-list-item
                    v-for="({ item: thing, matches }, index) in noLocation"
                    :key="index"
                    :thing="thing"
                    :matches="matches"
                    :selection-mode="selection.selectionMode"
                    :selected="selection.isSelected(thing.UID)"
                    compact
                    @toggle-selection="selection.ctrlClick"
                    @activate="click" />
                </f7-accordion-content>
              </f7-list-item>
            </f7-list-group>
            <f7-list-group v-for="(resultsWithInitial, initial) in indexedResults" :key="initial">
              <f7-list-item v-if="resultsWithInitial.length > 0" :title="initial" group-title media-item />
              <thing-list-item
                v-for="({ item: thing, matches }, index) in resultsWithInitial"
                :key="index"
                :thing="thing"
                :matches="matches"
                :selection-mode="selection.selectionMode"
                :selected="selection.isSelected(thing.UID)"
                :show-location="groupBy !== 'location'"
                @toggle-selection="selection.ctrlClick"
                @activate="click" />
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
      <f7-fab position="center-bottom" :text="`Inbox (${inbox.length})`" :color="inbox.length > 0 ? 'theme-alt' : 'gray'" href="inbox">
        <f7-icon f7="tray" />
      </f7-fab>
    </template>
  </f7-page>
</template>

<style lang="stylus">
.aurora .things-list
  --f7-list-group-title-height 22px

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
  .accordion-item
    > .item-link .item-content .item-inner
      height var(--f7-list-group-title-height) !important
      padding-top 0px
      padding-bottom 0px
      align-content center !important
    .item-content
    .item-inner
      min-height 0 !important
      .item-title
        font-weight 400 !important

  .needs-attention-group
    li.needs-attention-title > .item-link
      color var(--f7-color-red, #ff453a) !important
      background rgba(255, 69, 58, 0.18) !important
      font-weight 500 !important
    li.needs-attention-title
      color inherit !important
      background transparent !important
    li.needs-attention-title .item-after
      color var(--f7-color-red, #ff453a) !important
      font-weight 500 !important
    li.needs-attention-title > .accordion-item-content
      color var(--f7-text-color, inherit)
      background transparent
    ul:first-of-type li:first-child :after
      display none !important

  .no-location-group
    li.no-location-title > .item-link
      color var(--f7-list-group-title-text-color) !important
      background-color var(--f7-list-group-title-bg-color) !important
      font-weight var(--f7-list-group-title-font-weight) !important
      display block !important
      align-items center !important

.clipboard-icon
  margin-left 3px
</style>

<script>
import { nextTick, reactive, shallowRef, useTemplateRef } from 'vue'
import { useStorage } from '@vueuse/core'
import { f7, theme } from 'framework7-vue'

import { useRuntimeStore } from '@/js/stores/useRuntimeStore'

import ThingListItem from '@/components/thing/thing-list-item.vue'
import OhSearchbar from '@/pages/oh-searchbar.vue'
import ListSelectionActions from '@/components/list/list-selection-actions.vue'
import ListSelectionActionLink from '@/components/list/list-selection-action-link.vue'
import ListHeader from '@/components/list/list-header.vue'
import FileDefinition from '@/pages/settings/file-definition-mixin'

import EmptyStatePlaceholder from '@/components/empty-state-placeholder.vue'
import { showToast, showConfirmDialog } from '@/js/dialog-promises'
import { BREAKPOINTS } from '@/js/constants/breakpoints'

import { useSearch } from '@/components/useSearch'
import { useSelection } from '@/components/useSelection'
import { getListTitle } from '@/pages/list-helpers'

const storagePrefix = 'openhab.ui:things:'

export default {
  mixins: [FileDefinition],
  props: {
    searchFor: String,
    f7route: Object,
    f7router: Object
  },
  components: {
    EmptyStatePlaceholder,
    ThingListItem,
    OhSearchbar,
    ListSelectionActions,
    ListSelectionActionLink,
    ListHeader
  },
  setup() {
    const things = shallowRef([])
    const haystackFields = ['uid', 'label', 'location']
    const ohSearchbarRef = useTemplateRef('oh-searchbar')

    const runtimeStore = useRuntimeStore()

    const groupBy = useStorage(storagePrefix + 'pagesGroupBy', 'alphabetical', sessionStorage)
    const needsAttentionExpanded = useStorage(storagePrefix + 'needsAttentionExpanded', true, sessionStorage)
    const noLocationExpanded = useStorage(storagePrefix + 'noLocationExpanded', false, sessionStorage)

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
      getListTitle,
      haystackFields,
      runtimeStore,
      ohSearchbarRef,
      groupBy,
      needsAttentionExpanded,
      noLocationExpanded
    }
  },
  data() {
    return {
      ready: false,
      initSearchbar: false,
      loading: false,
      inbox: [],
      eventSource: null
    }
  },
  computed: {
    needsAttention() {
      return this.search.filteredResults.filter((result) => result.item.statusInfo?.status === 'OFFLINE')
    },
    noLocation() {
      return this.search.filteredResults.filter((result) => !result.item.location)
    },
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
          if (!thing.location) return prev
          if (!prev[thing.location]) {
            prev[thing.location] = []
          }
          prev[thing.location].push(result)

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
        this.things.filter((thing) => this.selection.selectedInFilter.has(thing.UID) && thing.editable).map((thing) => thing.UID)
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
  watch: {
    groupBy(newValue, oldValue) {
      if (newValue === 'alphabetical' && this.$refs.listIndex) {
        this.$refs.listIndex.update()
      }
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
    click(event, item) {
      if (this.selection.selectionMode) {
        this.selection.toggleItemSelection(item.UID)
      } else {
        this.f7router.navigate(item.UID)
      }
    },
    async removeSelected() {
      if (this.selectedDeletable.size === 0) return
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
