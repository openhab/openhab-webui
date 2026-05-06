<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar>
      <oh-nav-content title="Pages" back-link="Settings" back-link-url="/settings/" :f7router>
        <template #right>
          <f7-link icon-md="material:done_all" @click="toggleCheck()" :text="!theme.md ? (showCheckboxes ? 'Done' : 'Select') : ''" />
        </template>
      </oh-nav-content>
      <f7-subnavbar v-show="initSearchbar" :inner="false">
        <f7-searchbar
          v-if="initSearchbar"
          ref="searchbar"
          class="searchbar-pages"
          :custom-search="true"
          @searchbar:search="searchbarSearch"
          @searchbar:clear="searchbarClear"
          :placeholder="searchPlaceholder"
          :disable-button="!theme.aurora" />
      </f7-subnavbar>
    </f7-navbar>

    <f7-toolbar v-if="showCheckboxes" class="contextual-toolbar" :class="{ navbar: theme.md }" bottom-ios bottom-aurora>
      <div v-if="!theme.md && selection.length > 0" class="display-flex justify-content-center" style="width: 100%">
        <f7-link
          color="red"
          class="delete display-flex flex-direction-row margin-right"
          icon-ios="f7:trash"
          icon-aurora="f7:trash"
          @click="removeSelected">
          Remove
        </f7-link>
        <f7-link
          color="blue"
          class="copy display-flex flex-direction-row"
          @click="copySelectedItemsToClipboard"
          icon-ios="f7:square_on_square"
          icon-aurora="f7:square_on_square">
          &nbsp;Copy
        </f7-link>
      </div>
      <f7-link v-if="theme.md" icon-md="material:close" icon-color="white" @click="toggleCheck()" />
      <div v-if="theme.md" class="title">{{ selection.length }} selected</div>
      <div v-if="theme.md && selection.length > 0" class="right">
        <f7-link icon-md="material:delete" icon-color="white" @click="removeSelected" />
        <f7-link tooltip="Copy selected" icon-md="material:content_copy" icon-color="white" @click="copySelectedItemsToClipboard" />
      </div>
    </f7-toolbar>

    <f7-list-index
      v-if="ready"
      v-show="groupBy === 'alphabetical' && !$device.desktop"
      ref="listIndex"
      :key="'pages-index'"
      list-el=".pages-list"
      :scroll-list="true"
      :label="true" />

    <f7-block class="block-narrow">
      <!-- skeleton for not ready -->
      <f7-col v-if="!ready">
        <f7-block-title>&nbsp;Loading...</f7-block-title>
        <f7-list v-if="!ready" contacts-list class="col wide pages-list">
          <f7-list-group>
            <f7-list-item
              v-for="n in 20"
              media-item
              :key="n"
              :class="`skeleton-text skeleton-effect-blink`"
              title="Title of the page"
              subtitle="Page type"
              after="The item state"
              footer="Page ID">
              <template #media>
                <f7-skeleton-block style="width: 32px; height: 32px; border-radius: 50%" />
              </template>
            </f7-list-item>
          </f7-list-group>
        </f7-list>
      </f7-col>

      <f7-col v-show="ready">
        <f7-block-title class="no-margin-top">
          <span>{{ listTitle }}</span>
          <template v-if="showCheckboxes && selectablePageUids.length">
            -
            <f7-link @click="selectDeselectAll" :text="allSelected ? 'Deselect all' : 'Select all'" />
          </template>
        </f7-block-title>
        <div v-show="ready && pages.length > 0" class="padding-left padding-right">
          <f7-segmented strong tag="p">
            <f7-button :active="groupBy === 'alphabetical'" @click="switchGroupOrder('alphabetical')"> Alphabetical </f7-button>
            <f7-button :active="groupBy === 'type'" @click="switchGroupOrder('type')"> By type </f7-button>
          </f7-segmented>
        </div>

        <f7-list v-if="pages.length > 0 && filteredPages.length === 0" class="searchbar-not-found">
          <f7-list-item title="Nothing found" />
        </f7-list>
        <f7-list
          v-show="filteredPages.length > 0"
          class="col pages-list"
          ref="pagesList"
          :contacts-list="groupBy === 'alphabetical'"
          media-list>
          <f7-list-group v-for="(pagesWithInitial, initial) in indexedPages" :key="initial">
            <f7-list-item v-if="pagesWithInitial.length" :title="initial" group-title />
            <f7-list-item
              v-for="page in pagesWithInitial"
              :key="page.uid"
              media-item
              class="pagelist-item"
              :checkbox="showCheckboxes && page.uid !== 'overview'"
              :checked="isChecked(page.uid) ? true : null"
              :disabled="showCheckboxes && page.uid === 'overview' ? true : null"
              prevent-router
              @click.ctrl="ctrlClick($event, page)"
              @click.meta="ctrlClick($event, page)"
              @click.exact="click($event, page)"
              :link="getPageLink(page)"
              :title="page.config?.label || page.uid"
              :subtitle="getPageType(page).label"
              :footer="page.uid"
              :badge="page.config?.order">
              <template #subtitle>
                <div>
                  <f7-chip v-for="tag in page.tags" :key="tag" :text="tag" media-bg-color="blue" style="margin-right: 6px">
                    <template #media>
                      <f7-icon ios="f7:tag_fill" md="material:label" aurora="f7:tag_fill" />
                    </template>
                  </f7-chip>
                  <f7-chip
                    v-for="userrole in page.config?.visibleTo || []"
                    :key="userrole"
                    :text="userrole"
                    media-bg-color="green"
                    style="margin-right: 6px">
                    <template #media>
                      <f7-icon f7="person_crop_circle_fill_badge_checkmark" />
                    </template>
                  </f7-chip>
                </div>
              </template>
              <!-- <span class="item-initial">{{page.config.label[0].toUpperCase()}}</span> -->
              <template #after>
                <!-- This is here to push the after-title icon so it would appear immediately after the title
                     for consistency with Things, Items, and other lists that have the lock icon for non-editable entries -->
              </template>
              <template #after-title>
                <f7-icon v-if="page.editable === false" f7="lock_fill" size="1rem" color="gray" />
              </template>
              <template #media>
                <oh-icon
                  :color="page.config?.sidebar || page.uid === 'overview' ? '' : 'gray'"
                  :icon="getPageIcon(page)"
                  :height="32"
                  :width="32" />
              </template>
            </f7-list-item>
          </f7-list-group>
        </f7-list>
      </f7-col>
    </f7-block>

    <template #fixed>
      <f7-fab v-show="ready && !showCheckboxes" position="right-bottom" color="blue">
        <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus" />
        <f7-icon ios="f7:multiply" md="material:close" aurora="f7:multiply" />
        <f7-fab-buttons position="top">
          <f7-fab-button fab-close label="Create layout" href="layout/add">
            <f7-icon f7="rectangle_grid_2x2" />
          </f7-fab-button>
          <f7-fab-button fab-close label="Create tabbed page" href="tabs/add">
            <f7-icon f7="squares_below_rectangle" />
          </f7-fab-button>
          <f7-fab-button fab-close label="Create map view" href="map/add">
            <f7-icon f7="map" />
          </f7-fab-button>
          <f7-fab-button fab-close label="Create floor plan" href="plan/add">
            <f7-icon f7="square_stack_3d_up" />
          </f7-fab-button>
          <f7-fab-button fab-close label="Create chart" href="chart/add">
            <f7-icon f7="graph_square" />
          </f7-fab-button>
        </f7-fab-buttons>
      </f7-fab>
    </template>
  </f7-page>
</template>

<script>
import { nextTick } from 'vue'
import { f7, theme } from 'framework7-vue'

import { useLastSearchQueryStore } from '@/js/stores/useLastSearchQueryStore'
import { useRuntimeStore } from '@/js/stores/useRuntimeStore'
import { showToast } from '@/js/dialog-promises'
import { getPageType, getPageIcon } from '@/pages/page-type'

import copyToClipboard from '@/js/clipboard'
import { toFileYAMLSyntax } from '@/pages/yaml-file-format'

export default {
  props: {
    f7router: Object
  },
  setup() {
    const runtimeStore = useRuntimeStore()
    const lastSearchQueryStore = useLastSearchQueryStore()

    return {
      theme,
      runtimeStore,
      lastSearchQueryStore
    }
  },
  data() {
    return {
      ready: false,
      initSearchbar: false,
      loading: false,
      pages: [],
      selectedItems: [],
      showCheckboxes: false,
      searchQuery: ''
    }
  },
  computed: {
    groupBy: {
      get() {
        return this.runtimeStore.pagesGroupOrder
      },
      set(value) {
        this.runtimeStore.pagesGroupOrder = value
      }
    },
    filteredPages() {
      if (!this.searchQuery.length) return this.pages
      return this.pages.filter((page) => this.pageMatchesSearch(page, this.searchQuery))
    },
    filteredPagesCount() {
      return this.filteredPages.length
    },
    indexedPages() {
      if (this.groupBy === 'alphabetical') {
        return this.filteredPages.reduce((prev, page) => {
          const label = page.config?.label || page.uid
          const initial = label.substring(0, 1).toUpperCase()
          if (!prev[initial]) prev[initial] = []
          prev[initial].push(page)

          return prev
        }, {})
      } else {
        const typeGroups = this.filteredPages.reduce((prev, page) => {
          const type = getPageType(page).label
          if (!prev[type]) prev[type] = []
          prev[type].push(page)

          return prev
        }, {})
        return Object.keys(typeGroups)
          .sort((a, b) => a.localeCompare(b))
          .reduce((objEntries, key) => {
            objEntries[key] = typeGroups[key]
            return objEntries
          }, {})
      }
    },
    searchPlaceholder() {
      return window.innerWidth >= 1280 ? 'Search (for advanced search, use the developer sidebar (Shift+Alt+D))' : 'Search'
    },
    allSelected() {
      return this.selectablePageUids.length > 0 && this.selectablePageUids.every((uid) => this.selectedItems.includes(uid))
    },
    listTitle() {
      let title = this.filteredPagesCount
      if (this.searchQuery.length) {
        title += ` of ${this.pages.length} pages found`
      } else {
        title += ' pages'
      }
      if (this.selection.length > 0) {
        title += `, ${this.selection.length} selected`
      }
      return title
    },
    selectablePageUids() {
      return this.filteredPages.filter((page) => page.uid !== 'overview').map((page) => page.uid)
    },
    selection() {
      return this.selectablePageUids.filter((uid) => this.selectedItems.includes(uid))
    }
  },
  methods: {
    searchbarSearch(event) {
      this.searchQuery = event?.query || ''
    },
    searchbarClear() {
      this.searchQuery = ''
    },
    onPageAfterIn() {
      this.load()
    },
    onPageBeforeOut() {
      this.lastSearchQueryStore.lastPagesSearchQuery = this.$refs.searchbar?.$el.f7Searchbar.query
    },
    load() {
      if (this.loading) return
      this.loading = true

      if (this.initSearchbar) this.lastSearchQueryStore.lastPagesSearchQuery = this.$refs.searchbar?.$el.f7Searchbar.query
      this.initSearchbar = false

      this.pages = []
      this.selectedItems = []
      this.showCheckboxes = false
      this.$oh.api
        .get('/rest/ui/components/ui:page')
        .then((data) => {
          this.pages = data.sort((a, b) => {
            const aLabel = a.config?.label || a.uid
            const bLabel = b.config?.label || b.uid
            return aLabel.localeCompare(bLabel)
          })
          this.initSearchbar = true
          this.ready = true

          nextTick(() => {
            if (this.$refs.listIndex) this.$refs.listIndex.update()
            if (this.$device.desktop && this.$refs.searchbar) {
              this.$refs.searchbar.$el.f7Searchbar.$inputEl[0].focus()
            }
            this.$refs.searchbar?.$el.f7Searchbar.search(this.lastSearchQueryStore.lastPagesSearchQuery || '')
          })
        })
        .catch((err) => {
          console.error(err)
          showToast('An error occurred while loading pages: ' + (err?.message || String(err)))
        })
        .finally(() => {
          this.loading = false
        })
    },
    switchGroupOrder(groupBy) {
      this.groupBy = groupBy
      const searchbar = this.$refs.searchbar?.$el?.f7Searchbar
      const filterQuery = searchbar?.query
      nextTick(() => {
        if (filterQuery) {
          searchbar.clear()
          searchbar.search(filterQuery)
        }
        if (this.groupBy === 'alphabetical') this.$refs.listIndex.update()
      })
    },
    toggleCheck() {
      this.showCheckboxes = !this.showCheckboxes
      if (!this.showCheckboxes) {
        this.selectedItems = []
      }
    },
    isChecked(item) {
      return this.selectedItems.indexOf(item) >= 0
    },
    getNormalizedSearchTerms(query) {
      return (query || '').toLowerCase().trim().split(/\s+/).filter(Boolean)
    },
    getPageSearchText(page) {
      const searchFields = [
        page.config?.label,
        page.uid,
        this.getPageType(page)?.label,
        ...(page.tags || []),
        ...(page.config?.visibleTo || []).map((role) => role)
      ]
      return searchFields.filter(Boolean).join(' ').toLowerCase()
    },
    pageMatchesSearch(page, query) {
      const terms = this.getNormalizedSearchTerms(query)
      if (!terms.length) return true
      const pageSearchText = this.getPageSearchText(page)
      return terms.every((term) => pageSearchText.includes(term))
    },
    selectDeselectAll() {
      if (this.allSelected) {
        this.selectedItems = []
      } else {
        // assign a copy so mutations to `selectedItems` don't modify the computed `selectablePageUids` array
        this.selectedItems = Array.from(this.selectablePageUids)
      }
    },
    click(event, item) {
      if (this.showCheckboxes) {
        this.toggleItemCheck(event, item.uid, item)
      } else {
        const pageLink = this.getPageLink(item)
        if (pageLink) this.f7router.navigate(pageLink)
      }
    },
    ctrlClick(event, item) {
      this.toggleItemCheck(event, item.uid, item)
      if (!this.selectedItems.length) this.showCheckboxes = false
    },
    toggleItemCheck(event, itemName, item) {
      if (itemName === 'overview') return
      if (!this.showCheckboxes) this.showCheckboxes = true
      if (this.isChecked(itemName)) {
        this.selectedItems.splice(this.selectedItems.indexOf(itemName), 1)
      } else {
        this.selectedItems.push(itemName)
      }
    },
    getPageType,
    getPageIcon,
    getPageLink(page) {
      const type = this.getPageType(page)
      return type ? `${encodeURIComponent(type.type)}/${encodeURIComponent(page.uid)}` : null
    },
    removeSelected() {
      const vm = this

      f7.dialog.confirm(`Remove ${this.selection.length} selected pages?`, `Remove Pages`, () => {
        vm.doRemoveSelected()
      })
    },
    doRemoveSelected() {
      if (this.selection.some((p) => this.pages.find((page) => page.uid === p)?.editable === false)) {
        f7.dialog.alert('Some of the selected pages are not modifiable because they have been provisioned by files')
        return
      }

      let dialog = f7.dialog.progress('Deleting Pages...')

      const promises = this.selection.map((p) => this.$oh.api.delete('/rest/ui/components/ui:page/' + p))
      Promise.all(promises)
        .then((data) => {
          showToast('Pages removed')
          this.selectedItems = []
          dialog.close()
          this.load()
          f7.emit('sidebarRefresh', null)
        })
        .catch((err) => {
          dialog.close()
          this.load()
          console.error(err)
          showToast('An error occurred while deleting: ' + (err?.message || String(err)))
          f7.emit('sidebarRefresh', null)
        })
    },
    copySelectedItemsToClipboard() {
      const itemsToCopy = this.pages.filter((page) => this.selection.includes(page.uid))
      const yaml = toFileYAMLSyntax('pages', itemsToCopy)
      copyToClipboard(yaml, {
        onSuccess: () => showToast('Selected Page definitions copied to clipboard'),
        onError: () => showToast('Failed to copy page definitions to clipboard')
      })
    }
  },
  asyncComputed: {
    iconUrl() {
      return (icon) => this.$oh.media.getIcon(icon)
    }
  }
}
</script>
