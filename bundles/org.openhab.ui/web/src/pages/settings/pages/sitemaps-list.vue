<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar>
      <oh-nav-content title="Sitemaps" back-link="Settings" back-link-url="/settings/" :f7router>
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
          class="searchbar-sitemaps"
          :persist-search-string-key="'sitemaps-search-string'"
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
          :title="
            getListTitle(search.isFiltered, search.filteredResults.length, sitemaps.length, 'Sitemap', selection.selectedInFilter.size)
          ">
          <template v-if="selection.selectionMode && search.filteredUids.length > 0" #after-title>
            <f7-link @click="selection.selectDeselectAll" :text="selection.allSelected ? 'Deselect all' : 'Select all'" />
          </template>
          <f7-list v-show="search.filteredResults.length > 0" class="col sitemaps-list" ref="sitemapsList" :contacts-list="true" media-list>
            <f7-list-group v-for="(resultsWithInitial, initial) in indexedResults" :key="initial">
              <f7-list-item v-if="resultsWithInitial.length > 0" :title="initial" group-title />
              <f7-list-item
                v-for="{ item: sitemap, matches } in resultsWithInitial"
                :key="sitemap.name"
                media-item
                :checkbox="selection.selectionMode"
                :checked="selection.isSelected(sitemap.name)"
                prevent-router
                @click.ctrl="selection.ctrlClick(sitemap.name)"
                @click.meta="selection.ctrlClick(sitemap.name)"
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
      <f7-fab v-show="ready && !selection.selectionMode" position="right-bottom" color="theme-alt" href="add">
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
import { useSelection } from '@/components/useSelection'
import { getListTitle, highlightMatches } from '@/pages/list-helpers'
import { useRuntimeStore } from '@/js/stores/useRuntimeStore'
import EmptyStatePlaceholder from '@/components/empty-state-placeholder.vue'
import { showToast, showConfirmDialog } from '@/js/dialog-promises'
import { BREAKPOINTS } from '@/js/constants/breakpoints'

import OhSearchbar from '@/pages/oh-searchbar.vue'
import ListSelectionActions from '@/components/list/list-selection-actions.vue'

import * as api from '@/api'

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

    const searchState = useSearch(sitemaps, {
      filtersDefinitions,
      haystackFields,
      uidField: 'name',
      includeMatches: true
    })
    const search = reactive(searchState)
    const selection = reactive(useSelection(searchState.filteredUids))

    return {
      theme,
      sitemaps,
      BREAKPOINTS,
      runtimeStore,
      filtersDefinitions,
      search,
      selection,
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
      loading: false
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
    selectedDeletable() {
      return new Set(
        this.sitemaps
          .filter((sitemap) => this.selection.selectedInFilter.has(sitemap.name) && sitemap.editable)
          .map((sitemap) => sitemap.name)
      )
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
      this.selection.clearSelection()
      this.selection.selectionMode = false

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
    copySelected() {
      if (this.selection.selectedInFilter.size === 0) {
        showToast('No sitemaps selected to copy')
        return
      }
      this.copyFileDefinitionToClipboard(this.ObjectType.SITEMAP, [...this.selection.selectedInFilter])
    },
    click(event, item) {
      if (this.selection.selectionMode) {
        // Calling preventDefault() is necessary to prevent the default label-click behavior of toggling the checkbox,
        // which would cause it to go out of sync with Vue's state.
        // This is because f7-list-item renders a <label> that wraps the checkbox <input>.
        // without this, the browser's native label click would toggle el.checked independently of Vue's binding.
        // This issue only occurs when the list item has no link (i.e. is not editable)
        event.preventDefault()
        this.selection.toggleItemSelection(item.name)
      } else {
        this.f7router.navigate(encodeURIComponent(item.name))
      }
    },
    async removeSelected() {
      if (this.selectedDeletable.size === 0) return
      if (
        !(await showConfirmDialog(
          `Remove ${this.selectedDeletable.size} of ${this.selection.selectedInFilter.size} selected sitemaps?`,
          `Remove Sitemaps`
        ))
      )
        return

      let dialog = f7.dialog.progress(`Deleting Sitemaps...`)
      const promises = [...this.selectedDeletable].map((p) => {
        return api.removeSitemapFromRegistry({ sitemapname: p })
      })
      try {
        await Promise.all(promises)
        showToast('Sitemaps removed')
      } catch (err) {
        console.error(err)
        showToast('An error occurred while deleting: ' + (err?.message || String(err)))
      } finally {
        dialog.close()
        this.load()
        f7.emit('sidebarRefresh', null)
      }
    }
  }
}
</script>
