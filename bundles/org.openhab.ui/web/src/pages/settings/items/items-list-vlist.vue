<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar>
      <oh-nav-content title="Items" back-link="Settings" back-link-url="/settings/" :f7router>
        <template #right>
          <f7-link icon-md="material:done_all" @click="toggleCheck()" :text="!theme.md ? (showCheckboxes ? 'Done' : 'Select') : ''" />
        </template>
      </oh-nav-content>
      <f7-subnavbar v-show="initSearchbar" :inner="false">
        <!-- Only render searchbar, if page is ready. Otherwise searchbar is broken after changes to the Items list. -->
        <f7-searchbar
          v-if="initSearchbar"
          ref="searchbar"
          class="searchbar-items"
          custom-search
          :placeholder="searchbarPlaceholder"
          :disable-button="!theme.aurora" />
      </f7-subnavbar>
    </f7-navbar>

    <f7-toolbar v-if="showCheckboxes" class="contextual-toolbar" :class="{ navbar: theme.md }" bottom-ios bottom-aurora>
      <div v-if="!theme.md && selectedItems.length > 0" class="display-flex justify-content-center" style="width: 100%">
        <f7-link
          v-show="selectedItems.length"
          color="red"
          class="delete display-flex flex-direction-row margin-right"
          icon-ios="f7:trash"
          icon-aurora="f7:trash"
          @click="removeSelected">
          Remove
        </f7-link>
        <f7-link
          v-show="selectedItems.length"
          color="blue"
          class="copy display-flex flex-direction-row"
          icon-ios="f7:square_on_square"
          icon-aurora="f7:square_on_square"
          @click="copySelected">
          &nbsp;Copy
        </f7-link>
      </div>
      <f7-link v-if="theme.md" icon-md="material:close" icon-color="white" @click="showCheckboxes = false" />
      <div v-if="theme.md" class="title">{{ selectedItems.length }} selected</div>
      <div v-if="theme.md && selectedItems.length" class="right">
        <f7-link icon-md="material:delete" icon-color="white" @click="removeSelected" />
        <f7-link icon-md="material:content_copy" icon-color="white" @click="copySelected" />
      </div>
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
      <f7-col v-show="!ready">
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
        <f7-block-title class="no-margin-top">
          <span>{{ getListTitle(searchString.toString().length !== 0, filteredList.length, items.length, 'Item', selected.length) }}</span>
          <template v-if="showCheckboxes && filteredList.length">
            -
            <f7-link @click="selectDeselectAll" :text="allSelected ? 'Deselect all' : 'Select all'" />
          </template>
        </f7-block-title>
        <list-filter
          v-if="ready"
          ref="filters"
          :selected="selectedListFilters"
          @update:selected="onUpdateSelectedListFilters"
          :filtersDefinitions="filtersDefinitions" />

        <f7-list v-if="!filteredList.length">
          <f7-list-item title="Nothing found" />
        </f7-list>
        <f7-list class="searchbar-found col" ref="itemsList" media-list virtual-list :virtual-list-params="vlParams">
          <ul>
            <f7-list-item
              v-for="(item, index) in vlData.items"
              :key="index"
              media-item
              class="itemlist-item"
              :checkbox="showCheckboxes"
              :checked="isChecked(item.name)"
              prevent-router
              @click.ctrl="ctrlClick($event, item)"
              @click.meta="ctrlClick($event, item)"
              @click.exact="click($event, item)"
              :link="`${encodeURIComponent(item.name)}`"
              :title="item.label ? item.label : item.name"
              :footer="item.label ? item.name : '\xa0'"
              :subtitle="getItemTypeAndMetaLabel(item)"
              :style="`top: ${vlData.topPosition}px`"
              :after="item.state ? item.state : '\xa0'">
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
              <!-- <f7-button color="blue" icon-f7="compose" icon-size="24px" :link="`${item.name}/edit`"></f7-button> -->
              <template #subtitle>
                <div>
                  <f7-chip v-for="tag in getNonSemanticTags(item)" :key="tag" :text="tag" media-bg-color="blue" style="margin-right: 6px">
                    <template #media>
                      <f7-icon ios="f7:tag_fill" md="material:label" aurora="f7:tag_fill" />
                    </template>
                  </f7-chip>
                </div>
              </template>
            </f7-list-item>
          </ul>
        </f7-list>
      </f7-col>
    </f7-block>

    <f7-block v-if="ready && !items.length" class="block-narrow">
      <empty-state-placeholder icon="square_on_circle" title="items.title" text="items.text" />
      <f7-row v-if="$f7dim.width < 1280" class="display-flex justify-content-center">
        <f7-button
          large
          fill
          color="blue"
          external
          :href="`${runtimeStore.websiteUrl}/link/items`"
          target="_blank"
          :text="$t('home.overview.button.documentation')" />
      </f7-row>
    </f7-block>

    <template #fixed>
      <f7-fab v-show="!showCheckboxes" position="center-bottom" text="Refresh" color="blue" @click="load()">
        <f7-icon ios="f7:arrow_clockwise" md="material:refresh" aurora="f7:arrow_clockwise" />
      </f7-fab>
      <f7-fab v-show="!showCheckboxes" position="right-bottom" color="blue" href="add">
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
import { nextTick } from 'vue'
import { f7, theme } from 'framework7-vue'
import { mapStores } from 'pinia'

import { useRuntimeStore } from '@/js/stores/useRuntimeStore'
import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'

import * as Types from '@/assets/item-types'
import ItemMixin from '@/components/item/item-mixin'
import { getItemTypeAndMetaLabel, getNonSemanticTags } from '@/components/item/item-helpers'
import FileDefinition from '@/pages/settings/file-definition-mixin'

import EmptyStatePlaceholder from '@/components/empty-state-placeholder.vue'
import ListFilter from '@/components/util/list-filter.vue'
import { showToast } from '@/js/dialog-promises'
import { useSearch } from '@/components/useSearch'
import { getListTitle } from '@/pages/list-helpers'

export default {
  mixins: [ItemMixin, FileDefinition],
  props: {
    f7router: Object
  },
  components: {
    ListFilter,
    EmptyStatePlaceholder
  },
  setup() {
    const filtersDefinitions = {
      kind: {
        label: 'Kind',
        options: { editable: 'Editable', readonly: 'Non-editable' },
        singleSelect: true,
        searchbarKeyword: 'is',
        keywordChecker: (item, value) => (value.toLowerCase() == 'editable' ? !!item.editable : !item.editable)
      },
      type: {
        label: 'Item Type',
        options: Object.fromEntries(Types.ItemTypes.map((type) => [type.toLowerCase(), type])),
        keywordChecker: (item, value) => searchValue(item.type, value) || (item.type === 'Group' && searchValue(item.groupType, value))
      },
      group: {
        label: 'Group',
        options: {},
        advanced: true,
        keywordChecker: (item, value) => searchValue(item.groupNames, value)
      },
      tag: {
        label: 'Tag',
        options: {},
        advanced: true,
        keywordChecker: (item, value) => searchValue(item.tags, value)
      },
      state: {
        label: 'State',
        options: {},
        advanced: true,
        keywordChecker: (item, value) => searchValue(item.state + ' ' + item.displayState, value)
      },
      unit: {
        label: 'Unit',
        options: {},
        advanced: true,
        keywordChecker: (item, value) => searchValue(item.unitSymbol, value)
      },
      semantics: {
        label: 'Semantics',
        options: {},
        advanced: true,
        keywordChecker: (item, value) => searchValue(item.metadata?.semantics?.value, value)
      },
      metadata: {
        label: 'Metadata',
        options: {},
        advanced: true,
        keywordChecker: (item, value) => (item.metadata ? searchValue(Object.keys(item.metadata), value) : false)
      }
    }

    const haystackFunc = (item) => [item.name, item.label, getItemTypeAndMetaLabel(item)].join(' ').toLowerCase()

    const {
      search,
      searchString,
      searchValue,
      selectedListFilters,
      onUpdateSelectedListFilters,
      persistSearchbarQuery,
      restoreSearchbarQuery
    } = useSearch('searchbar', haystackFunc, {
      filtersDefinitions,
      persistSearchStringKey: 'items-query'
    })

    return {
      f7,
      theme,
      filtersDefinitions,
      selectedListFilters,
      search,
      searchString,
      searchValue,
      onUpdateSelectedListFilters,
      persistSearchbarQuery,
      restoreSearchbarQuery,
      getListTitle,
      getNonSemanticTags,
      getItemTypeAndMetaLabel
    }
  },
  data() {
    return {
      ready: false,
      initSearchbar: false,
      loading: false,
      items: [], // [{ label: 'Staircase', name: 'Staircase'}],
      vlData: {
        items: []
      },
      vlParams: {
        items: [],
        searchAll: this.searchAll,
        renderExternal: this.renderExternal,
        height: this.height
      },
      filteredList: [],
      selected: [],
      showCheckboxes: false,
      eventSource: null
    }
  },
  methods: {
    async onPageAfterIn(event) {
      await this.load()
      this.restoreSearchbarQuery()
    },
    onPageBeforeOut(event) {
      this.stopEventSource()
      this.persistSearchbarQuery()
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

        const { tagSet, unitSet, semanticsSet, groupSet, metadataSet } = this.items.reduce(
          (acc, item) => {
            if (item.metadata) console.log('item', Object.keys(item.metadata))
            if (item.tags) item.tags.forEach((tag) => acc.tagSet.add(tag))
            if (item.unitSymbol) acc.unitSet.add(item.unitSymbol)
            if (item.metadata?.semantics?.value) item.metadata.semantics.value.split('_').forEach((sem) => acc.semanticsSet.add(sem))
            if (item.groupNames) item.groupNames.forEach((group) => acc.groupSet.add(group))
            if (item.metadata) Object.keys(item.metadata).forEach((metadata) => acc.metadataSet.add(metadata))
            return acc
          },
          { tagSet: new Set(), unitSet: new Set(), semanticsSet: new Set(), groupSet: new Set(), metadataSet: new Set() }
        )
        this.filtersDefinitions.tag.options = Object.fromEntries([...tagSet].sort().map((tag) => [tag.toLowerCase(), tag]))
        this.filtersDefinitions.unit.options = Object.fromEntries([...unitSet].sort().map((unit) => [unit.toLowerCase(), unit]))
        this.filtersDefinitions.semantics.options = Object.fromEntries([...semanticsSet].sort().map((sem) => [sem.toLowerCase(), sem]))
        this.filtersDefinitions.group.options = Object.fromEntries([...groupSet].sort().map((group) => [group.toLowerCase(), group]))
        this.filtersDefinitions.metadata.options = Object.fromEntries(
          [...metadataSet].sort().map((metadata) => [metadata.toLowerCase(), metadata])
        )

        this.initSearchbar = true
        this.loading = false

        if (!this.eventSource) this.startEventSource()
        this.ready = true

        nextTick(() => {
          this.$refs.itemsList.$el.f7VirtualList.replaceAllItems(this.items)
          this.updateListedItems()

          const searchbar = this.$refs.searchbar?.$el.f7Searchbar
          if (this.$device.desktop && searchbar) {
            searchbar.$inputEl[0].focus()
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
    height(item) {
      let vlHeight
      if (theme.ios) vlHeight = 79.19
      if (theme.aurora) vlHeight = 66.37
      if (theme.md) vlHeight = 79.39
      if (this.$device.macos) {
        if (window.navigator.userAgent.includes('Safari') && !window.navigator.userAgent.includes('Chrome')) vlHeight -= 0.77
      }

      const nonSemanticTags = getNonSemanticTags(item)
      if (nonSemanticTags.length > 0) {
        vlHeight += 28
        if (theme.ios) vlHeight += 4
        if (theme.md) vlHeight += 6
      }
      return vlHeight
    },
    toggleCheck() {
      this.showCheckboxes = !this.showCheckboxes
    },
    isChecked(item) {
      return this.selected.indexOf(item) >= 0
    },
    click(event, item) {
      if (this.showCheckboxes) {
        this.toggleItemCheck(event, item.name, item)
      } else {
        this.f7router.navigate(item.name)
      }
    },
    ctrlClick(event, item) {
      this.toggleItemCheck(event, item.name, item)
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
    selectDeselectAll() {
      if (this.allSelected) {
        this.selected = []
      } else {
        this.selected = this.filteredList.map((i) => i.name)
      }
    },
    copySelected() {
      this.copyFileDefinitionToClipboard(this.ObjectType.ITEM, this.selected)
    },
    removeSelected() {
      const vm = this

      f7.dialog.confirm(`Remove ${this.selected.length} selected items?`, 'Remove Items', () => {
        vm.doRemoveSelected()
      })
    },
    doRemoveSelected() {
      if (this.selected.some((i) => i.editable === false)) {
        f7.dialog.alert('Some of the selected items are not modifiable because they have been created by textual configuration')
        return
      }

      let dialog = f7.dialog.progress('Deleting Items...')

      const promises = this.selected.map((i) => this.$oh.api.delete('/rest/items/' + i))
      Promise.all(promises)
        .then((data) => {
          showToast('Items removed')
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
    updateListedItems() {
      this.$nextTick(() => {
        this.filteredList = this.$refs.itemsList.$el.f7VirtualList.filteredItems || this.$refs.itemsList.$el.f7VirtualList.items || []
      })
    }
  },
  watch: {
    ready() {
      this.updateListedItems()
    },
    searchString: {
      handler() {
        const matches = this.search(this.items, 'indicies')
        this.$refs.itemsList?.$el.f7VirtualList.filterItems(matches)
        this.updateListedItems()
      },
      deep: true
    }
  },
  computed: {
    searchbarPlaceholder() {
      return window.innerWidth >= 1280 ? 'Search (for advanced search, use the developer sidebar (Shift+Alt+D))' : 'Search'
    },
    allSelected() {
      return this.selected.length >= this.filteredList.length && this.filteredList.length > 0
    },
    ...mapStores(useRuntimeStore, useUIOptionsStore)
  }
}
</script>
