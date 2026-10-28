<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar>
      <oh-nav-content title="Sitemaps" back-link="Settings" back-link-url="/settings/" :f7router>
        <template #right>
          <f7-link icon-md="material:done_all" @click="toggleCheck()" :text="!theme.md ? (showCheckboxes ? 'Done' : 'Select') : ''" />
        </template>
      </oh-nav-content>
      <f7-subnavbar v-show="initSearchbar" :inner="false">
        <oh-searchbar
          v-if="initSearchbar"
          ref="oh-searchbar"
          class="searchbar-sitemaps"
          :persist-search-string-key="'sitemaps-search-string'"
          :haystack-fields="haystackFields"
          :filters-definitions="filtersDefinitions"
          @update:tokenized-search="search.onUpdateTokenizedSearch" />
      </f7-subnavbar>
    </f7-navbar>

    <f7-toolbar v-if="showCheckboxes" class="contextual-toolbar" :class="{ navbar: theme.md }" bottom-ios bottom-aurora>
      <div v-if="!theme.md && selected.size > 0" class="display-flex justify-content-center" style="width: 100%">
        <f7-link
          v-if="!theme.md"
          v-show="selectedInFilter.size > 0"
          color="red"
          class="delete display-flex flex-direction-row margin-right"
          icon-ios="f7:trash"
          icon-aurora="f7:trash"
          @click="removeSelected">
          Remove
        </f7-link>
        <f7-link
          v-show="selectedInFilter.size > 0"
          color="theme-alt"
          class="copy display-flex flex-direction-row"
          icon-ios="f7:square_on_square"
          icon-aurora="f7:square_on_square"
          @click="copySelected">
          &nbsp;Copy
        </f7-link>
      </div>
      <f7-link v-if="theme.md" icon-md="material:close" icon-color="white" @click="toggleCheck()" />
      <div v-if="theme.md" class="title">{{ selectedInFilter.size }} selected</div>
      <div v-if="theme.md && selectedInFilter.size > 0" class="right">
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
        <f7-list v-if="sitemaps.length > 0 && search.filteredResults.length === 0" class="searchbar-not-found">
          <f7-list-item title="Nothing found" />
        </f7-list>
        <group-box
          :title="getListTitle(search.isFiltered, search.filteredResults.length, sitemaps.length, 'Sitemap', selectedInFilter.size)">
          <template v-if="showCheckboxes && search.filteredUids.length > 0" #after-title>
            <f7-link @click="selectDeselectAll" :text="allSelected ? 'Deselect all' : 'Select all'" />
          </template>
          <f7-list v-show="search.filteredResults.length > 0" class="col sitemaps-list" ref="sitemapsList" :contacts-list="true" media-list>
            <f7-list-group v-for="(resultsWithInitial, initial) in indexedResults" :key="initial">
              <f7-list-item v-if="resultsWithInitial.length > 0" :title="initial" group-title />
              <f7-list-item
                v-for="{ item: sitemap, matches } in resultsWithInitial"
                :key="sitemap.name"
                media-item
                :checkbox="showCheckboxes"
                :checked="isChecked(sitemap.name) ? true : null"
                prevent-router
                @click.ctrl="ctrlClick($event, sitemap)"
                @click.meta="ctrlClick($event, sitemap)"
                @click.exact="click($event, sitemap)"
                :link="encodeURIComponent(sitemap.name)">
                <template #title>
                  <span v-html="highlightMatches(sitemap.label, matches, 'label') || highlightMatches(sitemap.name, matches, 'name')" />
                </template>
                <template #footer>
                  <span v-html="highlightMatches(sitemap.name, matches, 'name')" />
                </template>
                <template #media>
                  <oh-icon :icon="sitemap.icon || 'f7:menu'" :height="32" :width="32" />
                </template>
                <template #after>
                  <!-- push the lock icon so it appears immediately after the title,
                 consistent with other list items (Things, Items, etc) -->
                </template>
                <template #after-title>
                  <f7-icon v-if="!sitemap.editable" f7="lock_fill" size="1rem" color="gray" />
                </template>
              </f7-list-item>
            </f7-list-group>
          </f7-list>
        </group-box>

        <f7-block v-if="!sitemaps.length" class="block-narrow">
          <empty-state-placeholder icon="square_on_circle" title="sitemaps.title" text="sitemaps.text" />
          <f7-row v-if="$f7dim.width < BREAKPOINTS.LG" class="display-flex justify-content-center">
            <f7-button
              large
              fill
              color="theme-alt"
              external
              :href="`${runtimeStore.websiteUrl}/docs/ui/sitemaps`"
              target="_blank"
              :text="$t('home.overview.button.documentation')" />
          </f7-row>
        </f7-block>
      </f7-col>
    </f7-block>

    <template #fixed>
      <f7-fab v-show="ready && !showCheckboxes" position="right-bottom" color="theme-alt" href="add">
        <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus" />
      </f7-fab>
    </template>
  </f7-page>
</template>

<script>
import { nextTick, reactive, shallowRef, useTemplateRef } from 'vue'
import { f7, theme } from 'framework7-vue'

import FileDefinition from '@/pages/settings/file-definition-mixin'

import { useSearch } from '@/components/useSearch'
import { getListTitle, highlightMatches } from '@/pages/list-helpers'
import { useRuntimeStore } from '@/js/stores/useRuntimeStore'
import EmptyStatePlaceholder from '@/components/empty-state-placeholder.vue'
import { showToast } from '@/js/dialog-promises'
import { BREAKPOINTS } from '@/js/constants/breakpoints'

import OhSearchbar from '@/pages/oh-searchbar.vue'

import * as api from '@/api'

export default {
  mixins: [FileDefinition],
  props: {
    f7router: Object
  },
  components: {
    EmptyStatePlaceholder,
    OhSearchbar
  },
  setup() {
    const sitemaps = shallowRef([])
    const haystackFields = ['name', 'label']
    const ohSearchbarRef = useTemplateRef('oh-searchbar')
    const runtimeStore = useRuntimeStore()

    const filtersDefinitions = {
      is: {
        label: 'Kind',
        getFn: (sitemap) => (sitemap.editable ? 'editable' : 'readonly'),
        options: ['Editable', 'Readonly']
      },
      name: {
        label: 'Name'
      },
      label: {
        label: 'Label'
      }
    }

    const search = reactive(
      useSearch(sitemaps, {
        filtersDefinitions,
        haystackFields,
        uidField: 'name',
        includeMatches: true
      })
    )

    return {
      theme,
      sitemaps,
      BREAKPOINTS,
      runtimeStore,
      filtersDefinitions,
      search,
      getListTitle,
      haystackFields,
      highlightMatches,
      ohSearchbarRef
    }
  },
  data() {
    return {
      ready: false,
      initSearchbar: false,
      loading: false,
      selected: new Set(),
      showCheckboxes: false
    }
  },
  computed: {
    indexedResults() {
      return this.search.filteredResults.reduce((prev, result) => {
        const sitemap = result.item
        const label = sitemap.label || sitemap.name
        const initial = label.substring(0, 1).toUpperCase()
        if (!prev[initial]) prev[initial] = []
        prev[initial].push(result)
        return prev
      }, {})
    },
    allSelected() {
      return this.search.filteredUids.length > 0 && this.search.filteredUids.every((name) => this.selected.has(name))
    },
    selectedInFilter() {
      return new Set(this.search.filteredUids.filter((name) => this.selected.has(name)))
    }
  },
  methods: {
    async onPageAfterIn() {
      await this.load()
    },
    onPageBeforeOut() {
      this.ohSearchbarRef?.persistSearchbarQuery()
    },
    async load() {
      if (this.loading) return
      this.loading = true

      if (this.initSearchbar) this.lastSearchQueryStore.lastSitemapsSearchQuery = this.$refs.searchbar?.$el.f7Searchbar.query
      this.initSearchbar = false

      this.sitemaps = []
      this.selected.clear()
      this.showCheckboxes = false

      try {
        const _sitemaps = await api.getSitemapDefinitions()
        this.sitemaps = _sitemaps.sort((a, b) => (a.label || a.name).localeCompare(b.label || b.name))
      } catch (err) {
        console.error(err)
        showToast('An error occurred while loading sitemaps: ' + (err?.message || String(err)))
        return
      } finally {
        this.loading = false
      }

      this.initSearchbar = true
      this.ready = true

      nextTick(() => {
        if (this.$refs.listIndex) this.$refs.listIndex.update()
        if (this.$device.desktop) {
          this.ohSearchbarRef?.focus()
        }
      })
    },
    toggleCheck() {
      this.showCheckboxes = !this.showCheckboxes
      if (!this.showCheckboxes) {
        this.selected.clear()
      }
    },
    isChecked(item) {
      return this.selected.has(item)
    },
    selectDeselectAll() {
      if (this.allSelected) {
        this.selected.clear()
      } else {
        this.selected = new Set(this.search.filteredUids)
      }
    },
    copySelected() {
      if (this.selectedInFilter.size === 0) {
        showToast('No sitemaps selected to copy')
        return
      }
      this.copyFileDefinitionToClipboard(this.ObjectType.SITEMAP, [...this.selectedInFilter])
    },
    click(event, item) {
      if (this.showCheckboxes) {
        this.toggleItemCheck(event, item.name, item)
      } else {
        this.f7router.navigate(encodeURIComponent(item.name))
      }
    },
    ctrlClick(event, item) {
      this.toggleItemCheck(event, item.name, item)
      if (!this.selected.size) this.showCheckboxes = false
    },
    toggleItemCheck(event, name, item) {
      if (!this.showCheckboxes) this.showCheckboxes = true
      if (this.isChecked(name)) {
        this.selected.delete(name)
      } else {
        this.selected.add(name)
      }
      // Calling preventDefault() is necessary to prevent the default label-click behavior of toggling the checkbox,
      // which would cause it to go out of sync with Vue's state.
      // This is because f7-list-item renders a <label> that wraps the checkbox <input>.
      // without this, the browser's native label click would toggle el.checked independently of Vue's binding.
      // This issue only occurs when the list item has no link (i.e. is not editable)
      event.preventDefault()
    },
    removeSelected() {
      f7.dialog.confirm(`Remove ${this.selectedInFilter.size} selected sitemaps?`, `Remove Sitemaps`, () => {
        this.doRemoveSelected()
      })
    },
    doRemoveSelected() {
      if ([...this.selectedInFilter].some((i) => !this.sitemaps.find((s) => s.name === i)?.editable)) {
        f7.dialog.alert('Some of the selected sitemaps are not modifiable because they have been created by textual configuration')
        return
      }

      let dialog = f7.dialog.progress(`Deleting Sitemaps...`)

      const promises = [...this.selectedInFilter].map((p) => {
        return api.removeSitemapFromRegistry({ sitemapname: p })
      })
      Promise.all(promises)
        .then((data) => {
          showToast('Sitemaps removed')
          this.selected.clear()
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
  }
}
</script>
