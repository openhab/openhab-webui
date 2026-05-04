<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar>
      <oh-nav-content title="Sitemaps" back-link="Settings" back-link-url="/settings/" :f7router>
        <template #right>
          <f7-link icon-md="material:done_all" @click="toggleCheck()" :text="!theme.md ? (showCheckboxes ? 'Done' : 'Select') : ''" />
        </template>
      </oh-nav-content>
      <f7-subnavbar v-show="initSearchbar" :inner="false">
        <f7-searchbar
          v-if="initSearchbar"
          ref="searchbar"
          class="searchbar-sitemaps"
          :custom-search="true"
          @searchbar:search="searchbarSearch"
          @searchbar:clear="searchbarClear"
          :placeholder="searchPlaceholder"
          :disable-button="!theme.aurora" />
      </f7-subnavbar>
    </f7-navbar>

    <f7-toolbar v-if="showCheckboxes" class="contextual-toolbar" :class="{ navbar: theme.md }" bottom-ios bottom-aurora>
      <div v-if="!theme.md && selectedItems.length > 0" class="display-flex justify-content-center" style="width: 100%">
        <f7-link
          v-if="!theme.md"
          v-show="selection.length"
          color="red"
          class="delete display-flex flex-direction-row margin-right"
          icon-ios="f7:trash"
          icon-aurora="f7:trash"
          @click="removeSelected">
          Remove
        </f7-link>
        <f7-link
          v-show="selection.length"
          color="blue"
          class="copy display-flex flex-direction-row"
          icon-ios="f7:square_on_square"
          icon-aurora="f7:square_on_square"
          @click="copySelected">
          &nbsp;Copy
        </f7-link>
      </div>
      <f7-link v-if="theme.md" icon-md="material:close" icon-color="white" @click="toggleCheck()" />
      <div v-if="theme.md" class="title">{{ selection.length }} selected</div>
      <div v-if="theme.md && selection.length" class="right">
        <f7-link icon-md="material:delete" icon-color="white" @click="removeSelected" />
        <f7-link icon-md="material:content_copy" icon-color="white" @click="copySelected" />
      </div>
    </f7-toolbar>

    <f7-list-index
      v-if="ready"
      v-show="!$device.desktop"
      ref="listIndex"
      :key="'sitemaps-index'"
      list-el=".sitemaps-list"
      :scroll-list="true"
      :label="true" />

    <f7-block class="block-narrow">
      <f7-col v-show="ready">
        <f7-block-title class="no-margin-top">
          <span>{{ listTitle }}</span>
          <template v-if="showCheckboxes && selectableSitemapNames.length">
            -
            <f7-link @click="selectDeselectAll" :text="allSelected ? 'Deselect all' : 'Select all'" />
          </template>
        </f7-block-title>

        <f7-list v-if="sitemaps.length > 0 && filteredSitemaps.length === 0" class="searchbar-not-found">
          <f7-list-item title="Nothing found" />
        </f7-list>

        <f7-list v-show="filteredSitemaps.length > 0" class="col sitemaps-list" ref="sitemapsList" :contacts-list="true" media-list>
          <f7-list-group v-for="(sitemapsWithInitial, initial) in indexedSitemaps" :key="initial">
            <f7-list-item v-if="sitemapsWithInitial.length" :title="initial" group-title />
            <!-- We have to use :key with a dynamic value to ensure proper reactivity to selection changes
              A root cause of selection reactivity issues was unclear.
            -->
            <f7-list-item
              v-for="sitemap in sitemapsWithInitial"
              :key="sitemap.name"
              media-item
              class="sitemapslist-item"
              :checkbox="showCheckboxes"
              :checked="isChecked(sitemap.name) ? true : null"
              prevent-router
              @click.ctrl="ctrlClick($event, sitemap)"
              @click.meta="ctrlClick($event, sitemap)"
              @click.exact="click($event, sitemap)"
              :link="sitemap.editable ? encodeURIComponent(sitemap.name) : null"
              :no-chevron="!sitemap.editable"
              :title="sitemap.label"
              :footer="sitemap.name">
              <template #media>
                <oh-icon :icon="sitemap.icon || 'f7:menu'" :height="32" :width="32" />
              </template>
              <template #after-title>
                <f7-icon v-if="!sitemap.editable" f7="lock_fill" size="1rem" color="gray" />
              </template>
            </f7-list-item>
          </f7-list-group>
        </f7-list>

        <f7-block v-if="!sitemaps.length" class="block-narrow">
          <empty-state-placeholder icon="square_on_circle" title="sitemaps.title" text="sitemaps.text" />
          <f7-row v-if="$f7dim.width < 1280" class="display-flex justify-content-center">
            <f7-button
              large
              fill
              color="blue"
              external
              :href="`${runtimeStore.websiteUrl}/docs/ui/sitemaps`"
              target="_blank"
              :text="$t('home.overview.button.documentation')" />
          </f7-row>
        </f7-block>
      </f7-col>
    </f7-block>

    <template #fixed>
      <f7-fab v-show="ready && !showCheckboxes" position="right-bottom" color="blue" href="add">
        <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus" />
      </f7-fab>
    </template>
  </f7-page>
</template>

<script>
import { nextTick } from 'vue'
import { f7, theme } from 'framework7-vue'

import FileDefinition from '@/pages/settings/file-definition-mixin'

import { useLastSearchQueryStore } from '@/js/stores/useLastSearchQueryStore'
import { useRuntimeStore } from '@/js/stores/useRuntimeStore'
import EmptyStatePlaceholder from '@/components/empty-state-placeholder.vue'
import { showToast } from '@/js/dialog-promises'

import * as api from '@/api'

export default {
  mixins: [FileDefinition],
  props: {
    f7router: Object
  },
  components: {
    EmptyStatePlaceholder
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
      sitemaps: [],
      selectedItems: [],
      showCheckboxes: false,
      searchQuery: ''
    }
  },
  computed: {
    filteredSitemaps() {
      if (!this.searchQuery.length) return this.sitemaps
      return this.sitemaps.filter((sitemap) => this.sitemapMatchesSearch(sitemap, this.searchQuery))
    },
    filteredSitemapsCount() {
      return this.filteredSitemaps.length
    },
    indexedSitemaps() {
      return this.filteredSitemaps.reduce((prev, sitemap) => {
        const label = sitemap.label || sitemap.name
        const initial = label.substring(0, 1).toUpperCase()
        if (!prev[initial]) prev[initial] = []
        prev[initial].push(sitemap)
        return prev
      }, {})
    },
    searchPlaceholder() {
      return window.innerWidth >= 1280 ? 'Search (for advanced search, use the developer sidebar (Shift+Alt+D))' : 'Search'
    },
    allSelected() {
      return this.selectableSitemapNames.length > 0 && this.selectableSitemapNames.every((name) => this.selectedItems.includes(name))
    },
    listTitle() {
      let title = this.filteredSitemapsCount
      if (this.searchQuery.length) {
        title += ` of ${this.sitemaps.length} sitemaps found`
      } else {
        title += ' sitemaps'
      }
      if (this.selection.length > 0) {
        title += `, ${this.selection.length} selected`
      }
      return title
    },
    selectableSitemapNames() {
      return this.filteredSitemaps.map((sitemap) => sitemap.name)
    },
    selection() {
      return this.selectableSitemapNames.filter((name) => this.selectedItems.includes(name))
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
      this.lastSearchQueryStore.lastSitemapsSearchQuery = this.$refs.searchbar?.$el.f7Searchbar.query
    },
    load() {
      if (this.loading) return
      this.loading = true

      if (this.initSearchbar) this.lastSearchQueryStore.lastSitemapsSearchQuery = this.$refs.searchbar?.$el.f7Searchbar.query
      this.initSearchbar = false

      this.sitemaps = []
      this.selectedItems = []
      this.showCheckboxes = false

      api
        .getSitemapDefinitions()
        .then((data) => {
          this.sitemaps = data.sort((a, b) => a.label.localeCompare(b.label))
          this.initSearchbar = true
          this.ready = true

          nextTick(() => {
            if (this.$refs.listIndex) this.$refs.listIndex.update()
            if (this.$device.desktop && this.$refs.searchbar) {
              this.$refs.searchbar.$el.f7Searchbar.$inputEl[0].focus()
            }
            this.$refs.searchbar?.$el.f7Searchbar.search(this.lastSearchQueryStore.lastSitemapsSearchQuery || '')
          })
        })
        .catch((err) => {
          console.error(err)
          showToast('An error occurred while loading sitemaps: ' + (err?.message || String(err)))
        })
        .finally(() => {
          this.loading = false
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
    getSitemapSearchText(sitemap) {
      const searchText = sitemap.label + ' ' + sitemap.name
      return searchText.toLowerCase()
    },
    sitemapMatchesSearch(sitemap, query) {
      const terms = this.getNormalizedSearchTerms(query)
      if (!terms.length) return true
      const sitemapSearchText = this.getSitemapSearchText(sitemap)
      return terms.every((term) => sitemapSearchText.includes(term))
    },
    selectDeselectAll() {
      if (this.allSelected) {
        this.selectedItems = []
      } else {
        // assign a copy so mutations to `selectedItems` don't modify the computed `selectableSitemapNames` array
        this.selectedItems = Array.from(this.selectableSitemapNames)
      }
    },
    copySelected() {
      if (this.selection.length === 0) {
        showToast('No sitemaps selected to copy')
        return
      }
      this.copyFileDefinitionToClipboard(this.ObjectType.SITEMAP, this.selection)
    },
    click(event, item) {
      if (this.showCheckboxes) {
        this.toggleItemCheck(event, item.name, item)
      } else if (item.editable) {
        this.f7router.navigate(encodeURIComponent(item.name))
      }
    },
    ctrlClick(event, item) {
      this.toggleItemCheck(event, item.name, item)
      if (!this.selectedItems.length) this.showCheckboxes = false
    },
    toggleItemCheck(event, itemName, item) {
      if (!this.showCheckboxes) this.showCheckboxes = true
      if (this.isChecked(itemName)) {
        this.selectedItems.splice(this.selectedItems.indexOf(itemName), 1)
      } else {
        this.selectedItems.push(itemName)
      }
      // Calling preventDefault() is necessary to prevent the default label-click behavior of toggling the checkbox,
      // which would cause it to go out of sync with Vue's state.
      // This is because f7-list-item renders a <label> that wraps the checkbox <input>.
      // without this, the browser's native label click would toggle el.checked independently of Vue's binding.
      // This issue only occurs when the list item has no link (i.e. is not editable)
      event.preventDefault()
    },
    removeSelected() {
      const vm = this

      f7.dialog.confirm(`Remove ${this.selection.length} selected sitemaps?`, `Remove Sitemaps`, () => {
        vm.doRemoveSelected()
      })
    },
    doRemoveSelected() {
      if (this.selection.some((i) => !this.sitemaps.find((s) => s.name === i)?.editable)) {
        f7.dialog.alert('Some of the selected sitemaps are not modifiable because they have been created by textual configuration')
        return
      }

      let dialog = f7.dialog.progress(`Deleting Sitemaps...`)

      const promises = this.selection.map((p) => {
        return api.removeSitemapFromRegistry({ sitemapname: p })
      })
      Promise.all(promises)
        .then((data) => {
          showToast('Sitemaps removed')
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
    }
  },
  asyncComputed: {
    iconUrl() {
      return (icon) => this.$oh.media.getIcon(icon)
    }
  }
}
</script>
