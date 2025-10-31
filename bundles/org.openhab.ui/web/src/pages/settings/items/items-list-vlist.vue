<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar>
      <oh-nav-content title="Items"
                      back-link="Settings"
                      back-link-url="/settings/"
                      :f7router>
        <template #right>
          <f7-link icon-md="material:done_all"
                   @click="toggleCheck()"
                   :text="(!theme.md) ? ((showCheckboxes) ? 'Done' : 'Select') : ''" />
        </template>
      </oh-nav-content>
      <f7-subnavbar :inner="false" v-show="initSearchbar">
        <!-- Only render searchbar, if page is ready. Otherwise searchbar is broken after changes to the Items list. -->
        <f7-searchbar
          v-if="initSearchbar"
          ref="searchbar"
          class="searchbar-items"
          search-container=".virtual-list"
          @searchbar:search="searchbarSearch"
          :placeholder="searchbarPlaceholder"
          :disable-button="!theme.aurora" />
      </f7-subnavbar>
    </f7-navbar>

    <f7-toolbar v-if="showCheckboxes"
                class="contextual-toolbar"
                :class="{ navbar: theme.md }"
                bottom-ios
                bottom-aurora>
      <div v-if="!theme.md && selectedItems.length > 0" class="display-flex justify-content-center" style="width: 100%">
        <f7-link v-show="selectedItems.length"
                 color="red"
                 class="delete display-flex flex-direction-row margin-right"
                 icon-ios="f7:trash"
                 icon-aurora="f7:trash"
                 @click="removeSelected">
          Remove
        </f7-link>
        <f7-link v-show="selectedItems.length"
                 color="blue"
                 class="copy display-flex flex-direction-row"
                 icon-ios="f7:square_on_square"
                 icon-aurora="f7:square_on_square"
                 @click="copySelected">
          &nbsp;Copy
        </f7-link>
      </div>
      <f7-link v-if="theme.md"
               icon-md="material:close"
               icon-color="white"
               @click="showCheckboxes = false" />
      <div v-if="theme.md" class="title">
        {{ selectedItems.length }} selected
      </div>
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
        <f7-block-title class="no-margin-top">
          &nbsp;Loading...
        </f7-block-title>
        <f7-list media-list class="col wide">
          <f7-list-group>
            <f7-list-item
              media-item
              v-for="n in 20"
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

      <f7-col v-show="ready && items.length > 0">
        <f7-block-title class="no-margin-top">
          <span>{{ listTitle }}</span>
          <template v-if="showCheckboxes && listedItems.length">
            -
            <f7-link @click="selectDeselectAll" :text="allSelected ? 'Deselect all' : 'Select all'" />
          </template>
        </f7-block-title>
        <list-filter v-if="ready"
                     ref="filters"
                     :filters="filters"
                     @toggled="processFilter"
                     @reset="resetFilter" />

        <f7-list v-if="!listedItems.length">
          <f7-list-item title="Nothing found" />
        </f7-list>
        <f7-list
          v-show="listedItems.length > 0"
          class="searchbar-found col"
          ref="itemsList"
          media-list
          virtual-list
          :virtual-list-params="vlParams">
          <ul>
            <f7-list-item
              v-for="(item, index) in vlData.items"
              :key="index"
              media-item
              class="itemlist-item"
              :checkbox="showCheckboxes"
              :checked="isChecked(item.name)"
              @click.ctrl="(e) => ctrlClick(e, item)"
              @click.meta="(e) => ctrlClick(e, item)"
              @click.exact="(e) => click(e, item)"
              link=""
              :title="(item.label) ? item.label : item.name"
              :footer="(item.label) ? item.name : '\xa0'"
              :subtitle="getItemTypeAndMetaLabel(item)"
              :style="`top: ${vlData.topPosition}px`"
              :after="(item.state) ? item.state : '\xa0'">
              <!-- Note: Using dynamic states is not possible since state tracking has a heavy performance impact -->
              <template #media>
                <oh-icon v-if="item.category"
                         :icon="item.category"
                         :state="item.type === 'Image' ? null : item.state"
                         height="32"
                         width="32" />
                <span v-else class="item-initial">{{ item.name[0] }}</span>
              </template>
              <template #after-title>
                <f7-icon v-if="!item.editable"
                         f7="lock_fill"
                         size="1rem"
                         color="gray" />
              </template>
              <!-- <f7-button color="blue" icon-f7="compose" icon-size="24px" :link="`${item.name}/edit`"></f7-button> -->
              <template #subtitle>
                <div>
                  <f7-chip v-for="tag in getNonSemanticTags(item)"
                           :key="tag"
                           :text="tag"
                           media-bg-color="blue"
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
      </f7-col>
    </f7-block>

    <f7-block v-if="ready && !items.length" class="block-narrow">
      <empty-state-placeholder icon="square_on_circle" title="items.title" text="items.text" />
      <f7-row v-if="$f7dim.width < 1280" class="display-flex justify-content-center">
        <f7-button large
                   fill
                   color="blue"
                   external
                   :href="`${runtimeStore.websiteUrl}/link/items`"
                   target="_blank"
                   :text="$t('home.overview.button.documentation')" />
      </f7-row>
    </f7-block>

    <template #fixed>
      <f7-fab v-show="!showCheckboxes"
              position="center-bottom"
              text="Refresh"
              color="blue"
              @click="load()">
        <f7-icon ios="f7:arrow_clockwise" md="material:refresh" aurora="f7:arrow_clockwise" />
      </f7-fab>
      <f7-fab v-show="!showCheckboxes"
              position="right-bottom"
              color="blue"
              href="add">
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

import { useLastSearchQueryStore } from '@/js/stores/useLastSearchQueryStore'
import { useRuntimeStore } from '@/js/stores/useRuntimeStore'
import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'

import * as Types from '@/assets/item-types'
import ItemMixin from '@/components/item/item-mixin'
import FileDefinition from '@/pages/settings/file-definition-mixin'

import EmptyStatePlaceholder from '@/components/empty-state-placeholder.vue'
import ListFilter from '@/components/util/list-filter.vue'

const ITEM_KINDS = { editable: 'Editable', readonly: 'Non-editable' }

export default {
  mixins: [ItemMixin, FileDefinition],
  props: {
    f7router: Object
  },
  components: {
    ListFilter,
    EmptyStatePlaceholder
  },
  setup () {
    return { f7, theme }
  },
  data () {
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
      searchQuery: '',
      filters: {
        kinds: {
          label: 'Kind',
          options: ITEM_KINDS
        },
        types: {
          label: 'Item Type',
          options: Object.fromEntries(Types.ItemTypes.map((type) => [type, type]))
        }
      },
      selectedItems: [],
      listedItems: [],
      excludedUids: new Set(),
      showCheckboxes: false,
      eventSource: null
    }
  },
  methods: {
    onPageAfterIn (event) {
      this.load()
    },
    onPageBeforeOut (event) {
      this.stopEventSource()
      useLastSearchQueryStore().lastItemSearchQuery = this.$refs.searchbar?.$el.f7Searchbar.query
    },
    load () {
      if (this.loading) return
      this.loading = true

      if (this.initSearchbar)
        useLastSearchQueryStore().lastItemSearchQuery = this.$refs.searchbar?.$el.f7Searchbar.query
      this.initSearchbar = false

      this.$oh.api.get('/rest/items?metadata=semantics').then((data) => {
        this.items = data.sort((a, b) => {
          const labelA = a.label || a.name
          const labelB = b.label || b.name
          return labelA.localeCompare(labelB)
        })
        this.$refs.itemsList.$el.f7VirtualList.replaceAllItems(this.items)
        this.initSearchbar = true
        this.loading = false
        this.processFilter()

        if (!this.eventSource) this.startEventSource()
        this.ready = true

        nextTick(() => {
          if (this.$device.desktop && this.$refs.searchbar) {
            this.$refs.searchbar.$el.f7Searchbar.$inputEl[0].focus()
          }
          this.$refs.searchbar?.$el.f7Searchbar.search(useLastSearchQueryStore().lastItemSearchQuery || '')
        })
      })
    },
    startEventSource () {
      this.eventSource = this.$oh.sse.connect('/rest/events?topics=openhab/items/*/added,openhab/items/*/removed,openhab/items/*/updated', null, (event) => {
        const topicParts = event.topic.split('/')
        switch (topicParts[3]) {
          case 'added':
          case 'removed':
          case 'updated':
            this.load()
            break
        }
      })
    },
    stopEventSource () {
      this.$oh.sse.close(this.eventSource)
      this.eventSource = null
    },
    searchbarSearch (event) {
      this.searchQuery = event?.query
      if (!this.searchQuery && this.$refs.filters?.filtered) {
        this.applyFilter()
      }
    },
    renderExternal (vl, vlData) {
      this.vlData = vlData
    },
    height (item) {
      let vlHeight
      if (theme.ios) vlHeight = 73.15
      if (theme.aurora) vlHeight = 66.37
      if (theme.md) vlHeight = 73.37
      if (this.$device.macos) {
        if (window.navigator.userAgent.includes('Safari') && !window.navigator.userAgent.includes('Chrome')) vlHeight -= 0.77
      }

      const nonSemanticTags = this.getNonSemanticTags(item)
      if (nonSemanticTags.length > 0) {
        vlHeight += 28
        if (theme.ios) vlHeight += 4
        if (theme.md) vlHeight += 6
      }
      return vlHeight
    },
    toggleCheck () {
      this.showCheckboxes = !this.showCheckboxes
    },
    isChecked (item) {
      return this.selectedItems.indexOf(item) >= 0
    },
    click (event, item) {
      if (this.showCheckboxes) {
        this.toggleItemCheck(event, item.name, item)
      } else {
        this.f7router.navigate(item.name)
      }
    },
    ctrlClick (event, item) {
      this.toggleItemCheck(event, item.name, item)
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
    selectDeselectAll () {
      if (this.allSelected) {
        this.selectedItems = []
      } else {
        this.selectedItems = this.listedItems.map((i) => i.name)
      }
    },
    copySelected () {
      this.copyFileDefinitionToClipboard(this.ObjectType.ITEM, this.selectedItems)
    },
    removeSelected () {
      const vm = this

      f7.dialog.confirm(
        `Remove ${this.selectedItems.length} selected items?`,
        'Remove Items',
        () => {
          vm.doRemoveSelected()
        }
      )
    },
    doRemoveSelected () {
      if (this.selectedItems.some((i) => i.editable === false)) {
        f7.dialog.alert('Some of the selected items are not modifiable because they have been created by textual configuration')
        return
      }

      let dialog = f7.dialog.progress('Deleting Items...')

      const promises = this.selectedItems.map((i) => this.$oh.api.delete('/rest/items/' + i))
      Promise.all(promises).then((data) => {
        f7.toast.create({
          text: 'Items removed',
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
        f7.dialog.alert('An error occurred while deleting: ' + err)
      })
    },
    searchAll (query, items) {
      if (query.trim() === '') {
        return items.filter((item) => !this.excludedUids.has(item.name)).map((_, index) => index)
      }

      query = query.toLowerCase()
      const found = []
      const foundUids = new Set()
      items.forEach((item, index) => {
        if (this.excludedUids.has(item.name)) {
          return // skip items excluded by filter
        }
        const haystack = [item.name, item.label, item.tags.join(' '), this.getItemTypeAndMetaLabel(item)]
        if (haystack.join(' ').toLowerCase().includes(query)) {
          found.push(index)
          foundUids.add(item.name)
        }
      })

      if (foundUids.size === 0) {
        this.selectedItems = []
      } else {
        this.selectedItems = this.selectedItems.filter((uid) => foundUids.has(uid))
      }
      return found // return array with matched indexes
    },
    reapplySearch () {
      const query = this.searchQuery
      if (!query) {
        return
      }
      this.$refs.searchbar?.f7Searchbar.search('')
      this.$refs.searchbar?.f7Searchbar.search(query)
    },
    resetFilter () {
      this.excludedUids.clear()
      if (this.searchQuery) {
        this.reapplySearch()
      } else {
        this.$refs.itemsList.$el.f7VirtualList.resetFilter()
      }
    },
    applyFilter () {
      let filteredIndexes = null
      const selected = this.$refs.filters?.selected

      this.excludedUids.clear()
      if (selected && this.$refs.filters.filtered) {
        filteredIndexes = []
        this.items.forEach((item, index) => {
          const typeMatch = !selected.types.size || selected.types.has(item.type.split(':')[0])
          const kind = item.editable ? 'editable' : 'readonly'
          const kindMatch = !selected.kinds.size || selected.kinds.has(kind)
          if (kindMatch && typeMatch) {
            filteredIndexes.push(index)
          } else {
            this.excludedUids.add(item.name)
          }
        })
      }

      if (this.excludedUids.size > 0) {
        this.selectedItems = this.selectedItems.filter((uid) => !this.excludedUids.has(uid))
      }

      if (this.searchQuery) {
        this.reapplySearch()
      } else if (filteredIndexes !== null) {
        this.$refs.itemsList.$el.f7VirtualList.filterItems(filteredIndexes)
      } else {
        this.$refs.itemsList.$el.f7VirtualList.resetFilter()
      }
    },
    processFilter () {
      const filters = this.$refs.filters
      if (filters?.filtered) {
        this.applyFilter()
      } else {
        this.resetFilter()
      }
    },
    updateListedItems () {
      this.$nextTick(() => {
        this.listedItems = this.$refs.itemsList.$el.f7VirtualList.filteredItems || this.$refs.itemsList.$el.f7VirtualList.items || []
      })
    }
  },
  watch: {
    ready () {
      this.updateListedItems()
    },
    searchQuery () {
      this.updateListedItems()
    },
    excludedUids: {
      handler: function () {
        this.updateListedItems()
      },
      deep: true
    }
  },
  computed: {
    searchbarPlaceholder () {
      return window.innerWidth >= 1280 ? 'Search (for advanced search, use the developer sidebar (Shift+Alt+D))' : 'Search'
    },
    allSelected () {
      return this.selectedItems.length >= this.listedItems.length
    },
    listTitle () {
      let title = this.listedItems.length
      if (this.searchQuery || this.$refs.filters?.filtered) {
        title += ` of ${this.items.length} Items found`
      } else {
        title += ' Items'
      }
      if (this.selectedItems.length > 0) {
        title += `, ${this.selectedItems.length} selected`
      }
      return title
    },
    ...mapStores(useRuntimeStore, useUIOptionsStore)
  }
}
</script>
