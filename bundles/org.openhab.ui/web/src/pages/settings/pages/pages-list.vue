<template>
  <f7-page @page:afterin="onPageAfterIn" @page:beforeout="onPageBeforeOut">
    <f7-navbar>
      <oh-nav-content title="Pages" back-link="Settings" back-link-url="/settings/" :f7router>
        <template #right>
          <f7-link
            icon-md="material:done_all"
            @click="selection.toggleSelectionMode"
            :text="!theme.md ? (selection.selectionMode ? 'Done' : 'Select') : ''" />
        </template>
      </oh-nav-content>
      <f7-subnavbar v-show="initSearchbar" :inner="false">
        <oh-searchbar
          v-if="initSearchbar"
          ref="oh-searchbar"
          class="searchbar-pages"
          :persist-search-string-key="'pages-search-string'"
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
        @copy="copySelectedItemsToClipboard" />
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
      <f7-col v-if="!ready" v-deferred>
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
        <div v-show="ready && pages.length > 0" class="padding-left padding-right">
          <f7-segmented strong tag="p">
            <f7-button :active="groupBy === 'alphabetical'" @click="switchGroupOrder('alphabetical')"> Alphabetical </f7-button>
            <f7-button :active="groupBy === 'type'" @click="switchGroupOrder('type')"> By type </f7-button>
          </f7-segmented>
        </div>

        <group-box
          :title="getListTitle(search.isFiltered, search.filteredResults.length, pages.length, 'Page', selection.selectedInFilter.size)">
          <template v-if="selection.selectionMode && search.filteredUids.length > 0" #after-title>
            <f7-link @click="selection.selectDeselectAll" :text="selection.allSelected ? 'Deselect all' : 'Select all'" />
          </template>
          <f7-list
            v-show="search.filteredResults.length > 0"
            class="col pages-list"
            ref="pagesList"
            :contacts-list="groupBy === 'alphabetical'"
            media-list>
            <f7-list-group v-for="(resultWithInitial, initial) in indexedResults" :key="initial">
              <f7-list-item v-if="resultWithInitial.length > 0" :title="initial" group-title />
              <f7-list-item
                v-for="{ item: page, matches } in resultWithInitial"
                :key="page.uid"
                media-item
                class="pagelist-item"
                :checkbox="selection.selectionMode"
                :checked="selection.isSelected(page.uid)"
                prevent-router
                @click.ctrl="selection.ctrlClick(page.uid)"
                @click.meta="selection.ctrlClick(page.uid)"
                @click.exact="click($event, page)"
                :link="getPageLink(page)"
                :subtitle="getPageType(page).label"
                :badge="page.config?.order">
                <template #title>
                  <span
                    v-html="
                      highlightMatches(page.config?.label, matches, 'config.label') || highlightMatches(page.uid, matches, 'uid')
                    "></span>
                </template>
                <template #footer>
                  <span v-html="highlightMatches(page.uid, matches, 'uid')"></span>
                </template>
                <template #subtitle>
                  <div>
                    <f7-chip v-for="tag in page.tags" :key="tag" :text="tag" media-bg-color="theme-alt" style="margin-right: 6px">
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
                  <oh-icon :color="page.config?.sidebar ? '' : 'gray'" :icon="getPageIcon(page)" :height="32" :width="32" />
                </template>
              </f7-list-item>
            </f7-list-group>
          </f7-list>
        </group-box>
      </f7-col>
    </f7-block>

    <template #fixed>
      <f7-fab v-show="ready && !selection.selectionMode" position="right-bottom" color="theme-alt">
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
import { nextTick, reactive, toRaw, shallowRef, useTemplateRef } from 'vue'
import { f7, theme } from 'framework7-vue'

import { useRuntimeStore } from '@/js/stores/useRuntimeStore'
import { showToast, showConfirmDialog } from '@/js/dialog-promises'
import { getPageType, getPageIcon } from '@/pages/page-type'
import { useSearch } from '@/components/useSearch'
import { useSelection } from '@/components/useSelection'
import { getListTitle, findElementsInObject, highlightMatches } from '@/pages/list-helpers'

import copyToClipboard from '@/js/clipboard'
import { toFileYAMLSyntax } from '@/pages/yaml-file-format'

import OhSearchbar from '@/pages/oh-searchbar.vue'
import ListSelectionActions from '@/components/list/list-selection-actions.vue'

export default {
  components: {
    OhSearchbar,
    ListSelectionActions
  },
  props: {
    f7router: Object
  },
  setup() {
    const runtimeStore = useRuntimeStore()
    const pages = shallowRef([])
    const haystackFields = ['uid', 'label', 'tag']
    const ohSearchbarRef = useTemplateRef('oh-searchbar')

    const filtersDefinitions = {
      is: {
        label: 'Kind',
        getFn: (page) => (page.editable ? 'editable' : 'readonly'),
        options: ['Editable', 'Readonly']
      },
      label: {
        label: 'Label',
        path: 'config.label'
      },
      uid: {
        label: 'UID'
      },
      type: {
        label: 'Type',
        getFn: (page) => getPageType(page).type
      },
      tag: {
        label: 'Tag',
        path: 'tags'
      },
      visible: {
        label: 'Visible to',
        path: 'config.visibleTo'
      },
      component: {
        label: 'Component',
        getFn: (page) => findElementsInObject(toRaw(page), 'component')
      }
    }

    const searchState = useSearch(pages, {
      filtersDefinitions,
      haystackFields,
      uidField: 'uid',
      includeMatches: true
    })
    const search = reactive(searchState)
    const selection = reactive(useSelection(searchState.filteredUids))

    filtersDefinitions.type.options = () => search.getFuseValuesForField('type')
    filtersDefinitions.tag.options = () => search.getFuseValuesForField('tag')
    filtersDefinitions.visible.options = () => search.getFuseValuesForField('visible')
    filtersDefinitions.component.options = () => search.getFuseValuesForField('component')

    return {
      theme,
      runtimeStore,
      search,
      selection,
      pages,
      filtersDefinitions,
      getListTitle,
      ohSearchbarRef,
      haystackFields,
      highlightMatches
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
    groupBy: {
      get() {
        return this.runtimeStore.pagesGroupOrder
      },
      set(value) {
        this.runtimeStore.pagesGroupOrder = value
      }
    },
    indexedResults() {
      if (this.groupBy === 'alphabetical') {
        return this.search.filteredResults.reduce((prev, result) => {
          const page = result.item
          const label = page.config?.label || page.uid
          const initial = label.substring(0, 1).toUpperCase()
          if (!prev[initial]) prev[initial] = []
          prev[initial].push(result)

          return prev
        }, {})
      } else {
        const typeGroups = this.search.filteredResults.reduce((prev, result) => {
          const page = result.item
          const type = getPageType(page).label
          if (!prev[type]) prev[type] = []
          prev[type].push(result)

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
    selectedDeletable() {
      return new Set(this.pages.filter((page) => this.selection.selectedInFilter.has(page.uid) && page.editable).map((page) => page.uid))
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
      this.initSearchbar = false

      this.pages = []
      this.selection.clearSelection()
      this.selection.selectionMode = false
      await this.$oh.api
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
            if (this.$device.desktop) {
              this.ohSearchbarRef?.focus()
            }
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
      if (this.groupBy === 'alphabetical') this.$refs.listIndex.update()
    },
    click(event, item) {
      if (this.selection.selectionMode) {
        this.selection.toggleItemSelection(item.uid)
      } else {
        const pageLink = this.getPageLink(item)
        if (pageLink) this.f7router.navigate(pageLink)
      }
    },
    getPageType,
    getPageIcon,
    getPageLink(page) {
      const type = this.getPageType(page)
      return type ? `${encodeURIComponent(type.type)}/${encodeURIComponent(page.uid)}` : null
    },
    async removeSelected() {
      if (this.selectedDeletable.size === 0) return
      if (
        !(await showConfirmDialog(
          `Remove ${this.selectedDeletable.size} of ${this.selection.selectedInFilter.size} selected pages?`,
          `Remove Pages`
        ))
      )
        return

      let dialog = f7.dialog.progress('Deleting Pages...')
      const promises = [...this.selectedDeletable].map((p) => this.$oh.api.delete('/rest/ui/components/ui:page/' + p))
      try {
        await Promise.all(promises)
        showToast('Pages removed')
      } catch (err) {
        console.error(err)
        showToast('An error occurred while deleting: ' + (err?.message || String(err)))
      } finally {
        dialog.close()
        this.load()
        f7.emit('sidebarRefresh', null)
      }
    },
    copySelectedItemsToClipboard() {
      const itemsToCopy = this.pages.filter((page) => this.selection.selectedInFilter.has(page.uid))
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
