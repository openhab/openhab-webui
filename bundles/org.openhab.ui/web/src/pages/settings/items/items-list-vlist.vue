<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar>
      <oh-nav-content title="Items" back-link="Settings" back-link-url="/settings/" :f7router>
        <template #right>
          <f7-link
            icon-md="material:done_all"
            @click="selection.toggleSelectionMode"
            :text="!theme.md ? (selection.selectionMode ? 'Done' : 'Select') : ''" />
        </template>
      </oh-nav-content>
      <f7-subnavbar v-show="initSearchbar" :inner="false">
        <!-- Only render searchbar, if page is ready. Otherwise searchbar is broken after changes to the Items list. -->
        <oh-searchbar
          v-if="initSearchbar"
          ref="oh-searchbar"
          class="searchbar-items"
          :persist-search-string-key="'items-search-string'"
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
        @copy="copySelected" />
    </f7-toolbar>

    <f7-block class="block-narrow margin-top-half">
      <f7-col>
        <div>
          <f7-block-footer class="no-margin-top margin-bottom" style="padding-left: 16px; padding-right: 16px">
            Note: Item states are not updated in real-time. Click the refresh button to update.
          </f7-block-footer>
        </div>
      </f7-col>

      <!-- skeleton for not ready -->
      <f7-col v-if="!ready" v-deferred>
        <f7-block-title class="no-margin-top"> &nbsp;Loading... </f7-block-title>
        <f7-list media-list class="col wide">
          <f7-list-group>
            <f7-list-item
              v-for="n in 20"
              media-item
              :key="n"
              :class="`skeleton-text skeleton-effect-blink`"
              title="Label of the item"
              subtitle="type, semantic metadata"
              after="The item state"
              footer="This contains the type of the item">
              <template #media>
                <f7-skeleton-block style="width: 32px; height: 32px; border-radius: 50%" />
              </template>
            </f7-list-item>
          </f7-list-group>
        </f7-list>
      </f7-col>

      <f7-col v-if="ready && items.length > 0">
        <group-box
          :title="getListTitle(search.isFiltered, search.filteredResults.length, items.length, 'Item', selection.selectedInFilter.size)">
          <template v-if="selection.selectionMode && search.filteredResults.length > 0" #after-title>
            <f7-link @click="selection.selectDeselectAll" :text="selection.allSelected ? 'Deselect all' : 'Select all'" />
          </template>
          <f7-list class="searchbar-found col" ref="itemsList" media-list virtual-list :virtual-list-params="vlParams">
            <ul>
              <f7-list-item
                v-for="({ item, fuseMatches }, index) in vlData.items"
                :key="index"
                media-item
                class="itemlist-item"
                :checkbox="selection.selectionMode"
                :checked="selection.isSelected(item.name)"
                prevent-router
                @click.ctrl="selection.ctrlClick(item.name)"
                @click.meta="selection.ctrlClick(item.name)"
                @click.exact="click($event, item)"
                :link="`${encodeURIComponent(item.name)}`"
                :style="`top: ${vlData.topPosition}px`">
                <template #title>
                  <span
                    v-html="
                      item.label ? highlightMatches(item.label, fuseMatches, 'label') : highlightMatches(item.name, fuseMatches, 'name')
                    "></span>
                </template>
                <template #footer>
                  <span v-html="item.label ? highlightMatches(item.name, fuseMatches, 'name') : '\xa0'"></span>
                </template>
                <template #after>
                  <span v-html="item.state ? highlightMatches(item.state, fuseMatches, 'state') : '\xa0'"></span>
                </template>
                <!-- Note: Using dynamic states is not possible since state tracking has a heavy performance impact -->
                <template #media>
                  <oh-icon
                    v-if="item.category"
                    :icon="item.category"
                    :state="item.type === 'Image' ? null : item.state"
                    height="32"
                    width="32" />
                  <span v-else class="item-initial">{{ item.name[0] }}</span>
                </template>
                <template #after-title>
                  <f7-icon v-if="!item.editable" f7="lock_fill" size="1rem" color="gray" />
                </template>
                <!-- <f7-button color="theme-alt" icon-f7="compose" icon-size="24px" :link="`${item.name}/edit`"></f7-button> -->
                <template #subtitle>
                  <span v-html="highlightMatches(getItemTypeLabel(item), fuseMatches, 'type')"></span>
                  <span
                    v-if="getItemSemanticLabel(item)"
                    v-html="' · ' + highlightMatches(getItemSemanticLabel(item), fuseMatches, 'semantics')"></span>
                  <!-- {{  getItemTypeLabel(item) + ' · ' + getItemSemanticLabel(item) }} -->
                  <div>
                    <f7-chip
                      v-for="tag in getNonSemanticTags(item)"
                      :key="tag"
                      :text="tag"
                      media-bg-color="theme-alt"
                      style="margin-right: 6px">
                      <template #media>
                        <f7-icon ios="f7:tag_fill" md="material:label" aurora="f7:tag_fill" />
                      </template>
                    </f7-chip>
                  </div>
                </template>
              </f7-list-item>
            </ul>
          </f7-list>
        </group-box>
      </f7-col>
    </f7-block>

    <f7-block v-if="ready && !items.length" class="block-narrow">
      <empty-state-placeholder icon="square_on_circle" title="items.title" text="items.text" />
      <f7-row v-if="$f7dim.width < BREAKPOINTS.LG" class="display-flex justify-content-center">
        <f7-button
          large
          fill
          color="theme-alt"
          external
          :href="`${runtimeStore.websiteUrl}/link/items`"
          target="_blank"
          :text="$t('home.overview.button.documentation')" />
      </f7-row>
    </f7-block>

    <template #fixed>
      <f7-fab v-show="!selection.selectionMode" position="center-bottom" text="Refresh" color="theme-alt" @click="load()">
        <f7-icon ios="f7:arrow_clockwise" md="material:refresh" aurora="f7:arrow_clockwise" />
      </f7-fab>
      <f7-fab v-show="!selection.selectionMode" position="right-bottom" color="theme-alt" href="add">
        <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus" />
      </f7-fab>
    </template>
  </f7-page>
</template>

<style lang="stylus">
.itemlist-item .item-after
  overflow hidden
  max-width 30%
  span
    overflow hidden
    text-overflow ellipsis
</style>

<script>
import { nextTick, reactive, shallowRef, useTemplateRef } from 'vue'
import { f7, theme } from 'framework7-vue'
import { BREAKPOINTS } from '@/js/constants/breakpoints'

import { useRuntimeStore } from '@/js/stores/useRuntimeStore'

import { getItemTypeLabel, getItemSemanticLabel, getNonSemanticTags } from '@/components/item/item-helpers'
import FileDefinition from '@/pages/settings/file-definition-mixin'

import EmptyStatePlaceholder from '@/components/empty-state-placeholder.vue'
import OhSearchbar from '@/pages/oh-searchbar.vue'
import ListSelectionActions from '@/components/list/list-selection-actions.vue'
import { showToast, showConfirmDialog } from '@/js/dialog-promises'
import { useSearch } from '@/components/useSearch'
import { useSelection } from '@/components/useSelection'
import { getListTitle, highlightMatches } from '@/pages/list-helpers'

export default {
  mixins: [FileDefinition],
  props: {
    f7router: Object
  },
  components: {
    EmptyStatePlaceholder,
    OhSearchbar,
    ListSelectionActions
  },
  setup() {
    const items = shallowRef([])
    const haystackFields = ['name', 'label', 'type', 'semantics']
    const ohSearchbarRef = useTemplateRef('oh-searchbar')

    const runtimeStore = useRuntimeStore()

    const filtersDefinitions = {
      is: {
        label: 'Kind',
        singleSelect: true,
        getFn: (item) => (item.editable ? 'editable' : 'readonly'),
        options: ['Editable', 'Readonly']
      },
      name: {
        label: 'Name',
        path: 'name'
      },
      label: {
        label: 'Label',
        path: 'label'
      },
      type: {
        label: 'Item Type',
        getFn: (item) => getItemTypeLabel(item)
      },
      group: {
        label: 'Members of Group',
        path: 'groupNames'
      },
      tag: {
        label: 'Tag',
        path: 'tags'
      },
      state: {
        // test
        label: 'State',
        getFn: (item) => item.state + (item.displayState ? ' ' + item.displayState : '')
      },
      unit: {
        label: 'Unit',
        path: 'unitSymbol'
      },
      semantics: {
        label: 'Semantics',
        getFn: (item) => getItemSemanticLabel(item)
      },
      metadata: {
        label: 'Metadata',
        getFn: (item) => (item.metadata ? Object.keys(item.metadata) : [])
      }
    }

    const searchState = useSearch(items, {
      filtersDefinitions,
      haystackFields,
      uidField: 'name',
      includeMatches: true
    })
    const search = reactive(searchState)
    const selection = reactive(useSelection(searchState.filteredUids))

    filtersDefinitions.type.options = () => search.getFuseValuesForField('type')
    filtersDefinitions.group.options = () => search.getFuseValuesForField('group')
    filtersDefinitions.tag.options = () => search.getFuseValuesForField('tag')
    filtersDefinitions.unit.options = () => search.getFuseValuesForField('unit')
    filtersDefinitions.semantics.options = () => search.getFuseValuesForField('semantics')
    filtersDefinitions.metadata.options = () => search.getFuseValuesForField('metadata')

    return {
      f7,
      theme,
      runtimeStore,
      BREAKPOINTS,
      items,
      filtersDefinitions,
      search,
      selection,
      getListTitle,
      getNonSemanticTags,
      getItemTypeLabel,
      getItemSemanticLabel,
      highlightMatches,
      ohSearchbarRef,
      haystackFields
    }
  },
  data() {
    return {
      ready: false,
      initSearchbar: false,
      loading: false,
      vlData: {
        items: []
      },
      vlParams: {
        items: [],
        searchAll: this.searchAll,
        renderExternal: this.renderExternal,
        height: this.height
      },
      eventSource: null
    }
  },
  computed: {
    selectedDeletable() {
      return new Set(this.items.filter((item) => this.selection.selectedInFilter.has(item.name) && item.editable).map((item) => item.name))
    }
  },
  methods: {
    async onPageAfterIn(event) {
      await this.load()
    },
    onPageBeforeOut(event) {
      this.stopEventSource()
      this.ohSearchbarRef?.persistSearchbarQuery()
    },
    syncVirtualList() {
      const f7VirtualList = this.$refs.itemsList?.$el.f7VirtualList
      if (!f7VirtualList) return

      f7VirtualList.replaceAllItems(
        this.search.filteredResults.map((result) => ({ item: { ...result.item }, fuseMatches: result.matches }))
      )
    },
    async load() {
      if (this.loading) return
      this.loading = true
      this.initSearchbar = false

      await this.$oh.api.get('/rest/items').then((data) => {
        this.items = data.sort((a, b) => {
          const labelA = a.label || a.name
          const labelB = b.label || b.name
          return labelA.localeCompare(labelB)
        })

        this.initSearchbar = true
        this.loading = false

        if (!this.eventSource) this.startEventSource()
        this.ready = true

        nextTick(() => {
          this.syncVirtualList()
          if (this.$device.desktop) {
            this.ohSearchbarRef?.focus()
          }

          // This should no longer be needed now that we are awaiting the load() function, but leaving it in for now just in case.
          // Hard refresh can leave the virtual list measured at zero height until
          // the page is fully visible, so trigger one delayed remeasure.
          setTimeout(() => {
            window.dispatchEvent(new Event('resize'))
          }, 100)
        })
      })
    },
    startEventSource() {
      this.eventSource = this.$oh.sse.connect(
        '/rest/events?topics=openhab/items/*/added,openhab/items/*/removed,openhab/items/*/updated',
        null,
        (event) => {
          const topicParts = event.topic.split('/')
          switch (topicParts[3]) {
            case 'added':
            case 'removed':
            case 'updated':
              this.load()
              break
          }
        }
      )
    },
    stopEventSource() {
      this.$oh.sse.close(this.eventSource)
      this.eventSource = null
    },
    renderExternal(vl, vlData) {
      this.vlData = vlData
    },
    height({ item }) {
      let vlHeight
      if (theme.ios) vlHeight = 79.19
      if (theme.aurora) vlHeight = 66.37
      if (theme.md) vlHeight = 79.39
      if (this.$device.macos) {
        if (window.navigator.userAgent.includes('Safari') && !window.navigator.userAgent.includes('Chrome')) vlHeight -= 0.77
      }

      // Virtual list can briefly request height for missing rows while data/filter state updates.
      if (!item) return vlHeight

      const nonSemanticTags = getNonSemanticTags(item)
      if (nonSemanticTags.length > 0) {
        vlHeight += 28
        if (theme.ios) vlHeight += 4
        if (theme.md) vlHeight += 6
      }
      return vlHeight
    },
    click(event, item) {
      if (this.selection.selectionMode) {
        this.selection.toggleItemSelection(item.name)
      } else {
        this.f7router.navigate(item.name)
      }
    },
    copySelected() {
      this.copyFileDefinitionToClipboard(this.ObjectType.ITEM, [...this.selection.selectedInFilter])
    },
    async removeSelected() {
      if (this.selectedDeletable.size === 0) return
      if (
        !(await showConfirmDialog(
          `Remove ${this.selectedDeletable.size} of ${this.selection.selectedInFilter.size} selected items?`,
          'Remove Items'
        ))
      )
        return

      let dialog = f7.dialog.progress('Deleting Items...')
      const promises = [...this.selectedDeletable].map((i) => this.$oh.api.delete('/rest/items/' + i))
      try {
        await Promise.all(promises)
        showToast('Items removed')
      } catch (err) {
        console.error(err)
        f7.dialog.alert('An error occurred while deleting: ' + err)
      } finally {
        dialog.close()
        this.load()
      }
    }
  },
  watch: {
    'search.filteredResults'() {
      this.syncVirtualList()
    }
  }
}
</script>
